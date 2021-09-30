import LuaAST from "LuaAST";

export type TableIndexExpressionValue =
	| LuaAST.StringLiteral
	| LuaAST.NumericLiteral
	| LuaAST.DotsKeyword
	| LuaAST.FunctionExpression
	| IdentifierExpression;

export type IdentifierExpression =
	| LuaAST.Identifier
	| LuaAST.TableIndexExpression;

export type IndexableExpression =
	| LuaAST.MethodCallExpression
	| LuaAST.CallExpression
	| LuaAST.ParenthesizedExpression
	| IdentifierExpression;

export type ExpressionValue =
	| LuaAST.BinaryExpression
	| LuaAST.UnaryExpression
	| LuaAST.StringLiteral
	| LuaAST.NumericLiteral
	| LuaAST.NilKeyword
	| LuaAST.BooleanLiteral
	| LuaAST.DotsKeyword
	| LuaAST.TableExpression
	| LuaAST.FunctionExpression
	| IndexableExpression;
