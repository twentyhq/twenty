import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { sanitizeFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/sanitize-flat-entity-update.util';

type TestContext<T extends AllMetadataName = AllMetadataName> = {
  flatEntityUpdate: FlatEntityUpdate<T>;
  metadataName: T;
};

describe('sanitizeFlatEntityUpdate', () => {
  const testCases = [
    {
      title:
        'should return only valid properties for fieldMetadata when update contains valid and invalid properties',
      context: {
        flatEntityUpdate: {
          isActive: true,
          label: 'New Label',
          invalidProperty: 'should be removed',
        } as FlatEntityUpdate<'fieldMetadata'>,
        metadataName: 'fieldMetadata',
      },
    },
    {
      title:
        'should return empty object when all properties are undefined for fieldMetadata',
      context: {
        flatEntityUpdate: {
          isActive: undefined,
          label: undefined,
        } as FlatEntityUpdate<'fieldMetadata'>,
        metadataName: 'fieldMetadata',
      },
    },
    {
      title: 'should return empty object when update is empty for fieldMetadata',
      context: {
        flatEntityUpdate: {} as FlatEntityUpdate<'fieldMetadata'>,
        metadataName: 'fieldMetadata',
      },
    },
    {
      title:
        'should preserve null values as they are valid updates for fieldMetadata',
      context: {
        flatEntityUpdate: {
          isActive: false,
          label: null,
          description: 'Updated description',
        } as FlatEntityUpdate<'fieldMetadata'>,
        metadataName: 'fieldMetadata',
      },
    },
    {
      title: 'should return only valid properties for view metadata',
      context: {
        flatEntityUpdate: {
          name: 'My View',
          icon: 'IconUser',
          invalidProperty: 'should be removed',
        } as FlatEntityUpdate<'view'>,
        metadataName: 'view',
      },
    },
    {
      title: 'should return only valid properties for objectMetadata',
      context: {
        flatEntityUpdate: {
          isActive: true,
          labelSingular: 'Person',
          labelPlural: 'People',
          invalidProperty: 'should be removed',
        } as FlatEntityUpdate<'objectMetadata'>,
        metadataName: 'objectMetadata',
      },
    },
    {
      title: 'should handle viewField metadata updates',
      context: {
        flatEntityUpdate: {
          position: 1,
          size: 100,
          isVisible: true,
          invalidProperty: 'should be removed',
        } as FlatEntityUpdate<'viewField'>,
        metadataName: 'viewField',
      },
    },
    {
      title: 'should handle role metadata updates',
      context: {
        flatEntityUpdate: {
          label: 'Admin Role',
          description: 'Administrator role',
          invalidProperty: 'should be removed',
        } as FlatEntityUpdate<'role'>,
        metadataName: 'role',
      },
    },
    {
      title: 'should handle agent metadata updates',
      context: {
        flatEntityUpdate: {
          name: 'My Agent',
          description: 'Agent description',
          invalidProperty: 'should be removed',
        } as FlatEntityUpdate<'agent'>,
        metadataName: 'agent',
      },
    },
    {
      title: 'should handle webhook metadata updates',
      context: {
        flatEntityUpdate: {
          targetUrl: 'https://example.com/webhook',
          description: 'My webhook',
          invalidProperty: 'should be removed',
        } as FlatEntityUpdate<'webhook'>,
        metadataName: 'webhook',
      },
    },
  ] as const satisfies EachTestingContext<TestContext>[];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({ context: { flatEntityUpdate, metadataName } }) => {
      const result = sanitizeFlatEntityUpdate({
        flatEntityUpdate: flatEntityUpdate as FlatEntityUpdate<typeof metadataName>,
        metadataName,
      });

      expect(result).toMatchSnapshot();
    },
  );
});
