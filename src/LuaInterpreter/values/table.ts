import { err, ok, Result } from "@kherge/result";
import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { match, wrap } from "Shared/utils/rustlang/option";

// @no-transform-path
import { v4 as uuid } from "uuid";
import { LuaBoolean } from "./boolean";
import { LuaNumber } from "./number";
import { LuaString } from "./string";
import {
	isLuaFunction,
	isLuaNil,
	isLuaNumber,
	isLuaString,
	isLuaTable,
} from "./typeGuard";
import {
	AnyLuaValue,
	LuaAddress,
	LuaType,
	LuaValue,
	OptionLuaValue,
} from "./types";

interface QueueInfo {
	address?: LuaAddress;
	value: LuaValue;
}

export class LuaTable implements LuaValue {
	readonly type = LuaType.Table;
	readonly address = uuid();

	/** cache for stringifyTable */
	private uniqueAddresses = new Array<String>();
	private metatable?: LuaTable = undefined;

	private queueForArray = new Array<QueueInfo>();

	readonly array = new Array<LuaValue>();
	readonly map = new Map<LuaAddress, AnyLuaValue>();

	public constructor() {}

	public tostring() {
		return `table: ${this.address}`;
	}

	public eq(other: LuaMultiReturn) {
		return match(
			other.getFirstReturn(),
			obj => new LuaBoolean(obj.address === this.address),
			() => new LuaBoolean(false),
		);
	}

	// queue list
	private refreshQueue() {
		// clear up queue info
		for (const queueInfo of this.queueForArray) {
			if (!queueInfo.address) {
				this.array.push(queueInfo.value);
			}

			// do not apply if that value is nil or address is non-number
			if (
				queueInfo.value === undefined ||
				typeof queueInfo.address !== "number"
			) {
				continue;
			}

			// lookout for that index because it will considered as a map
			// if it is out of the array collection list
			if (this.array.length - 1 > queueInfo.address) {
				this.setMapEntryMember(queueInfo.address, queueInfo.value);
				continue;
			}

			this.array.splice(queueInfo.address, 0, queueInfo.value);
		}

		// if the array index is enough to fit with the
		// array then it can be become an array member
		for (const [key, value] of this.map) {
			if (!isLuaNumber(key) || isLuaNil(value)) {
				continue;
			}

			const suitableIndexToJoin = this.length + 1;
			if (key.value === suitableIndexToJoin) {
				this.map.delete(key);
				this.array.push(value);
			}
		}
	}

	// table stuff
	public get length() {
		return this.array.length;
	}

	/**
	 * Attempts to stringify tables (does not apply to metatable)
	 *
	 * **Note**: This is an experimental method, it may cause problems
	 * with cyclic tables
	 */
	public stringifyTable(indent = 0) {
		// make an indentation string
		let indentStr = "  ".repeat(indent);
		let shiftStr = "  ".repeat(indent + 1);
		let result = indentStr + "{\n";

		const callback = (value: AnyLuaValue, key: LuaAddress) => {
			let initial = shiftStr + `[`;
			if (isLuaString(key)) {
				initial += `"${key.toString()}"`;
			} else {
				initial += `${
					typeof key === "number" ? key + 1 : key.toString()
				}`;
			}
			initial += "]: ";
			// if it is a table then deal with cyclic references
			if (isLuaTable(value)) {
				if (this.uniqueAddresses.includes(value.address)) {
					// STOP!
					initial += `** cyclic table detected **\n`;
					result += initial;
					return;
				} else {
					this.uniqueAddresses.push(value.address);
					initial += this.stringifyTable(indent + 1);
				}
			} else if (value !== undefined) {
				initial += `${value.toString()}\n`;
			} else {
				initial += "nil\n";
			}
			result += initial;
		};

		this.map.forEach(callback);
		this.array.forEach(callback);

		result += indentStr + "}";

		if (indent > 0) {
			return result + "\n";
		}

		return result;
	}

	public insert(value: AnyLuaValue, index?: LuaValue) {
		// do not apply if that value is nil
		if (value === undefined) {
			return;
		}

		if (!index) {
			// bypassing way to bypass array queue
			this.array.push(value);
			return;
		}

		this.queueForArray.push({
			address: index.address,
			value: value,
		});

		this.refreshQueue();
	}

	public setMapEntryMember(key: LuaAddress, value: AnyLuaValue) {
		this.map.set(key, value);
		this.refreshQueue();
	}

	public arraySet(keyOpt: OptionLuaValue, value: AnyLuaValue) {
		return match<typeof keyOpt, Result<undefined, string>>(
			keyOpt,
			key => {
				if (!isLuaNumber(key)) {
					return err(
						"attempt to set array index with non-number index",
					);
				}
				this.insert(key, value);
				return ok(undefined);
			},
			() => err("attempt to set array index with nil"),
		);
	}

	public rawget(keyOpt: OptionLuaValue) {
		return match<OptionLuaValue, Result<AnyLuaValue, string>>(
			keyOpt,
			key => {
				switch (key.type) {
					case LuaType.Number:
						// array content
						const valueIndex = this.array.findIndex(
							(_, i) => i === (key as LuaNumber).value - 1,
						);
						if (valueIndex !== -1) {
							return ok(this.array[valueIndex]);
						}
					default:
						return ok(this.map.get(key.address));
				}
			},
			() => err("table index is nil"),
		);
	}

	public rawset(keyOpt: OptionLuaValue, value: AnyLuaValue) {
		// lua's array can only be start at strictly 1
		// otherwise it is considered as a map
		return match<typeof keyOpt, Result<undefined, string>>(
			keyOpt,
			key => {
				if (isLuaNumber(key)) {
					if (key.value <= 0) {
						this.map.set(key.address, value);
					}
					this.insert(value);
				} else {
					this.map.set(key.address, value);
				}
				return ok(undefined);
			},
			() => err("table index is nil"),
		);
	}

	public get(key: AnyLuaValue): Result<LuaMultiReturn, string> {
		const result = this.rawget(wrap(key));
		if (result.isErr()) {
			// pass it through
			return err(result.unwrapErr());
		}

		// the result is nil, then try the metatable
		const value = result.unwrap();
		if (value === undefined && this.metatable) {
			const __indexResult = this.metatable.get(new LuaString("__index"));
			if (__indexResult.isErr()) {
				return err(__indexResult.unwrapErr());
			}
			const metamethod = __indexResult.unwrap();
			if (isLuaTable(metamethod)) {
				return metamethod.get(key);
			} else if (isLuaFunction(metamethod)) {
				const callbackResult = metamethod.callback([this, key]);
				return ok(callbackResult);
			}
		}

		return ok(new LuaMultiReturn([value]));
	}
}
