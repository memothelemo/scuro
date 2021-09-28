import { ok, Result, err } from "@kherge/result";
import LuaAST from "LuaAST";

export function getUnaryOperatorFromText(
	operator: string,
): Result<LuaAST.UnaryOperator, string> {
	switch (operator) {
		case "-":
			return ok(LuaAST.SyntaxKind.NegationOperator);
		case "#":
			return ok(LuaAST.SyntaxKind.LengthOperator);
		case "not":
			return ok(LuaAST.SyntaxKind.NotOperator);
		default:
			return err(`Unknown unary operator: ${operator}`);
	}
}
