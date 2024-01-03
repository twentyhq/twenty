import { createAppTester, tools } from 'zapier-platform-core';
import getBundle from '../../utils/getBundle';
import App from '../../index';
import { findObjectNamesSingularKey } from '../../triggers/find_object_names_singular';
tools.env.inject();

const appTester = createAppTester(App);
describe('triggers.find_object_names_singular', () => {
  test('should run', async () => {
    const bundle = getBundle({});
    const result = await appTester(
      App.triggers[findObjectNamesSingularKey].operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(1);
    expect(result[0].nameSingular).toBeDefined();
  });
});
