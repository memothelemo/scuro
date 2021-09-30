import LuaAST from "LuaAST";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { visitCallExpression } from "../expressions/callExpression";
import { visitIdentifier } from "../expressions/identifier";
import { visitMethodCallExpression } from "../expressions/methodCallExpression";
import { visitStringLiteral } from "../expressions/string";
import { ExpressionValue } from "../types";

export function visitExpressionValue(
	thread: LuaThread,
	scope: Scope,
	node: ExpressionValue,
) {
	switch (node.kind) {
		case LuaAST.SyntaxKind.Identifier:
			return visitIdentifier(thread, scope, node);
		case LuaAST.SyntaxKind.StringLiteral:
			return thread.runtime.state.createMultiReturn(
				visitStringLiteral(thread, node),
			);
		case LuaAST.SyntaxKind.MethodCallExpression:
			return visitMethodCallExpression(thread, scope, node);
		case LuaAST.SyntaxKind.CallExpression:
			return visitCallExpression(thread, scope, node);
		default:
			return thread.runtime.state.throwError(
				`Unsupported expression value kind: ${
					LuaAST.SyntaxKind[node.kind]
				}`,
			);
	}
}
