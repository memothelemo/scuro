import { LuaType, LuaValue } from "../../Interpreter/types";
import { LuaLib, LuaState } from "../../Interpreter/state";
import { LuaString } from "../../Interpreter/values/string";
import { LuaNil } from "../../Interpreter/values/nil";
import { LuaNumber } from "../../Interpreter/values/number";
import { LuaTable } from "Interpreter/values/table";
import { isLuaFunction, isLuaTable } from "../../Interpreter/typeGuard";
import { createStringLib } from "./string";

export function createGlobal(state: LuaState) {
	function error([message]: LuaValue[]) {
		const messageResult = state.is_string(message)
			? message.value
			: "Error occurred, no output from Lua (Scuro runtime).";
		state.throwError(messageResult);
		return [];
	}

	function print(args: LuaValue[]) {
		let finalString = "";
		args.forEach(value => {
			let stringedValue = isLuaTable(value)
				? value.stringifyTable()
				: value.toString();

			if (finalString === "") {
				finalString += stringedValue;
			} else {
				finalString += " " + stringedValue;
			}
		});
		console.log(finalString);
		return [new LuaNil()];
	}

	function assert([condition, message]: LuaValue[]) {
		if (state.isFalsy(condition)) {
			let finalMessage: string;
			if (state.is_nil(message) || message === undefined) {
				finalMessage = "Assertion failed!";
			} else {
				state.expectType(state.is_string, "string", message, 2);
				finalMessage = message.value;
			}
			state.throwError(finalMessage);
		}
		return [];
	}

	function tostring([value]: LuaValue[]) {
		if (value === undefined) {
			value = new LuaNil();
		}
		// name metamethod
		if (isLuaTable(value)) {
			const metamethod = value.metatable?.get(new LuaString("__name"));
			if (metamethod) {
				if (!isLuaFunction(metamethod)) {
					state.throwError(`Expected function in __name metamethod`);
				}
				return metamethod.executor([value]);
			}
		}
		return [new LuaString(value.toString())];
	}

	function type([value]: LuaValue[]) {
		if (value === undefined) {
			// javascript undefined values are considered nil
			return [new LuaString("nil")];
		}
		switch (value.type) {
			case LuaType.Boolean:
				return [new LuaString("boolean")];
			case LuaType.Function:
				return [new LuaString("function")];
			case LuaType.Nil:
				return [new LuaString("nil")];
			case LuaType.Thread:
				return [new LuaString("thread")];
			case LuaType.Number:
				return [new LuaString("number")];
			case LuaType.Table:
				return [new LuaString("table")];
			case LuaType.String:
				return [new LuaString("string")];
			default:
				return [new LuaString("userdata")];
		}
	}

	function tonumber([value]: LuaValue[]) {
		if (value === undefined) {
			value = new LuaNil();
		}
		return [new LuaNumber(Number(value.toString()))];
	}

	// this is my raw implementation of next, it will break in some point
	function next([table, index]: LuaValue[]) {
		if (!state.is_table(table)) {
			state.throwError(
				`bad argument #1 to '?' (table expected, ${state.utils.type([
					table,
				])})`,
			);
		}

		if (!state.is_nil(index) && !state.is_number(index)) {
			state.throwError(
				`bad argument #2 to '?' (nil or number expected, ${state.utils.type(
					[table],
				)})`,
			);
		}

		// index shifting, i do not know how it works actually
		let indexToShiftLeft = state.is_nil(index) ? 0 : index.value;

		// array
		for (const [key, value] of table.array.entries()) {
			if (indexToShiftLeft > 0) {
				indexToShiftLeft--;
			} else {
				return [state.create_number(key + 1), value];
			}
		}

		// map
		for (const [key, value] of table.map.entries()) {
			if (indexToShiftLeft > 0) {
				indexToShiftLeft--;
			} else {
				return [key, value];
			}
		}

		return [state.create_nil(), state.create_nil()];
	}

	function iter([table, initial]: LuaValue[]) {
		(initial as LuaNumber).value += 1;
		const value = (table as LuaTable).get(initial);
		if (!state.is_nil(value)) {
			return [initial, value];
		}
		return [];
	}

	function nextIter([table, initial]: LuaValue[]) {
		(initial as LuaNumber).value += 1;
		return next([table, initial]);
	}

	function pairs([table]: LuaValue[]) {
		if (!state.is_table(table)) {
			state.throwError(
				`bad argument #1 to '?' (table expected, ${state.utils.type([
					table,
				])})`,
			);
		}

		// magic formula
		return [
			state.create_function(nextIter),
			table,
			state.create_number(-1),
		];
	}

	function ipairs([table]: LuaValue[]) {
		if (!state.is_table(table)) {
			state.throwError(
				`bad argument #1 to '?' (table expected, ${state.utils.type([
					table,
				])})`,
			);
		}
		return [state.create_function(iter), table, state.create_number(0)];
	}

	// it is on unstable stage yet
	function setmetatable([table, metatable]: LuaValue[]) {
		if (!state.is_table(table)) {
			state.throwError(
				`bad argument #1 to '?' (table expected, ${state.utils.type([
					table,
				])})`,
			);
		}
		if (!state.is_table(metatable)) {
			state.throwError(
				`bad argument #2 to '?' (table expected, ${state.utils.type([
					table,
				])})`,
			);
		}
		table.metatable = metatable;
		return [table];
	}

	function getmetatable([table]: LuaValue[]) {
		if (!state.is_table(table)) {
			state.throwError(
				`bad argument #1 to '?' (table expected, ${state.utils.type([
					table,
				])})`,
			);
		}
		// __metatable metamethod
		const metamethod = table.metatable?.get(
			state.create_string("__metatable"),
		);
		if (!state.is_nil(metamethod)) {
			if (!state.is_function(metamethod)) {
				throw state.throwError(
					`Expected function in __metatable metamethod`,
				);
			} else {
				return metamethod.executor([table]);
			}
		}
		return [table.metatable ?? state.create_nil()];
	}

	const _G = new LuaLib(state);
	_G.addFunction("next", next);
	_G.addFunction("print", print);
	_G.addFunction("type", type);
	_G.addFunction("tostring", tostring);
	_G.addFunction("tonumber", tonumber);
	_G.addFunction("getmetatable", getmetatable);
	_G.addFunction("setmetatable", setmetatable);
	_G.addFunction("ipairs", ipairs);
	_G.addFunction("pairs", pairs);
	_G.addFunction("assert", assert);
	_G.addFunction("error", error);
	_G.add("string", createStringLib(state));

	return _G.toTable();
}
