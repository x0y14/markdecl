import type AstVariable from '../ast/variable';
import type Token from 'markdown-it/lib/token';

type astTypes = {
  Variable?: typeof AstVariable;
};

export function parse(input: string, astTypes?: astTypes): Token;

type PegLocation = {
  offset: number;
  line: number;
  column: number;
};

export interface SyntaxError extends Error {
  location: {
    start: PegLocation;
    end: PegLocation;
  };
}
