import { type RuleRecordShareGrant } from 'src/engine/permissions/record-share/types/rule-record-share-grant.type';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';

const buildRuleGrantKey = ({
  recordId,
  principalId,
  sourceId,
}: RuleRecordShareGrant): string => `${recordId}:${principalId}:${sourceId}`;

export const diffRuleRecordShares = ({
  ruleGrants,
  existingRuleRecordShares,
}: {
  ruleGrants: RuleRecordShareGrant[];
  existingRuleRecordShares: Pick<
    RecordShare,
    'id' | 'recordId' | 'principalId' | 'sourceId'
  >[];
}): {
  obsoleteRecordShareIds: string[];
  missingGrants: RuleRecordShareGrant[];
} => {
  const ruleGrantKeys = new Set(ruleGrants.map(buildRuleGrantKey));
  const existingKeys = new Set(existingRuleRecordShares.map(buildRuleGrantKey));

  return {
    obsoleteRecordShareIds: existingRuleRecordShares
      .filter(
        (recordShare) => !ruleGrantKeys.has(buildRuleGrantKey(recordShare)),
      )
      .map(({ id }) => id),
    missingGrants: ruleGrants.filter(
      (ruleGrant) => !existingKeys.has(buildRuleGrantKey(ruleGrant)),
    ),
  };
};
