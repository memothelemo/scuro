import ast from "../../../Ast";
import { Scope } from "../../scope";
import { LuaScript } from "../../script";

export function isIdentifierExpressionAMethod(node: ast.IdentifierExpression) {
	switch (node.kind) {
		case ast.SyntaxKind.Identifier:
			// identifier cannot be methods
			return false;
		case ast.SyntaxKind.PropertyAccessExpression:
			return (node as ast.PropertyAccessExpression).isMethod;
		case ast.SyntaxKind.ElementAccessExpression:
			// nope
			return false;
	}
}
