import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createViewQueryFactory } from 'test/integration/metadata/suites/view/utils/create-view-query-factory.util';
import { destroyViewQueryFactory } from 'test/integration/metadata/suites/view/utils/destroy-view-query-factory.util';
import { updateOneView } from 'test/integration/metadata/suites/view/utils/update-one-view.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { ViewType, ViewVisibility } from 'twenty-shared/types';

import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PRIVACY_GQL_FIELDS = `
  id
  isPrivate
  visibility
`;

const readViewIsPrivate = async (viewId: string): Promise<boolean> => {
  const [view] = await globalThis.testDataSource.query(
    `SELECT "isPrivate" FROM core."view" WHERE id = $1`,
    [viewId],
  );

  return view.isPrivate;
};

describe('view isPrivate input (integration)', () => {
  let companyObjectMetadataId: string;
  const createdViewIds: string[] = [];

  const createView = async (
    privacyInput: Pick<CreateViewInput, 'isPrivate' | 'visibility'>,
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

    expect(view).toMatchObject({
      isPrivate: true,
      visibility: ViewVisibility.UNLISTED,
    });
    expect(await readViewIsPrivate(view.id)).toBe(true);
  });

  it('should still create a private view from the deprecated visibility', async () => {
    const view = await createView({ visibility: ViewVisibility.UNLISTED });

    expect(view).toMatchObject({
      isPrivate: true,
      visibility: ViewVisibility.UNLISTED,
    });
  });

  it('should create a workspace view by default', async () => {
    const view = await createView({});

    expect(view).toMatchObject({
      isPrivate: false,
      visibility: ViewVisibility.WORKSPACE,
    });
  });

  it('should prefer isPrivate over visibility on update', async () => {
    const view = await createView({ isPrivate: true });

    const { data, errors } = await updateOneView({
      viewId: view.id,
      input: {
        id: view.id,
        isPrivate: false,
        visibility: ViewVisibility.UNLISTED,
      },
      gqlFields: PRIVACY_GQL_FIELDS,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.updateView).toMatchObject({
      isPrivate: false,
      visibility: ViewVisibility.WORKSPACE,
    });
    expect(await readViewIsPrivate(view.id)).toBe(false);
  });
});
