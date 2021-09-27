import { v4 as uuid } from "uuid";
import { LuaError } from "../../Shared/error";
import {
	isLuaFunction,
	isLuaNil,
	isLuaNumber,
	isLuaString,
	isLuaTable,
	isLuaValue,
} from "../../Interpreter/typeGuard";
import { LuaType, LuaValue } from "../types";
import { LuaBoolean } from "./boolean";
import { LuaNil } from "./nil";
import { LuaNumber } from "./number";
import { LuaString } from "./string";
import { LuaState } from "Interpreter/state";

export class LuaTable implements LuaValue {
	readonly type = LuaType.Table;
	readonly address = uuid();

	/** cache for stringifyTable */
	private uniqueAddresses = new Array<string>();

	array = new Array<LuaValue>();
	map = new Map<LuaValue, LuaValue>();

	metatable?: LuaTable = undefined;

	/*{ Meh = "Yes" }*/
	constructor(private state: LuaState) {}

	eq(other: LuaValue): LuaBoolean {
		if (!isLuaTable(other)) return new LuaBoolean(false);
		return new LuaBoolean(this.address === other.address);
	}

	/**
	 * Attempts to stringify tables (does not apply to metatable)
	 *
	 * **Note**: This is an experimental method, it may cause problems
	 * with cyclic tables
	 */
	stringifyTable(indent = 0) {
		// make an indentation string
		let indentStr = "  ".repeat(indent);
		let shiftStr = "  ".repeat(indent + 1);
		let result = indentStr + "{\n";

		const callback = (value: LuaValue, key: LuaValue | number) => {
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
			} else {
				initial += `${value.toString()}\n`;
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

	/** refreshes the lua table */
	refresh() {
		// if the array index is enough to fit with the
		// array then it can be become an array member
		for (const [key, value] of this.map) {
			if (!isLuaNumber(key)) {
				continue;
			}

			const suitableIndexToJoin = this.length + 1;
			if (key.value === suitableIndexToJoin) {
				this.map.delete(key);
				this.insert(value);
			}
		}
	}

	get length() {
		return this.array.length;
	}

	set(key: LuaValue, value: LuaValue) {
		if (this.metatable) {
			const setter = this.metatable.get(new LuaString("__newindex"));
			if (!isLuaFunction(setter) && !isLuaNil(setter)) {
				throw "Expected __newindex to be a function";
			}
			if (isLuaFunction(setter)) {
				setter.executor([this, key, value]);
				return;
			}
		}
		return this.rawset(key, value);
	}

	get(key: LuaValue): LuaValue {
		const value = this.rawget(key);
		if (value.type === LuaType.Nil && this.metatable) {
			const indexer = this.metatable.get(new LuaString("__index"));
			if (isLuaTable(indexer)) {
				return indexer.get(key);
			}
			if (isLuaFunction(indexer)) {
				const v = indexer.executor([this, key]);
				if (v === undefined) {
					return new LuaNil();
				} else if (!isLuaValue(v)) {
					this.state.throwError(
						"Unexpected error when returning a value with JS value",
					);
				}
				return v;
			}
		}
		return value;
	}

	getMapKeyFromUnknownKey(key: LuaValue) {
		for (const mapKey of this.map.keys()) {
			switch (key.type) {
				case LuaType.Boolean:
					if (mapKey.eq(key)) {
						return mapKey;
					}
					break;
				case LuaType.Nil:
					if (mapKey.type === LuaType.Nil) {
						return mapKey;
					}
					break;
				default:
					if (mapKey.address === key.address) {
						return mapKey;
					}
					break;
			}
		}
	}

	/** Raw map getter function */
	mapget(key: LuaValue) {
		// attempt #1
		let mapKey = this.getMapKeyFromUnknownKey(key);
		if (mapKey) {
			return this.map.get(mapKey);
		}
		return this.map.get(key);
	}

	mapset(key: LuaValue, value: LuaValue) {
		const mapKey = this.getMapKeyFromUnknownKey(key);
		if (mapKey) {
			// if the value is nil, then delete it!
			if (isLuaNil(value)) {
				this.map.delete(mapKey);
			} else {
				this.map.set(mapKey, value);
			}
		} else {
			this.map.set(key, value);
		}
		this.refresh();
	}

	arrayset(key: LuaNumber, value: LuaValue) {
		if (this.array.length - 1 > key.value) {
			this.mapset(key, value);
		} else {
			this.array[key.value] = value;
		}
		this.refresh();
	}

	/** useful for table.insert later on */
	insert(value: LuaValue, index?: LuaNumber) {
		// do not apply if that value is nil
		if (value.type === LuaType.Nil) {
			return;
		}

		if (!index) {
			this.array.push(value);
			return;
		}

		// lookout for that index because it will considered as a map
		// if it is out of the array collection list
		if (this.array.length - 1 > index.value) {
			this.mapset(index, value);
			return this.refresh();
		}

		this.array.splice(index.value, 0, value);
	}

	rawget(key: LuaValue) {
		switch (key.type) {
			case LuaType.Number:
				// array contents
				const arrayIndex = this.array.findIndex((_, i) => {
					return i === (key as LuaNumber).value - 1;
				});
				if (arrayIndex !== -1) {
					return this.array[arrayIndex];
				}
			default:
				return this.mapget(key) ?? new LuaNil();
		}
	}

	rawset(key: LuaValue, value: LuaValue) {
		// lua's array can only be start at strictly 1
		// otherwise it is considered as a map
		switch (key.type) {
			case LuaType.Number:
				if ((key as LuaNumber).value <= 0) {
					return this.mapset(key, value);
				}
				return this.insert(value);
			default:
				return this.mapset(key, value);
		}
	}

	toString() {
		return `table: ${this.address}`;
	}
}
