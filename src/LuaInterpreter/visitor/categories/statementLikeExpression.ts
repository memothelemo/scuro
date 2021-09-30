import LuaAST from "LuaAST";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { visitCallExpression } from "../expressions/callExpression";
import { visitMethodCallExpression } from "../expressions/methodCallExpression";

export function visitStatementLikeExpression(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.StatementLikeExpression,
) {
	switch (node.kind) {
		case LuaAST.SyntaxKind.CallExpression:
			return visitCallExpression(thread, scope, node);
		case LuaAST.SyntaxKind.MethodCallExpression:
			return visitMethodCallExpression(thread, scope, node);
		default:
			return thread.runtime.state.throwError(
				`Unknown statement like expression: ${
					LuaAST.SyntaxKind[(node as LuaAST.Node).kind]
				}`,
			);
	}
}
