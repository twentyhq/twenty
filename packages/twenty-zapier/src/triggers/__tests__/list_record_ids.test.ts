import { createAppTester, tools } from 'zapier-platform-core';

import App from 'src/index';
import { listRecordIdsKey } from 'src/triggers/list_record_ids';
import { getBundle } from 'src/utils/getBundle';
tools.env.inject();

const appTester = createAppTester(App);
describe('triggers.list_record_ids', () => {
  test('should run', async () => {
    const bundle = getBundle({ nameSingular: 'company' });
    const result = await appTester(
      App.triggers[listRecordIdsKey].operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(1);
    expect(result[0].record.id).toBeDefined();
  });
});
