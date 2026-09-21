import { MESSAGE_LIST_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-list-data-seeds.constant';
import { PERSON_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

type MessageListMemberDataSeed = {
  id: string;
  listId: string;
  personId: string;
};

export const MESSAGE_LIST_MEMBER_DATA_SEED_COLUMNS: (keyof MessageListMemberDataSeed)[] =
  ['id', 'listId', 'personId'];

const buildMembersByJobTitle = ({
  listId,
  listIndex,
  jobTitlePattern,
}: {
  listId: string;
  listIndex: number;
  jobTitlePattern: RegExp;
}): MessageListMemberDataSeed[] =>
  PERSON_DATA_SEEDS.filter((person) =>
    jobTitlePattern.test(person.jobTitle),
  ).map((person, index) => ({
    id: `20202020-${(index + 1).toString(16).padStart(4, '0')}-4c69-8${listIndex}01-123456789abc`,
    listId,
    personId: person.id,
  }));

export const MESSAGE_LIST_MEMBER_DATA_SEEDS: MessageListMemberDataSeed[] = [
  ...buildMembersByJobTitle({
    listId: MESSAGE_LIST_DATA_SEED_IDS.DEVELOPER_PROGRAM,
    listIndex: 0,
    jobTitlePattern: /developer|engineer|programmer|designer|software/i,
  }),
  ...buildMembersByJobTitle({
    listId: MESSAGE_LIST_DATA_SEED_IDS.FOUNDERS,
    listIndex: 1,
    jobTitlePattern: /chief|founder|entrepreneur|managing director/i,
  }),
];

export const countMessageListMembers = (listId: string): number =>
  MESSAGE_LIST_MEMBER_DATA_SEEDS.filter((member) => member.listId === listId)
    .length;
