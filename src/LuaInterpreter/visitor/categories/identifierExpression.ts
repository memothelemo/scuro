import LuaAST from "LuaAST";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { visitIdentifier } from "../expressions/identifier";
import { IdentifierExpression } from "../types";

export function visitIdentifierExpression(
	thread: LuaThread,
	scope: Scope,
	node: IdentifierExpression,
) {
	switch (node.kind) {
		case LuaAST.SyntaxKind.Identifier:
			return visitIdentifier(thread, scope, node);
		default:
			return thread.runtime.state.throwError(
				`Unsupported identifier expression: ${
					LuaAST.SyntaxKind[node.kind]
				}`,
			);
	}
}
