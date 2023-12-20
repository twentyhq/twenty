import { createAppTester } from "zapier-platform-core";
import getBundle from '../../utils/getBundle';
import App from '../../index';

const appTester = createAppTester(App);
describe('triggers.find_objects', () => {
  test('should run', async () => {
    const bundle = getBundle({});
    const result = await appTester(
      App.triggers.find_objects.operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(1)
    expect(result[0].nameSingular).toBeDefined()
  })
})
