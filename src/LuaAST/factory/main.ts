import { Node, SourceFile, Statement, TextRange } from "LuaAST/nodes";
import { SyntaxKind } from "LuaAST/enums";

export function isNode(object: unknown): object is Node {
	if (typeof object !== "object" && object != undefined) {
		return false;
	}
	if ("kind" in (object as unknown as { kind: number })) {
		return true;
	}
	return false;
}

export function createNode(kind: SyntaxKind, position?: TextRange) {
	if (position !== undefined) {
		return {
			kind,
			line: position.line,
			column: position.column,
		};
	}
	return { kind };
}

export function cloneNode<T extends Node>(node: T): T {
	return { ...node };
}

export function setNodePosition<T extends Node>(
	node: T,
	position: TextRange,
): T {
	node.line = position.line;
	node.column = position.column;

	return node;
}

export function getOriginalPos(node: Node): TextRange {
	return { line: node.line, column: node.column };
}

export function isSourceFile(node: Node): node is SourceFile {
	return node.kind === SyntaxKind.SourceFile;
}

export function createSourceFile(
	statements: Statement[],
	position?: TextRange,
) {
	const sourceFile = createNode(
		SyntaxKind.SourceFile,
		position,
	) as SourceFile;
	sourceFile.statements = statements;
	return sourceFile;
}
