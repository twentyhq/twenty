import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { setObjectAccess } from 'test/integration/metadata/suites/object-metadata/utils/set-object-access.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  MetadataReadability,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const MORPH_CHILD_SINGULAR = 'morphInheritanceChild';
const MORPH_CHILD_PLURAL = 'morphInheritanceChildren';

const RECORD_IDS = {
  READABLE_PARENT: randomUUID(),
  UNREADABLE_PARENT: randomUUID(),
  LATE_VARIANT_PARENT: randomUUID(),
};

const CHILD_IDS = {
  ON_READABLE_PARENT: randomUUID(),
  ON_UNREADABLE_PARENT: randomUUID(),
  ON_LATE_VARIANT: randomUUID(),
  ORPHAN: randomUUID(),
};

const collectIds = (edges: { node: { id: string } }[]): string[] =>
  edges.map((edge) => edge.node.id).sort();

const findChildren = findManyOperationFactory({
  objectMetadataSingularName: MORPH_CHILD_SINGULAR,
  objectMetadataPluralName: MORPH_CHILD_PLURAL,
  gqlFields: 'id',
  filter: { id: { in: Object.values(CHILD_IDS) } },
});

describe('inheritedAccessMorphObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let readableParentObjectMetadataId: string;
  let unreadableParentObjectMetadataId: string;
  let lateVariantObjectMetadataId: string;
  let childObjectMetadataId: string;
  let morphFieldMetadataId: string;
  let morphId: string;
  let memberRoleId: string;

  const sourceId = randomUUID();

  const createObject = async (nameSingular: string, namePlural: string) => {
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular,
        namePlural,
        labelSingular: nameSingular,
        labelPlural: namePlural,
        icon: 'IconLock',
        isLabelSyncedWithName: false,
      },
    });

    await createOneFieldMetadata({
      input: {
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: data.createOneObject.id,
        isLabelSyncedWithName: false,
      },
    });

    return data.createOneObject.id;
  };

  const declareMorphInheritance = () =>
    setObjectAccess(childObjectMetadataId, {
      readability: MetadataReadability.INHERITED,
      inheritance: {
        match: ObjectAccessInheritanceMatch.ANY,
        through: [{ kind: ObjectAccessInheritanceRelationKind.MORPH, morphId }],
      } as never,
    });

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    readableParentObjectMetadataId = await createObject(
      'morphReadableParent',
      'morphReadableParents',
    );
    unreadableParentObjectMetadataId = await createObject(
      'morphUnreadableParent',
      'morphUnreadableParents',
    );
    lateVariantObjectMetadataId = await createObject(
      'morphLateVariantParent',
      'morphLateVariantParents',
    );
    childObjectMetadataId = await createObject(
      MORPH_CHILD_SINGULAR,
      MORPH_CHILD_PLURAL,
    );

    const { data: morphFieldData } = await createOneFieldMetadata({
      input: {
        name: 'target',
        label: 'Target',
        type: FieldMetadataType.MORPH_RELATION,
        objectMetadataId: childObjectMetadataId,
        isLabelSyncedWithName: false,
        morphRelationsCreationPayload: [
          {
            targetObjectMetadataId: readableParentObjectMetadataId,
            targetFieldLabel: 'Morph Children',
            targetFieldIcon: 'IconLock',
            type: RelationType.MANY_TO_ONE,
          },
          {
            targetObjectMetadataId: unreadableParentObjectMetadataId,
            targetFieldLabel: 'Morph Children',
            targetFieldIcon: 'IconLock',
            type: RelationType.MANY_TO_ONE,
          },
        ],
      },
      gqlFields: `
        id
        morphId
      `,
    });

    morphFieldMetadataId = morphFieldData.createOneField.id;
    morphId = morphFieldData.createOneField.morphId as string;

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'morphReadableParent',
        gqlFields: 'id',
        data: { id: RECORD_IDS.READABLE_PARENT, name: 'readable' },
      }),
    );
    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'morphUnreadableParent',
        gqlFields: 'id',
        data: { id: RECORD_IDS.UNREADABLE_PARENT, name: 'unreadable' },
      }),
    );

    for (const [id, data] of [
      [
        CHILD_IDS.ON_READABLE_PARENT,
        { targetMorphReadableParentId: RECORD_IDS.READABLE_PARENT },
      ],
      [
        CHILD_IDS.ON_UNREADABLE_PARENT,
        { targetMorphUnreadableParentId: RECORD_IDS.UNREADABLE_PARENT },
      ],
      [CHILD_IDS.ORPHAN, {}],
    ] as const) {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: MORPH_CHILD_SINGULAR,
          gqlFields: 'id',
          data: { id, name: 'child', ...data },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    await recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          recordId: RECORD_IDS.READABLE_PARENT,
          objectMetadataId: readableParentObjectMetadataId,
          principalId: memberRoleId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId,
        },
      ],
    });

    await setObjectAccess(readableParentObjectMetadataId, {
      readability: MetadataReadability.PRIVATE,
    });
    await setObjectAccess(unreadableParentObjectMetadataId, {
      readability: MetadataReadability.PRIVATE,
    });
    await declareMorphInheritance();

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value: false,
      expectToFail: false,
    });
    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });

    for (const objectMetadataId of [
      readableParentObjectMetadataId,
      unreadableParentObjectMetadataId,
      lateVariantObjectMetadataId,
      childObjectMetadataId,
    ]) {
      await setObjectAccess(objectMetadataId, {
        readability: MetadataReadability.OPEN,
      });
    }

    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: MORPH_CHILD_SINGULAR,
        objectMetadataPluralName: MORPH_CHILD_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: Object.values(CHILD_IDS) } },
      }),
    );

    await updateOneFieldMetadata({
      input: {
        idToUpdate: morphFieldMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });
    await deleteOneFieldMetadata({
      input: { idToDelete: morphFieldMetadataId },
      expectToFail: false,
    });

    for (const objectMetadataId of [
      childObjectMetadataId,
      readableParentObjectMetadataId,
      unreadableParentObjectMetadataId,
      lateVariantObjectMetadataId,
    ]) {
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
    }
  });

  it('resolves the morph group as one branch and hides the unreadable and orphan rows', async () => {
    const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

    expect(response.body.errors).toBeUndefined();
    expect(collectIds(response.body.data[MORPH_CHILD_PLURAL].edges)).toEqual([
      CHILD_IDS.ON_READABLE_PARENT,
    ]);
  });

  it('covers a morph variant added after the policy was declared, with no second list to maintain', async () => {
    await updateOneFieldMetadata({
      input: {
        idToUpdate: morphFieldMetadataId,
        updatePayload: {
          morphRelationsUpdatePayload: [
            { targetObjectMetadataId: lateVariantObjectMetadataId },
          ],
        },
      },
      expectToFail: false,
    });

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'morphLateVariantParent',
        gqlFields: 'id',
        data: { id: RECORD_IDS.LATE_VARIANT_PARENT, name: 'late' },
      }),
    );

    const createResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: MORPH_CHILD_SINGULAR,
        gqlFields: 'id',
        data: {
          id: CHILD_IDS.ON_LATE_VARIANT,
          name: 'child',
          targetMorphLateVariantParentId: RECORD_IDS.LATE_VARIANT_PARENT,
        },
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();

    const openVariantResponse =
      await makeGraphqlAPIRequestWithMemberRole(findChildren);

    expect(openVariantResponse.body.errors).toBeUndefined();
    expect(
      collectIds(openVariantResponse.body.data[MORPH_CHILD_PLURAL].edges),
    ).toEqual([CHILD_IDS.ON_READABLE_PARENT, CHILD_IDS.ON_LATE_VARIANT].sort());

    await setObjectAccess(lateVariantObjectMetadataId, {
      readability: MetadataReadability.PRIVATE,
    });

    const privateVariantResponse =
      await makeGraphqlAPIRequestWithMemberRole(findChildren);

    expect(privateVariantResponse.body.errors).toBeUndefined();
    expect(
      collectIds(privateVariantResponse.body.data[MORPH_CHILD_PLURAL].edges),
    ).toEqual([CHILD_IDS.ON_READABLE_PARENT]);
  });

  it('refuses deleting the relation the object inherits its access through', async () => {
    const response = await deleteOneFieldMetadata({
      input: { idToDelete: morphFieldMetadataId },
      expectToFail: true,
    });

    expect(JSON.stringify(response.errors)).toContain('inherited access');
  });
});
