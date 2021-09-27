import { Scope } from "Interpreter/scope";
import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import { visitElementAccessExpression } from "../expressions/visitElementAccessExpression";
import { visitIdentifier } from "../expressions/visitIdentifier";
import { visitPropertyAccessExpression } from "../expressions/visitPropertyAccessExpression";

export function visitIdentifierExpression(
	script: LuaScript,
	scope: Scope,
	node: ast.IdentifierExpression,
) {
	script.captureNode(node);
	switch (node.kind) {
		case ast.SyntaxKind.Identifier:
			return [visitIdentifier(script, scope, node)];
		case ast.SyntaxKind.PropertyAccessExpression:
			return visitPropertyAccessExpression(script, scope, node);
		case ast.SyntaxKind.ElementAccessExpression:
			return visitElementAccessExpression(script, scope, node);
		default:
			script.state.throwError(
				`Unsupported identifier expression kind: ${
					ast.SyntaxKind[(node as ast.Node).kind]
				}`,
				script,
			);
	}
}
