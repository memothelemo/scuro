import { Result } from "@kherge/result";

/** Implementation of Option match function in rust */
export function matchResult<T extends Result<any, any>, R = void>(
	result: T,
	ok: (value: T extends Result<infer V, any> ? V : never) => R,
	err: (value: T extends Result<any, infer V> ? V : never) => R,
) {
	if (result.isOk()) {
		return ok(result.unwrap());
	}
	return err(result.unwrapErr());
}
