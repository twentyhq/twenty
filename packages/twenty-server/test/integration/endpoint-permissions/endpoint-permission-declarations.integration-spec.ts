import {
  type DiscoveryService,
  type MetadataScanner,
  type Reflector,
} from '@nestjs/core';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { collectEndpointPermissionDeclarations } from 'test/integration/utils/collect-endpoint-permission-declarations.util';

describe('endpoint permission declarations', () => {
  it('should match the auth principals, permission flags, feature flags and application target of every mounted endpoint', () => {
    expect(
      collectEndpointPermissionDeclarations({
        discoveryService:
          getAppProviderByClassName<DiscoveryService>('DiscoveryService'),
        reflector: getAppProviderByClassName<Reflector>('Reflector'),
        metadataScanner:
          getAppProviderByClassName<MetadataScanner>('MetadataScanner'),
      }),
    ).toMatchSnapshot();
  });
});
