import LuaAST from "LuaAST";
import { LuaThread } from "LuaInterpreter/runtime/thread";

export function visitStringLiteral(
	thread: LuaThread,
	node: LuaAST.StringLiteral,
) {
	return thread.runtime.state.createString(node.value);
}
