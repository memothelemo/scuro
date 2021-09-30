import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { match } from "Shared/utils/rustlang/option";
import { LuaType, LuaValue } from "./types";

export class LuaBoolean implements LuaValue {
	readonly type = LuaType.Boolean;
	readonly address: boolean;

	public constructor(public readonly value: boolean) {
		this.address = value;
	}

	public eq(other: LuaMultiReturn): LuaBoolean {
		return match(
			other.getFirstReturn(),
			value => new LuaBoolean(value.address === this.address),
			() => new LuaBoolean(false),
		);
	}

	public tostring() {
		return `${this.value}`;
	}
}
