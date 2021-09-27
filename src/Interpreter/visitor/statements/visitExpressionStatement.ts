import { Scope } from "Interpreter/scope";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { visitCallExpression } from "../expressions/visitCallExpression";

export function visitExpressionStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.ExpressionStatement,
): unknown {
	const { expression } = node;
	switch (expression.kind) {
		case ast.SyntaxKind.CallExpression:
			return visitCallExpression(
				script,
				scope,
				expression as ast.CallExpression,
			);
		default:
			throw `Unsupported expression statement's expression kind: ${
				ast.SyntaxKind[expression.kind]
			}`;
	}
}
