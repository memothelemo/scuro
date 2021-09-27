import { LuaType, LuaValue } from "./types";
import { LuaBoolean } from "./values/boolean";
import { LuaFunction } from "./values/function";
import { LuaNil } from "./values/nil";
import { LuaNumber } from "./values/number";
import { LuaString } from "./values/string";
import { LuaTable } from "./values/table";
import { LuaUserdata } from "./values/userdata";

export function isLuaValue(value: unknown): value is LuaValue {
	if (value == undefined) return false;
	if (typeof value === "object") {
		if ("address" in value! && "toString" in value!) {
			return true;
		}
	}
	return false;
}

export function isLuaBoolean(value: unknown): value is LuaBoolean {
	if (!isLuaValue(value)) return false;
	return value.type === LuaType.Boolean;
}

export function isLuaFunction(value: unknown): value is LuaFunction {
	if (!isLuaValue(value)) return false;
	return value.type === LuaType.Function;
}

export function isLuaNil(value: unknown): value is LuaNil {
	if (!isLuaValue(value)) return true;
	return value.type === LuaType.Nil;
}

export function isLuaString(value: unknown): value is LuaString {
	if (!isLuaValue(value)) return false;
	return value.type === LuaType.String;
}

export function isLuaUserdata(value: unknown): value is LuaUserdata {
	if (!isLuaValue(value)) return false;
	return value.type === LuaType.Userdata;
}

export function isLuaTable(value: unknown): value is LuaTable {
	if (!isLuaValue(value)) return false;
	return value.type === LuaType.Table;
}

export function isLuaNumber(value: unknown): value is LuaNumber {
	if (!isLuaValue(value)) return false;
	return value.type === LuaType.Number;
}
