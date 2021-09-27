import { LuaValue } from "../../../Interpreter/types";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { visitCallExpression } from "../expressions/visitCallExpression";
import { visitIdentifierExpression } from "./visitIdentifierExpression";
import { Scope } from "Interpreter/scope";
import { visitParenthesizedExpression } from "../expressions/visitParenthesizedExpression";
import { visitElementAccessExpression } from "../expressions/visitElementAccessExpression";

export function visitIndexableExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.IndexableExpression,
): LuaValue[] {
	script.captureNode(node);
	switch (node.kind) {
		case ast.SyntaxKind.ParenthesizedExpression:
			return visitParenthesizedExpression(script, scope, node);
		case ast.SyntaxKind.ElementAccessExpression:
			return visitElementAccessExpression(script, scope, node);
		case ast.SyntaxKind.CallExpression:
			return visitCallExpression(script, scope, node);
		default:
			return visitIdentifierExpression(
				script,
				scope,
				node as ast.IdentifierExpression,
			);
	}
}
