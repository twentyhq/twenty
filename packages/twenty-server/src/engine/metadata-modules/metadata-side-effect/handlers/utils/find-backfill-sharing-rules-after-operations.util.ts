import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { type UniversalFlatSharingRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-sharing-rule.type';

export type BackfillSharingRuleCandidate = Pick<
  UniversalFlatSharingRule | FlatSharingRule,
  | 'universalIdentifier'
  | 'objectMetadataUniversalIdentifier'
  | 'isActive'
  | 'deletedAt'
  | 'granteePrincipalType'
  | 'rowLevelPermissionPredicateUniversalIdentifiers'
>;

const BACKFILL_GRANTEE_PRINCIPAL_TYPES: RecordSharePrincipalType[] = [
  RecordSharePrincipalType.EVERYONE,
  RecordSharePrincipalType.ROLE,
];

// A backfill rule is an active rule without criteria granting everyone or a
// role: the only kind that keeps every record of a PRIVATE object readable
export const findBackfillSharingRulesAfterOperations = ({
  objectMetadataUniversalIdentifier,
  flatSharingRuleMaps,
  allFlatEntityOperationRecordByMetadataName,
}: {
  objectMetadataUniversalIdentifier: string;
  flatSharingRuleMaps: AllFlatEntityMaps['flatSharingRuleMaps'];
  allFlatEntityOperationRecordByMetadataName?: Partial<AllFlatEntityOperationRecordByMetadataName>;
}): BackfillSharingRuleCandidate[] => {
  const sharingRuleOperations =
    allFlatEntityOperationRecordByMetadataName?.sharingRule;
  const predicateOperations =
    allFlatEntityOperationRecordByMetadataName?.rowLevelPermissionPredicate;

  const deletedSharingRuleUniversalIdentifiers = new Set(
    Object.keys(sharingRuleOperations?.flatEntityToDelete ?? {}),
  );
  const deletedPredicateUniversalIdentifiers = new Set(
    Object.keys(predicateOperations?.flatEntityToDelete ?? {}),
  );
  const sharingRuleUniversalIdentifiersGainingCriteria = new Set(
    Object.values(predicateOperations?.flatEntityToCreate ?? {})
      .filter(isDefined)
      .map((predicate) => predicate.sharingRuleUniversalIdentifier)
      .filter(isDefined),
  );

  const existingSharingRules = Object.values(
    flatSharingRuleMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatSharingRule) =>
        flatSharingRule.objectMetadataUniversalIdentifier ===
          objectMetadataUniversalIdentifier &&
        !deletedSharingRuleUniversalIdentifiers.has(
          flatSharingRule.universalIdentifier,
        ),
    )
    .map(
      (flatSharingRule): BackfillSharingRuleCandidate =>
        sharingRuleOperations?.flatEntityToUpdate?.[
          flatSharingRule.universalIdentifier
        ] ?? flatSharingRule,
    );

  const createdSharingRules = Object.values(
    sharingRuleOperations?.flatEntityToCreate ?? {},
  )
    .filter(isDefined)
    .filter(
      (universalFlatSharingRule) =>
        universalFlatSharingRule.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier,
    );

  return [...existingSharingRules, ...createdSharingRules].filter(
    (sharingRule) =>
      sharingRule.isActive &&
      !isDefined(sharingRule.deletedAt) &&
      BACKFILL_GRANTEE_PRINCIPAL_TYPES.includes(
        sharingRule.granteePrincipalType,
      ) &&
      !sharingRuleUniversalIdentifiersGainingCriteria.has(
        sharingRule.universalIdentifier,
      ) &&
      sharingRule.rowLevelPermissionPredicateUniversalIdentifiers.every(
        (predicateUniversalIdentifier) =>
          deletedPredicateUniversalIdentifiers.has(
            predicateUniversalIdentifier,
          ),
      ),
  );
};
