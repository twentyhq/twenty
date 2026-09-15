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
// normalize whitespace so the multi-line output can be compared against a
// compact expected string.
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

  it('should clear any baked value so the front resolves the API origin from the page origin', () => {
    process.env.SERVER_URL = 'http://x.com';

    generateFrontConfig();

    expect(getInjectedEnv()).toBe('{}');
  });
});
