import { v5 } from 'uuid';

import { type ChannelRecordRuleUniversalIdentifierSeed } from 'src/engine/permissions/channel-visibility/constants/channel-record-rule-universal-identifier-seeds.constant';

export const getChannelRecordRuleUniversalIdentifier = ({
  ruleUniversalIdentifierSeed,
  roleUniversalIdentifier,
  kind,
}: {
  ruleUniversalIdentifierSeed: ChannelRecordRuleUniversalIdentifierSeed;
  roleUniversalIdentifier: string;
  kind: 'rule' | 'group' | 'predicate';
}): string =>
  v5(`${ruleUniversalIdentifierSeed}:${kind}`, roleUniversalIdentifier);
