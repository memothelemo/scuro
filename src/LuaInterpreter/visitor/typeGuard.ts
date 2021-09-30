import LuaAST from "LuaAST";
import {
	ExpressionValue,
	IdentifierExpression,
	IndexableExpression,
	TableIndexExpressionValue,
} from "./types";

export function isIdentifierExpression(
	node: LuaAST.Node,
): node is IdentifierExpression {
	switch (node.kind) {
		case LuaAST.SyntaxKind.Identifier:
		case LuaAST.SyntaxKind.TableIndexExpression:
			return true;
		default:
			return false;
	}
}

export function isTableIndexExpressionValue(
	node: LuaAST.Node,
): node is TableIndexExpressionValue {
	switch (node.kind) {
		case LuaAST.SyntaxKind.StringLiteral:
		case LuaAST.SyntaxKind.NumericLiteral:
		case LuaAST.SyntaxKind.DotsKeyword:
		case LuaAST.SyntaxKind.FunctionExpression:
			return true;
		default:
			return isIdentifierExpression(node);
	}
}

export function isIndexableExpression(
	node: LuaAST.Node,
): node is IndexableExpression {
	switch (node.kind) {
		case LuaAST.SyntaxKind.MethodCallExpression:
		case LuaAST.SyntaxKind.CallExpression:
		case LuaAST.SyntaxKind.ParenthesizedExpression:
			return true;
		default:
			return isIdentifierExpression(node);
	}
}

export function isExpressionValue(node: LuaAST.Node): node is ExpressionValue {
	switch (node.kind) {
		case LuaAST.SyntaxKind.BinaryExpression:
		case LuaAST.SyntaxKind.UnaryExpression:
		case LuaAST.SyntaxKind.StringLiteral:
		case LuaAST.SyntaxKind.NumericLiteral:
		case LuaAST.SyntaxKind.NilKeyword:
		case LuaAST.SyntaxKind.TrueKeyword:
		case LuaAST.SyntaxKind.FalseKeyword:
		case LuaAST.SyntaxKind.DotsKeyword:
		case LuaAST.SyntaxKind.TableExpression:
		case LuaAST.SyntaxKind.FunctionExpression:
			return true;
		default:
			return isIndexableExpression(node);
	}
}
