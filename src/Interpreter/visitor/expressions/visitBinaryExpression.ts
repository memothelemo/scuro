import ast from "Ast";
import { LogicKind } from "../../../Interpreter/types";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { doArithmeticBinaryOperation } from "../helpers/doArithmeticBinaryOperation";
import { doComparisonBinaryOperation } from "../helpers/doComparisonBinaryOperation";
import { visitExpressionValue } from "../helpers/visitExpressionValue";
import { visitBinaryToken } from "../helpers/visitBinaryToken";

export function visitBinaryExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.BinaryExpression,
) {
	// visit both left and right expressions
	const left = visitExpressionValue(script, scope, node.left)[0];
	const logicResult = visitBinaryToken(node.operator);
	const right = visitExpressionValue(script, scope, node.right)[0];

	if (logicResult.kind === LogicKind.Arithmetic) {
		return doArithmeticBinaryOperation(script, left, logicResult, right);
	} else if (logicResult.kind === LogicKind.Comparison) {
		return doComparisonBinaryOperation(script, left, logicResult, right);
	} else {
		script.state.throwError(
			`Unexpected unary operator in a binary expression`,
			script,
		);
	}
}
