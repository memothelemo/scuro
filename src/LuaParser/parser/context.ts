import { wrap } from "Shared/utils/rustlang/option";

export interface Scope {
	id: number;
	isInLoop: boolean;
}

export class Context {
	private scopes = new Array<Scope>();
	private variables = new Map<number, string[]>();

	public isInLoop() {
		let i = this.scopes.length;
		while (i-- > 0) {
			if (this.scopes[i].isInLoop) {
				return true;
			}
		}
		return false;
	}

	public pushScope(isInLoop: boolean) {
		this.scopes.push({
			id: this.scopes.length + 1,
			isInLoop: isInLoop,
		});
	}

	public popScope() {
		this.scopes.pop();
	}

	public hasVariable(name: string) {
		let i = this.scopes.length - 1;
		while (i-- > 0) {
			const list = this.variables.get(i);
			if (list && list.includes(name)) {
				return true;
			}
		}
		return false;
	}

	public addLocal(name: string) {
		// create one if it does not exists
		const currentScopeId = this.getCurrentScopeId();
		const list = this.variables.get(currentScopeId);

		if (!list) {
			this.variables.set(currentScopeId, new Array<string>(name));
		} else {
			list.push(name);
			this.variables.set(currentScopeId, list);
		}
	}

	public getCurrentScopeId() {
		return this.scopes.length - 1;
	}

	public getScopeFromId(id: number) {
		return wrap(this.scopes[id]);
	}

	public getCurrentScope() {
		return wrap(this.scopes[this.getCurrentScopeId()]);
	}
}
