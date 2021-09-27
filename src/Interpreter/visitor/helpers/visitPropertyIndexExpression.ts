import ast from "../../../Ast";
import { Scope } from "../../scope";
import { LuaScript } from "../../script";
import { visitFunctionExpression } from "../expressions/visitFunctionExpression";
import { visitNumericLiteral } from "../expressions/visitNumericLiteral";
import { visitStringLiteral } from "../expressions/visitStringLiteral";
import { visitVarArgsKeyword } from "../expressions/visitVarArgsKeyword";
import { visitIdentifierExpression } from "./visitIdentifierExpression";

export function visitPropertyIndexExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.PropertyIndexExpression,
) {
	script.captureNode(node);
	switch (node.kind) {
		case ast.SyntaxKind.StringLiteral:
			return [visitStringLiteral(script, node as ast.StringLiteral)];
		case ast.SyntaxKind.NumericLiteral:
			return [visitNumericLiteral(script, node as ast.NumericLiteral)];
		case ast.SyntaxKind.VarArgsKeyword:
			return visitVarArgsKeyword(scope);
		case ast.SyntaxKind.FunctionExpression:
			return [
				visitFunctionExpression(
					script,
					scope,
					node as ast.FunctionExpression,
					false,
				),
			];
		default:
			return visitIdentifierExpression(script, scope, node);
	}
}
