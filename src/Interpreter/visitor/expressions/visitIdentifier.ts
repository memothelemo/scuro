import { LuaValue } from "../../../Interpreter/types";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { Scope } from "Interpreter/scope";

export function visitIdentifier(
	script: LuaScript,
	scope: Scope,
	node: ast.Identifier,
): LuaValue {
	// find that variable that they looking for
	return script.tryGetVariable(node.id, scope);
}
