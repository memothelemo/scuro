import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";

export function visitNumericLiteral(
	script: LuaScript,
	node: ast.NumericLiteral,
) {
	return script.state.create_number(Number(node.value));
}
