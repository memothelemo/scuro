import { LuaBoolean } from "./values/boolean";

export type LogicKindResult =
	| {
			kind: LogicKind.Unary;
			value: UnaryKind;
	  }
	| {
			kind: LogicKind.Arithmetic;
			value: ArithmeticKind;
	  }
	| {
			kind: LogicKind.Comparison;
			value: ComparisonKind;
	  };

export enum UnaryKind {
	Dash,
	Length,
	Opposite,
}

export enum ArithmeticKind {
	Add,
	Subtract,
	Multiply,
	Divide,
	Exponent,
	Modulus,
	Percent,
	Concat,
}

export enum ComparisonKind {
	GreaterEqual,
	GreaterThan,
	LessEqual,
	LessThan,
	NotEqual,
	Equal,
	And,
	Or,
}

export enum LogicKind {
	Comparison = 0,
	Arithmetic = 1,
	Unary = 2,
}

export interface LuaValue {
	/** Lua type */
	readonly type: LuaType;

	/** Memory address for every value (it must be unique, expect nil or global variables) */
	address: string;

	/** Equals operator lambda */
	eq(other: LuaValue): LuaBoolean;

	/** Converts from native lua value to display string */
	toString(): string;
}

export enum LuaType {
	/** Array of characters */
	String,

	/** True or false value */
	Boolean,

	/** Double precision floating point. I do not know if JS uses that */
	Number,

	/** Nothing else */
	Nil,

	/** Represents a method that is written in C or Lua. */
	Function,

	/** Represent ordinary arrays, symbol tables, sets, records, graphs, trees, etc.,
	and implements associative arrays.
	It can hold any value (except nil) */
	Table,

	/** Represents independent threads of execution and
	it is used to implement coroutines. */
	Thread,

	/** Javascript data obviously */
	Userdata,
}
