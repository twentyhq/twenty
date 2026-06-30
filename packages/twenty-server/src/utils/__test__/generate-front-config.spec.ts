import * as fs from 'fs';

import { generateFrontConfig } from 'src/utils/generate-front-config';

// dotenv runs at import time with override: true, which would clobber the
// per-test process.env we set below. Neutralize it so each test controls env.
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

const INDEX_TEMPLATE = `<html>
  <head>
    <!-- BEGIN: Twenty Config -->
    <script id="twenty-env-config">
      window._env_ = {"REACT_APP_SERVER_BASE_URL":"http://stale-value"};
    </script>
    <!-- END: Twenty Config -->
  </head>
</html>`;

// Pull the injected _env_ object back out of the written index.html and
// normalize whitespace so the multi-line JSON.stringify(..., 2) output can be
// compared against a compact expected string.
const getInjectedEnv = (): string => {
  const writtenContent = mockedFs.writeFileSync.mock.calls[0][1] as string;
  const match = writtenContent.match(/window\._env_ = (\{[\s\S]*?\});/);

  return match ? match[1].replace(/\s+/g, '') : '';
};

describe('generateFrontConfig', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    mockedFs.readFileSync.mockReturnValue(INDEX_TEMPLATE);
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should inject the absolute SERVER_URL when set and the toggle is unset', () => {
    process.env.SERVER_URL = 'http://x.com';
    delete process.env.FRONT_AUTO_BASE_URL;

    generateFrontConfig();

    expect(getInjectedEnv()).toBe(
      '{"REACT_APP_SERVER_BASE_URL":"http://x.com"}',
    );
  });

  it('should inject an empty _env_ when SERVER_URL is unset', () => {
    delete process.env.SERVER_URL;
    delete process.env.FRONT_AUTO_BASE_URL;

    generateFrontConfig();

    expect(getInjectedEnv()).toBe('{}');
  });

  it('should inject an empty _env_ when FRONT_AUTO_BASE_URL=true even if SERVER_URL is set', () => {
    process.env.SERVER_URL = 'http://x.com';
    process.env.FRONT_AUTO_BASE_URL = 'true';

    generateFrontConfig();

    expect(getInjectedEnv()).toBe('{}');
  });

  it('should keep the absolute SERVER_URL when FRONT_AUTO_BASE_URL is not exactly "true"', () => {
    process.env.SERVER_URL = 'http://x.com';
    process.env.FRONT_AUTO_BASE_URL = 'false';

    generateFrontConfig();

    expect(getInjectedEnv()).toBe(
      '{"REACT_APP_SERVER_BASE_URL":"http://x.com"}',
    );
  });
});
