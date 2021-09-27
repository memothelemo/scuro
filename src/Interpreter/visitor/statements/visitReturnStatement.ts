import { LuaValue } from "Interpreter/types";
import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitExpressionValue } from "../helpers/visitExpressionValue";

export function visitReturnStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.ReturnStatement,
) {
	// piece of cake
	if (node.expression) {
		const returnValues = new Array<LuaValue>();
		ast.NodeArray.forEach(node.expression, expression => {
			const result = visitExpressionValue(script, scope, expression);
			returnValues.push(...result);
		});
		return returnValues;
	}
	return [script.state.create_nil()];
}
