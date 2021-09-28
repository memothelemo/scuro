import {
	Identifier,
	Block,
	Statement,
	Node,
	TextRange,
	Expression,
	DoStatement,
	IfStatement,
	GotoStatement,
	LabelStatement,
	ExpressionStatement,
	BreakStatement,
	WhileStatement,
	RepeatStatement,
	ReturnStatement,
	IterationStatement,
	AssignmentStatement,
	GenericForStatement,
	NumericForStatement,
	VariableDeclarationStatement,
	AssignmentLeftSideExpression,
} from "LuaAST/nodes";
import { SyntaxKind } from "LuaAST/enums";
import {
	isIdentifier,
	isTableIndexExpression,
} from "LuaAST/factory/expressions";
import { createNode } from "LuaAST/factory/main";

export function isBlock(node: Node): node is Block {
	return node.kind === SyntaxKind.Block;
}

export function createBlock(statements: Statement[], position?: TextRange) {
	const block = createNode(SyntaxKind.Block, position) as Block;
	block.statements = statements;
	return block;
}

// do {new_scope} end
export function isDoStatement(node: Node): node is DoStatement {
	return node.kind === SyntaxKind.DoStatement;
}

export function createDoStatement(block: Block, position?: TextRange) {
	const statement = createNode(
		SyntaxKind.DoStatement,
		position,
	) as DoStatement;
	statement.block = block;
	return statement;
}

// if <exp> then <block> <elseblock> ends
export function isIfStatement(node: Node): node is IfStatement {
	return node.kind === SyntaxKind.IfStatement;
}

export function createIfStatement(
	condition: Expression,
	ifBlock: Block,
	elseBlock?: Block | IfStatement,
	position?: TextRange,
) {
	const node = createNode(SyntaxKind.IfStatement, position) as IfStatement;
	node.condition = condition;
	node.ifBlock = ifBlock;
	node.elseBlock = elseBlock;
	return node;
}

// while <condition> do <block> end
export function isWhileStatement(node: Node): node is WhileStatement {
	return node.kind === SyntaxKind.WhileStatement;
}

export function createWhileStatement(
	block: Block,
	condition: Expression,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.WhileStatement,
		position,
	) as WhileStatement;
	node.condition = condition;
	node.block = block;
	return node;
}

// return <exp>, <exp>, ...
export function isReturnStatement(node: Node): node is ReturnStatement {
	return node.kind === SyntaxKind.ReturnStatement;
}

export function createReturnStatement(
	expressions: Expression[],
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.ReturnStatement,
		position,
	) as ReturnStatement;
	node.expressions = expressions;
	return node;
}

// break
export function isBreakStatement(node: Node): node is BreakStatement {
	return node.kind === SyntaxKind.BreakStatement;
}

export function createBreakStatement(position?: TextRange) {
	const node = createNode(
		SyntaxKind.BreakStatement,
		position,
	) as BreakStatement;
	return node;
}

// <exp>
export function isExpressionStatement(node: Node): node is ExpressionStatement {
	return node.kind === SyntaxKind.ExpressionStatement;
}

export function createExpressionStatement(
	expression: Expression,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.ExpressionStatement,
		position,
	) as ExpressionStatement;
	node.expression = expression;
	return node;
}

// repeat <block> until <exp>
export function isRepeatStatement(node: Node): node is RepeatStatement {
	return node.kind === SyntaxKind.RepeatStatement;
}

export function createRepeatStatement(
	block: Block,
	condition: Expression,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.RepeatStatement,
		position,
	) as RepeatStatement;
	node.condition = condition;
	node.block = block;
	return node;
}

// local <id>, ... = <exp>, ...
export function isVariableDeclarationStatement(
	node: Node,
): node is VariableDeclarationStatement {
	return node.kind === SyntaxKind.VariableDeclarationStatement;
}

export function createVariableDeclarationStatement(
	left: Identifier[],
	right?: Expression[],
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.VariableDeclarationStatement,
		position,
	) as VariableDeclarationStatement;
	node.left = left;
	node.right = right;
	return node;
}

// <exp>, ... =? <exp>?, ...?
export function isAssignmentLeftSideExpression(
	node: Node,
): node is AssignmentLeftSideExpression {
	return isIdentifier(node) || isTableIndexExpression(node);
}

export function isAssignmentStatement(node: Node): node is AssignmentStatement {
	return node.kind === SyntaxKind.AssignmentStatement;
}

export function createAssignmentStatement(
	left: AssignmentLeftSideExpression[],
	right?: Expression[],
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.AssignmentStatement,
		position,
	) as AssignmentStatement;
	node.left = left;
	node.right = right;
	return node;
}

// the king of while, repeat and for statements
export function isIterationStatement(node: Node): node is IterationStatement {
	return (
		isWhileStatement(node) ||
		isRepeatStatement(node) ||
		isNumericForStatement(node) ||
		isGenericForStatement(node)
	);
}

// for <id> = <exp>, <exp>, <exp>? do <block> end
export function isNumericForStatement(node: Node): node is NumericForStatement {
	return node.kind === SyntaxKind.NumericForStatement;
}

export function createNumericForStatement(
	block: Block,
	name: Identifier,
	startExpression: Expression,
	limitExpression: Expression,
	stepExpression?: Expression,
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.NumericForStatement,
		position,
	) as NumericForStatement;
	node.name = name;
	node.startExpression = startExpression;
	node.limitExpression = limitExpression;
	node.stepExpression = stepExpression;
	node.block = block;
	return node;
}

// for <exp>, ... in <exp>, ... do <block> end
export function isGenericForStatement(node: Node): node is GenericForStatement {
	return node.kind === SyntaxKind.GenericForStatement;
}

export function createGenericForStatement(
	block: Block,
	names: Identifier[],
	expressions: Expression[],
	position?: TextRange,
) {
	const node = createNode(
		SyntaxKind.GenericForStatement,
		position,
	) as GenericForStatement;
	node.block = block;
	node.names = names;
	node.expressions = expressions;
	return node;
}

// please revise this, because i'm a lua 5.1 user
// goto <label>
export function isGotoStatement(node: Node): node is GotoStatement {
	return node.kind === SyntaxKind.GotoStatement;
}

export function createGotoStatement(label: string, position?: TextRange) {
	const node = createNode(
		SyntaxKind.GotoStatement,
		position,
	) as GotoStatement;
	node.label = label;
	return node;
}

// :: <label> ::
export function isLabelStatement(node: Node): node is LabelStatement {
	return node.kind === SyntaxKind.LabelStatement;
}

export function createLabelStatement(label: string, position?: TextRange) {
	const node = createNode(
		SyntaxKind.LabelStatement,
		position,
	) as LabelStatement;
	node.label = label;
	return node;
}
