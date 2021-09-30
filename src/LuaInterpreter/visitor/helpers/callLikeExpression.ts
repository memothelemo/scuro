import LuaAST from "LuaAST";
import { AnyLuaValue, LuaFunction } from "LuaInterpreter/bundle";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaThread } from "LuaInterpreter/runtime/thread";
import { visitExpressionValue } from "../categories/expressionValue";
import { visitIdentifierExpression } from "../categories/identifierExpression";
import { isIdentifierExpression } from "../typeGuard";
import { ExpressionValue } from "../types";

export function visitCallLikeExpression(
	thread: LuaThread,
	scope: Scope,
	node: LuaAST.CallLikeExpression,
	isMethod: boolean,
) {
	// get a variable from an identifier
	const identifier = node.expression;
	if (!isIdentifierExpression(identifier)) {
		return thread.runtime.state.throwError(
			"Identifier expression expected",
		);
	}

	const varopt = visitIdentifierExpression(
		thread,
		scope,
		identifier,
	).getFirstReturn();

	// validating it is a function
	let variable: LuaFunction;
	let isCallback = true;

	if (varopt.isNone()) {
		isCallback = false;
	} else {
		if (!thread.runtime.state.isFunction(varopt.unwrap())) {
			isCallback = false;
		}
	}

	if (!isCallback) {
		return thread.runtime.state.throwError(
			`attempt to call non-function value`,
		);
	}

	variable = varopt.unwrap() as LuaFunction;

	// prepare for arguments
	const args = new Array<AnyLuaValue>();
	for (const param of node.params) {
		args.push(
			...visitExpressionValue(
				thread,
				scope,
				param as ExpressionValue,
			).unwrap(),
		);
	}

	// bring self parameter
	if (isMethod) {
		args.unshift(variable);
	}

	// attempt to execute this function
	return variable.callback(args);
}
