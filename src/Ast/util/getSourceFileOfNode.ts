import * as luau from "../bundle";

export function getSourceFileOfNode(node: luau.Node): luau.SourceFile {
	while (node && node.kind !== luau.SyntaxKind.SourceFile) {
		if (node.parent === undefined) {
			throw "Unknown parent!";
		}
		node = node.parent;
	}
	return node as luau.SourceFile;
}
