import { deepEquals } from 'deep-assert';
import { expect } from 'vitest';

function deepEqualsResult(actual: unknown, expected: unknown, subset = false) {
  try {
    deepEquals(actual, expected, {
      allowAdditionalProps: subset,
    });
    return {
      pass: true,
      message: () => 'Unexpected match',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      pass: false,
      message: () => message,
    };
  }
}

expect.extend({
  toDeepEqual(actual: unknown, expected: unknown) {
    return deepEqualsResult(actual, expected);
  },
  toDeepEqualSubset(actual: unknown, expected: unknown) {
    return deepEqualsResult(actual, expected, true);
  },
  toBeTrue(actual: unknown) {
    return {
      pass: actual === true,
      message: () => `Expected true but received ${String(actual)}`,
    };
  },
  toBeFalse(actual: unknown) {
    return {
      pass: actual === false,
      message: () => `Expected false but received ${String(actual)}`,
    };
  },
});
