import { LuaNil } from "../../../Interpreter/values/nil";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { LuaValue } from "../../../Interpreter/types";
import { visitStatement } from "../visitStatement";
import { Scope } from "../../../Interpreter/scope";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnType<T> = T extends (...args: any[]) => infer V ? V : never;

function visitStatementListInner(
	script: LuaScript,
	scope: Scope,
	list: ast.NodeArray<ast.Statement>,
) {
	const newScope = scope.extend();
	let returnResult: LuaValue[] | undefined;
	let shouldStop = false;

	ast.NodeArray.forEach(list, statement => {
		if (shouldStop) return;

		const result = visitStatement(script, newScope, statement);
		if (ast.isReturnStatement(statement) || newScope.isReturned) {
			returnResult = result as LuaValue[];
			shouldStop = true;
			newScope.isReturned = true;
		} else if (ast.isBreakStatement(statement)) {
			shouldStop = true;
		} else if (scope.isInLoop && ast.isContinueStatement(statement)) {
			shouldStop = true;
		}
	});

	return {
		hasStopped: shouldStop,
		result: returnResult ?? [script.state.create_nil()],
	};
}

export function visitStatementListOnLoop(
	script: LuaScript,
	scope: Scope,
	list: ast.NodeArray<ast.Statement>,
	immediate: boolean,
	condition: () => boolean,
	makeNewScope = true,
): LuaValue[] {
	const newScope = makeNewScope ? scope.extend() : scope;
	newScope.isInLoop = true;
	let result: ReturnType<typeof visitStatementListInner>;
	if (immediate) {
		result = visitStatementListInner(script, newScope, list);
	}
	while (condition()) {
		result = visitStatementListInner(script, newScope, list);
		if (result.hasStopped) {
			scope.isReturned = true;
			return result.result;
		}
	}
	return [new LuaNil()];
}

export function visitStatementList(
	script: LuaScript,
	scope: Scope,
	list: ast.NodeArray<ast.Statement>,
): LuaValue[] {
	const visitResult = visitStatementListInner(script, scope, list);
	return visitResult.result;
}
