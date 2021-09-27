import * as luau from "../bundle";

export function visitSourceFile(
	sourceFile: luau.SourceFile,
	visitor: (node: luau.Node) => luau.Node | luau.Node[] | undefined,
) {
	const statements = luau.NodeArray.make<luau.Statement>(false);

	luau.NodeArray.forEach(sourceFile.statements, statement => {
		const result = visitor(statement);
		if (Array.isArray(result)) {
			statement.forEach(node => luau.NodeArray.push(statements, node));
		} else if (result !== undefined) {
			luau.NodeArray.push(statements, result);
		}
	});

	return statements;
}
