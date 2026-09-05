import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { SharingRuleEntity } from 'src/engine/metadata-modules/sharing-rule/entities/sharing-rule.entity';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  RecalculateSharingRuleRecordSharesJob,
  type RecalculateSharingRuleRecordSharesJobData,
} from 'src/engine/record-share/jobs/recalculate-sharing-rule-record-shares.job';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

const OBJECT_SINGULAR = 'sharingRuleRecalculationObject';
const OBJECT_PLURAL = 'sharingRuleRecalculationObjects';
const CRITERIA_TOKEN = 'Visible';
const SHARING_RULE_ID = randomUUID();

const RECORD_IDS = {
  VISIBLE_ONE: randomUUID(),
  VISIBLE_TWO: randomUUID(),
  HIDDEN: randomUUID(),
};

const RECORD_NAMES = {
  VISIBLE_ONE: `${CRITERIA_TOKEN} one`,
  VISIBLE_TWO: `${CRITERIA_TOKEN} two`,
  HIDDEN: 'Hidden',
};

const ALL_RECORD_IDS = Object.values(RECORD_IDS);

const findManyOperation = findManyOperationFactory({
  objectMetadataSingularName: OBJECT_SINGULAR,
  objectMetadataPluralName: OBJECT_PLURAL,
  gqlFields: 'id',
  filter: { id: { in: ALL_RECORD_IDS } },
});

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

const sortRecordShares = (recordShares: RecordShare[]) =>
  [...recordShares].sort((left, right) => left.id.localeCompare(right.id));

