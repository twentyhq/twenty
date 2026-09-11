import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { setObjectAccess } from 'test/integration/metadata/suites/object-metadata/utils/set-object-access.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  FeatureFlagKey,
  FieldMetadataType,
  MetadataReadability,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
  type ObjectRecord,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { In } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SOURCE_SINGULAR = 'inheritanceSource';
const SOURCE_PLURAL = 'inheritanceSources';
const TARGET_SINGULAR = 'inheritanceTarget';
const TARGET_PLURAL = 'inheritanceTargets';
const CHILD_SINGULAR = 'inheritanceChild';
const CHILD_PLURAL = 'inheritanceChildren';

const CHILD_UPDATE_RESPONSE_KEY = 'updateInheritanceChildren';
const CHILD_DELETE_RESPONSE_KEY = 'deleteInheritanceChildren';

const SOURCE_IDS = {
  READABLE: randomUUID(),
  UNREADABLE: randomUUID(),
};

const TARGET_IDS = {
  READABLE: randomUUID(),
  UNREADABLE: randomUUID(),
};

const CHILD_IDS = {
  BOTH_READABLE: randomUUID(),
  ONLY_SOURCE_READABLE: randomUUID(),
  ONLY_TARGET_READABLE: randomUUID(),
  ORPHAN: randomUUID(),
};

const ALL_CHILD_IDS = Object.values(CHILD_IDS);

const childFilter = { id: { in: ALL_CHILD_IDS } };

const collectIds = (edges: { node: { id: string } }[]): string[] =>
  edges.map((edge) => edge.node.id).sort();

const findChildren = findManyOperationFactory({
  objectMetadataSingularName: CHILD_SINGULAR,
  objectMetadataPluralName: CHILD_PLURAL,
  gqlFields: 'id',
  filter: childFilter,
});

const findChildrenThroughSources = findManyOperationFactory({
  objectMetadataSingularName: SOURCE_SINGULAR,
  objectMetadataPluralName: SOURCE_PLURAL,
  gqlFields: `
    id
    ${CHILD_PLURAL} {
      edges {
        node {
          id
        }
      }
    }
  `,
  filter: { id: { in: Object.values(SOURCE_IDS) } },
});

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

