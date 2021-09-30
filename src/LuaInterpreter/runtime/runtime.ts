import { none, Option, some } from "@kherge/result";
import LuaAST from "LuaAST";
import { createGlobals } from "LuaInterpreter/lib/globals";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaTable } from "LuaInterpreter/values/table";
import { LuaAddress } from "LuaInterpreter/values/types";
import { wrap } from "Shared/utils/rustlang/option";
import { LuaMultiReturn } from "./multiReturn";
import { LuaState } from "./state";
import { LuaThread } from "./thread";

enum LuaRuntimeStatus {
	Ok,
	Dead,
	Error,
}

export class LuaRuntime {
	private threads = new Array<LuaThread>();
	private status = LuaRuntimeStatus.Ok;

	public readonly globalEnv: LuaTable;
	public readonly state = new LuaState();

	public constructor() {
		this.globalEnv = createGlobals(this.state);
	}

	public getVariableValue(id: string, scope: Scope) {
		// try to get from the scope
		const result = scope.get(id);
		if (result) {
			return this.state.createMultiReturn(result);
		}

		// try to get from global
		const globalRes = this.globalEnv.get(this.state.createString(id));
		if (globalRes.isOk()) {
			// not everything is a lua value
			return globalRes.unwrap();
		} else {
			// if it has an error, then throw it out!
			this.state.throwError(globalRes.unwrapErr());
		}

		return new LuaMultiReturn([]);
	}

	public getThreadFromAddress(address: LuaAddress): Option<LuaThread> {
		const threadIndex = this.threads.findIndex(t => t.address === address);
		if (threadIndex === -1) {
			return none();
		}
		return some(this.threads[threadIndex]);
	}

	public get hasErrors() {
		return this.status === LuaRuntimeStatus.Error;
	}

	public visitSourceFile(file: LuaAST.SourceFile) {
		const thread = LuaThread.fromSourceFile(this, file);
		this.spawnThread(thread);
	}

	public spawnThread(thread: LuaThread) {
		// spawn equivalent
		setTimeout(() => {
			while (thread.hasNext() && !this.hasErrors) {
				thread.next();
			}
		}, 0);
	}
}
