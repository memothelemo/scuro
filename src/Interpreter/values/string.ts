import { isLuaString } from "../../Interpreter/typeGuard";
import { LuaType, LuaValue } from "../types";
import { LuaBoolean } from "./boolean";

export class LuaString implements LuaValue {
	readonly type = LuaType.String;
	address!: string;

	constructor(public value: string) {
		this.updateAddress();
	}

	updateAddress() {
		this.address = this.value;
	}

	len() {
		return this.value.length;
	}

	eq(other: LuaValue): LuaBoolean {
		if (!isLuaString(other)) return new LuaBoolean(false);
		return new LuaBoolean(other.value === this.value);
	}

	toString() {
		return `${this.value}`;
	}
}
