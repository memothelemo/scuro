import { Scope } from "Interpreter/scope";
import { LuaValue } from "Interpreter/types";
import { LuaFunction } from "Interpreter/values/function";
import ast from "../../../Ast";
import { LuaScript } from "../../script";
import { visitStatementList } from "../helpers/visitStatementList";

export function visitFunctionExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.FunctionExpression,
	isMethod: boolean,
): LuaFunction {
	const argumentNames = new Array<string>();
	let hasVarArgs = false;

	// checking for parameters
	if (node.parameters) {
		ast.NodeArray.forEach(
			node.parameters as ast.NodeArray<ast.Identifier>,
			param => {
				if (ast.isVarArgsKeyword(param)) {
					hasVarArgs = true;
				} else {
					argumentNames.push(param.id);
				}
			},
		);
	}

	return script.state.create_function(args => {
		// creating a new scope
		const newScope = scope.extend();
		const varArgs = new Array<LuaValue>();

		// check for arguments
		args.forEach((arg, i) => {
			let argName: string;
			if (isMethod && i === 0) {
				argName = "self";
			} else {
				argName = argumentNames[i];
			}
			if (argName === undefined) {
				// maybe join them as an var argument
				varArgs.push(arg);
			} else {
				newScope.setLocal(argName, arg);
			}
		});

		newScope.setVarArgs(varArgs);
		return visitStatementList(script, scope, node.statements);
	});
}
