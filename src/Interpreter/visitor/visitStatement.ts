import { Scope } from "../../Interpreter/scope";
import ast from "../../Ast";
import { LuaScript } from "../../Interpreter/script";
import { visitExpressionStatement } from "./statements/visitExpressionStatement";
import { LuaValue } from "Interpreter/types";
import { visitFunctionDeclaration } from "./statements/visitFunctionDeclaration";
import { visitVariableDeclaration } from "./statements/visitVariableDeclaration";
import { visitIfStatement } from "./statements/visitIfStatement";
import { visitWhileStatement } from "./statements/visitWhileStatement";
import { visitRepeatStatement } from "./statements/visitRepeatStatement";
import { visitReturnStatement } from "./statements/visitReturnStatement";
import { visitAssignment } from "./statements/visitAssignment";
import { visitDoStatement } from "./statements/visitDoStatement";
import { visitForStatement } from "./statements/visitForStatement";
import { visitNumericForStatement } from "./statements/visitNumericForStatement";

export function visitStatement(
	script: LuaScript,
	scope: Scope,
	node: ast.Statement,
): LuaValue[] | unknown {
	script.captureNode(node);
	switch (node.kind) {
		case ast.SyntaxKind.Assignment:
			return visitAssignment(script, scope, node as ast.Assignment);
		case ast.SyntaxKind.BreakStatement:
			return;
		case ast.SyntaxKind.ContinueStatement:
			return;
		case ast.SyntaxKind.DoStatement:
			return visitDoStatement(script, scope, node as ast.DoStatement);
		case ast.SyntaxKind.ForStatement:
			return visitForStatement(script, scope, node as ast.ForStatement);
		case ast.SyntaxKind.IfStatement:
			return visitIfStatement(script, scope, node as ast.IfStatement);
		case ast.SyntaxKind.VariableDeclaration:
			return visitVariableDeclaration(
				script,
				scope,
				node as ast.VariableDeclaration,
			);
		case ast.SyntaxKind.FunctionDeclaration:
			return visitFunctionDeclaration(
				script,
				scope,
				node as ast.FunctionDeclaration,
			);
		case ast.SyntaxKind.ExpressionStatement:
			return visitExpressionStatement(
				script,
				scope,
				node as ast.ExpressionStatement,
			);
		case ast.SyntaxKind.NumericForStatement:
			return visitNumericForStatement(
				script,
				scope,
				node as ast.NumericForStatement,
			);
		case ast.SyntaxKind.Assignment:
			return visitAssignment(script, scope, node as ast.Assignment);
		case ast.SyntaxKind.EndOfFile:
			return;
		case ast.SyntaxKind.ReturnStatement:
			return visitReturnStatement(
				script,
				scope,
				node as ast.ReturnStatement,
			);
		case ast.SyntaxKind.WhileStatement:
			return visitWhileStatement(
				script,
				scope,
				node as ast.WhileStatement,
			);
		case ast.SyntaxKind.RepeatStatement:
			return visitRepeatStatement(
				script,
				scope,
				node as ast.RepeatStatement,
			);
		default:
			script.state.throwError(
				`Unsupported statement kind: ${ast.SyntaxKind[node.kind]}`,
				script,
			);
	}
}
