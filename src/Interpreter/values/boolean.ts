import { isLuaBoolean } from "../../Interpreter/typeGuard";
import { LuaType, LuaValue } from "../types";

export class LuaBoolean implements LuaValue {
	readonly type = LuaType.Boolean;
	address!: string;

	constructor(public value: boolean) {
		this.update();
	}

	update() {
		this.address = `${this.value}`;
	}

	eq(other: LuaValue): LuaBoolean {
		if (!isLuaBoolean(other)) return new LuaBoolean(false);
		return new LuaBoolean(other.value === this.value);
	}

	toString() {
		return `${this.value}`;
	}
}
