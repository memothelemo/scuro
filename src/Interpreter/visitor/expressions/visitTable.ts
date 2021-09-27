import { LuaValue } from "Interpreter/types";
import ast from "../../../Ast";
import { Scope } from "../../../Interpreter/scope";
import { LuaScript } from "../../../Interpreter/script";
import { visitExpressionValue } from "../helpers/visitExpressionValue";
import { visitPropertyAssignment } from "../helpers/visitPropertyAssignment";

export function visitTable(script: LuaScript, scope: Scope, node: ast.Table) {
	const arrayContents: (
		| { index: undefined; value: LuaValue[] }
		| {
				index: LuaValue[];
				value: LuaValue[];
		  }
	)[] = ast.NodeArray.map(node.contents, content => {
		if (ast.isPropertyAssignment(content)) {
			return visitPropertyAssignment(script, scope, content);
		}
		return {
			index: undefined,
			value: visitExpressionValue(
				script,
				scope,
				content as ast.ExpressionValue,
			),
		};
	});

	// making a new table
	const table = script.state.create_table();
	arrayContents.forEach(content => {
		if (content.index === undefined) {
			content.value.forEach(value => table.insert(value));
		} else {
			content.index.forEach((indexInitializer, index) => {
				let value = content.value[index];
				if (value === undefined) {
					value = script.state.create_nil();
				}
				table.rawset(indexInitializer, value);
			});
		}
	});

	return [table];
}
