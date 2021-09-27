import * as luau from "../bundle";

export function countWrappedParentheses(node: luau.Node) {
	if (!luau.isParenthesizedExpression(node)) {
		return 0;
	}
	let count = 0;
	let lastParenthesizedNode: luau.Expression = node;
	while (luau.isParenthesizedExpression(lastParenthesizedNode)) {
		count++;
		lastParenthesizedNode = node.expression;
	}
	return count;
}
