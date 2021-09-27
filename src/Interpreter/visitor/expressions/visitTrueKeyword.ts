import { LuaScript } from "../../script";

export function visitTrueKeyword(script: LuaScript) {
	return script.state.create_boolean(true);
}
