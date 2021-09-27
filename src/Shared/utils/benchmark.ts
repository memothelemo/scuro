/**
 * Benchmarks the callback, executes it rapidly as possible in a second
 * and calculates how many operations can be handled this callback.
 * @returns Operations per second (ops)
 */
export function benchmark(callback: () => void) {
	let ops = 0;
	const start = Date.now();
	while (true) {
		const current = Date.now();
		if (current - start >= 1000) {
			break;
		}
		callback();
		ops += 1;
	}
	return ops;
}

/**
 * Benchmarks the callback, executes it
 * and calculates how many miliseconds since this callback elapsed.
 * @returns miliseconds
 */
export function benchmarkNow(callback: () => void) {
	const start = Date.now();
	callback();
	const current = Date.now();
	return current - start;
}
