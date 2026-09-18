import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { createOneViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-view-filter-group.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { createOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/create-one-view-sort.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { In } from 'typeorm';

import { type PurgeSoftDeletedViewsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789744500000-purge-soft-deleted-views.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const findRemainingIds = async (
  target: EntityClassOrSchema,
  ids: string[],
): Promise<string[]> => {
  const rows = await getCoreRepository<{ id: string }>(target).find({
    where: { id: In(ids) },
    withDeleted: true,
  });

  return rows.map(({ id }) => id).sort();
};

describe('2-42 workspace command 1789744500000 - PurgeSoftDeletedViewsCommand (integration)', () => {
  let command: PurgeSoftDeletedViewsCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let objectMetadataId: string;
  let lastViewObjectMetadataId: string;
  let keptViewId: string;
  let purgedViewId: string;
  let lastViewIds: string[];
  let labelIdentifierViewFieldId: string;
  let softDeletedViewFieldId: string;
  let keptViewFilterId: string;
  let softDeletedViewFilterId: string;
  let nestedViewFilterId: string;
  let purgedViewFilterId: string;
  let softDeletedViewFilterGroupId: string;
  let softDeletedViewSortId: string;
  let twentyStandardApplicationId: string;

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      authContext,
    );

  beforeAll(async () => {
    command = getAppProviderByClassName<PurgeSoftDeletedViewsCommand>(
      'PurgeSoftDeletedViewsCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const {
      data: {
        createOneObject: {
          id: createdObjectMetadataId,
          labelIdentifierFieldMetadataId,
        },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'purgeViewsObject',
        namePlural: 'purgeViewsObjects',
        labelSingular: 'Purge Views Object',
        labelPlural: 'Purge Views Objects',
        icon: 'IconEye',
      },
      gqlFields: 'id labelIdentifierFieldMetadataId',
    });

    objectMetadataId = createdObjectMetadataId;

    const {
      data: {
        createOneObject: { id: createdLastViewObjectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'purgeLastViewObject',
        namePlural: 'purgeLastViewObjects',
        labelSingular: 'Purge Last View Object',
        labelPlural: 'Purge Last View Objects',
        icon: 'IconEye',
      },
    });

    lastViewObjectMetadataId = createdLastViewObjectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'purgeViewsField',
        label: 'Purge Views Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: true,
      },
      gqlFields: 'id',
    });

    const {
      data: { createView: keptView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Kept view',
        objectMetadataId,
        icon: 'IconList',
      },
    });

    const {
      data: { createView: purgedView },
    } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Purged view',
        objectMetadataId,
        icon: 'IconList',
      },
    });

    keptViewId = keptView.id;
    purgedViewId = purgedView.id;

    const {
      data: { createViewField: labelIdentifierViewField },
    } = await createOneViewField({
      expectToFail: false,
      input: {
        viewId: keptViewId,
        fieldMetadataId: labelIdentifierFieldMetadataId,
        position: 0,
        isVisible: true,
      },
      gqlFields: 'id',
    });

    labelIdentifierViewFieldId = labelIdentifierViewField.id;

    const {
      data: { createViewField: softDeletedViewField },
    } = await createOneViewField({
      expectToFail: false,
      input: {
        viewId: keptViewId,
        fieldMetadataId,
        position: 1,
        isVisible: true,
      },
      gqlFields: 'id',
    });

    softDeletedViewFieldId = softDeletedViewField.id;

    const {
      data: { createViewFilterGroup: viewFilterGroup },
    } = await createOneViewFilterGroup({
      expectToFail: false,
      input: {
        viewId: keptViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      },
    });

    softDeletedViewFilterGroupId = viewFilterGroup.id;

    const createViewFilter = async ({
      viewId,
      viewFilterGroupId,
    }: {
      viewId: string;
      viewFilterGroupId?: string;
    }) => {
      const {
        data: { createViewFilter: viewFilter },
      } = await createOneViewFilter({
        expectToFail: false,
        input: {
          fieldMetadataId,
          viewId,
          operand: ViewFilterOperand.CONTAINS,
          value: 'purge',
          viewFilterGroupId,
        },
      });

      return viewFilter.id;
    };

    keptViewFilterId = await createViewFilter({ viewId: keptViewId });
    softDeletedViewFilterId = await createViewFilter({ viewId: keptViewId });
    nestedViewFilterId = await createViewFilter({
      viewId: keptViewId,
      viewFilterGroupId: softDeletedViewFilterGroupId,
    });
    purgedViewFilterId = await createViewFilter({ viewId: purgedViewId });

    const {
      data: { createViewSort: viewSort },
    } = await createOneViewSort({
      expectToFail: false,
      input: {
        viewId: keptViewId,
        fieldMetadataId,
        direction: ViewSortDirection.ASC,
      },
    });

    softDeletedViewSortId = viewSort.id;

    const lastViews = await getCoreRepository<ViewEntity>(ViewEntity).find({
      where: { objectMetadataId: lastViewObjectMetadataId },
    });

    expect(lastViews.length).toBeGreaterThan(0);

    lastViewIds = lastViews.map(({ id }) => id).sort();

    const twentyStandardApplication =
      await getCoreRepository<ApplicationEntity>(
        ApplicationEntity,
      ).findOneOrFail({
        where: {
          universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        },
      });

    twentyStandardApplicationId = twentyStandardApplication.id;

    await getCoreRepository<ViewEntity>(ViewEntity).update(
      { id: purgedViewId },
      { applicationId: twentyStandardApplicationId },
    );

    await getCoreRepository<ViewEntity>(ViewEntity).softDelete({
      id: In([purgedViewId, ...lastViewIds]),
    });
    await getCoreRepository<ViewFieldEntity>(ViewFieldEntity).softDelete({
      id: In([labelIdentifierViewFieldId, softDeletedViewFieldId]),
    });
    await getCoreRepository<ViewFilterEntity>(ViewFilterEntity).softDelete({
      id: softDeletedViewFilterId,
    });
    await getCoreRepository<ViewFilterGroupEntity>(
      ViewFilterGroupEntity,
    ).softDelete({ id: softDeletedViewFilterGroupId });
    await getCoreRepository<ViewSortEntity>(ViewSortEntity).softDelete({
      id: softDeletedViewSortId,
    });

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFilterMaps',
      'flatViewFilterGroupMaps',
      'flatViewSortMaps',
    ]);
  });

  afterAll(async () => {
    for (const objectMetadataIdToDelete of [
      objectMetadataId,
      lastViewObjectMetadataId,
    ]) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataIdToDelete,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataIdToDelete },
      });
    }
  });

  it('keeps every soft-deleted row on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(
      await findRemainingIds(ViewEntity, [purgedViewId, ...lastViewIds]),
    ).toEqual([purgedViewId, ...lastViewIds].sort());
    expect(
      await findRemainingIds(ViewFieldEntity, [
        labelIdentifierViewFieldId,
        softDeletedViewFieldId,
      ]),
    ).toEqual([labelIdentifierViewFieldId, softDeletedViewFieldId].sort());
    expect(
      await findRemainingIds(ViewFilterEntity, [
        softDeletedViewFilterId,
        nestedViewFilterId,
        purgedViewFilterId,
      ]),
    ).toEqual(
      [softDeletedViewFilterId, nestedViewFilterId, purgedViewFilterId].sort(),
    );
    expect(
      await findRemainingIds(ViewFilterGroupEntity, [
        softDeletedViewFilterGroupId,
      ]),
    ).toEqual([softDeletedViewFilterGroupId]);
    expect(
      await findRemainingIds(ViewSortEntity, [softDeletedViewSortId]),
    ).toEqual([softDeletedViewSortId]);
  });

  it('hard-deletes soft-deleted views and children along with the rows under them, including a view owned by another application, skips the last views of an object and the only label identifier view field of a live view, and is a no-op on a second run', async () => {
    const purgedViewBeforeRun = await getCoreRepository<ViewEntity>(
      ViewEntity,
    ).findOneOrFail({ where: { id: purgedViewId }, withDeleted: true });

    expect(purgedViewBeforeRun.applicationId).toBe(twentyStandardApplicationId);

    await runCommand();
    await runCommand();

    expect(
      await findRemainingIds(ViewEntity, [
        keptViewId,
        purgedViewId,
        ...lastViewIds,
      ]),
    ).toEqual([keptViewId, ...lastViewIds].sort());
    expect(
      await findRemainingIds(ViewFieldEntity, [
        labelIdentifierViewFieldId,
        softDeletedViewFieldId,
      ]),
    ).toEqual([labelIdentifierViewFieldId]);
    expect(
      await findRemainingIds(ViewFilterEntity, [
        keptViewFilterId,
        softDeletedViewFilterId,
        nestedViewFilterId,
        purgedViewFilterId,
      ]),
    ).toEqual([keptViewFilterId]);
    expect(
      await findRemainingIds(ViewFilterGroupEntity, [
        softDeletedViewFilterGroupId,
      ]),
    ).toEqual([]);
    expect(
      await findRemainingIds(ViewSortEntity, [softDeletedViewSortId]),
    ).toEqual([]);
  });
});
