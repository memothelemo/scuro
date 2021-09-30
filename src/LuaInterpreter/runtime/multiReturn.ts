import { none, Option, some } from "@kherge/result";
import { AnyLuaValue, LuaValue } from "LuaInterpreter/bundle";
import { wrap } from "Shared/utils/rustlang/option";

export class LuaMultiReturn<T extends AnyLuaValue = AnyLuaValue> {
	private storage = new Array<T>();

	public constructor(initializers: T[]) {
		this.storage.push(...initializers);
	}

	public forEach(callback: (value: T, index: number) => void) {
		this.storage.forEach(callback);
	}

	public getFirstReturn(): Option<LuaValue> {
		return wrap(this.storage[0]) as Option<LuaValue>;
	}

	public unwrap() {
		return this.storage;
	}

	public map<V>(mapCallback: (value: T, index: number) => V) {
		return this.storage.map(mapCallback);
	}

	public isEmpty() {
		return this.storage.length === 0;
	}
}
