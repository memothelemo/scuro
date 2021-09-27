import { isLuaNumber } from "../../Interpreter/typeGuard";
import { LuaType, LuaValue } from "../types";
import { LuaBoolean } from "./boolean";

export class LuaNumber implements LuaValue {
	readonly type = LuaType.Number;
	address!: string;

	constructor(public value: number) {
		this.updateAddress();
	}

	updateAddress() {
		this.address = `${this.value}`;
	}

	eq(other: LuaValue): LuaBoolean {
		if (!isLuaNumber(other)) return new LuaBoolean(false);
		return new LuaBoolean(other.value === this.value);
	}

	toString() {
		return `${this.value}`;
	}
}
