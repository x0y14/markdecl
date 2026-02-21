import 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> {
    toDeepEqual(expected: any): T;
    toDeepEqualSubset(expected: any): T;
    toBeTrue(): T;
    toBeFalse(): T;
  }

  interface AsymmetricMatchersContaining {
    toDeepEqual(expected: any): void;
    toDeepEqualSubset(expected: any): void;
    toBeTrue(): void;
    toBeFalse(): void;
  }
}
