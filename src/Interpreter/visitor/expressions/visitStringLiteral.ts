import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";

export function visitStringLiteral(script: LuaScript, node: ast.StringLiteral) {
	return script.state.create_string(node.value);
}
