import { LuaValue } from "../../../Interpreter/types";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { visitIndexableExpression } from "./visitIndexableExpression";
import { Scope } from "Interpreter/scope";
import { visitBinaryExpression } from "../expressions/visitBinaryExpression";
import { visitUnaryExpression } from "../expressions/visitUnaryExpression";
import { visitFunctionExpression } from "../expressions/visitFunctionExpression";
import { visitFalseKeyword } from "../expressions/visitFalseKeyword";
import { visitTrueKeyword } from "../expressions/visitTrueKeyword";
import { visitNilKeyword } from "../expressions/visitNilKeyword";
import { visitNumericLiteral } from "../expressions/visitNumericLiteral";
import { visitStringLiteral } from "../expressions/visitStringLiteral";
import { visitTable } from "../expressions/visitTable";

export function visitExpressionValue(
	script: LuaScript,
	scope: Scope,
	node: ast.ExpressionValue,
): LuaValue[] {
	script.captureNode(node);
	switch (node.kind) {
		case ast.SyntaxKind.FalseKeyword:
			return [visitFalseKeyword(script)];
		case ast.SyntaxKind.TrueKeyword:
			return [visitTrueKeyword(script)];
		case ast.SyntaxKind.NilKeyword:
			return [visitNilKeyword(script)];
		case ast.SyntaxKind.NumericLiteral:
			return [visitNumericLiteral(script, node)];
		case ast.SyntaxKind.FunctionExpression:
			return [
				visitFunctionExpression(
					script,
					scope,
					node as ast.FunctionExpression,
					false,
				),
			];
		case ast.SyntaxKind.BinaryExpression:
			return visitBinaryExpression(
				script,
				scope,
				node as ast.BinaryExpression,
			);
		case ast.SyntaxKind.UnaryExpression:
			return visitUnaryExpression(
				script,
				scope,
				node as ast.UnaryExpression,
			);
		case ast.SyntaxKind.StringLiteral:
			return [visitStringLiteral(script, node)];
		case ast.SyntaxKind.Table:
			return visitTable(script, scope, node);
		default:
			return visitIndexableExpression(
				script,
				scope,
				node as ast.IndexableExpression,
			);
	}
}
