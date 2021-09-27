import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { doUnaryOperation } from "../helpers/doUnaryOperation";
import { visitExpressionValue } from "../helpers/visitExpressionValue";
import { visitUnaryToken } from "../helpers/visitUnaryToken";

export function visitUnaryExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.UnaryExpression,
) {
	// visit both left and right expressions
	const value = visitExpressionValue(script, scope, node.value)[0];
	const logicResult = visitUnaryToken(script, node.operator);
	return doUnaryOperation(script, value, logicResult);
}
