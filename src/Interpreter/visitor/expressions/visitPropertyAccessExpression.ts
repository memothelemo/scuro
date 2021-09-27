import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitIndexingExpression } from "../helpers/visitIndexingExpression";

export function visitPropertyAccessExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.PropertyAccessExpression,
) {
	return visitIndexingExpression(script, scope, node);
}
