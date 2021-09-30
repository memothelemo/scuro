import { LuaThread } from "../runtime/thread";
import { LuaBoolean } from "./boolean";
import { LuaFunction } from "./function";
import { LuaNumber } from "./number";
import { LuaString } from "./string";
import { LuaTable } from "./table";
import { LuaType, LuaValue } from "./types";
import { LuaUserdata } from "./userdata";

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

export function isLuaNil(value: unknown): value is undefined {
	return value === undefined;
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

export function isLuaThread(value: unknown): value is LuaThread {
	if (!isLuaValue(value)) return false;
	return value.type === LuaType.Thread;
}
