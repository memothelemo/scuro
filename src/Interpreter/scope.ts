import { hasOwnProperty } from "../Shared/utils/hasOwnProperty";
import { LuaValue } from "./types";

export class Scope {
	private parent?: Scope;
	private varArgs: LuaValue[] = [];
	private readonly variables: Record<string, LuaValue>;

	isInLoop = false;
	isReturned = false;

	constructor(variables = {}) {
		this.variables = variables;
	}

	get(key: string): LuaValue | undefined {
		return this.variables[key];
	}

	set(key: string, value: LuaValue) {
		if (hasOwnProperty(this.variables, key) || !this.parent) {
			this.setLocal(key, value);
		} else {
			this.parent.set(key, value);
		}
	}

	setVarArgs(args: LuaValue[]) {
		this.varArgs = args;
	}

	getVarArgs(): LuaValue[] {
		return this.varArgs || (this.parent && this.parent.getVarArgs()) || [];
	}

	setLocal(key: string, value: LuaValue) {
		this.variables[key] = value;
	}

	extend() {
		const innerVars = Object.create(this.variables);
		const scope = new Scope(innerVars);
		scope.parent = this;
		return scope;
	}
}
