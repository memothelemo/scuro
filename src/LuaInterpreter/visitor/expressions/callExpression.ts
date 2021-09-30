import LuaAST from "LuaAST";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { visitCallLikeExpression } from "../helpers/callLikeExpression";

export function visitCallExpression(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.CallExpression,
) {
	return visitCallLikeExpression(thread, scope, node, false);
}
