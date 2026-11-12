import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createViewQueryFactory } from 'test/integration/metadata/suites/view/utils/create-view-query-factory.util';
import { destroyViewQueryFactory } from 'test/integration/metadata/suites/view/utils/destroy-view-query-factory.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { ViewType, ViewVisibility } from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const readViewVisibility = async (viewId: string): Promise<string> => {
  const [view] = await globalThis.testDataSource.query(
    `SELECT visibility FROM core."view" WHERE id = $1`,
    [viewId],
  );

  return view.visibility;
};

// The seeded guest role cannot access tools, so it lacks VIEWS
describe('view visibility permission (integration)', () => {
  let unlistedViewId: string;

  beforeAll(async () => {
    const companyObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'company' },
    });

    const response = await makeMetadataApiRequest(
      createViewQueryFactory({
        input: {
          name: 'Guest private companies',
          objectMetadataId: companyObjectMetadata.id,
          icon: 'IconTable',
          type: ViewType.TABLE,
          visibility: ViewVisibility.UNLISTED,
        },
      }),
      APPLE_PHIL_GUEST_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    unlistedViewId = response.body.data.createView.id;
  });

  afterAll(async () => {
    await makeMetadataApiRequest(
      destroyViewQueryFactory({ viewId: unlistedViewId }),
    );
  });

  it('should let a guest without VIEWS rename their own unlisted view', async () => {
    const { data, errors } = await updateOneView({
      viewId: unlistedViewId,
      input: { id: unlistedViewId, name: 'Guest renamed companies' },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.updateView).toMatchObject({ name: 'Guest renamed companies' });
    expect(await readViewVisibility(unlistedViewId)).toBe(
      ViewVisibility.UNLISTED,
    );
  });

  it('should refuse publishing it through GraphQL', async () => {
    const { errors } = await updateOneView({
      viewId: unlistedViewId,
      input: { id: unlistedViewId, visibility: ViewVisibility.WORKSPACE },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(errors?.[0]?.message).toBe(
      'You do not have permission to modify this view',
    );
    expect(await readViewVisibility(unlistedViewId)).toBe(
      ViewVisibility.UNLISTED,
    );
  });

  it('should refuse publishing it through REST', async () => {
    const response = await makeRestApiRequest({
      method: 'patch',
      path: `/metadata/views/${unlistedViewId}`,
      bearer: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      body: { visibility: ViewVisibility.WORKSPACE },
    });

    expect(response.status).toBe(403);
    expect(await readViewVisibility(unlistedViewId)).toBe(
      ViewVisibility.UNLISTED,
    );
  });
});
