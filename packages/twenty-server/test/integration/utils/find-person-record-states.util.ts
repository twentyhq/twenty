import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { isDefined } from 'twenty-shared/utils';

export type PersonRecordState = {
  status: 'active' | 'softDeleted' | 'absent';
  jobTitle?: string;
};

export const findPersonRecordStates = async (
  ids: string[],
): Promise<PersonRecordState[]> => {
  const people = await findRecordNodesByFilter<{
    id: string;
    jobTitle: string;
    deletedAt: string | null;
  }>('person', 'people', 'id jobTitle deletedAt', {
    and: [
      { id: { in: ids } },
      {
        or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
      },
    ],
  });

  return ids.map((id) => {
    const person = people.find((candidate) => candidate.id === id);

    if (!isDefined(person)) {
      return { status: 'absent' };
    }

    return {
      status: isDefined(person.deletedAt) ? 'softDeleted' : 'active',
      jobTitle: person.jobTitle,
    };
  });
};
