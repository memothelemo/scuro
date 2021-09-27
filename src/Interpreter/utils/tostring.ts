import { LuaValue } from "../../Interpreter/types";

export function tostring(value: LuaValue) {
	return value.toString();
}
