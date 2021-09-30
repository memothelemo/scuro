import { some, none, Option } from "@kherge/result";

type defined = {};

/**
 * This function is a lazy version of constructing an Option than some or none functions
 *
 * _It is useful if you have a generator function that has a chance of a value to become none_
 */
export function wrap<T extends defined>(value: T | undefined): Option<T> {
	if (value !== undefined) {
		return some(value);
	}
	return none();
}

/** Reveals Option's value either it is some or none */
export function reveal<T extends Option<any>>(option: T) {
	return match(
		option,
		v => v,
		() => undefined,
	);
}

/** Implementation of Option match function in rust */
export function match<T extends Option<any>, R = void>(
	option: T,
	some: (value: T extends Option<infer V> ? V : never) => R,
	none: () => R,
) {
	if (option.isSome()) {
		return some(option.unwrap());
	}
	return none();
}
