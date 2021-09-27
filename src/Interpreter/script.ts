import { LuaError } from "../Shared/error";
import ast from "../Ast";
import { createGlobal } from "./lib/globals";
import { Scope } from "./scope";
import { LuaState } from "./state";
import { LuaString } from "./values/string";
import { LuaTable } from "./values/table";
import { visitSourceFile } from "./visitor/visitSourceFile";
import { createStringLib } from "./lib/string";

export class LuaScript {
	readonly globals: LuaTable;
	readonly stringLib: LuaTable;
	readonly scope = new Scope();

	constructor(public state: LuaState, public sourceFile: ast.SourceFile) {
		this.globals = createGlobal(state);
		this.stringLib = createStringLib(state);
	}

	captureNode(node: ast.Node) {
		this.state.lastGoodKnownNode = node;
	}

	execute() {
		try {
			return visitSourceFile(this, this.sourceFile);
		} catch (e) {
			if (e instanceof LuaError) {
				return e;
			}
			throw `Unexpected error: ${e}`;
		}
	}

	tryGetVariable(key: string, scope?: Scope) {
		// first get the variable from the scope
		if (!scope) {
			const fromGlobalScope = this.scope.get(key);
			if (fromGlobalScope) return fromGlobalScope;
		} else {
			const fromLocalScope = scope.get(key);
			if (fromLocalScope) return fromLocalScope;
		}

		// load from the globals
		const fromGlobal = this.globals.rawget(new LuaString(key));
		if (fromGlobal) return fromGlobal;

		return this.state.create_nil();
	}
}
