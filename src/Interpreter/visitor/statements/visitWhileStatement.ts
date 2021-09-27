import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitConditionalStatement } from "../helpers/visitConditionalStatement";
import { visitStatementListOnLoop } from "../helpers/visitStatementList";

export function visitWhileStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.WhileStatement,
) {
	// keep on looping
	return visitStatementListOnLoop(script, scope, node.statements, false, () =>
		visitConditionalStatement(script, scope, node),
	);
}
