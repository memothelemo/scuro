import ast from "../../../Ast";
import { LuaScript } from "../../script";
import { visitIdentifierExpression } from "../helpers/visitIdentifierExpression";
import { visitExpressionValue } from "../helpers/visitExpressionValue";
import { LuaValue } from "Interpreter/types";
import { Scope } from "Interpreter/scope";

export function visitCallExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.CallExpression,
) {
	// first get a variable from an identifier
	const variable = visitIdentifierExpression(script, scope, node.id)[0];

	// make sure it is a function
	if (!script.state.is_function(variable)) {
		script.state.throwError(
			`Attempt to call ${variable.toString()}`,
			script,
		);
	}

	// get the arguments
	const args = new Array<LuaValue>();
	ast.NodeArray.forEach(node.parameters, exp => {
		args.push(...visitExpressionValue(script, scope, exp));
	});

	// if the identifier is a method call, bring its self kind of parameter injected
	if (ast.isMethodCallExpression(node.id)) {
		args.unshift(variable);
	}

	// attempt to execute this function
	return variable.executor(args);
}
