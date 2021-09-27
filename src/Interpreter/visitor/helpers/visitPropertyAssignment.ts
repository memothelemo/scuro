import { LuaValue } from "Interpreter/types";
import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitExpressionValue } from "./visitExpressionValue";
import { visitPropertyIndexExpression } from "./visitPropertyIndexExpression";

export function visitPropertyAssignment(
	script: LuaScript,
	scope: Scope,
	node: ast.PropertyAssignment,
) {
	script.captureNode(node);

	let index: LuaValue[];
	if (node.isWrappedWithValue) {
		index = visitPropertyIndexExpression(script, scope, node.id);
	} else {
		index = [script.state.create_string((node.id as ast.Identifier).id)];
	}
	return {
		index: index,
		value: visitExpressionValue(script, scope, node.value),
	};
}
