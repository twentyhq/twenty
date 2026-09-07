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
import { SharingRuleExceptionCode } from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';

@Injectable()
export class SharingRuleLastBackfillOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'sharingRule',
    name: 'sharingRuleLastBackfillOnUpdate',
    description:
      'Deactivating the last active sharing rule without criteria granting EVERYONE or a ROLE on a PRIVATE object would hide every record from everyone, so the update is refused unless the same migration keeps another backfill rule or moves the object off PRIVATE. Noop on objects that had no backfill rule, which are already locked out.',
  },
) {
  buildSideEffects({
    flatEntity: flatSharingRule,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'sharingRule'>): MetadataSideEffectResult {
    const removal = resolveLastBackfillSharingRuleRemoval({
      sharingRuleUniversalIdentifier: flatSharingRule.universalIdentifier,
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
      type: 'update',
      metadataName: 'sharingRule',
      flatEntityMinimalInformation: {
        universalIdentifier: flatSharingRule.universalIdentifier,
        name: flatSharingRule.name,
      } as Partial<MetadataFlatEntity<'sharingRule'>>,
      errors: [
        {
          code: SharingRuleExceptionCode.INVALID_SHARING_RULE_INPUT,
          message: t`Cannot deactivate the last sharing rule keeping ${objectLabel} readable while the object is private`,
          userFriendlyMessage: msg`Add another rule for everyone or a role, or make ${objectLabel} open, before removing this rule`,
        },
      ],
    };
  }
}
