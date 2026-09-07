import { isDefined } from 'twenty-shared/utils';

import { type CalendarEventParticipantDataSeed } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-event-participant-data-seeds.constant';
import { MESSAGE_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-data-seeds.constant';
import { type MessageParticipantDataSeed } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-participant-data-seeds.constant';
import { OPPORTUNITY_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

// Timeline reads resolve through the target junctions once
// IS_MESSAGE_CALENDAR_TARGET_READ_ENABLED is on, and reconciliation only runs
// on sync paths, so seeded workspaces must seed the rows reconciliation would
// have produced: per parent, a Person target for each participant person, a
// Company target for each of their companies, and an Opportunity target for
// each opportunity they are the point of contact of.

type TargetColumnsDataSeed = {
  targetPersonId: string | null;
  targetCompanyId: string | null;
  targetOpportunityId: string | null;
};

export type MessageThreadTargetDataSeed = TargetColumnsDataSeed & {
  id: string;
  messageThreadId: string;
  isAutomaticallyAssigned: boolean;
  isManuallyAssigned: boolean;
};

export type CalendarEventTargetDataSeed = TargetColumnsDataSeed & {
  id: string;
  calendarEventId: string;
  isAutomaticallyAssigned: boolean;
  isManuallyAssigned: boolean;
};

export const MESSAGE_THREAD_TARGET_DATA_SEED_COLUMNS: (keyof MessageThreadTargetDataSeed)[] =
  [
    'id',
    'messageThreadId',
    'targetPersonId',
    'targetCompanyId',
    'targetOpportunityId',
    'isAutomaticallyAssigned',
    'isManuallyAssigned',
  ];

export const CALENDAR_EVENT_TARGET_DATA_SEED_COLUMNS: (keyof CalendarEventTargetDataSeed)[] =
  [
    'id',
    'calendarEventId',
    'targetPersonId',
    'targetCompanyId',
    'targetOpportunityId',
    'isAutomaticallyAssigned',
    'isManuallyAssigned',
  ];

const COMPANY_ID_BY_PERSON_ID = new Map(
  PERSON_DATA_SEEDS.map((person) => [person.id, person.companyId]),
);

const BUILD_OPPORTUNITY_IDS_BY_PERSON_ID = (): Map<string, string[]> => {
  const OPPORTUNITY_IDS_BY_PERSON_ID = new Map<string, string[]>();

  for (const OPPORTUNITY of OPPORTUNITY_DATA_SEEDS) {
    const OPPORTUNITY_IDS =
      OPPORTUNITY_IDS_BY_PERSON_ID.get(OPPORTUNITY.pointOfContactId) ?? [];

    OPPORTUNITY_IDS.push(OPPORTUNITY.id);
    OPPORTUNITY_IDS_BY_PERSON_ID.set(
      OPPORTUNITY.pointOfContactId,
      OPPORTUNITY_IDS,
    );
  }

  return OPPORTUNITY_IDS_BY_PERSON_ID;
};

const OPPORTUNITY_IDS_BY_PERSON_ID = BUILD_OPPORTUNITY_IDS_BY_PERSON_ID();

const BUILD_TARGET_COLUMN_SETS = (
  personIds: Set<string>,
): TargetColumnsDataSeed[] => {
  const TARGET_COLUMN_SETS: TargetColumnsDataSeed[] = [];
  const COMPANY_IDS = new Set<string>();
  const OPPORTUNITY_IDS = new Set<string>();

  for (const PERSON_ID of personIds) {
    TARGET_COLUMN_SETS.push({
      targetPersonId: PERSON_ID,
      targetCompanyId: null,
      targetOpportunityId: null,
    });

    const COMPANY_ID = COMPANY_ID_BY_PERSON_ID.get(PERSON_ID);

    if (isDefined(COMPANY_ID)) {
      COMPANY_IDS.add(COMPANY_ID);
    }

    for (const OPPORTUNITY_ID of OPPORTUNITY_IDS_BY_PERSON_ID.get(PERSON_ID) ??
      []) {
      OPPORTUNITY_IDS.add(OPPORTUNITY_ID);
    }
  }

  for (const COMPANY_ID of COMPANY_IDS) {
    TARGET_COLUMN_SETS.push({
      targetPersonId: null,
      targetCompanyId: COMPANY_ID,
      targetOpportunityId: null,
    });
  }

  for (const OPPORTUNITY_ID of OPPORTUNITY_IDS) {
    TARGET_COLUMN_SETS.push({
      targetPersonId: null,
      targetCompanyId: null,
      targetOpportunityId: OPPORTUNITY_ID,
    });
  }

  return TARGET_COLUMN_SETS;
};

const GROUP_PERSON_IDS_BY_PARENT_ID = <Participant>({
  participants,
  getParentId,
  getPersonId,
}: {
  participants: Participant[];
  getParentId: (participant: Participant) => string | undefined;
  getPersonId: (participant: Participant) => string | null;
}): Map<string, Set<string>> => {
  const PERSON_IDS_BY_PARENT_ID = new Map<string, Set<string>>();

  for (const PARTICIPANT of participants) {
    const PARENT_ID = getParentId(PARTICIPANT);
    const PERSON_ID = getPersonId(PARTICIPANT);

    if (!isDefined(PARENT_ID) || !isDefined(PERSON_ID)) {
      continue;
    }

    const PERSON_IDS = PERSON_IDS_BY_PARENT_ID.get(PARENT_ID) ?? new Set();

    PERSON_IDS.add(PERSON_ID);
    PERSON_IDS_BY_PARENT_ID.set(PARENT_ID, PERSON_IDS);
  }

  return PERSON_IDS_BY_PARENT_ID;
};

const BUILD_TARGET_SEEDS = <TargetSeed>({
  personIdsByParentId,
  createTargetSeed,
}: {
  personIdsByParentId: Map<string, Set<string>>;
  createTargetSeed: (args: {
    index: number;
    parentId: string;
    targetColumns: TargetColumnsDataSeed;
  }) => TargetSeed;
}): TargetSeed[] => {
  const TARGET_SEEDS: TargetSeed[] = [];
  let TARGET_INDEX = 1;

  for (const [PARENT_ID, PERSON_IDS] of personIdsByParentId) {
    for (const TARGET_COLUMNS of BUILD_TARGET_COLUMN_SETS(PERSON_IDS)) {
      TARGET_SEEDS.push(
        createTargetSeed({
          index: TARGET_INDEX,
          parentId: PARENT_ID,
          targetColumns: TARGET_COLUMNS,
        }),
      );
      TARGET_INDEX++;
    }
  }

  return TARGET_SEEDS;
};

const BUILD_TARGET_SEED_ID = ({
  index,
  nodeSuffix,
}: {
  index: number;
  nodeSuffix: string;
}): string => {
  const HEX_INDEX = index.toString(16).padStart(4, '0');

  return `20202020-${HEX_INDEX}-4e7c-8001-${nodeSuffix}`;
};

const MESSAGE_THREAD_ID_BY_MESSAGE_ID = new Map(
  MESSAGE_DATA_SEEDS.map((message) => [message.id, message.messageThreadId]),
);

export const getMessageThreadTargetDataSeeds = (
  messageParticipantSeeds: MessageParticipantDataSeed[],
): MessageThreadTargetDataSeed[] =>
  BUILD_TARGET_SEEDS({
    personIdsByParentId: GROUP_PERSON_IDS_BY_PARENT_ID({
      participants: messageParticipantSeeds,
      getParentId: (participant) =>
        MESSAGE_THREAD_ID_BY_MESSAGE_ID.get(participant.messageId),
      getPersonId: (participant) => participant.personId,
    }),
    createTargetSeed: ({ index, parentId, targetColumns }) => ({
      id: BUILD_TARGET_SEED_ID({ index, nodeSuffix: 'cafe56789abc' }),
      messageThreadId: parentId,
      ...targetColumns,
      isAutomaticallyAssigned: true,
      isManuallyAssigned: false,
    }),
  });

export const getCalendarEventTargetDataSeeds = (
  calendarEventParticipantSeeds: CalendarEventParticipantDataSeed[],
): CalendarEventTargetDataSeed[] =>
  BUILD_TARGET_SEEDS({
    personIdsByParentId: GROUP_PERSON_IDS_BY_PARENT_ID({
      participants: calendarEventParticipantSeeds,
      getParentId: (participant) => participant.calendarEventId,
      getPersonId: (participant) => participant.personId,
    }),
    createTargetSeed: ({ index, parentId, targetColumns }) => ({
      id: BUILD_TARGET_SEED_ID({ index, nodeSuffix: 'face56789abc' }),
      calendarEventId: parentId,
      ...targetColumns,
      isAutomaticallyAssigned: true,
      isManuallyAssigned: false,
    }),
  });
