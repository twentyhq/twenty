import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const RULE_GQL_FIELDS = `
  id
  objectMetadataId
  relationFieldMetadataId
  resolution
  actions
  triggerFieldMetadataIds
  isActive
  isStandard
  isOverridden
`;

const FIND_TIMELINE_ACTIVITY_RULES = gql`
  query TimelineActivityRules {
    timelineActivityRules {
      ${RULE_GQL_FIELDS}
    }
  }
`;

const UPSERT_TIMELINE_ACTIVITY_RULE = gql`
  mutation UpsertTimelineActivityRule($input: UpsertTimelineActivityRuleInput!) {
    upsertTimelineActivityRule(input: $input) {
      ${RULE_GQL_FIELDS}
    }
  }
`;

const RESET_TIMELINE_ACTIVITY_RULE = gql`
  mutation ResetTimelineActivityRule($input: ResetTimelineActivityRuleInput!) {
    resetTimelineActivityRule(input: $input) {
      ${RULE_GQL_FIELDS}
    }
  }
`;

type TimelineActivityRuleResponse = {
  id: string | null;
  objectMetadataId: string;
  relationFieldMetadataId: string | null;
  resolution: string;
  actions: string[];
  triggerFieldMetadataIds: string[] | null;
  isActive: boolean;
  isStandard: boolean;
  isOverridden: boolean;
};

// Random per run so the suite stays re-runnable without a database reset.
const COMPANY_A_ID = v4();
const COMPANY_B_ID = v4();
const NOTE_A_ID = v4();
const NOTE_B_ID = v4();
const NOTE_TARGET_A_ID = v4();
const NOTE_TARGET_B_ID = v4();

const findEffectiveRules = async (): Promise<
  TimelineActivityRuleResponse[]
