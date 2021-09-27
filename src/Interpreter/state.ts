import { LuaError } from "../Shared/error";
import ast from "../Ast";
import { LuaScript } from "./script";
import { LuaFunction, LuaFunctionExecutor } from "./values/function";
import { LuaNil } from "./values/nil";
import { LuaString } from "./values/string";
import { LuaBoolean } from "./values/boolean";
import { LuaTable } from "./values/table";
import { LuaUserdata } from "./values/userdata";
import { LuaNumber } from "./values/number";
import { createGlobal } from "./lib/globals";
import { LuaType, LuaValue } from "./types";
import {
	isLuaBoolean,
	isLuaFunction,
	isLuaNil,
	isLuaNumber,
	isLuaString,
	isLuaTable,
	isLuaUserdata,
} from "./typeGuard";

export class LuaLib {
	private tableContent: LuaTable;

	constructor(public state: LuaState) {
		this.tableContent = this.state.create_table();
	}

	toTable() {
		return this.tableContent;
	}

	add(key: string, value: LuaValue) {
		this.tableContent.mapset(this.state.create_string(key), value);
	}

	addFunction(key: string, value: LuaFunctionExecutor) {
		this.tableContent.rawset(
			this.state.create_string(key),
			this.state.create_function(value),
		);
	}
}

export class LuaState {
	scripts = new Array<LuaScript>();
	utils: {
		print: LuaFunctionExecutor;
		type: LuaFunctionExecutor;
		tostring: LuaFunctionExecutor;
		tonumber: LuaFunctionExecutor;
	};
	lastGoodKnownNode?: ast.Node;

	constructor() {
		const globals = createGlobal(this);
		this.utils = {
			print: (globals.mapget(this.create_string("print")) as LuaFunction)
				.executor,
			type: (globals.mapget(this.create_string("type")) as LuaFunction)
				.executor,
			tostring: (
				globals.mapget(this.create_string("tostring")) as LuaFunction
			).executor,
			tonumber: (
				globals.mapget(this.create_string("tonumber")) as LuaFunction
			).executor,
		};
	}

	isFalsy(value: LuaValue): value is LuaValue {
		if (value === undefined) return true;
		switch (value.type) {
			case LuaType.Boolean:
				return (value as LuaBoolean).value === false;
			case LuaType.Nil:
				return true;
			default:
				return false;
		}
	}

	loadSourceFile(sourceFile: ast.SourceFile) {
		const script = new LuaScript(this, sourceFile);
		this.scripts.push(script);
		return script.execute();
	}

	expectType<T extends LuaValue>(
		typeChecker: (value: LuaValue) => value is T,
		typeName: string,
		value: LuaValue,
		argNum: number,
	): asserts value is T {
		if (!typeChecker(value)) {
			this.throwError(
				`bad argument #${argNum} to '?' (${typeName} expected, ${this.utils.type(
					[value],
				)})`,
			);
		}
	}

	is_number(value: unknown): value is LuaNumber {
		return isLuaNumber(value);
	}

	is_userdata(value: unknown): value is LuaUserdata {
		return isLuaUserdata(value);
	}

	is_table(value: unknown): value is LuaTable {
		return isLuaTable(value);
	}

	is_boolean(value: unknown): value is LuaBoolean {
		return isLuaBoolean(value);
	}

	is_string(value: unknown): value is LuaString {
		return isLuaString(value);
	}

	is_nil(value: unknown): value is LuaNil {
		return isLuaNil(value);
	}

	is_function(value: unknown): value is LuaFunction {
		return isLuaFunction(value);
	}

	create_number(value: number) {
		return new LuaNumber(value);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	create_userdata(value: any) {
		return new LuaUserdata(value);
	}

	create_table() {
		return new LuaTable(this);
	}

	create_boolean(bool: boolean) {
		return new LuaBoolean(bool);
	}

	throwError(reason: string, script?: LuaScript, node?: ast.Node): never {
		if (!this.lastGoodKnownNode) {
			throw `please please please capture the last good known node please!`;
		}
		throw new LuaError(reason, node ?? this.lastGoodKnownNode, script);
	}

	create_string(str: string) {
		return new LuaString(str);
	}

	create_nil() {
		return new LuaNil();
	}

	create_function(executor: LuaFunctionExecutor) {
		return new LuaFunction(executor);
	}
}
