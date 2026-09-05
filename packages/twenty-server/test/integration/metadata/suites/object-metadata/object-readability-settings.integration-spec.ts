import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { deleteSharingRule } from 'test/integration/metadata/suites/sharing-rule/utils/delete-sharing-rule.util';
import { findSharingRules } from 'test/integration/metadata/suites/sharing-rule/utils/find-sharing-rules.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  FeatureFlagKey,
  FieldMetadataType,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  RecalculateSharingRuleRecordSharesJob,
  type RecalculateSharingRuleRecordSharesJobData,
} from 'src/engine/record-share/jobs/recalculate-sharing-rule-record-shares.job';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OBJECT_SINGULAR = 'sharingSettingsListing';
const OBJECT_PLURAL = 'sharingSettingsListings';
const RECORD_IDS = [randomUUID(), randomUUID()];

const READABILITY_GQL_FIELDS = 'id readability ownerFieldMetadataId';

const findManyOperation = findManyOperationFactory({
  objectMetadataSingularName: OBJECT_SINGULAR,
  objectMetadataPluralName: OBJECT_PLURAL,
  gqlFields: 'id',
  filter: { id: { in: RECORD_IDS } },
});

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

const readRecordIds = (response: {
  body: { data: Record<string, { edges: { node: { id: string } }[] }> };
}) => response.body.data[OBJECT_PLURAL].edges.map(({ node }) => node.id).sort();

const findStandardObject = async (nameSingular: string) => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: { filter: {}, paging: { first: 200 } },
    gqlFields: `${READABILITY_GQL_FIELDS} nameSingular`,
  });

  const object = objects.find(
    (objectMetadata) => objectMetadata.nameSingular === nameSingular,
  );

  jestExpectToBeDefined(object);

  return object;
};

