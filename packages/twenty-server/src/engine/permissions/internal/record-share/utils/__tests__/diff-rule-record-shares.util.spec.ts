import { diffRuleRecordShares } from 'src/engine/permissions/internal/record-share/utils/diff-rule-record-shares.util';

const grant = (principalId: string) => ({
  recordId: 'record',
  principalId,
  sourceId: 'source',
});

describe('diffRuleRecordShares', () => {
  it('keeps matching grants out of both sides of the diff', () => {
    expect(
      diffRuleRecordShares({
        ruleGrants: [grant('kept')],
        existingRuleRecordShares: [{ ...grant('kept'), id: 'kept-id' }],
      }),
    ).toEqual({ obsoleteRecordShareIds: [], missingGrants: [] });
  });

  it('returns rows no rule asks for and grants no row covers', () => {
    expect(
      diffRuleRecordShares({
        ruleGrants: [grant('new')],
        existingRuleRecordShares: [{ ...grant('old'), id: 'old-id' }],
      }),
    ).toEqual({
      obsoleteRecordShareIds: ['old-id'],
      missingGrants: [grant('new')],
    });
  });

  it('treats a grant from another source as a different grant', () => {
    expect(
      diffRuleRecordShares({
        ruleGrants: [grant('role')],
        existingRuleRecordShares: [
          { ...grant('role'), sourceId: 'other-source', id: 'other-id' },
        ],
      }),
    ).toEqual({
      obsoleteRecordShareIds: ['other-id'],
      missingGrants: [grant('role')],
    });
  });
});
