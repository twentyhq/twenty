import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isTimelineActivityAction } from 'twenty-shared/timeline';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { TimelineActivityRuleExceptionCode } from 'src/engine/metadata-modules/timeline-activity-rule/timeline-activity-rule.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type UniversalFlatTimelineActivityRuleToValidate = NonNullable<
  MetadataUniversalFlatEntityMaps<'timelineActivityRule'>['byUniversalIdentifier'][string]
>;

@Injectable()
export class FlatTimelineActivityRuleValidatorService {
  private getSemanticValidationErrors({
    flatTimelineActivityRule,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }: {
    flatTimelineActivityRule: UniversalFlatTimelineActivityRuleToValidate;
    flatFieldMetadataMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityRule
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps']['flatFieldMetadataMaps'];
    flatObjectMetadataMaps: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.timelineActivityRule
    >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps']['flatObjectMetadataMaps'];
  }): FlatEntityValidationError<TimelineActivityRuleExceptionCode>[] {
    const errors: FlatEntityValidationError<TimelineActivityRuleExceptionCode>[] =
      [];

    // Phase 6 adds the read-time engine; until then only emissions are valid.
    if (flatTimelineActivityRule.resolution !== 'MATERIALIZED') {
      errors.push({
        code: TimelineActivityRuleExceptionCode.UNSUPPORTED_RESOLUTION,
        message: t`Only MATERIALIZED timeline rules are supported`,
        userFriendlyMessage: msg`Only materialized timeline rules are supported`,
      });
    }

    const invalidActions = (flatTimelineActivityRule.actions ?? []).filter(
      (action) => !isTimelineActivityAction(action),
    );

    if (invalidActions.length > 0) {
      const invalidActionsList = invalidActions.join(', ');

      errors.push({
        code: TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
        message: t`Unknown timeline rule actions: ${invalidActionsList}`,
        userFriendlyMessage: msg`Unknown timeline rule action`,
      });
    }

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatTimelineActivityRule.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      errors.push({
        code: TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object not found`,
      });
    }

    const relationFieldUniversalIdentifier =
      flatTimelineActivityRule.relationFieldMetadataUniversalIdentifier;

    if (!isDefined(relationFieldUniversalIdentifier)) {
      const hasLinkAction = (flatTimelineActivityRule.actions ?? []).some(
        (action) => action === 'linked' || action === 'unlinked',
      );

      if (hasLinkAction) {
        errors.push({
          code: TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
          message: t`A self rule cannot emit linked or unlinked entries`,
          userFriendlyMessage: msg`A self rule cannot emit linked or unlinked entries`,
        });
      }

      return errors;
    }

    const flatRelationFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: relationFieldUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatRelationFieldMetadata)) {
      errors.push({
        code: TimelineActivityRuleExceptionCode.INVALID_RELATION_FIELD,
        message: t`Relation field metadata not found`,
        userFriendlyMessage: msg`Relation field not found`,
      });

      return errors;
    }

    if (
      flatRelationFieldMetadata.objectMetadataUniversalIdentifier !==
      flatTimelineActivityRule.objectMetadataUniversalIdentifier
    ) {
      errors.push({
        code: TimelineActivityRuleExceptionCode.INVALID_RELATION_FIELD,
        message: t`Relation field must belong to the rule object`,
        userFriendlyMessage: msg`Relation field must belong to the rule object`,
      });
    }

    if (
      flatRelationFieldMetadata.type !== FieldMetadataType.RELATION &&
      flatRelationFieldMetadata.type !== FieldMetadataType.MORPH_RELATION
    ) {
      errors.push({
        code: TimelineActivityRuleExceptionCode.INVALID_RELATION_FIELD,
        message: t`Timeline rules can only walk relation fields`,
        userFriendlyMessage: msg`Timeline rules can only walk relation fields`,
      });

      return errors;
    }

    const relationSettings = flatRelationFieldMetadata.universalSettings as {
      relationType?: RelationType;
      junctionTargetFieldUniversalIdentifier?: string | null;
    } | null;

    const isManyToOne =
      relationSettings?.relationType === RelationType.MANY_TO_ONE;
    const isJunctionOneToMany =
      relationSettings?.relationType === RelationType.ONE_TO_MANY &&
      isDefined(relationSettings?.junctionTargetFieldUniversalIdentifier);

    // The validity matrix: a plain one-to-many emission has unbounded fan-out
    // and is only expressible as an INHERITED rule, which phase 6 unlocks.
    if (!isManyToOne && !isJunctionOneToMany) {
      errors.push({
        code: TimelineActivityRuleExceptionCode.INVALID_RELATION_FIELD,
        message: t`An emission rule needs a many-to-one relation or a junction relation`,
        userFriendlyMessage: msg`An emission rule needs a many-to-one relation or a junction relation`,
      });
    }

    return errors;
  }

  private getNaturalKeyDuplicateErrors({
    flatTimelineActivityRule,
    optimisticFlatTimelineActivityRuleMaps,
  }: {
    flatTimelineActivityRule: UniversalFlatTimelineActivityRuleToValidate;
    optimisticFlatTimelineActivityRuleMaps: MetadataUniversalFlatEntityMaps<'timelineActivityRule'>;
  }): FlatEntityValidationError<TimelineActivityRuleExceptionCode>[] {
    const duplicateExists = Object.values(
      optimisticFlatTimelineActivityRuleMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .some(
        (existingRule) =>
          existingRule.universalIdentifier !==
            flatTimelineActivityRule.universalIdentifier &&
          existingRule.objectMetadataUniversalIdentifier ===
            flatTimelineActivityRule.objectMetadataUniversalIdentifier &&
          (existingRule.relationFieldMetadataUniversalIdentifier ?? null) ===
            (flatTimelineActivityRule.relationFieldMetadataUniversalIdentifier ??
              null) &&
          existingRule.resolution === flatTimelineActivityRule.resolution,
      );

    if (duplicateExists) {
      return [
        {
          code: TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
          message: t`A timeline rule already exists for this object and relation`,
          userFriendlyMessage: msg`A timeline rule already exists for this object and relation`,
        },
      ];
    }

    return [];
  }

  public validateFlatTimelineActivityRuleCreation({
    flatEntityToValidate: flatTimelineActivityRuleToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityRuleMaps: optimisticFlatTimelineActivityRuleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.timelineActivityRule
  >): FailedFlatEntityValidation<'timelineActivityRule', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier:
          flatTimelineActivityRuleToValidate.universalIdentifier,
        objectMetadataUniversalIdentifier:
          flatTimelineActivityRuleToValidate.objectMetadataUniversalIdentifier,
      },
      metadataName: 'timelineActivityRule',
      type: 'create',
    });

    const existingFlatTimelineActivityRule =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatTimelineActivityRuleToValidate.universalIdentifier,
        flatEntityMaps: optimisticFlatTimelineActivityRuleMaps,
      });

    if (isDefined(existingFlatTimelineActivityRule)) {
      validationResult.errors.push({
        code: TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
        message: t`Timeline rule already exists`,
        userFriendlyMessage: msg`Timeline rule already exists`,
      });
    }

    validationResult.errors.push(
      ...this.getNaturalKeyDuplicateErrors({
        flatTimelineActivityRule: flatTimelineActivityRuleToValidate,
        optimisticFlatTimelineActivityRuleMaps,
      }),
      ...this.getSemanticValidationErrors({
        flatTimelineActivityRule: flatTimelineActivityRuleToValidate,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatTimelineActivityRuleUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityRuleMaps: optimisticFlatTimelineActivityRuleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.timelineActivityRule
  >): FailedFlatEntityValidation<'timelineActivityRule', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'timelineActivityRule',
      type: 'update',
    });

    const existingFlatTimelineActivityRule =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier,
        flatEntityMaps: optimisticFlatTimelineActivityRuleMaps,
      });

    if (!isDefined(existingFlatTimelineActivityRule)) {
      validationResult.errors.push({
        code: TimelineActivityRuleExceptionCode.TIMELINE_ACTIVITY_RULE_NOT_FOUND,
        message: t`Timeline rule not found`,
        userFriendlyMessage: msg`Timeline rule not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...this.getSemanticValidationErrors({
        flatTimelineActivityRule: {
          ...existingFlatTimelineActivityRule,
          ...flatEntityUpdate,
        },
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatTimelineActivityRuleDeletion({
    flatEntityToValidate: flatTimelineActivityRuleToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityRuleMaps: optimisticFlatTimelineActivityRuleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.timelineActivityRule
  >): FailedFlatEntityValidation<'timelineActivityRule', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier:
          flatTimelineActivityRuleToValidate.universalIdentifier,
      },
      metadataName: 'timelineActivityRule',
      type: 'delete',
    });

    const existingFlatTimelineActivityRule =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatTimelineActivityRuleToValidate.universalIdentifier,
        flatEntityMaps: optimisticFlatTimelineActivityRuleMaps,
      });

    if (!isDefined(existingFlatTimelineActivityRule)) {
      validationResult.errors.push({
        code: TimelineActivityRuleExceptionCode.TIMELINE_ACTIVITY_RULE_NOT_FOUND,
        message: t`Timeline rule not found`,
        userFriendlyMessage: msg`Timeline rule not found`,
      });
    }

    return validationResult;
  }
}
