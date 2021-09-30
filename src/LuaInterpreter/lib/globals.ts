import { AnyLuaValue, LuaState, LuaTable } from "LuaInterpreter/bundle";

export function createGlobals(state: LuaState) {
	// internal print function
	function print(args: AnyLuaValue[]) {
		let result = "";
		for (const arg of args) {
			if (arg === undefined) {
				result += "nil ";
			} else {
				result += `${arg.tostring()} `;
			}
		}
		console.log(result);
		return state.createMultiReturn();
	}

	const lib = state.createTable();
	lib.setMapEntryMember("print", state.createFunction(print));

	return lib;
}
