import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { diffChars } from 'diff';
import yaml from 'yaml-js';

import markdoc from '../../index';

type MarktestCase = {
  $$lines?: { start: number; end: number };
  code?: string;
  config?: Record<string, unknown>;
  expected?: string;
  expectedError?: string;
  name: string;
  slots?: boolean;
  validation?: boolean;
};

class Loader extends yaml.loader.Loader {
  construct_mapping(node: any) {
    return {
      ...super.construct_mapping(node),
      $$lines: {
        start: node.start_mark.line,
        end: node.end_mark.line,
      },
    };
  }
}

const tokenizer = new markdoc.Tokenizer({
  allowIndentation: true,
  allowComments: true,
});

function parse(content: string, slots?: boolean, file?: string) {
  const tokens = tokenizer.tokenize(content);
  return markdoc.parse(tokens, { file, slots });
}

function stripLines(object: MarktestCase) {
  return JSON.parse(
    JSON.stringify(object, (key, value) => (key === '$$lines' ? undefined : value)),
  ) as MarktestCase;
}

function checkMatch(diffs: ReturnType<typeof diffChars>) {
  return diffs.find((part) => part.added || part.removed);
}

function run({
  code,
  config = {},
  expected,
}: {
  code: ReturnType<typeof parse>;
  config?: MarktestCase['config'];
  expected?: string;
}) {
  const partials: Record<string, ReturnType<typeof parse>> = {};
  for (const [file, content] of Object.entries((config?.partials as any) ?? {}))
    partials[file] = parse(content as string, false, file);

  const transformed = markdoc.transform(code, { ...config, partials });
  const output = markdoc.renderers.html(transformed);
  const diff = diffChars((expected || '').trim(), (output || '').trim());
  return checkMatch(diff) ? diff : false;
}

function formatValidation(path: string, test: MarktestCase, validation: any[]) {
  const lines = test.$$lines;
  let output = '';
  for (const {
    lines: errorLines,
    error: { message },
  } of validation)
    output += `${errorLines ? errorLines[0] : '?'}:${message}\n`;

  return [`INVALID: ${path}:${lines?.start ?? '?'}`, test.name, test.code ?? '', output].join(
    '\n\n',
  );
}

function formatDiff(path: string, test: MarktestCase, diff: ReturnType<typeof diffChars>) {
  const lines = test.$$lines;
  const prettyDiff = diff
    .flatMap((part) => [
      part.added ? '+' : part.removed ? '-' : ' ',
      part.added || part.removed ? part.value.replace(/ /g, '⎵') : part.value,
    ])
    .join('');

  return [`FAILED: ${path}:${lines?.start ?? '?'}`, test.name, test.code ?? '', prettyDiff].join(
    '\n\n',
  );
}

const testsPath = resolve(process.cwd(), 'spec/marktest/tests.yaml');
const tests = yaml.load(readFileSync(testsPath, 'utf8'), Loader) as MarktestCase[];

describe('marktest suite', () => {
  for (const testCase of tests) {
    it(testCase.name, () => {
      const code = parse(testCase.code || '', testCase.slots);
      const validation = markdoc.validate(code, testCase.config);

      if (testCase.expectedError) {
        const output = validation.map((item) => item.error.message).join('\n');
        expect(output.trim()).toBe((testCase.expectedError || '').trim());
        return;
      }

      if (validation.length && testCase.validation !== false)
        throw new Error(formatValidation(testsPath, testCase, validation));

      const result = run({
        ...stripLines(testCase),
        code,
      });

      if (result) throw new Error(formatDiff(testsPath, testCase, result));
    });
  }
});
