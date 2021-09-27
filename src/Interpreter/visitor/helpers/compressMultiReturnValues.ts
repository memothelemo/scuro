import { LuaValue } from "Interpreter/types";
import ast from "../../../Ast";

export function compressMultiReturnValues<T extends ast.Node>(
	array: ast.NodeArray<T>,
	callback: (node: T) => LuaValue[],
) {
	const values = new Array<LuaValue>();
	ast.NodeArray.forEach(array, node => {
		values.push(...callback(node));
	});
	return values;
}
