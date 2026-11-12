import { extractRecordReferenceIds } from '@/ai/utils/extract-record-reference-ids.util';
import { formatRecordReference } from '@/ai/utils/format-record-reference.util';

const JONY_ID = '20202020-0000-4000-8000-000000000001';
const TIM_ID = '20202020-0000-4000-8000-000000000002';

describe('extractRecordReferenceIds', () => {
  it('returns each referenced record of the object once', () => {
    const jony = formatRecordReference({
      objectNameSingular: 'workspaceMember',
      recordId: JONY_ID,
      displayName: 'Jony',
    });
    const tim = formatRecordReference({
      objectNameSingular: 'workspaceMember',
      recordId: TIM_ID,
      displayName: 'Tim',
    });
    const company = formatRecordReference({
      objectNameSingular: 'company',
      recordId: '20202020-0000-4000-8000-000000000003',
      displayName: 'Acme',
    });

    expect(
      extractRecordReferenceIds({
        text: `${jony} and ${tim}, can you look at ${company}? Thanks ${jony}`,
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([JONY_ID, TIM_ID]);
  });

  it('returns nothing for text without references', () => {
    expect(
      extractRecordReferenceIds({
        text: 'Thanks!',
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([]);
  });

  it('ignores references whose id is not a uuid', () => {
    expect(
      extractRecordReferenceIds({
        text: `[[record:workspaceMember:not-a-uuid:Jony]] and [[record:workspaceMember:${TIM_ID}:Tim]]`,
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([TIM_ID]);
  });

  it('reads references written without the record prefix, as the chat renders them', () => {
    expect(
      extractRecordReferenceIds({
        text: `[[workspaceMember:${JONY_ID}:Jony]] and [[object:workspaceMember:Members]]`,
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([JONY_ID]);
  });

  it('follows the uuid rule of the chat chips, whatever the uuid version', () => {
    const unversionedId = '20202020-0000-0000-0000-000000000004';

    expect(
      extractRecordReferenceIds({
        text: `[[record:workspaceMember:${unversionedId}:Phil]] and [[record:workspaceMember:2020ABCD-0000-4000-8000-000000000001:Jony]]`,
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([unversionedId]);
  });

  it('reads a reference that follows an extra opening bracket', () => {
    expect(
      extractRecordReferenceIds({
        text: `[[[record:workspaceMember:${JONY_ID}:Jony]]`,
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([JONY_ID]);
  });

  it('reads text full of unclosed brackets in linear time', () => {
    expect(
      extractRecordReferenceIds({
        text: '[[9'.repeat(100_000),
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([]);
  });
});
