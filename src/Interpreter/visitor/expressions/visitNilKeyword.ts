import { LuaScript } from "../../../Interpreter/script";

export function visitNilKeyword(script: LuaScript) {
	return script.state.create_nil();
}
