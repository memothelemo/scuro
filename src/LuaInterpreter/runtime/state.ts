import {
	AnyLuaValue,
	isLuaBoolean,
	isLuaFunction,
	isLuaNumber,
	isLuaString,
	isLuaTable,
	isLuaUserdata,
	LuaBoolean,
	LuaFunction,
	LuaFunctionCallback,
	LuaNumber,
	LuaString,
	LuaTable,
	LuaUserdata,
} from "LuaInterpreter/bundle";
import { LuaMultiReturn } from "./multiReturn";

export class LuaState {
	public throwError(reason: string): never {
		throw reason;
	}

	public isString(obj: unknown): obj is LuaString {
		return isLuaString(obj);
	}

	public isBoolean(obj: unknown): obj is LuaBoolean {
		return isLuaBoolean(obj);
	}

	public isNumber(obj: unknown): obj is LuaNumber {
		return isLuaNumber(obj);
	}

	public isUserdata(obj: unknown): obj is LuaUserdata {
		return isLuaUserdata(obj);
	}

	public isFunction(obj: unknown): obj is LuaFunction {
		return isLuaFunction(obj);
	}

	public isTable(obj: unknown): obj is LuaTable {
		return isLuaTable(obj);
	}

	public createString(str: string) {
		return new LuaString(str);
	}

	public createBoolean(bool: boolean) {
		return new LuaBoolean(bool);
	}

	public createMultiReturn(...values: AnyLuaValue[]) {
		return new LuaMultiReturn(values);
	}

	public createTable() {
		return new LuaTable();
	}

	public createNumber(num: number) {
		return new LuaNumber(num);
	}

	public createUserdata(value: any) {
		return new LuaUserdata(value);
	}

	public createFunction(callback: LuaFunctionCallback) {
		return new LuaFunction(callback);
	}
}
