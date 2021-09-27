import { LuaScript } from "../../../Interpreter/script";

export function visitFalseKeyword(script: LuaScript) {
	return script.state.create_boolean(false);
}
