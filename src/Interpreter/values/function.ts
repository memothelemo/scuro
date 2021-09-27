import { v4 as uuid } from "uuid";
import { isLuaFunction } from "../../Interpreter/typeGuard";
import { LuaType, LuaValue } from "../types";
import { LuaBoolean } from "./boolean";

export type LuaFunctionExecutor = (args: LuaValue[]) => LuaValue[];

export class LuaFunction implements LuaValue {
	readonly type = LuaType.Function;
	readonly address = uuid();

	constructor(public executor: LuaFunctionExecutor) {}

	eq(other: LuaValue): LuaBoolean {
		if (!isLuaFunction(other)) return new LuaBoolean(false);
		return new LuaBoolean(other.address === this.address);
	}

	toString() {
		return `function: ${this.address}`;
	}
}