describe('Object readability settings', () => {
  let objectMetadataId: string;
  let ownerFieldMetadataId: string;
  let memberRoleId: string;
  let backfillSharingRuleId: string | undefined;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Sharing Settings Listing',
        labelPlural: 'Sharing Settings Listings',
        icon: 'IconLock',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;

    const workspaceMemberObjectMetadata =
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'workspaceMember',
        },
      });

    const { data: ownerFieldData } = await createOneFieldMetadata({
      input: {
        name: 'owner',
        label: 'Owner',
        type: FieldMetadataType.RELATION,
        objectMetadataId,
        isLabelSyncedWithName: false,
        relationCreationPayload: {
          targetObjectMetadataId: workspaceMemberObjectMetadata.id,
          targetFieldLabel: 'Owned Sharing Settings Listings',
          targetFieldIcon: 'IconLock',
          type: RelationType.MANY_TO_ONE,
        },
      },
    });

    ownerFieldMetadataId = ownerFieldData.createOneField.id;

    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    for (const id of RECORD_IDS) {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id',
          data: { id, name: `Listing ${id}` },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);

    if (isDefined(backfillSharingRuleId)) {
      await deleteSharingRule({ input: { id: backfillSharingRuleId } });
    }

    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_SINGULAR,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: RECORD_IDS } },
      }),
    );
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('refuses to make an object PRIVATE without a backfill sharing rule', async () => {
    const { errors } = await updateOneObjectMetadata({
      expectToFail: true,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { readability: MetadataReadability.PRIVATE },
      },
    });

    expect(errors).toBeDefined();
    expect(JSON.stringify(errors)).toContain('sharing rule');

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: { id: { eq: objectMetadataId } }, paging: { first: 1 } },
      gqlFields: READABILITY_GQL_FIELDS,
    });

    expect(objects[0].readability).toBe(MetadataReadability.OPEN);
  });

  it.each([MetadataReadability.SYSTEM, MetadataReadability.INHERITED])(
    'refuses the %s readability level, which only an application can set',
    async (readability) => {
      const { errors } = await updateOneObjectMetadata({
        expectToFail: true,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { readability },
        },
      });

      expect(errors).toBeDefined();
    },
  );

  it('makes the object PRIVATE with a role backfill rule created in the same migration', async () => {
    const { data, errors } = await updateOneObjectMetadata({
      expectToFail: false,
      gqlFields: READABILITY_GQL_FIELDS,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: {
          readability: MetadataReadability.PRIVATE,
          backfillSharingRule: {
            granteePrincipalType: RecordSharePrincipalType.ROLE,
            granteeRoleId: memberRoleId,
            accessLevel: RecordShareAccessLevel.READ,
          },
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneObject.readability).toBe(MetadataReadability.PRIVATE);

    const { data: sharingRulesData } = await findSharingRules({
      input: { objectMetadataId },
    });

    expect(sharingRulesData.sharingRules).toHaveLength(1);
    expect(sharingRulesData.sharingRules[0]).toMatchObject({
      name: 'Member',
      granteePrincipalType: RecordSharePrincipalType.ROLE,
      granteeRoleId: memberRoleId,
      accessLevel: RecordShareAccessLevel.READ,
      isActive: true,
      rowLevelPermissionPredicates: [],
    });

    backfillSharingRuleId = sharingRulesData.sharingRules[0].id;
  });

  it('lets members holding the role read the records once the rule is materialized, and nobody else', async () => {
    jestExpectToBeDefined(backfillSharingRuleId);

    await enqueueJobAndDrain<RecalculateSharingRuleRecordSharesJobData>(
      MessageQueue.recordShareQueue,
      RecalculateSharingRuleRecordSharesJob.name,
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sharingRuleIds: [backfillSharingRuleId],
      },
    );
    await setRecordSharingEnabled(true);

    const memberResponse =
      await makeGraphqlAPIRequestWithMemberRole(findManyOperation);

    expect(memberResponse.body.errors).toBeUndefined();
    expect(readRecordIds(memberResponse)).toEqual([...RECORD_IDS].sort());

    const adminResponse = await makeGraphqlAPIRequest(findManyOperation);

    expect(adminResponse.body.errors).toBeUndefined();
    expect(readRecordIds(adminResponse)).toEqual([]);

    await setRecordSharingEnabled(false);
  });

  it('sets and clears the owner field through updateOneObject', async () => {
    const { data, errors } = await updateOneObjectMetadata({
      expectToFail: false,
      gqlFields: READABILITY_GQL_FIELDS,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { ownerFieldMetadataId },
      },
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneObject.ownerFieldMetadataId).toBe(
      ownerFieldMetadataId,
    );

    const { data: clearedData } = await updateOneObjectMetadata({
      expectToFail: false,
      gqlFields: READABILITY_GQL_FIELDS,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { ownerFieldMetadataId: null },
      },
    });

    expect(clearedData.updateOneObject.ownerFieldMetadataId).toBeNull();
  });

  describe('standard object', () => {
    let companyObjectMetadataId: string;
    let companySharingRuleIdsBefore: string[];

    const findNewCompanySharingRules = async () =>
      (
        await findSharingRules({
          input: { objectMetadataId: companyObjectMetadataId },
        })
      ).data.sharingRules.filter(
        (sharingRule) => !companySharingRuleIdsBefore.includes(sharingRule.id),
      );

    const findCompanyOverrides = async () =>
      (
        await getCoreRepository<ObjectMetadataEntity>(
          ObjectMetadataEntity,
        ).findOneOrFail({ where: { id: companyObjectMetadataId } })
      ).overrides;

    beforeAll(async () => {
      companyObjectMetadataId = (await findStandardObject('company')).id;
      companySharingRuleIdsBefore = [];
      companySharingRuleIdsBefore = (await findNewCompanySharingRules()).map(
        (sharingRule) => sharingRule.id,
      );
    });

    afterAll(async () => {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: companyObjectMetadataId,
          updatePayload: { readability: MetadataReadability.OPEN },
        },
      });

      for (const sharingRule of await findNewCompanySharingRules()) {
        await deleteSharingRule({ input: { id: sharingRule.id } });
      }
    });

    it('stores the level in overrides and exposes the effective readability', async () => {
      const { data, errors } = await updateOneObjectMetadata({
        expectToFail: false,
        gqlFields: READABILITY_GQL_FIELDS,
        input: {
          idToUpdate: companyObjectMetadataId,
          updatePayload: {
            readability: MetadataReadability.PRIVATE,
            backfillSharingRule: {
              granteePrincipalType: RecordSharePrincipalType.EVERYONE,
              accessLevel: RecordShareAccessLevel.READ_WRITE,
            },
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.updateOneObject.readability).toBe(
        MetadataReadability.PRIVATE,
      );

      expect((await findStandardObject('company')).readability).toBe(
        MetadataReadability.PRIVATE,
      );
      expect((await findCompanyOverrides())?.readability).toBe(
        MetadataReadability.PRIVATE,
      );

      const newCompanySharingRules = await findNewCompanySharingRules();

      expect(newCompanySharingRules).toHaveLength(1);
      expect(newCompanySharingRules[0]).toMatchObject({
        name: 'Everyone',
        granteePrincipalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      });
    });

    it('drops the override when the level goes back to the standard value', async () => {
      const { data, errors } = await updateOneObjectMetadata({
        expectToFail: false,
        gqlFields: READABILITY_GQL_FIELDS,
        input: {
          idToUpdate: companyObjectMetadataId,
          updatePayload: { readability: MetadataReadability.OPEN },
        },
      });

      expect(errors).toBeUndefined();
      expect(data.updateOneObject.readability).toBe(MetadataReadability.OPEN);

      expect((await findStandardObject('company')).readability).toBe(
        MetadataReadability.OPEN,
      );
      expect((await findCompanyOverrides())?.readability).toBeUndefined();
    });
  });
});
