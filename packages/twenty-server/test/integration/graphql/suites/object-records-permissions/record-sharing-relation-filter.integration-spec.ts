import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type RecordShareStorageService } from 'src/engine/permissions/internal/record-share/services/record-share-storage.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_NAME = 'sharedOnlyProject';
const OBJECT_PLURAL = 'sharedOnlyProjects';
const RELATION_FIELD_NAME = 'sharedOnlyProject';
const SHARED_PROJECT_ID = randomUUID();
const UNSHARED_PROJECT_ID = randomUUID();
const PERSON_ON_SHARED_PROJECT_ID = randomUUID();
const PERSON_ON_UNSHARED_PROJECT_ID = randomUUID();
const SET_SHARE = parse(
  `mutation SetShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!, $accessLevel: RecordShareAccessLevel!) { setRecordShare(target: $target, principal: $principal, accessLevel: $accessLevel) { canManageSharing } }`,
);

describe('Relation filters through an object reached only by shares', () => {
  let objectMetadataId: string;
  let memberRoleId: string;

  const setMemberObjectAccess = (canAccessObject: boolean) =>
    upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        objectPermissions: [
          {
            objectMetadataId,
            canReadObjectRecords: canAccessObject,
            canUpdateObjectRecords: canAccessObject,
            canSoftDeleteObjectRecords: canAccessObject,
            canDestroyObjectRecords: canAccessObject,
          },
        ],
      },
    });

  const findPeopleOnProjectsAsJony = async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: {
          id: {
            in: [PERSON_ON_SHARED_PROJECT_ID, PERSON_ON_UNSHARED_PROJECT_ID],
          },
          [RELATION_FIELD_NAME]: { name: { in: ['Shared', 'Unshared'] } },
        },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    return {
      errors: response.body.errors,
      ids: (response.body.data?.people?.edges ?? []).map(
        ({ node }: { node: { id: string } }) => node.id,
      ),
    };
  };

  beforeAll(async () => {
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Shared only project',
        labelPlural: 'Shared only projects',
        icon: 'IconShare',
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id',
    });

    objectMetadataId = data.createOneObject.id;

    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);
    const personObjectMetadataId = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
    })?.id;

    if (!isDefined(personObjectMetadataId)) {
      throw new Error('The person object is not seeded');
    }

    await createOneFieldMetadata({
      input: {
        objectMetadataId: personObjectMetadataId,
        name: RELATION_FIELD_NAME,
        label: 'Shared only project',
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetObjectMetadataId: objectMetadataId,
          targetFieldLabel: 'People',
          targetFieldIcon: 'IconUsers',
          type: RelationType.MANY_TO_ONE,
        },
      },
      gqlFields: 'id',
      expectToFail: false,
    });

    for (const [id, name] of [
      [SHARED_PROJECT_ID, 'Shared'],
      [UNSHARED_PROJECT_ID, 'Unshared'],
    ]) {
      const created = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_NAME,
          gqlFields: 'id',
          data: { id, name },
        }),
      );

      expect(created.body.errors).toBeUndefined();
    }

    for (const [id, projectId] of [
      [PERSON_ON_SHARED_PROJECT_ID, SHARED_PROJECT_ID],
      [PERSON_ON_UNSHARED_PROJECT_ID, UNSHARED_PROJECT_ID],
    ]) {
      const created = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          data: { id, [`${RELATION_FIELD_NAME}Id`]: projectId },
        }),
      );

      expect(created.body.errors).toBeUndefined();
    }

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });
    await setMemberObjectAccess(false);
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: false,
      expectToFail: false,
    });
    await setMemberObjectAccess(true);
    await getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    ).deleteByRecordIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      recordIds: [SHARED_PROJECT_ID, UNSHARED_PROJECT_ID],
    });
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: {
          id: {
            in: [PERSON_ON_SHARED_PROJECT_ID, PERSON_ON_UNSHARED_PROJECT_ID],
          },
        },
      }),
    );
    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('should filter through the relation without matching unshared records', async () => {
    expect(await findPeopleOnProjectsAsJony()).toEqual({
      errors: undefined,
      ids: [],
    });

    const shared = await makeMetadataApiRequest({
      query: SET_SHARE,
      variables: {
        target: { objectMetadataId, recordId: SHARED_PROJECT_ID },
        principal: { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
        accessLevel: RecordShareAccessLevel.READ,
      },
    });

    expect(shared.body.errors).toBeUndefined();
    expect(await findPeopleOnProjectsAsJony()).toEqual({
      errors: undefined,
      ids: [PERSON_ON_SHARED_PROJECT_ID],
    });
  });
});
