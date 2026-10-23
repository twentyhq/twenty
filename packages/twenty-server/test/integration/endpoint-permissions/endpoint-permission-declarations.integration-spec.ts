import { collectEndpointPermissionDeclarations } from 'test/integration/utils/collect-endpoint-permission-declarations.util';

describe('endpoint permission declarations', () => {
  it('should match the auth principals, permission flags, feature flags and application target of every mounted endpoint', () => {
    expect(collectEndpointPermissionDeclarations()).toMatchSnapshot();
  });
});