describe('sharing rule recalculation', () => {
  let recordShareService: RecordShareService;
  let workspaceCacheService: WorkspaceCacheService;
  let metadataEventEmitter: MetadataEventEmitter;
  let objectMetadataId: string;
  let nameFieldMetadataId: string;
  let applicationId: string;

  const manualSourceId = randomUUID();

  const findAllRecordShares = () =>
    recordShareService.findByRecordIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      recordIds: ALL_RECORD_IDS,
    });

  const findRuleRecordIds = async () =>
    (await findAllRecordShares())
      .filter((recordShare) => recordShare.sourceId === SHARING_RULE_ID)
      .map((recordShare) => recordShare.recordId)
      .sort();

  const refreshSharingRuleCache = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatSharingRuleMaps',
      'flatRowLevelPermissionPredicateMaps',
    ]);

  const runRecalculation = () =>
    enqueueJobAndDrain<RecalculateSharingRuleRecordSharesJobData>(
      MessageQueue.recordShareQueue,
      RecalculateSharingRuleRecordSharesJob.name,
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sharingRuleIds: [SHARING_RULE_ID],
      },
    );

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    metadataEventEmitter = getAppProviderByClassName<MetadataEventEmitter>(
      'MetadataEventEmitter',
    );
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Sharing Rule Recalculation Object',
        labelPlural: 'Sharing Rule Recalculation Objects',
        icon: 'IconLock',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;

    const nameFieldMetadata = await getCoreRepository<FieldMetadataEntity>(
      FieldMetadataEntity,
    ).findOneOrFail({ where: { objectMetadataId, name: 'name' } });

    nameFieldMetadataId = nameFieldMetadata.id;

    const objectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({ where: { id: objectMetadataId } });

    applicationId = objectMetadata.applicationId;

    for (const [key, id] of Object.entries(RECORD_IDS)) {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: 'id',
          data: { id, name: RECORD_NAMES[key as keyof typeof RECORD_NAMES] },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    await recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          recordId: RECORD_IDS.VISIBLE_ONE,
          objectMetadataId,
          principalId: randomUUID(),
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: manualSourceId,
        },
        {
          recordId: RECORD_IDS.VISIBLE_ONE,
          objectMetadataId,
          principalId: randomUUID(),
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: RECORD_IDS.VISIBLE_ONE,
        },
      ],
    });

    await setObjectReadability(objectMetadataId, MetadataReadability.PRIVATE);

    await getCoreRepository<SharingRuleEntity>(SharingRuleEntity).insert({
      id: SHARING_RULE_ID,
      universalIdentifier: randomUUID(),
      applicationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId,
      name: 'Everyone reads recalculation objects',
      description: null,
      granteePrincipalType: RecordSharePrincipalType.EVERYONE,
      granteeRoleId: null,
      granteePrincipalId: null,
      accessLevel: RecordShareAccessLevel.READ,
      isActive: true,
    });

    await refreshSharingRuleCache();
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);

    if (!isDefined(objectMetadataId)) {
      return;
    }

    await getCoreRepository<SharingRuleEntity>(SharingRuleEntity).delete({
      id: SHARING_RULE_ID,
    });
    await refreshSharingRuleCache();

    for (const sourceId of [
      SHARING_RULE_ID,
      manualSourceId,
      RECORD_IDS.VISIBLE_ONE,
    ]) {
      await recordShareService.deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId,
      });
    }

    await setObjectReadability(objectMetadataId, MetadataReadability.OPEN);
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_SINGULAR,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: ALL_RECORD_IDS } },
      }),
    );
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

  it('should materialize one RULE row per record for a rule without criteria', async () => {
    await runRecalculation();

    const ruleRecordShares = (await findAllRecordShares()).filter(
      (recordShare) => recordShare.rowCause === RecordShareRowCause.RULE,
    );

    expect(ruleRecordShares.map(({ recordId }) => recordId).sort()).toEqual(
      [...ALL_RECORD_IDS].sort(),
    );
    ruleRecordShares.forEach((recordShare) => {
      expect(recordShare).toMatchObject({
        objectMetadataId,
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ,
        sourceId: SHARING_RULE_ID,
      });
    });
  });

  it('should keep rows on matching records only once the rule gains criteria, leaving other sources untouched', async () => {
    await getCoreRepository<RowLevelPermissionPredicateEntity>(
      RowLevelPermissionPredicateEntity,
    ).insert({
      universalIdentifier: randomUUID(),
      applicationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sharingRuleId: SHARING_RULE_ID,
      roleId: null,
      objectMetadataId,
      fieldMetadataId: nameFieldMetadataId,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: CRITERIA_TOKEN,
    });
    await refreshSharingRuleCache();

    await runRecalculation();

    expect(await findRuleRecordIds()).toEqual(
      [RECORD_IDS.VISIBLE_ONE, RECORD_IDS.VISIBLE_TWO].sort(),
    );

    const visibleOneOtherRows = (await findAllRecordShares()).filter(
      (recordShare) =>
        recordShare.recordId === RECORD_IDS.VISIBLE_ONE &&
        recordShare.rowCause !== RecordShareRowCause.RULE,
    );

    expect(visibleOneOtherRows.map(({ rowCause }) => rowCause).sort()).toEqual([
      RecordShareRowCause.MANUAL,
      RecordShareRowCause.OWNER,
    ]);
  });

  it('should change nothing on a second run', async () => {
    const recordSharesBefore = sortRecordShares(await findAllRecordShares());

    await runRecalculation();

    expect(sortRecordShares(await findAllRecordShares())).toEqual(
      recordSharesBefore,
    );
  });

  it('should recalculate through the listener when a record criteria field changes', async () => {
    const response = await makeGraphqlAPIRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: OBJECT_SINGULAR,
        gqlFields: 'id',
        recordId: RECORD_IDS.VISIBLE_TWO,
        data: { name: 'Hidden two' },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    await expectEventually(async () => {
      expect(await findRuleRecordIds()).toEqual([RECORD_IDS.VISIBLE_ONE]);
    });
  });

  it('should let a member read exactly the records the rows grant', async () => {
    await setRecordSharingEnabled(true);

    const response =
      await makeGraphqlAPIRequestWithMemberRole(findManyOperation);

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data[OBJECT_PLURAL].edges.map(
        (edge: { node: { id: string } }) => edge.node.id,
      ),
    ).toEqual([RECORD_IDS.VISIBLE_ONE]);

    await setRecordSharingEnabled(false);
  });

  it('should drop every row of a deleted rule through the listener', async () => {
    await getCoreRepository<SharingRuleEntity>(SharingRuleEntity).delete({
      id: SHARING_RULE_ID,
    });
    await refreshSharingRuleCache();

    metadataEventEmitter.emitMetadataEvents({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      metadataEvents: [
        {
          metadataName: 'sharingRule',
          type: 'deleted',
          recordId: SHARING_RULE_ID,
          properties: { before: { id: SHARING_RULE_ID } },
        } as unknown as MetadataEvent,
      ],
    });

    await expectEventually(async () => {
      expect(await findRuleRecordIds()).toEqual([]);
    });
    expect(
      (await findAllRecordShares()).map(({ rowCause }) => rowCause).sort(),
    ).toEqual([RecordShareRowCause.MANUAL, RecordShareRowCause.OWNER]);
  });
});
