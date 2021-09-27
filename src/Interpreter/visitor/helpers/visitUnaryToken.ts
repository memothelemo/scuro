import ast from "../../../Ast";
import { LuaScript } from "../../../Interpreter/script";
import {
	UnaryKind,
	LogicKind,
	LogicKindResult,
} from "../../../Interpreter/types";

export function visitUnaryToken(
	script: LuaScript,
	node: ast.UnaryToken,
): LogicKindResult {
	script.captureNode(node);
	switch (node.kind) {
		case ast.SyntaxKind.DashToken:
			return {
				kind: LogicKind.Unary,
				value: UnaryKind.Dash,
			};
		case ast.SyntaxKind.HashToken:
			return {
				kind: LogicKind.Unary,
				value: UnaryKind.Length,
			};
		case ast.SyntaxKind.NotToken:
			return {
				kind: LogicKind.Unary,
				value: UnaryKind.Opposite,
			};
		default:
			script.state.throwError(
				`Unsupported unary token kind: ${
					ast.SyntaxKind[(node as ast.UnaryToken).kind]
				}`,
				script,
			);
	}
}
