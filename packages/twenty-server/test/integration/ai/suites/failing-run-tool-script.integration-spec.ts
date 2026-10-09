import { runToolScriptThroughMcp } from 'test/integration/ai/suites/utils/run-tool-script-through-mcp.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type FailingScriptTestContext = {
  code: string;
  expectedError: string;
};

// Limit errors report measured durations and sizes
const normalizeScriptError = (error: string | undefined) =>
  error
    ?.replace(/\d+(\.\d+)?s\b/g, '<seconds>s')
    .replace(/\d+ bytes/g, '<n> bytes');

const failingScriptTestCases: EachTestingContext<FailingScriptTestContext>[] = [
  {
    title: 'a file read through open',
    context: {
      code: "open('/etc/passwd').read()",
      expectedError: 'unresolved-reference',
    },
  },
  {
    title: 'a file read the type checker cannot see',
    context: {
      code: "opener = eval('open')\nopener('/etc/passwd').read()",
      expectedError: 'PermissionError',
    },
  },
  {
    title: 'reading the environment',
    context: {
      code: 'import os\nos.environ',
      expectedError: "'os.environ' is not supported",
    },
  },
  {
    title: 'reading /proc/self/environ',
    context: {
      code: "from pathlib import Path\nPath('/proc/self/environ').read_text()",
      expectedError: 'PermissionError',
    },
  },
  {
    title: 'importing socket',
    context: { code: 'import socket', expectedError: 'unresolved-import' },
  },
  {
    title: 'importing subprocess',
    context: { code: 'import subprocess', expectedError: 'unresolved-import' },
  },
  {
    title: 'importing through __import__',
    context: {
      code: "__import__('os')",
      expectedError: 'unresolved-reference',
    },
  },
  {
    title: 'an allocation over the memory limit',
    context: { code: "x = 'a' * 10**9\nlen(x)", expectedError: 'MemoryError' },
  },
  {
    title: 'an endless loop',
    context: { code: 'while True:\n    pass', expectedError: 'TimeoutError' },
  },
  {
    title: 'a tool excluded from MCP',
    context: {
      code: 'await call_tool("http_request", {"url": "https://example.com"})',
      expectedError: 'is not available in scripts',
    },
  },
  {
    title: 'code_interpreter',
    context: {
      code: 'await call_tool("code_interpreter", {"code": "print(1)"})',
      expectedError: 'is not available in scripts',
    },
  },
  {
    title: 'a nested run_tool_script',
    context: {
      code: 'await call_tool("run_tool_script", {"code": "1"})',
      expectedError: 'is not available in scripts',
    },
  },
  {
    title: 'a tool that supports approval',
    context: {
      code: 'await call_tool("create_one_task", {"title": "Should not exist"})',
      expectedError: 'supports user approval',
    },
  },
  {
    title: 'a syntax error',
    context: { code: 'def (:', expectedError: 'invalid-syntax' },
  },
  {
    title: 'a type error',
    context: {
      code: 'await call_tool(1, 2)',
      expectedError: 'Type check failed',
    },
  },
];

describe('run_tool_script over MCP refusals and limits', () => {
  it.each(eachTestingContextFilter(failingScriptTestCases))(
    'returns a tool error for $title',
    async ({ context: { code, expectedError } }) => {
      const output = await runToolScriptThroughMcp({
        code,
        expectToFail: true,
      });

      expect(output.success).toBe(false);
      expect(output.error).toContain(expectedError);
      expect(normalizeScriptError(output.error)).toMatchSnapshot();

      const serializedOutput = JSON.stringify(output);

      for (const secret of [
        process.env.APP_SECRET,
        process.env.PG_DATABASE_URL,
      ]) {
        expect(secret).toBeDefined();
        expect(serializedOutput).not.toContain(secret);
      }
    },
    60_000,
  );

  it('keeps serving scripts after every failure', async () => {
    const output = await runToolScriptThroughMcp({
      code: '1 + 1',
      expectToFail: false,
    });

    expect(output.result).toBe(2);
  });
});
