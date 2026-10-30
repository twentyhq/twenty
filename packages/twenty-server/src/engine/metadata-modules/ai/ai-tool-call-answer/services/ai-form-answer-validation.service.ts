import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import {
  isAiFormInlineSelectSettings,
  type RequestFormField,
  validateAiFormAnswers,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

// Server-side validation for forms an agent asks for in chat. Workflow form
// steps keep their existing rules. Runs in the answering person's request
// context, so record checks use their permissions.
@Injectable()
export class AiFormAnswerValidationService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async validate({
    fields,
    values,
  }: {
    fields: RequestFormField[];
    values: Record<string, unknown>;
  }): Promise<string[]> {
    const shapeErrors = validateAiFormAnswers({ fields, values });

    if (shapeErrors.length > 0) {
      return shapeErrors;
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const errors: string[] = [];

      for (const field of fields) {
        const value = values[field.name];

        if (!isDefined(value)) {
          continue;
        }

        const error =
          field.type === 'RECORD'
            ? await this.validateRecordSelection(field, value)
            : this.validateMetadataSelection(field, value);

        if (isDefined(error)) {
          errors.push(error);
        }
      }

      return errors;
    });
  }

  private async validateRecordSelection(
    field: RequestFormField,
    value: unknown,
  ): Promise<string | undefined> {
    const objectName = field.settings?.objectName;
    const recordId = isPlainObject(value) ? value.id : undefined;
    const unavailable = `${field.label} must be a record you can access.`;

    if (!isString(objectName) || !isString(recordId)) {
      return unavailable;
    }

    // An inaccessible or unknown object fails the same way as a missing
    // record, so the message never confirms that a record exists.
    try {
      const record = await this.workspaceOrmManager
        .getRepositoryWithContextPermissions(objectName)
        .findOne({ where: { id: recordId }, select: { id: true } });

      return isDefined(record) ? undefined : unavailable;
    } catch {
      return unavailable;
    }
  }

  private validateMetadataSelection(
    field: RequestFormField,
    value: unknown,
  ): string | undefined {
    if (
      (field.type !== 'SELECT' && field.type !== 'MULTI_SELECT') ||
      isAiFormInlineSelectSettings(field.settings)
    ) {
      return undefined;
    }

    const selectedFieldId = field.settings?.selectedFieldId;
    const unavailable = `${field.label} must use its current options.`;

    if (!isString(selectedFieldId)) {
      return unavailable;
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: getWorkspaceContext().flatFieldMetadataMaps,
      flatEntityId: selectedFieldId,
    });
    const allowedValues = new Set(
      (Array.isArray(fieldMetadata?.options) ? fieldMetadata.options : []).map(
        (option: { value: string }) => option.value,
      ),
    );
    const selectedValues = Array.isArray(value) ? value : [value];

    return selectedValues.every(
      (selectedValue) =>
        isString(selectedValue) && allowedValues.has(selectedValue),
    )
      ? undefined
      : unavailable;
  }
}
