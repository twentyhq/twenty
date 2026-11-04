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

  it('reads labels holding colons, balanced brackets or nothing, whatever the uuid version', () => {
    const unversionedId = '20202020-0000-0000-0000-000000000004';

    expect(
      extractRecordReferenceIds({
        text: `[[record:workspaceMember:${JONY_ID}:Jony: Design [EMEA]]], [[record:workspaceMember:${TIM_ID}:]] and [[record:workspaceMember:${unversionedId}:Phil]]`,
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([JONY_ID, TIM_ID, unversionedId]);
  });

  it.each([
    ['an unclosed reference', `[[record:workspaceMember:${JONY_ID}:Jony`],
    ['a reference without a label', `[[record:workspaceMember:${JONY_ID}]]`],
    ['an unprefixed reference', `[[workspaceMember:${JONY_ID}:Jony]]`],
    [
      'an uppercase id',
      '[[record:workspaceMember:2020ABCD-0000-4000-8000-000000000001:Jony]]',
    ],
    [
      'a line break in the label',
      `[[record:workspaceMember:${JONY_ID}:Jo\nny]]`,
    ],
    [
      'a carriage return in the label',
      `[[record:workspaceMember:${JONY_ID}:Jo\rny]]`,
    ],
    ['an unbalanced bracket', `[[record:workspaceMember:${JONY_ID}:Jo]ny]]`],
  ])('ignores %s', (_, text) => {
    expect(
      extractRecordReferenceIds({
        text,
        objectNameSingular: 'workspaceMember',
      }),
    ).toEqual([]);
  });
});
