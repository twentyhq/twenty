import { createAppTester, tools } from 'zapier-platform-core';
import getBundle from '../../utils/getBundle';
import App from '../../index';
import { findObjectNamesPluralKey } from '../../triggers/find_object_names_plural';
tools.env.inject();

const appTester = createAppTester(App);
describe('triggers.find_object_names_plural', () => {
  test('should run', async () => {
    const bundle = getBundle({});
    const result = await appTester(
      App.triggers[findObjectNamesPluralKey].operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(1);
    expect(result[0].namePlural).toBeDefined();
  });
});
