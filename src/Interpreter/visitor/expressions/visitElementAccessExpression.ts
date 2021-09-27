import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitIndexingExpression } from "../helpers/visitIndexingExpression";

export function visitElementAccessExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.ElementAccessExpression,
) {
	return visitIndexingExpression(script, scope, node);
}
