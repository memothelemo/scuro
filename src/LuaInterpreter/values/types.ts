import { Option } from "@kherge/result";
import { LuaMultiReturn } from "LuaInterpreter/runtime/multiReturn";
import { LuaBoolean } from "./boolean";

export type AnyLuaValue = LuaValue | undefined;
export type LuaAddress = symbol | string | number | boolean;
export type OptionLuaValue = Option<LuaValue>;

export interface LuaValue {
	/** Lua type */
	readonly type: LuaType;

	/** Memory address for every value */
	address: LuaAddress;

	/** Equals operator function */
	eq(other: LuaMultiReturn): LuaBoolean;

	/** tostring method thatallows to use it for tostring function */
	tostring(): string;
}

export enum LuaType {
	/** array of characters */
	String,

	/** true or false value */
	Boolean,

	/** simply numbers */

	/**
	 * Represent ordinary arrays, symbol tables, sets, records, graphs, trees, etc.,
	 * and implements associative arrays.
	 *
	 * It can hold any value (except nil)
	 */
	Table,

	Number,

	/**
	 * Represents independent threads of execution and
	 * it is used to implement coroutines
	 */
	Thread,

	/** Represents a method that is written in JavaScript or Lua. */
	Function,

	/** JavaScript data */
	Userdata,
}
