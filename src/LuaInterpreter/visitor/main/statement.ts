import { Option, some } from "@kherge/result";
import LuaAST from "LuaAST";
import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { wrap } from "Shared/utils/rustlang/option";
import { visitExpressionStatement } from "../statements/expressionStatement";

function visitStatementInner(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.Statement,
) {
	switch (node.kind) {
		case LuaAST.SyntaxKind.ExpressionStatement:
			return visitExpressionStatement(
				thread,
				scope,
				node as LuaAST.ExpressionStatement,
			);
		default:
			return thread.runtime.state.throwError(
				`Unsupported statement kind: ${LuaAST.SyntaxKind[node.kind]}`,
			);
	}
}

export function visitStatement(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.Statement,
): Option<LuaMultiReturn> {
	const result = visitStatementInner(thread, scope, node);
	return wrap(result);
}