> => {
  const response = await makeMetadataAPIRequest({
    query: FIND_TIMELINE_ACTIVITY_RULES,
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivityRules;
};

const findNoteRule = async (): Promise<TimelineActivityRuleResponse> => {
  const { objects } = await findManyObjectMetadata({
    input: {
      filter: {},
      paging: { first: 1000 },
    },
    gqlFields: 'id nameSingular',
  });

  const noteObjectMetadata = objects.find(
    (objectMetadata) => objectMetadata.nameSingular === 'note',
  );

  expect(noteObjectMetadata).toBeDefined();

  const rules = await findEffectiveRules();
  const noteRule = rules.find(
    (rule) =>
      isDefined(rule.relationFieldMetadataId) &&
      rule.objectMetadataId === noteObjectMetadata?.id,
  );

  expect(noteRule).toBeDefined();

  return noteRule as TimelineActivityRuleResponse;
};

const createRecord = async ({
  objectMetadataSingularName,
  data,
}: {
  objectMetadataSingularName: string;
  data: object;
}): Promise<void> => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const countLinkedEntriesOnCompany = async (
  companyId: string,
): Promise<number> => {
  await waitForAllJobsToFinish();

  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: 'id name',
      filter: {
        targetCompanyId: { eq: companyId },
        name: { eq: 'linked-note.created' },
      },
      first: 10,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivities.edges.length;
};

describe('timeline activity rule metadata API (integration)', () => {
  // A previous partial run may have left overrides behind: put every standard
  // junction rule back to its definition before asserting defaults.
  beforeAll(async () => {
    const rules = await findEffectiveRules();

    for (const rule of rules) {
      if (isDefined(rule.relationFieldMetadataId) && rule.isStandard) {
        const response = await makeMetadataAPIRequest({
          query: RESET_TIMELINE_ACTIVITY_RULE,
          variables: {
            input: {
              objectMetadataId: rule.objectMetadataId,
              relationFieldMetadataId: rule.relationFieldMetadataId,
            },
          },
        });

        expect(response.body.errors).toBeUndefined();
      }
    }
  });

  it('should return the standard junction rules and derived self rules', async () => {
    const rules = await findEffectiveRules();

    const standardJunctionRules = rules.filter(
      (rule) => isDefined(rule.relationFieldMetadataId) && rule.isStandard,
    );

    expect(standardJunctionRules).toHaveLength(2);

    for (const rule of standardJunctionRules) {
      expect(rule.id).not.toBeNull();
      expect(rule.resolution).toBe('MATERIALIZED');
      expect(rule.isActive).toBe(true);
      expect(rule.isOverridden).toBe(false);
      expect([...rule.actions].sort()).toEqual([
        'linked',
        'unlinked',
        'updated',
      ]);
      expect(rule.triggerFieldMetadataIds).toHaveLength(1);
    }

    const derivedSelfRules = rules.filter(
      (rule) => rule.relationFieldMetadataId === null && rule.id === null,
    );

    expect(derivedSelfRules.length).toBeGreaterThan(0);
    expect(
      derivedSelfRules.every(
        (rule) =>
          rule.isActive &&
          !rule.isOverridden &&
          [...rule.actions].sort().join(',') ===
            'created,deleted,restored,updated',
      ),
    ).toBe(true);
  });

  it('should stop and resume the note fan out when the rule is disabled then reset', async () => {
    const noteRule = await findNoteRule();

    const disableResponse = await makeMetadataAPIRequest({
      query: UPSERT_TIMELINE_ACTIVITY_RULE,
      variables: {
        input: {
          objectMetadataId: noteRule.objectMetadataId,
          relationFieldMetadataId: noteRule.relationFieldMetadataId,
          isActive: false,
        },
      },
    });

    expect(disableResponse.body.errors).toBeUndefined();
    expect(disableResponse.body.data.upsertTimelineActivityRule.isActive).toBe(
      false,
    );
    expect(
      disableResponse.body.data.upsertTimelineActivityRule.isOverridden,
    ).toBe(true);

    await createRecord({
      objectMetadataSingularName: 'company',
      data: { id: COMPANY_A_ID, name: 'Rule disabled host' },
    });
    await createRecord({
      objectMetadataSingularName: 'note',
      data: { id: NOTE_A_ID, title: 'Note while disabled' },
    });
    await createRecord({
      objectMetadataSingularName: 'noteTarget',
      data: {
        id: NOTE_TARGET_A_ID,
        noteId: NOTE_A_ID,
        targetCompanyId: COMPANY_A_ID,
      },
    });

    expect(await countLinkedEntriesOnCompany(COMPANY_A_ID)).toBe(0);

    const resetResponse = await makeMetadataAPIRequest({
      query: RESET_TIMELINE_ACTIVITY_RULE,
      variables: {
        input: {
          objectMetadataId: noteRule.objectMetadataId,
          relationFieldMetadataId: noteRule.relationFieldMetadataId,
        },
      },
    });

    expect(resetResponse.body.errors).toBeUndefined();
    expect(resetResponse.body.data.resetTimelineActivityRule.isActive).toBe(
      true,
    );
    expect(resetResponse.body.data.resetTimelineActivityRule.isOverridden).toBe(
      false,
    );

    await createRecord({
      objectMetadataSingularName: 'company',
      data: { id: COMPANY_B_ID, name: 'Rule enabled host' },
    });
    await createRecord({
      objectMetadataSingularName: 'note',
      data: { id: NOTE_B_ID, title: 'Note while enabled' },
    });
    await createRecord({
      objectMetadataSingularName: 'noteTarget',
      data: {
        id: NOTE_TARGET_B_ID,
        noteId: NOTE_B_ID,
        targetCompanyId: COMPANY_B_ID,
      },
    });

    expect(await countLinkedEntriesOnCompany(COMPANY_B_ID)).toBe(1);
  });

  it('should materialize a self rule override and delete it on reset', async () => {
    const rules = await findEffectiveRules();
    const derivedSelfRule = rules.find(
      (rule) => rule.relationFieldMetadataId === null && rule.id === null,
    );

    expect(derivedSelfRule).toBeDefined();

    const objectMetadataId = (derivedSelfRule as TimelineActivityRuleResponse)
      .objectMetadataId;

    const upsertResponse = await makeMetadataAPIRequest({
      query: UPSERT_TIMELINE_ACTIVITY_RULE,
      variables: {
        input: { objectMetadataId, isActive: false },
      },
    });

    expect(upsertResponse.body.errors).toBeUndefined();
    expect(
      upsertResponse.body.data.upsertTimelineActivityRule.id,
    ).not.toBeNull();
    expect(upsertResponse.body.data.upsertTimelineActivityRule.isActive).toBe(
      false,
    );

    const resetResponse = await makeMetadataAPIRequest({
      query: RESET_TIMELINE_ACTIVITY_RULE,
      variables: { input: { objectMetadataId } },
    });

    expect(resetResponse.body.errors).toBeUndefined();
    expect(resetResponse.body.data.resetTimelineActivityRule.id).toBeNull();
    expect(resetResponse.body.data.resetTimelineActivityRule.isActive).toBe(
      true,
    );
  });

  it('should reject an unknown action', async () => {
    const noteRule = await findNoteRule();

    const response = await makeMetadataAPIRequest({
      query: UPSERT_TIMELINE_ACTIVITY_RULE,
      variables: {
        input: {
          objectMetadataId: noteRule.objectMetadataId,
          relationFieldMetadataId: noteRule.relationFieldMetadataId,
          actions: ['linked', 'exploded'],
        },
      },
    });

    expect(response.body.errors).toBeDefined();
  });
});
