import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitConditionalStatement } from "../helpers/visitConditionalStatement";
import { visitStatementListOnLoop } from "../helpers/visitStatementList";

export function visitRepeatStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.RepeatStatement,
) {
	// keep on looping
	return visitStatementListOnLoop(script, scope, node.statements, true, () =>
		visitConditionalStatement(script, scope, node),
	);
}
