import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { match } from "Shared/utils/rustlang/option";
import { LuaBoolean } from "./boolean";
import { LuaType, LuaValue } from "./types";

export class LuaNumber implements LuaValue {
	readonly type = LuaType.Number;
	readonly address: number;

	public constructor(public readonly value: number) {
		this.address = value;
	}

	public eq(other: LuaMultiReturn) {
		return match(
			other.getFirstReturn(),
			value => new LuaBoolean(this.address === value.address),
			() => new LuaBoolean(false),
		);
	}

	public tostring() {
		return `${this.value}`;
	}
}
