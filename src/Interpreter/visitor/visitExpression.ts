import { LuaValue } from "Interpreter/types";
import ast from "../../Ast";
import { Scope } from "../../Interpreter/scope";
import { LuaScript } from "../../Interpreter/script";
import { visitBinaryExpression } from "./expressions/visitBinaryExpression";
import { visitCallExpression } from "./expressions/visitCallExpression";
import { visitFalseKeyword } from "./expressions/visitFalseKeyword";
import { visitFunctionExpression } from "./expressions/visitFunctionExpression";
import { visitIdentifier } from "./expressions/visitIdentifier";
import { visitNilKeyword } from "./expressions/visitNilKeyword";
import { visitNumericLiteral } from "./expressions/visitNumericLiteral";
import { visitParenthesizedExpression } from "./expressions/visitParenthesizedExpression";
import { visitPropertyAccessExpression } from "./expressions/visitPropertyAccessExpression";
import { visitStringLiteral } from "./expressions/visitStringLiteral";
import { visitTable } from "./expressions/visitTable";
import { visitTrueKeyword } from "./expressions/visitTrueKeyword";
import { visitUnaryExpression } from "./expressions/visitUnaryExpression";

export function visitExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.Expression,
): LuaValue[] {
	script.captureNode(node);
	switch (node.kind) {
		case ast.SyntaxKind.BinaryExpression:
			return visitBinaryExpression(
				script,
				scope,
				node as ast.BinaryExpression,
			);
		case ast.SyntaxKind.CallExpression:
			return visitCallExpression(
				script,
				scope,
				node as ast.CallExpression,
			);
		case ast.SyntaxKind.FalseKeyword:
			return [visitFalseKeyword(script)];
		case ast.SyntaxKind.FunctionExpression:
			return [
				visitFunctionExpression(
					script,
					scope,
					node as ast.FunctionExpression,
					false,
				),
			];
		case ast.SyntaxKind.Identifier:
			return [visitIdentifier(script, scope, node as ast.Identifier)];
		case ast.SyntaxKind.NilKeyword:
			return [visitNilKeyword(script)];
		case ast.SyntaxKind.NumericLiteral:
			return [visitNumericLiteral(script, node as ast.NumericLiteral)];
		case ast.SyntaxKind.PropertyAccessExpression:
			return visitPropertyAccessExpression(
				script,
				scope,
				node as ast.PropertyAccessExpression,
			);
		case ast.SyntaxKind.ParenthesizedExpression:
			return visitParenthesizedExpression(
				script,
				scope,
				node as ast.ParenthesizedExpression,
			);
		case ast.SyntaxKind.StringLiteral:
			return [visitStringLiteral(script, node as ast.StringLiteral)];
		case ast.SyntaxKind.TrueKeyword:
			return [visitTrueKeyword(script)];
		case ast.SyntaxKind.UnaryExpression:
			return visitUnaryExpression(
				script,
				scope,
				node as ast.UnaryExpression,
			);
		case ast.SyntaxKind.Table:
			return visitTable(script, scope, node as ast.Table);
		default:
			script.state.throwError(
				`Unsupported expression kind: ${ast.SyntaxKind[node.kind]}`,
				script,
			);
	}
}
