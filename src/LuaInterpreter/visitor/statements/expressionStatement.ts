import LuaAST from "LuaAST";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { visitStatementLikeExpression } from "../categories/statementLikeExpression";

export function visitExpressionStatement(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.ExpressionStatement,
) {
	return visitStatementLikeExpression(
		thread,
		scope,
		node.expression as LuaAST.StatementLikeExpression,
	);
}
