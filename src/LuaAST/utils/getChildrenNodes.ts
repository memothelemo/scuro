import { isNode } from "LuaAST/factory";
import { Node } from "LuaAST/nodes";

export function getChildrenNodes(node: Node) {
	const children = new Array<Node>();
	for (const value of Object.values(node)) {
		if (isNode(value)) {
			children.push(value);
		}
		// array checking
		if (Array.isArray(value)) {
			children.push(...value.filter((v): v is Node => isNode(value)));
		}
	}
	return children;
}
