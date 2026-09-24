import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  FieldMetadataType,
  ViewSortDirection,
  ViewType,
} from 'twenty-shared/types';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('View sort order after a cache recompute', () => {
  let objectMetadataId: string;
  let viewId: string;
  let workspaceId: string;
  const fieldMetadataIds: string[] = [];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: createdObjectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testViewSortOrderObject',
        namePlural: 'testViewSortOrderObjects',
        labelSingular: 'Test View Sort Order Object',
        labelPlural: 'Test View Sort Order Objects',
        icon: 'IconSort',
      },
    });

    objectMetadataId = createdObjectMetadataId;

    for (const name of ['firstSortField', 'secondSortField']) {
      const {
        data: {
          createOneField: { id: fieldMetadataId },
        },
      } = await createOneFieldMetadata({
        input: {
          name,
          label: name,
          type: FieldMetadataType.TEXT,
          objectMetadataId,
          isLabelSyncedWithName: false,
        },
        gqlFields: 'id',
      });

      fieldMetadataIds.push(fieldMetadataId);
    }

    const { data } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Test View For Sort Order',
        objectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconSort',
      },
    });

    viewId = data?.createView?.id;
    workspaceId = data?.createView?.workspaceId;
    jestExpectToBeDefined(viewId);
    jestExpectToBeDefined(workspaceId);
  });

  afterAll(async () => {
    await destroyOneView({ expectToFail: false, viewId });
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: objectMetadataId },
    });
  });

  it('keeps sorts in creation order when the first one is stored after the second', async () => {
    const viewSortIds: string[] = [];

    for (const fieldMetadataId of fieldMetadataIds) {
      const { data } = await createOneViewSort({
        expectToFail: false,
        input: {
          viewId,
          fieldMetadataId,
          direction: ViewSortDirection.ASC,
        },
      });

      viewSortIds.push(data.createViewSort.id);
    }

    await global.testDataSource.query(
      `WITH "movedViewSort" AS (
        DELETE FROM core."viewSort" WHERE id = $1 RETURNING *
      )
      INSERT INTO core."viewSort" SELECT * FROM "movedViewSort"`,
      [viewSortIds[0]],
    );

    const workspaceCacheService =
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');

    await workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatViewMaps',
    ]);

    const { flatViewMaps } = await workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatViewMaps'],
    );

    const viewUniversalIdentifier =
      flatViewMaps.universalIdentifierById[viewId];

    jestExpectToBeDefined(viewUniversalIdentifier);

    expect(
      flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]?.viewSortIds,
    ).toEqual(viewSortIds);
  });
});
