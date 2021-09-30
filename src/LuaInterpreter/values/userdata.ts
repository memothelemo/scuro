import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { match } from "Shared/utils/rustlang/option";
import { LuaBoolean } from "./boolean";
import { LuaType, LuaValue } from "./types";

export class LuaUserdata implements LuaValue {
	readonly type = LuaType.Userdata;
	readonly address: any;

	public constructor(public readonly value: any) {
		this.address = value;
	}

	public eq(other: LuaMultiReturn) {
		return match(
			other.getFirstReturn(),
			value => new LuaBoolean(value.address === this.address),
			() => new LuaBoolean(false),
		);
	}

	public tostring() {
		return `userdata`;
	}
}
