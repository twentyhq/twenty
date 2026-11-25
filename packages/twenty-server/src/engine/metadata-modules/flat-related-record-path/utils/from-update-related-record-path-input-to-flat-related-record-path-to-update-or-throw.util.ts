/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { FLAT_RELATED_RECORD_PATH_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-related-record-path/constants/flat-related-record-path-editable-properties.constant';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';
import { type UpdateRelatedRecordPathInput } from 'src/engine/metadata-modules/related-record-path/dtos/update-related-record-path.input';
import {
  RelatedRecordPathException,
  RelatedRecordPathExceptionCode,
} from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateRelatedRecordPathInputToFlatRelatedRecordPathToUpdateOrThrow =
  ({
    updateRelatedRecordPathInput: { isInherent, isActive },
    existingFlatRelatedRecordPath,
    callerApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    updateRelatedRecordPathInput: Pick<
      UpdateRelatedRecordPathInput,
      'isInherent' | 'isActive'
    >;
    existingFlatRelatedRecordPath: FlatRelatedRecordPath | undefined;
    callerApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): FlatRelatedRecordPath => {
    if (!isDefined(existingFlatRelatedRecordPath)) {
      throw new RelatedRecordPathException(
        'Related record path not found',
        RelatedRecordPathExceptionCode.RELATED_RECORD_PATH_NOT_FOUND,
      );
    }

    const shouldOverride = isCallerOverridingEntity({
      callerApplicationUniversalIdentifier,
      entityApplicationUniversalIdentifier:
        existingFlatRelatedRecordPath.applicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
      isSystemSideEffect: false,
    });

    const { overrides, updatedEditableProperties } =
      sanitizeOverridableEntityInput({
        metadataName: 'relatedRecordPath',
        existingFlatEntity: existingFlatRelatedRecordPath,
        updatedEditableProperties: {
          ...(isDefined(isInherent) ? { isInherent } : {}),
          ...(isDefined(isActive) ? { isActive } : {}),
        },
        shouldOverride,
        callerApplicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier,
      });

    return {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatRelatedRecordPath,
        properties: [...FLAT_RELATED_RECORD_PATH_EDITABLE_PROPERTIES],
        update: updatedEditableProperties,
      }),
      overrides,
      updatedAt: new Date().toISOString(),
    };
  };
