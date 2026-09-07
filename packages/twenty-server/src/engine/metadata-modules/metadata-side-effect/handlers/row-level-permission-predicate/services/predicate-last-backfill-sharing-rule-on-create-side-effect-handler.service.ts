import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { resolveLastBackfillSharingRuleRemoval } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/resolve-last-backfill-sharing-rule-removal.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { RowLevelPermissionPredicateExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';

@Injectable()
export class PredicateLastBackfillSharingRuleOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'rowLevelPermissionPredicate',
    name: 'predicateLastBackfillSharingRuleOnCreate',
    description:
      'A criteria added to the last active sharing rule without criteria granting EVERYONE or a ROLE on a PRIVATE object narrows the only grant keeping every record readable, so the creation is refused unless the same migration keeps another backfill rule or moves the object off PRIVATE. Noop for role predicates and on objects that had no backfill rule.',
  },
) {
  buildSideEffects({
    flatEntity: flatRowLevelPermissionPredicate,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'rowLevelPermissionPredicate'>): MetadataSideEffectResult {
    const { sharingRuleUniversalIdentifier } = flatRowLevelPermissionPredicate;

    if (!isDefined(sharingRuleUniversalIdentifier)) {
      return { status: 'noop' };
    }

    const removal = resolveLastBackfillSharingRuleRemoval({
      sharingRuleUniversalIdentifier,
      flatSharingRuleMaps: relatedFlatEntityMaps.flatSharingRuleMaps,
      flatObjectMetadataMaps: relatedFlatEntityMaps.flatObjectMetadataMaps,
      allFlatEntityOperationRecordByMetadataName,
    });

    if (!isDefined(removal)) {
      return { status: 'noop' };
    }

    const objectLabel = removal.objectLabelPlural;

    return {
      status: 'fail',
      type: 'create',
      metadataName: 'rowLevelPermissionPredicate',
      flatEntityMinimalInformation: {
        universalIdentifier:
          flatRowLevelPermissionPredicate.universalIdentifier,
      } as Partial<MetadataFlatEntity<'rowLevelPermissionPredicate'>>,
      errors: [
        {
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`Cannot add criteria to the last sharing rule keeping ${objectLabel} readable while the object is private`,
          userFriendlyMessage: msg`Add another rule for everyone or a role, or make ${objectLabel} open, before narrowing this rule`,
        },
      ],
    };
  }
}
