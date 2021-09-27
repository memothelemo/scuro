import { LuaLib, LuaState } from "../../Interpreter/state";

export function createStringLib(state: LuaState) {
	const lib = new LuaLib(state);
	lib.addFunction("match", () => {
		state.throwError("Lua regex is not implemented!");
	});
	lib.addFunction("gmatch", () => {
		state.throwError("Lua regex is not implemented!");
	});
	lib.addFunction("split", ([value, separator]) => {
		state.expectType(state.is_string, "string", value, 1);
		state.expectType(state.is_string, "string", separator, 2);
		const splited = state.create_table();
		value.value
			.split(separator.value)
			.forEach(separated =>
				splited.insert(state.create_string(separated)),
			);
		return [splited];
	});
	return lib.toTable();
}
