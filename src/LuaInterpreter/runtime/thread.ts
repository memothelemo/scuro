import { Option } from "@kherge/result";
import LuaAST from "LuaAST";
import { LuaRuntime } from "LuaInterpreter/runtime/runtime";
import { Scope } from "LuaInterpreter/runtime/scope";
import { LuaStack } from "LuaInterpreter/runtime/stack";
import { LuaBoolean } from "LuaInterpreter/values/boolean";
import { LuaType, LuaValue } from "LuaInterpreter/values/types";
import { visitStatement } from "LuaInterpreter/visitor/main/statement";
import { match, wrap } from "Shared/utils/rustlang/option";

// @no-transform-path
import { v4 as uuid } from "uuid";
import { LuaMultiReturn } from "./multiReturn";

export enum LuaThreadStatus {
	Ok,
	Suspended,
	Dead,
}

export class LuaThread implements LuaValue {
	private _ptr = 0;
	private statementAmount: number;
	private returnedValues?: LuaValue[];

	public status = LuaThreadStatus.Ok;

	readonly stack = new LuaStack();
	readonly scope: Scope;
	readonly type = LuaType.Thread;
	readonly address = Symbol(uuid());

	public constructor(
		public readonly runtime: LuaRuntime,
		public readonly block: LuaAST.Block,
		public readonly caller?: LuaThread,
		scope?: Scope,
	) {
		this.scope = scope ?? new Scope();
		this.statementAmount = block.statements.length;
	}

	public static fromSourceFile(
		runtime: LuaRuntime,
		file: LuaAST.SourceFile,
		scope?: Scope,
	) {
		// convert multiple statements into blocks
		const block = LuaAST.factory.createBlock(file.statements, file);
		const thread = new LuaThread(runtime, block, undefined, scope);
		return thread;
	}

	// internal methods
	private executeStatement(statement: LuaAST.Statement) {
		this.stack.pushStack(statement);
		const result = visitStatement(this, this.scope, statement);
		this.stack.popStack();
		return result;
	}

	public peek(offset = 0) {
		return wrap(this.block.statements[this._ptr + offset]);
	}

	public isMain() {
		return this.caller === undefined;
	}

	public isStatus(status: LuaThreadStatus) {
		return this.status === status;
	}

	public getReturnedValues() {
		if (this.status !== LuaThreadStatus.Dead) {
			this.runtime.state.throwError(
				"cannot retrieve returned expressions while running",
			);
		}
		return this.returnedValues!;
	}

	public resume() {
		if (this.status !== LuaThreadStatus.Suspended) {
			switch (this.status) {
				case LuaThreadStatus.Dead:
					this.runtime.state.throwError("cannot resume dead thread");
				case LuaThreadStatus.Ok:
					this.runtime.state.throwError(
						"cannot resume running thread",
					);
			}
		}
		this.status = LuaThreadStatus.Ok;
	}

	public next() {
		// do not execute if runtime has errors
		if (this.runtime.hasErrors) return;
		if (this.status !== LuaThreadStatus.Ok) {
			this.runtime.state.throwError(
				"cannot move to next statement on not running thread",
			);
		}
		if (!this.hasNext()) {
			this.status = LuaThreadStatus.Dead;
		}
		const opt = this.peek();
		if (opt.isSome()) {
			this.executeStatement(opt.unwrap());
		}
		this._ptr++;
	}

	public hasNext() {
		return this.statementAmount >= this._ptr;
	}

	// public methods
	public get ptr() {
		return this._ptr;
	}

	public eq(other: LuaMultiReturn) {
		return match(
			other.getFirstReturn(),
			value => new LuaBoolean(value.address === this.address),
			() => new LuaBoolean(false),
		);
	}

	public tostring() {
		return `thread: ${this.address.description ?? "unknown"}`;
	}
}
