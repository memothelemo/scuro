import { LuaLib, LuaState } from "../../Interpreter/state";

export function makeOSLib(state: LuaState) {
	const oslib = new LuaLib(state);
	oslib.addFunction("exit", ([code]) => {
		if (!state.is_number(code)) {
			state.throwError(
				`bad argument #1 to '?' (number expected, ${state.utils.type([
					code,
				])})`,
			);
		}
		console.log(`Process exited at code: ${code.value}`);
		process.exit(code.value);
	});
	oslib.addFunction("clock", () =>
		state.throwError(
			`os.clock() is unsupported because of JavaScript (Node.js) limitation`,
		),
	);
	oslib.addFunction("time", () => [
		state.create_number(Math.floor(new Date().valueOf() / 1000)),
	]);
	return oslib.toTable();
}
