import { SyntaxKind, Node } from "LuaAST/bundle";

export function printAST(node: Node, indent = 0) {
	// making an indent string
	const indentStr = " ".repeat(indent);
	process.stdout.write(indentStr + SyntaxKind[node.kind]);
}
