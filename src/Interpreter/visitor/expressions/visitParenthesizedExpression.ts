import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitExpressionValue } from "../helpers/visitExpressionValue";

export function visitParenthesizedExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.ParenthesizedExpression,
) {
	return visitExpressionValue(script, scope, node.expression);
}
