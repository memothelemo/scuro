import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";

export function visitVarArgsKeyword(scope: Scope) {
	// simple as cake
	return scope.getVarArgs();
}
