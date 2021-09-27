import { LuaType, LuaValue } from "../../../Interpreter/types";
import { LuaBoolean } from "Interpreter/values/boolean";

export function isFalsy(value: LuaValue) {
	switch (value.type) {
		case LuaType.Boolean:
			return (value as LuaBoolean).value === false;
		case LuaType.Nil:
			return true;
		default:
			return false;
	}
}