describe('inheritedAccessObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let sourceObjectMetadataId: string;
  let targetObjectMetadataId: string;
  let childObjectMetadataId: string;
  let sourceRelationFieldMetadataId: string;
  let targetRelationFieldMetadataId: string;
  let sourceRelationFieldUniversalIdentifier: string;
  let targetRelationFieldUniversalIdentifier: string;
  let memberRoleId: string;

  const sourceId = randomUUID();

  const shareWithMember = (
    objectMetadataId: string,
    recordId: string,
    accessLevel: RecordShareAccessLevel,
  ) =>
    recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          recordId,
          objectMetadataId,
          principalId: memberRoleId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId,
        },
      ],
    });

  const setChildInheritance = (
    match: ObjectAccessInheritanceMatch,
    fieldUniversalIdentifiers: string[],
  ) =>
    setObjectAccess(childObjectMetadataId, {
      readability: MetadataReadability.INHERITED,
      inheritance: {
        match,
        through: fieldUniversalIdentifiers.map((fieldUniversalIdentifier) => ({
          kind: ObjectAccessInheritanceRelationKind.FIELD,
          fieldUniversalIdentifier,
        })),
      } as never,
    });

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const createObject = async (
      nameSingular: string,
      namePlural: string,
      labelSingular: string,
      labelPlural: string,
    ) => {
      const { data } = await createOneObjectMetadata({
        input: {
          nameSingular,
          namePlural,
          labelSingular,
          labelPlural,
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

    sourceObjectMetadataId = await createObject(
      SOURCE_SINGULAR,
      SOURCE_PLURAL,
      'Inheritance Source',
      'Inheritance Sources',
    );
    targetObjectMetadataId = await createObject(
      TARGET_SINGULAR,
      TARGET_PLURAL,
      'Inheritance Target',
      'Inheritance Targets',
    );
    childObjectMetadataId = await createObject(
      CHILD_SINGULAR,
      CHILD_PLURAL,
      'Inheritance Child',
      'Inheritance Children',
    );

    const createParentRelation = async (
      name: string,
      targetObjectMetadataIdToLink: string,
      targetFieldLabel: string,
    ) => {
      const { data } = await createOneFieldMetadata({
        input: {
          name,
          label: targetFieldLabel,
          type: FieldMetadataType.RELATION,
          objectMetadataId: childObjectMetadataId,
          isLabelSyncedWithName: false,
          relationCreationPayload: {
            targetObjectMetadataId: targetObjectMetadataIdToLink,
            targetFieldLabel: 'Inheritance Children',
            targetFieldIcon: 'IconLock',
            type: RelationType.MANY_TO_ONE,
          },
        },
        gqlFields: `
          id
          universalIdentifier
        `,
      });

      return data.createOneField;
    };

    const sourceRelationField = await createParentRelation(
      'source',
      sourceObjectMetadataId,
      'Source',
    );
    const targetRelationField = await createParentRelation(
      'target',
      targetObjectMetadataId,
      'Target',
    );

    sourceRelationFieldMetadataId = sourceRelationField.id;
    targetRelationFieldMetadataId = targetRelationField.id;
    sourceRelationFieldUniversalIdentifier =
      sourceRelationField.universalIdentifier;
    targetRelationFieldUniversalIdentifier =
      targetRelationField.universalIdentifier;

    for (const [name, id] of Object.entries(SOURCE_IDS)) {
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: SOURCE_SINGULAR,
          gqlFields: 'id',
          data: { id, name },
        }),
      );
    }

    for (const [name, id] of Object.entries(TARGET_IDS)) {
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: TARGET_SINGULAR,
          gqlFields: 'id',
          data: { id, name },
        }),
      );
    }

    const childData: Record<string, { sourceId?: string; targetId?: string }> =
      {
        [CHILD_IDS.BOTH_READABLE]: {
          sourceId: SOURCE_IDS.READABLE,
          targetId: TARGET_IDS.READABLE,
        },
        [CHILD_IDS.ONLY_SOURCE_READABLE]: {
          sourceId: SOURCE_IDS.READABLE,
          targetId: TARGET_IDS.UNREADABLE,
        },
        [CHILD_IDS.ONLY_TARGET_READABLE]: {
          sourceId: SOURCE_IDS.UNREADABLE,
          targetId: TARGET_IDS.READABLE,
        },
        [CHILD_IDS.ORPHAN]: {},
      };

    for (const [id, links] of Object.entries(childData)) {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: CHILD_SINGULAR,
          gqlFields: 'id',
          data: { id, name: 'child', ...links },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    await shareWithMember(
      sourceObjectMetadataId,
      SOURCE_IDS.READABLE,
      RecordShareAccessLevel.READ,
    );
    await shareWithMember(
      targetObjectMetadataId,
      TARGET_IDS.READABLE,
      RecordShareAccessLevel.READ,
    );

    await setObjectAccess(sourceObjectMetadataId, {
      readability: MetadataReadability.PRIVATE,
    });
    await setObjectAccess(targetObjectMetadataId, {
      readability: MetadataReadability.PRIVATE,
    });
    await setChildInheritance(ObjectAccessInheritanceMatch.ANY, [
      sourceRelationFieldUniversalIdentifier,
      targetRelationFieldUniversalIdentifier,
    ]);
    await setRecordSharingEnabled(true);
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });

    for (const objectMetadataId of [
      sourceObjectMetadataId,
      targetObjectMetadataId,
      childObjectMetadataId,
    ]) {
      await setObjectAccess(objectMetadataId, {
        readability: MetadataReadability.OPEN,
      });
    }

    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: CHILD_SINGULAR,
        objectMetadataPluralName: CHILD_PLURAL,
        gqlFields: 'id',
        filter: childFilter,
      }),
    );

    for (const idToDelete of [
      sourceRelationFieldMetadataId,
      targetRelationFieldMetadataId,
    ]) {
      await deleteOneFieldMetadata({
        input: { idToDelete },
        expectToFail: false,
      });
    }

    for (const objectMetadataId of [
      childObjectMetadataId,
      sourceObjectMetadataId,
      targetObjectMetadataId,
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

  describe('ANY over two private parents', () => {
    beforeAll(async () => {
      await setChildInheritance(ObjectAccessInheritanceMatch.ANY, [
        sourceRelationFieldUniversalIdentifier,
        targetRelationFieldUniversalIdentifier,
      ]);
    });

    it('gates the workspace owner too: no parent is shared with their principals', async () => {
      const response = await makeGraphqlAPIRequest(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).toEqual([]);
    });

    it('follows the readable parent and hides the child without any parent', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).toEqual(
        [
          CHILD_IDS.BOTH_READABLE,
          CHILD_IDS.ONLY_SOURCE_READABLE,
          CHILD_IDS.ONLY_TARGET_READABLE,
        ].sort(),
      );
    });

    it('applies the same gate to a nested read', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findChildrenThroughSources,
      );

      expect(response.body.errors).toBeUndefined();

      const nestedChildIds = response.body.data[SOURCE_PLURAL].edges.flatMap(
        (edge: {
          node: { [key: string]: { edges: { node: { id: string } }[] } };
        }) => edge.node[CHILD_PLURAL].edges.map((child) => child.node.id),
      );

      expect(nestedChildIds.sort()).toEqual(
        [CHILD_IDS.BOTH_READABLE, CHILD_IDS.ONLY_SOURCE_READABLE].sort(),
      );
    });

    it('hides every child again once the parent share rows are revoked', async () => {
      await recordShareService.deleteByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: sourceObjectMetadataId,
        recordIds: [SOURCE_IDS.READABLE],
      });

      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).toEqual(
        [CHILD_IDS.BOTH_READABLE, CHILD_IDS.ONLY_TARGET_READABLE].sort(),
      );

      await shareWithMember(
        sourceObjectMetadataId,
        SOURCE_IDS.READABLE,
        RecordShareAccessLevel.READ,
      );
    });

    it('cannot be overridden by a share row on the child itself', async () => {
      await shareWithMember(
        childObjectMetadataId,
        CHILD_IDS.ORPHAN,
        RecordShareAccessLevel.FULL,
      );

      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).not.toContain(
        CHILD_IDS.ORPHAN,
      );

      await recordShareService.deleteByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: childObjectMetadataId,
        recordIds: [CHILD_IDS.ORPHAN],
      });
    });

    it('cannot be bypassed when the parent object itself is unreadable for the role', async () => {
      await upsertObjectPermissions({
        expectToFail: false,
        input: {
          roleId: memberRoleId,
          objectPermissions: [
            {
              objectMetadataId: sourceObjectMetadataId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
      });

      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).toEqual(
        [CHILD_IDS.BOTH_READABLE, CHILD_IDS.ONLY_TARGET_READABLE].sort(),
      );

      await upsertObjectPermissions({
        expectToFail: false,
        input: {
          roleId: memberRoleId,
          objectPermissions: [
            {
              objectMetadataId: sourceObjectMetadataId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: true,
              canDestroyObjectRecords: true,
            },
          ],
        },
      });
    });

    it('refuses reads outright when the declared policy cannot be resolved', async () => {
      await setObjectAccess(childObjectMetadataId, {
        readability: MetadataReadability.INHERITED,
        inheritance: null,
      });

      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'not readable through the API',
      );

      await setChildInheritance(ObjectAccessInheritanceMatch.ANY, [
        sourceRelationFieldUniversalIdentifier,
        targetRelationFieldUniversalIdentifier,
      ]);
    });

    it('refuses to let a SYSTEM parent be read through its child', async () => {
      await setObjectAccess(sourceObjectMetadataId, {
        readability: MetadataReadability.SYSTEM,
      });

      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).toEqual(
        [CHILD_IDS.BOTH_READABLE, CHILD_IDS.ONLY_TARGET_READABLE].sort(),
      );

      await setObjectAccess(sourceObjectMetadataId, {
        readability: MetadataReadability.PRIVATE,
      });
    });

    it('leaves a privileged system context ungated', async () => {
      const workspaceOrmManager =
        getAppProviderByClassName<WorkspaceOrmManager>('WorkspaceOrmManager');

      const records = await workspaceOrmManager.executeInWorkspaceContext(
        () =>
          workspaceOrmManager
            .getRepository<ObjectRecord>(CHILD_SINGULAR, {
              shouldBypassPermissionChecks: true,
            })
            .find({ where: { id: In(ALL_CHILD_IDS) } }),
        buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
      );

      expect(records.map((record) => record.id).sort()).toEqual(
        [...ALL_CHILD_IDS].sort(),
      );
    });

    it('falls back to open reads when record sharing is disabled', async () => {
      await setRecordSharingEnabled(false);

      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).toEqual(
        [...ALL_CHILD_IDS].sort(),
      );

      await setRecordSharingEnabled(true);
    });
  });

  describe('ALL over two private parents', () => {
    beforeAll(async () => {
      await setChildInheritance(ObjectAccessInheritanceMatch.ALL, [
        sourceRelationFieldUniversalIdentifier,
        targetRelationFieldUniversalIdentifier,
      ]);
    });

    afterAll(async () => {
      await setChildInheritance(ObjectAccessInheritanceMatch.ANY, [
        sourceRelationFieldUniversalIdentifier,
        targetRelationFieldUniversalIdentifier,
      ]);
    });

    it('requires both effective parents', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(findChildren);

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data[CHILD_PLURAL].edges)).toEqual([
        CHILD_IDS.BOTH_READABLE,
      ]);
    });

    it('keeps requiring the other branch through a joined query', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findChildrenThroughSources,
      );

      expect(response.body.errors).toBeUndefined();

      const nestedChildIds = response.body.data[SOURCE_PLURAL].edges.flatMap(
        (edge: {
          node: { [key: string]: { edges: { node: { id: string } }[] } };
        }) => edge.node[CHILD_PLURAL].edges.map((child) => child.node.id),
      );

      expect(nestedChildIds).toEqual([CHILD_IDS.BOTH_READABLE]);
    });
  });

  describe('write thresholds and destination checks', () => {
    it('refuses an update with only READ on the parent and allows it at READ_WRITE', async () => {
      const updateOperation = updateManyOperationFactory({
        objectMetadataSingularName: CHILD_SINGULAR,
        objectMetadataPluralName: CHILD_PLURAL,
        gqlFields: 'id',
        data: { name: 'renamed' },
        filter: { id: { eq: CHILD_IDS.ONLY_SOURCE_READABLE } },
      });

      const readOnlyResponse =
        await makeGraphqlAPIRequestWithMemberRole(updateOperation);

      expect(
        readOnlyResponse.body.data[CHILD_UPDATE_RESPONSE_KEY],
      ).toHaveLength(0);

      await recordShareService.deleteByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: sourceObjectMetadataId,
        recordIds: [SOURCE_IDS.READABLE],
      });
      await shareWithMember(
        sourceObjectMetadataId,
        SOURCE_IDS.READABLE,
        RecordShareAccessLevel.READ_WRITE,
      );

      const readWriteResponse =
        await makeGraphqlAPIRequestWithMemberRole(updateOperation);

      expect(
        readWriteResponse.body.data[CHILD_UPDATE_RESPONSE_KEY],
      ).toHaveLength(1);
    });

    it('refuses a delete below FULL on the parent', async () => {
      const deleteResponse = await makeGraphqlAPIRequestWithMemberRole(
        deleteManyOperationFactory({
          objectMetadataSingularName: CHILD_SINGULAR,
          objectMetadataPluralName: CHILD_PLURAL,
          gqlFields: 'id',
          filter: { id: { eq: CHILD_IDS.ONLY_SOURCE_READABLE } },
        }),
      );

      expect(deleteResponse.body.data[CHILD_DELETE_RESPONSE_KEY]).toHaveLength(
        0,
      );
    });

    it('refuses creating a child under a parent the caller cannot write', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        createOneOperationFactory({
          objectMetadataSingularName: CHILD_SINGULAR,
          gqlFields: 'id',
          data: { id: randomUUID(), sourceId: SOURCE_IDS.UNREADABLE },
        }),
      );

      expect(response.body.errors).toBeDefined();
    });

    it('refuses moving a child onto a parent the caller cannot write', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateManyOperationFactory({
          objectMetadataSingularName: CHILD_SINGULAR,
          objectMetadataPluralName: CHILD_PLURAL,
          gqlFields: 'id',
          data: { sourceId: SOURCE_IDS.UNREADABLE },
          filter: { id: { eq: CHILD_IDS.ONLY_SOURCE_READABLE } },
        }),
      );

      expect(response.body.errors).toBeDefined();
    });
  });
});
