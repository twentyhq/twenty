import gql from 'graphql-tag';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  targetRecordId
  targetObjectMetadataId
  folderId
  position
  targetRecordIdentifier {
    id
    labelIdentifier
  }
`;

const createCoreWorkflow = async (
  name: string,
  visibility?: 'PRIVATE' | 'WORKSPACE',
) => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
        createCoreWorkflow(input: $input) {
          id
          name
          workspaceWorkflowId
        }
      }
    `,
    variables: { input: { name, ...(visibility ? { visibility } : {}) } },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createCoreWorkflow as {
    id: string;
    name: string;
    workspaceWorkflowId: string | null;
  };
};

const deleteCoreWorkflows = async (coreWorkflowIds: string[]) => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
        deleteCoreWorkflows(input: $input) {
          id
        }
      }
    `,
    variables: { input: { coreWorkflowIds } },
  });

  return response;
};

describe('workflow navigation menu items resolve and clean up on core ids', () => {
  let workflowObjectMetadataId: string;
  let companyObjectMetadataId: string;
  let companyRecordId: string;
  let currentUserWorkspaceId: string;
  let memberUserWorkspaceId: string;
  const createdNavigationMenuItemIds: string[] = [];
  const createdMemberNavigationMenuItemIds: string[] = [];

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const workflowObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'workflow',
    );
    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(workflowObjectMetadata);
    jestExpectToBeDefined(companyObjectMetadata);

    workflowObjectMetadataId = workflowObjectMetadata.id;
    companyObjectMetadataId = companyObjectMetadata.id;

    const companyResponse = await makeGraphqlAPIRequest({
      query: gql`
        mutation CreateCompany($data: CompanyCreateInput!) {
          createCompany(data: $data) {
            id
          }
        }
      `,
      variables: { data: { name: 'Workflow favorite company' } },
    });

    expect(companyResponse.body.errors).toBeUndefined();
    companyRecordId = companyResponse.body.data.createCompany.id;

    const { data: currentUserData } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    jestExpectToBeDefined(currentUserData?.currentUser?.currentUserWorkspace);

    currentUserWorkspaceId =
      currentUserData.currentUser.currentUserWorkspace.id;
  });

  afterAll(async () => {
    const { data } = await findNavigationMenuItems({
      input: undefined,
      expectToFail: false,
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    });

    const remainingIds = new Set(
      (data?.navigationMenuItems ?? []).map((item) => item.id),
    );

    for (const navigationMenuItemId of createdNavigationMenuItemIds) {
      if (!remainingIds.has(navigationMenuItemId)) {
        continue;
      }

      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: navigationMenuItemId },
      });
    }

    for (const navigationMenuItemId of createdMemberNavigationMenuItemIds) {
      await deleteNavigationMenuItem({
        expectToFail: null,
        input: { id: navigationMenuItemId },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
    }
  });

  const createFavorite = async ({
    targetObjectMetadataId,
    targetRecordId,
  }: {
    targetObjectMetadataId: string;
    targetRecordId: string;
  }) => {
    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataId,
        targetRecordId,
        userWorkspaceId: currentUserWorkspaceId,
      },
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    });

    jestExpectToBeDefined(data?.createNavigationMenuItem);

    createdNavigationMenuItemIds.push(data.createNavigationMenuItem.id);

    return data.createNavigationMenuItem;
  };

  const findFavoriteById = async (navigationMenuItemId: string) => {
    const { data } = await findNavigationMenuItems({
      input: undefined,
      expectToFail: false,
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    });

    return data?.navigationMenuItems.find(
      (item) => item.id === navigationMenuItemId,
    );
  };

  it('resolves a favorite stored on the core workflow id', async () => {
    const coreWorkflow = await createCoreWorkflow('Favorite core workflow');

    const favorite = await createFavorite({
      targetObjectMetadataId: workflowObjectMetadataId,
      targetRecordId: coreWorkflow.id,
    });

    expect(favorite.targetRecordId).toBe(coreWorkflow.id);
    expect(favorite.targetRecordIdentifier).toEqual(
      expect.objectContaining({
        id: coreWorkflow.id,
        labelIdentifier: 'Favorite core workflow',
      }),
    );

    await deleteCoreWorkflows([coreWorkflow.id]);
  }, 120_000);

  it('resolves a legacy favorite stored on the workspace workflow id to the core id', async () => {
    const coreWorkflow = await createCoreWorkflow('Legacy favorite workflow');

    jestExpectToBeDefined(coreWorkflow.workspaceWorkflowId);

    const favorite = await createFavorite({
      targetObjectMetadataId: workflowObjectMetadataId,
      targetRecordId: coreWorkflow.workspaceWorkflowId,
    });

    expect(favorite.targetRecordId).toBe(coreWorkflow.workspaceWorkflowId);
    expect(favorite.targetRecordIdentifier?.id).toBe(coreWorkflow.id);

    await deleteCoreWorkflows([coreWorkflow.id]);
  }, 120_000);

  it('removes favorites of both id shapes when the core workflow is deleted', async () => {
    const coreWorkflow = await createCoreWorkflow('Deleted core workflow');

    jestExpectToBeDefined(coreWorkflow.workspaceWorkflowId);

    const coreIdFavorite = await createFavorite({
      targetObjectMetadataId: workflowObjectMetadataId,
      targetRecordId: coreWorkflow.id,
    });
    const legacyIdFavorite = await createFavorite({
      targetObjectMetadataId: workflowObjectMetadataId,
      targetRecordId: coreWorkflow.workspaceWorkflowId,
    });
    const companyFavorite = await createFavorite({
      targetObjectMetadataId: companyObjectMetadataId,
      targetRecordId: companyRecordId,
    });

    const deleteResponse = await deleteCoreWorkflows([coreWorkflow.id]);

    expect(deleteResponse.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();

    expect(await findFavoriteById(coreIdFavorite.id)).toBeUndefined();
    expect(await findFavoriteById(legacyIdFavorite.id)).toBeUndefined();
    expect(isDefined(await findFavoriteById(companyFavorite.id))).toBe(true);
  }, 120_000);

  it('does not resolve a workflow kept private by another member', async () => {
    const privateCoreWorkflow = await createCoreWorkflow(
      'Private core workflow',
      'PRIVATE',
    );

    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataId: workflowObjectMetadataId,
        targetRecordId: privateCoreWorkflow.id,
        userWorkspaceId: memberUserWorkspaceId,
      },
      gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    jestExpectToBeDefined(data?.createNavigationMenuItem);
    createdMemberNavigationMenuItemIds.push(data.createNavigationMenuItem.id);

    expect(data.createNavigationMenuItem.targetRecordIdentifier).toBeNull();

    await deleteCoreWorkflows([privateCoreWorkflow.id]);
  }, 120_000);

  it('does not resolve or delete an id no workflow in this workspace holds', async () => {
    const unknownCoreWorkflowId = uuidv4();

    const favorite = await createFavorite({
      targetObjectMetadataId: workflowObjectMetadataId,
      targetRecordId: unknownCoreWorkflowId,
    });

    expect(favorite.targetRecordIdentifier).toBeNull();

    const deleteResponse = await deleteCoreWorkflows([unknownCoreWorkflowId]);

    expect(deleteResponse.body.data.deleteCoreWorkflows).toEqual([]);

    await waitForAllJobsToFinish();

    expect(isDefined(await findFavoriteById(favorite.id))).toBe(true);
  }, 120_000);
});
