import LuaAST from "LuaAST";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";

export function visitIdentifier(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.Identifier,
) {
	// try to find the value from the variable
	return thread.runtime.getVariableValue(node.id, scope);
}
