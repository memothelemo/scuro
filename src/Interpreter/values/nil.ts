import { isLuaNil } from "../../Interpreter/typeGuard";
import { LuaType, LuaValue } from "../types";
import { LuaBoolean } from "./boolean";

export class LuaNil implements LuaValue {
	readonly type = LuaType.Nil;
	readonly address = "luau_nil";

	constructor() {}

	eq(other: LuaNil): LuaBoolean {
		return new LuaBoolean(isLuaNil(other));
	}

	toString() {
		return `nil`;
	}
}
