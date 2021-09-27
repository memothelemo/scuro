import * as luau from "../bundle";

function primitive(id: string) {
	return () => luau.createIdentifier(id);
}

function propertyAccessPrimitive(base: string, access: string) {
	return () =>
		luau.createPropertyAccessExpression(
			luau.createIdentifier(base),
			access,
		);
}

export const Globals = {
	_G: primitive("_G"),
	assert: primitive("assert"),
	error: primitive("error"),
	getmetatable: primitive("getmetatable"),
	ipairs: primitive("ipairs"),
	pairs: primitive("pairs"),
	pcall: primitive("pcall"),
	require: primitive("require"),
	self: primitive("self"),
	setmetatable: primitive("setmetatable"),
	string: {
		byte: propertyAccessPrimitive("string", "byte"),
		find: propertyAccessPrimitive("string", "find"),
		format: propertyAccessPrimitive("string", "format"),
		gmatch: propertyAccessPrimitive("string", "gmatch"),
		gsub: propertyAccessPrimitive("string", "gsub"),
		lower: propertyAccessPrimitive("string", "lower"),
		match: propertyAccessPrimitive("string", "match"),
		rep: propertyAccessPrimitive("string", "rep"),
		reverse: propertyAccessPrimitive("string", "reverse"),
		split: propertyAccessPrimitive("string", "split"),
		sub: propertyAccessPrimitive("string", "sub"),
		upper: propertyAccessPrimitive("string", "upper"),
	},
	table: {
		clear: propertyAccessPrimitive("table", "clear"),
		concat: propertyAccessPrimitive("table", "concat"),
		create: propertyAccessPrimitive("table", "create"),
		find: propertyAccessPrimitive("table", "find"),
		insert: propertyAccessPrimitive("table", "insert"),
		move: propertyAccessPrimitive("table", "move"),
		remove: propertyAccessPrimitive("table", "remove"),
		sort: propertyAccessPrimitive("table", "sort"),
	},
	tostring: primitive("tostring"),
	type: primitive("type"),
	unpack: primitive("unpack"),
};
