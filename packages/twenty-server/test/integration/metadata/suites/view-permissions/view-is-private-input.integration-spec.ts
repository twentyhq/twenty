import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createViewQueryFactory } from 'test/integration/metadata/suites/view/utils/create-view-query-factory.util';
import { destroyViewQueryFactory } from 'test/integration/metadata/suites/view/utils/destroy-view-query-factory.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { ViewType } from 'twenty-shared/types';

import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PRIVACY_GQL_FIELDS = `
  id
  isPrivate
`;

const readViewPrivacy = async (
  viewId: string,
): Promise<{ isPrivate: boolean; createdByUserWorkspaceId: string | null }> => {
  const [view] = await globalThis.testDataSource.query(
    `SELECT "isPrivate", "createdByUserWorkspaceId" FROM core."view" WHERE id = $1`,
    [viewId],
  );

  return view;
};

const readViewIsPrivate = async (viewId: string): Promise<boolean> =>
  (await readViewPrivacy(viewId)).isPrivate;

describe('view isPrivate input (integration)', () => {
  let companyObjectMetadataId: string;
  const createdViewIds: string[] = [];

  const createView = async (
    privacyInput: Pick<CreateViewInput, 'isPrivate'>,
  ) => {
    const response = await makeMetadataApiRequest(
      createViewQueryFactory({
        gqlFields: PRIVACY_GQL_FIELDS,
        input: {
          name: 'Privacy input companies',
          objectMetadataId: companyObjectMetadataId,
          icon: 'IconTable',
          type: ViewType.TABLE,
          ...privacyInput,
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const view = response.body.data.createView;

    createdViewIds.push(view.id);

    return view;
  };

  beforeAll(async () => {
    const companyObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'company' },
    });

    companyObjectMetadataId = companyObjectMetadata.id;
  });

  afterAll(async () => {
    for (const viewId of createdViewIds) {
      await makeMetadataApiRequest(destroyViewQueryFactory({ viewId }));
    }
  });

  it('should create a private view from isPrivate', async () => {
    const view = await createView({ isPrivate: true });

    expect(view).toMatchObject({ isPrivate: true });
    expect(await readViewIsPrivate(view.id)).toBe(true);
  });

  it('should create a workspace view by default', async () => {
    const view = await createView({});

    expect(view).toMatchObject({ isPrivate: false });
  });

  it('should refuse to make a shared view private for a member who did not create it', async () => {
    const view = await createView({});
    const { createdByUserWorkspaceId: callerUserWorkspaceId } =
      await readViewPrivacy(view.id);

    const [{ id: otherMemberUserWorkspaceId }] =
      await globalThis.testDataSource.query(
        `SELECT id FROM core."userWorkspace" WHERE "workspaceId" = $1 AND id <> $2 LIMIT 1`,
        [SEED_APPLE_WORKSPACE_ID, callerUserWorkspaceId],
      );

    await globalThis.testDataSource.query(
      `UPDATE core."view" SET "createdByUserWorkspaceId" = $2 WHERE id = $1`,
      [view.id, otherMemberUserWorkspaceId],
    );

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatViewMaps']);

    const { errors } = await updateOneView({
      viewId: view.id,
      input: { id: view.id, isPrivate: true },
      gqlFields: PRIVACY_GQL_FIELDS,
      expectToFail: true,
    });

    expect(errors?.[0]?.extensions?.code).toBe('METADATA_VALIDATION_FAILED');
    expect(errors?.[0]?.extensions?.errors?.view?.[0]?.errors?.[0]?.code).toBe(
      'PRIVATABLE_ENTITY_PRIVACY_CHANGE_NOT_ALLOWED',
    );
    expect(await readViewPrivacy(view.id)).toEqual({
      isPrivate: false,
      createdByUserWorkspaceId: otherMemberUserWorkspaceId,
    });
  });

  it('should refuse to make a view with no creator private, and keep it without one', async () => {
    const view = await createView({});

    await globalThis.testDataSource.query(
      `UPDATE core."view" SET "createdByUserWorkspaceId" = NULL WHERE id = $1`,
      [view.id],
    );

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatViewMaps']);

    const { errors } = await updateOneView({
      viewId: view.id,
      input: { id: view.id, isPrivate: true },
      gqlFields: PRIVACY_GQL_FIELDS,
      expectToFail: true,
    });

    expect(errors?.[0]?.extensions?.errors?.view?.[0]?.errors?.[0]?.code).toBe(
      'PRIVATABLE_ENTITY_PRIVACY_CHANGE_NOT_ALLOWED',
    );

    const { errors: renameErrors } = await updateOneView({
      viewId: view.id,
      input: { id: view.id, name: 'Renamed view with no creator' },
      gqlFields: PRIVACY_GQL_FIELDS,
      expectToFail: false,
    });

    expect(renameErrors).toBeUndefined();
    expect(await readViewPrivacy(view.id)).toEqual({
      isPrivate: false,
      createdByUserWorkspaceId: null,
    });
  });

  it('should let the creator make their shared view private', async () => {
    const view = await createView({});
    const { createdByUserWorkspaceId } = await readViewPrivacy(view.id);

    const { errors } = await updateOneView({
      viewId: view.id,
      input: { id: view.id, isPrivate: true },
      gqlFields: PRIVACY_GQL_FIELDS,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await readViewPrivacy(view.id)).toEqual({
      isPrivate: true,
      createdByUserWorkspaceId,
    });
  });

  it('should let the creator make their private view shared', async () => {
    const view = await createView({ isPrivate: true });
    const { createdByUserWorkspaceId } = await readViewPrivacy(view.id);

    const { errors } = await updateOneView({
      viewId: view.id,
      input: { id: view.id, isPrivate: false },
      gqlFields: PRIVACY_GQL_FIELDS,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(await readViewPrivacy(view.id)).toEqual({
      isPrivate: false,
      createdByUserWorkspaceId,
    });
  });
});
