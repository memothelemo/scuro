import * as luau from "../bundle";

export function printAst(node: luau.Node, indent = 0) {
	let indentStr = " ".repeat(indent);
	console.log(indentStr + luau.SyntaxKind[node.kind]);
	node.forEach(child => {
		printAst(child, indent + 2);
	});
}
