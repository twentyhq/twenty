import { NODE_ESM_CJS_BANNER } from 'twenty-shared/application';

import { stripNodeEsmCjsBanner } from 'src/engine/metadata-modules/logic-function/utils/strip-node-esm-cjs-banner.util';

const BUNDLE_BODY =
  'var handler = async () => "ok";\nexport { handler as default };\n';

describe('stripNodeEsmCjsBanner', () => {
  it('removes the banner the rebuild adds back, so it is declared once', () => {
    expect(
      stripNodeEsmCjsBanner(`${NODE_ESM_CJS_BANNER.js}\n${BUNDLE_BODY}`),
    ).toBe(BUNDLE_BODY);
  });

  it('leaves code without the banner unchanged', () => {
    expect(stripNodeEsmCjsBanner(BUNDLE_BODY)).toBe(BUNDLE_BODY);
  });
});
