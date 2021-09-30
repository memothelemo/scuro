import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { match } from "Shared/utils/rustlang/option";
import { LuaBoolean } from "./boolean";
import { LuaType, LuaValue } from "./types";

export class LuaString implements LuaValue {
	readonly type = LuaType.String;
	readonly address: string;

	public constructor(public readonly value: string) {
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
		return this.value;
	}
}
