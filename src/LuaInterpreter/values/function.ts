import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { match } from "Shared/utils/rustlang/option";

// @no-transform-path
import { v4 as uuid } from "uuid";
import { LuaBoolean } from "./boolean";
import { AnyLuaValue, LuaType, LuaValue } from "./types";

export type LuaFunctionCallback = (args: AnyLuaValue[]) => LuaMultiReturn;

export class LuaFunction implements LuaValue {
	readonly type = LuaType.Function;
	readonly address = uuid();

	public constructor(public callback: LuaFunctionCallback) {}

	public eq(other: LuaMultiReturn): LuaBoolean {
		return match(
			other.getFirstReturn(),
			value => new LuaBoolean(value.address === this.address),
			() => new LuaBoolean(false),
		);
	}

	public tostring() {
		return `function: ${this.address}`;
	}
}
