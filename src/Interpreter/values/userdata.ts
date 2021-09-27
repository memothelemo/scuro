import { v4 as uuid } from "uuid";
import { isLuaUserdata } from "../../Interpreter/typeGuard";
import { LuaType, LuaValue } from "../types";
import { LuaBoolean } from "./boolean";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class LuaUserdata<T = any> implements LuaValue {
	readonly type = LuaType.Userdata;
	readonly address = uuid();

	value: T = undefined as unknown as T;

	constructor(value?: T) {
		if (value) {
			this.value = value;
		}
	}

	eq(other: LuaValue): LuaBoolean {
		if (!isLuaUserdata(other)) return new LuaBoolean(false);
		return new LuaBoolean(other.address === this.address);
	}

	toString() {
		return `userdata`;
	}
}
