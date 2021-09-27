import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitExpression } from "../visitExpression";
import { isFalsy } from "./isFalsy";

export function visitConditionalStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.ConditionalStatement,
) {
	// visit the expression or condition
	const condition = visitExpression(script, scope, node.expression);
	return !isFalsy(condition[0]);
}
