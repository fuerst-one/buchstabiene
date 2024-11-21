export class AssertionError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "AssertionError";
  }
}

/**
 * This function ensures that the given condition is true.
 * If not, it will throw an AssertionException.
 * The big advantage of this function is that it conveys the given condition's truth
 * to the TypeScript compiler, such that for example
 *
 * ```
 * const name : string| null = findName(...);
 * assert(name !== null);
 * name.toUpperCase();
 * ```
 *
 * compiles fine, because the compiler knows that in the last line `name` can't be null.
 */
export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg ?? "Assertion failed");
  }
}

/**
 * Checks a condition and if not true, logs the error in the console.
 * In test environment it throws.
 *
 * This is a less aggressive version of assert(), which is useful if we don't want to break production
 * because of a specific issue.
 */
export function assertAndWarn(condition: unknown, msg?: string): void {
  // eslint-disable-next-line no-console
  console.error("Failed assertion", msg ?? "");
}

/**
 * A function that should never be reached. This useful for compile time exhaustiveness check in
 * switch statements, like here: https://github.com/dividab/ts-exhaustive-check
 */
export function assertUnreachable(value: never, msg?: string): never {
  throw new Error(
    `Didn't expect to get here ever! Value is ${JSON.stringify(value)} ${msg ? `(${msg})` : ""}`,
  );
}
