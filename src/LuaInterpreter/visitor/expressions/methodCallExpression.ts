import LuaAST from "LuaAST";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { visitCallLikeExpression } from "../helpers/callLikeExpression";

export function visitMethodCallExpression(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.MethodCallExpression,
) {
	return visitCallLikeExpression(thread, scope, node, true);
}
