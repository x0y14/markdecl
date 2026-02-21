import { Delimiter } from 'markdown-it/lib/rules_inline/state_inline.mjs';
import type { ValidationError } from './src/types';

declare module 'markdown-it/lib/token.mjs' {
  interface Token {
    errors?: ValidationError[];
    position?: {
      start?: number;
      end?: number;
    };
  }
}

declare module 'markdown-it/lib/rules_block/state_block.mjs' {
  interface StateBlock {
    delimiters?: Delimiter[];
  }
}
