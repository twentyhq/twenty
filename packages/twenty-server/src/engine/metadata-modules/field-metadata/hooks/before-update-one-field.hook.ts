import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { i18n } from '@lingui/core';
import {
  BeforeUpdateOneHook,
  UpdateOneInputType,
} from '@ptc-org/nestjs-query-graphql';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';

interface StandardFieldUpdate extends Partial<UpdateFieldInput> {
  standardOverrides?: FieldStandardOverridesDTO;
}

@Injectable()
export class BeforeUpdateOneField<T extends UpdateFieldInput>
  implements BeforeUpdateOneHook<T>
{
  constructor(readonly fieldMetadataService: FieldMetadataService) {}

  async run(
    instance: UpdateOneInputType<T>,
    {
      workspaceId,
      locale,
    }: {
      workspaceId: string;
      locale: keyof typeof APP_LOCALES | undefined;
    },
  ): Promise<UpdateOneInputType<T>> {
    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const fieldMetadata = await this.getFieldMetadata(instance, workspaceId);

    if (!fieldMetadata.isCustom) {
      return this.handleStandardFieldUpdate(instance, fieldMetadata, locale);
    }

    return instance;
  }

  private async getFieldMetadata(
    instance: UpdateOneInputType<T>,
    workspaceId: string,
  ) {
    const fieldMetadata =
      await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: instance.id.toString(),
        },
      });

    if (!fieldMetadata) {
      throw new BadRequestException('Field does not exist');
    }

    return fieldMetadata;
  }

  private handleStandardFieldUpdate(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    locale?: keyof typeof APP_LOCALES,
  ): UpdateOneInputType<T> {
    const update: StandardFieldUpdate = {};
    const updatableFields = ['isActive', 'isLabelSyncedWithName'];
    const overridableFields = ['label', 'icon', 'description'];

    const hasNonUpdatableFields = Object.keys(instance.update).some(
      (key) =>
        !updatableFields.includes(key) && !overridableFields.includes(key),
    );

    const isUpdatingLabelWhenSynced =
      instance.update.label &&
      fieldMetadata.isLabelSyncedWithName &&
      instance.update.isLabelSyncedWithName !== false &&
      instance.update.label !== fieldMetadata.label;

    if (isUpdatingLabelWhenSynced) {
      throw new BadRequestException(
        'Cannot update label when it is synced with name',
      );
    }

    if (hasNonUpdatableFields) {
      throw new BadRequestException(
        'Only isActive, isLabelSyncedWithName, label, icon and description fields can be updated for standard fields',
      );
    }

    // Preserve existing overrides
    update.standardOverrides = fieldMetadata.standardOverrides
      ? { ...fieldMetadata.standardOverrides }
      : {};

    this.handleActiveField(instance, update);
    this.handleLabelSyncedWithNameField(instance, update);
    this.handleStandardOverrides(instance, fieldMetadata, update, locale);

    return {
      id: instance.id,
      update: update as T,
    };
  }

  private handleActiveField(
    instance: UpdateOneInputType<T>,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.isActive)) {
      return;
    }

    update.isActive = instance.update.isActive;
  }

  private handleLabelSyncedWithNameField(
    instance: UpdateOneInputType<T>,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.isLabelSyncedWithName)) {
      return;
    }

    update.isLabelSyncedWithName = instance.update.isLabelSyncedWithName;

    if (instance.update.isLabelSyncedWithName === false) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};
    update.standardOverrides.label = null;
  }

  private handleStandardOverrides(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    update: StandardFieldUpdate,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    const hasStandardOverrides =
      isDefined(instance.update.description) ||
      isDefined(instance.update.icon) ||
      isDefined(instance.update.label);

    if (!hasStandardOverrides) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    this.handleDescriptionOverride(instance, fieldMetadata, update, locale);
    this.handleIconOverride(instance, fieldMetadata, update);
    this.handleLabelOverride(instance, fieldMetadata, update, locale);
  }

  private resetOverrideIfMatchesOriginal<
    K extends keyof FieldStandardOverridesDTO,
  >(
    update: StandardFieldUpdate,
    overrideKey: K,
    newValue: string,
    originalValue: string,
    locale?: keyof typeof APP_LOCALES | undefined,
  ): boolean {
    if (locale && locale !== SOURCE_LOCALE) {
      const messageId = generateMessageId(originalValue ?? '');
      const translatedMessage = i18n._(messageId);

      if (newValue === translatedMessage) {
        update.standardOverrides = update.standardOverrides || {};
        update.standardOverrides[overrideKey] = null;

        return true;
      }

      return false;
    } else {
      if (newValue === originalValue) {
        update.standardOverrides = update.standardOverrides || {};
        update.standardOverrides[overrideKey] = null;

        return true;
      }

      return false;
    }
  }

  private setOverrideValue<K extends keyof FieldStandardOverridesDTO>(
    update: StandardFieldUpdate,
    overrideKey: 'label' | 'description' | 'icon',
    value: any,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    update.standardOverrides = update.standardOverrides || {};

    if (locale && locale !== SOURCE_LOCALE && overrideKey !== 'icon') {
      update.standardOverrides.translations =
        update.standardOverrides.translations || {};
      update.standardOverrides.translations[locale] =
        update.standardOverrides.translations[locale] || {};

      const localeTranslations = update.standardOverrides.translations[locale];

      (localeTranslations as Record<string, any>)[overrideKey] = value;
    } else {
      update.standardOverrides[overrideKey] = value;
    }
  }

  private handleDescriptionOverride(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    update: StandardFieldUpdate,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    if (!isDefined(instance.update.description)) {
      return;
    }

    if (
      this.resetOverrideIfMatchesOriginal(
        update,
        'description',
        instance.update.description,
        fieldMetadata.description,
        locale,
      )
    ) {
      return;
    }

    this.setOverrideValue(
      update,
      'description',
      instance.update.description,
      locale,
    );
  }

  private handleIconOverride(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.icon)) {
      return;
    }

    if (
      this.resetOverrideIfMatchesOriginal(
        update,
        'icon',
        instance.update.icon,
        fieldMetadata.icon,
      )
    ) {
      return;
    }

    this.setOverrideValue(update, 'icon', instance.update.icon);
  }

  private handleLabelOverride(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    update: StandardFieldUpdate,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    if (
      fieldMetadata.isLabelSyncedWithName ||
      update.isLabelSyncedWithName === true
    ) {
      return;
    }

    if (!isDefined(instance.update.label)) {
      return;
    }

    if (
      this.resetOverrideIfMatchesOriginal(
        update,
        'label',
        instance.update.label,
        fieldMetadata.label,
        locale,
      )
    ) {
      return;
    }

    this.setOverrideValue(update, 'label', instance.update.label, locale);
  }
}
