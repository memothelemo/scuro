import { AnyLuaValue } from "LuaInterpreter/values/types";
import { hasOwnProperty } from "Shared/utils/object";

export class Scope {
	private parent?: Scope;
	private varArgs: AnyLuaValue[] = [];
	private readonly variables: Record<string, AnyLuaValue>;

	isInLoop = false;
	isReturned = false;

	public constructor(variables = {}) {
		this.variables = variables;
	}

	public get(key: string): AnyLuaValue | undefined {
		return this.variables[key];
	}

	public setLocal(key: string, value: AnyLuaValue) {
		this.variables[key] = value;
	}

	public set(key: string, value: AnyLuaValue) {
		if (hasOwnProperty(this.variables, key) || !this.parent) {
			this.setLocal(key, value);
		} else {
			this.parent.set(key, value);
		}
	}

	public setVarArgs(args: AnyLuaValue[]) {
		this.varArgs = args;
	}

	public getVarArgs(): AnyLuaValue[] {
		return this.varArgs || (this.parent && this.parent.getVarArgs()) || [];
	}

	public extend() {
		const innerVars = Object.create(this.variables);
		const scope = new Scope(innerVars);
		scope.parent = this;
		return scope;
	}
}
