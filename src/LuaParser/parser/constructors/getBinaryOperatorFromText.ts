import { ok, Result, err } from "@kherge/result";
import LuaAST from "LuaAST";

export function getBinaryOperatorFromText(
	operator: string,
): Result<LuaAST.BinaryOperator, string> {
	switch (operator) {
		case "+":
			return ok(LuaAST.SyntaxKind.AdditionOperator);
		case "-":
			return ok(LuaAST.SyntaxKind.SubtractionOperator);
		case "*":
			return ok(LuaAST.SyntaxKind.MultiplicationOperator);
		case "/":
			return ok(LuaAST.SyntaxKind.DivisionOperator);
		case "%":
			return ok(LuaAST.SyntaxKind.ModuloOperator);
		case "//":
			return ok(LuaAST.SyntaxKind.FloorDivisionOperator);
		case "^":
			return ok(LuaAST.SyntaxKind.PowerOperator);
		case "..":
			return ok(LuaAST.SyntaxKind.ConcatOperator);
		case "==":
			return ok(LuaAST.SyntaxKind.EqualityOperator);
		case "~=":
			return ok(LuaAST.SyntaxKind.InequalityOperator);
		case "<":
			return ok(LuaAST.SyntaxKind.LessThanOperator);
		case "<=":
			return ok(LuaAST.SyntaxKind.LessEqualOperator);
		case ">":
			return ok(LuaAST.SyntaxKind.GreaterThanOperator);
		case ">=":
			return ok(LuaAST.SyntaxKind.GreaterEqualOperator);
		case "and":
			return ok(LuaAST.SyntaxKind.AndOperator);
		case "or":
			return ok(LuaAST.SyntaxKind.OrOperator);
		default:
			return err(`Unknown binary operator: ${operator}`);
	}
}
