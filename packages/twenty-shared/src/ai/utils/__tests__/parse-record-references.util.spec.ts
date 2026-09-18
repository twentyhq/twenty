import { formatRecordReference } from '../format-record-reference.util';
import { parseRecordReferences } from '../parse-record-references.util';

const WORKSPACE_MEMBER_ID = '11111111-2222-4333-8444-555555555555';
const PERSON_ID = '66666666-7777-4888-8999-aaaaaaaaaaaa';

describe('parseRecordReferences', () => {
  it('reads back what formatRecordReference wrote', () => {
    const text = formatRecordReference({
      objectNameSingular: 'workspaceMember',
      recordId: WORKSPACE_MEMBER_ID,
      displayName: 'Tim Apple',
    });

    expect(parseRecordReferences(text)).toEqual([
      {
        objectNameSingular: 'workspaceMember',
        recordId: WORKSPACE_MEMBER_ID,
        displayName: 'Tim Apple',
      },
    ]);
  });

  it('finds every reference in a sentence and keeps their order', () => {
    const text = `Can ${formatRecordReference({
      objectNameSingular: 'workspaceMember',
      recordId: WORKSPACE_MEMBER_ID,
      displayName: 'Tim',
    })} look at ${formatRecordReference({
      objectNameSingular: 'person',
      recordId: PERSON_ID,
      displayName: 'Ada',
    })} today?`;

    expect(
      parseRecordReferences(text).map((r) => r.objectNameSingular),
    ).toEqual(['workspaceMember', 'person']);
  });

  it('keeps a display name that holds a colon', () => {
    const text = formatRecordReference({
      objectNameSingular: 'company',
      recordId: PERSON_ID,
      displayName: 'Acme: the sequel',
    });

    expect(parseRecordReferences(text)[0].displayName).toBe('Acme: the sequel');
  });

  it('returns nothing for text that only looks like a reference', () => {
    expect(parseRecordReferences('[[record:person:not-a-uuid:Ada]]')).toEqual(
      [],
    );
    expect(parseRecordReferences('no references here')).toEqual([]);
  });
});
