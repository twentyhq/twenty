import { Injectable } from '@nestjs/common';

import { i18n } from '@lingui/core';
import {
  BeforeUpdateOneHook,
  UpdateOneInputType,
} from '@ptc-org/nestjs-query-graphql';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import {
  ForbiddenError,
  ValidationError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';

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
      throw new ForbiddenError('Could not retrieve workspace ID');
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
      throw new ValidationError('Field does not exist');
    }

    return fieldMetadata;
  }

  private handleStandardFieldUpdate(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    locale?: keyof typeof APP_LOCALES,
  ): UpdateOneInputType<T> {
    const update: StandardFieldUpdate = {};
    const updatableFields = [
      'isActive',
      'isLabelSyncedWithName',
      'options',
      'settings',
      'defaultValue',
    ];
    const overridableFields = ['label', 'icon', 'description'];

    const nonUpdatableFields = Object.keys(instance.update).filter(
      (key) =>
        !updatableFields.includes(key) && !overridableFields.includes(key),
    );

    if (nonUpdatableFields.length > 0) {
      throw new ValidationError(
        `Only isActive, isLabelSyncedWithName, label, icon, description and defaultValue fields can be updated for standard fields. Invalid fields: ${nonUpdatableFields.join(', ')}`,
      );
    }

    // Preserve existing overrides
    update.standardOverrides = fieldMetadata.standardOverrides
      ? { ...fieldMetadata.standardOverrides }
      : {};

    this.handleActiveField(instance, update);
    this.handleLabelSyncedWithNameField(instance, update);
    this.handleStandardOverrides(instance, fieldMetadata, update, locale);
    this.handleOptionsField(instance, update);
    this.handleSettingsField(instance, update);
    this.handleDefaultValueField(instance, update);

    return {
      id: instance.id,
      update: update as T,
    };
  }

  private handleDefaultValueField(
    instance: UpdateOneInputType<T>,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.defaultValue)) {
      return;
    }

    update.defaultValue = instance.update.defaultValue;
  }

  private handleOptionsField(
    instance: UpdateOneInputType<T>,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.options)) {
      return;
    }

    update.options = instance.update.options;
  }

  private handleSettingsField(
    instance: UpdateOneInputType<T>,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.settings)) {
      return;
    }

    update.settings = instance.update.settings;
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

  private resetOverrideIfMatchesOriginal({
    update,
    overrideKey,
    newValue,
    originalValue,
    locale,
  }: {
    update: StandardFieldUpdate;
    overrideKey: 'label' | 'description' | 'icon';
    newValue: string;
    originalValue: string | null;
    locale?: keyof typeof APP_LOCALES | undefined;
  }): boolean {
    // Handle localized overrides
    if (locale && locale !== SOURCE_LOCALE) {
      const wasOverrideReset = this.resetLocalizedOverride(
        update,
        overrideKey,
        newValue,
        originalValue,
        locale,
      );

      return wasOverrideReset;
    }

    // Handle default language overrides
    const wasOverrideReset = this.resetDefaultOverride(
      update,
      overrideKey,
      newValue,
      originalValue,
    );

    return wasOverrideReset;
  }

  private resetLocalizedOverride(
    update: StandardFieldUpdate,
    overrideKey: 'label' | 'description' | 'icon',
    newValue: string,
    originalValue: string | null,
    locale: keyof typeof APP_LOCALES,
  ): boolean {
    const messageId = generateMessageId(originalValue ?? '');
    const translatedMessage = i18n._(messageId);

    if (newValue !== translatedMessage) {
      return false;
    }

    // Initialize the translations structure if needed
    update.standardOverrides = update.standardOverrides || {};
    update.standardOverrides.translations =
      update.standardOverrides.translations || {};
    update.standardOverrides.translations[locale] =
      update.standardOverrides.translations[locale] || {};

    // Reset the override by setting it to null
    const localeTranslations = update.standardOverrides.translations[locale];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (localeTranslations as Record<string, any>)[overrideKey] = null;

    return true;
  }

  private resetDefaultOverride(
    update: StandardFieldUpdate,
    overrideKey: 'label' | 'description' | 'icon',
    newValue: string,
    originalValue: string | null,
  ): boolean {
    if (newValue !== originalValue) {
      return false;
    }

    update.standardOverrides = update.standardOverrides || {};
    update.standardOverrides[overrideKey] = null;

    return true;
  }

  private setOverrideValue(
    update: StandardFieldUpdate,
    overrideKey: 'label' | 'description' | 'icon',
    value: string,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    update.standardOverrides = update.standardOverrides || {};

    const shouldSetLocalizedOverride =
      locale && locale !== SOURCE_LOCALE && overrideKey !== 'icon';

    if (!shouldSetLocalizedOverride) {
      update.standardOverrides[overrideKey] = value;

      return;
    }

    this.setLocalizedOverrideValue(update, overrideKey, value, locale);
  }

  private setLocalizedOverrideValue(
    update: StandardFieldUpdate,
    overrideKey: 'label' | 'description' | 'icon',
    value: string,
    locale: keyof typeof APP_LOCALES,
  ): void {
    update.standardOverrides = update.standardOverrides || {};
    update.standardOverrides.translations =
      update.standardOverrides.translations || {};
    update.standardOverrides.translations[locale] =
      update.standardOverrides.translations[locale] || {};

    const localeTranslations = update.standardOverrides.translations[locale];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (localeTranslations as Record<string, any>)[overrideKey] = value;
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
      this.resetOverrideIfMatchesOriginal({
        update,
        overrideKey: 'description',
        newValue: instance.update.description,
        originalValue: fieldMetadata.description,
        locale,
      })
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
      this.resetOverrideIfMatchesOriginal({
        update,
        overrideKey: 'icon',
        newValue: instance.update.icon,
        originalValue: fieldMetadata.icon,
        locale: undefined,
      })
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
    if (!isDefined(instance.update.label)) {
      return;
    }

    if (
      this.resetOverrideIfMatchesOriginal({
        update,
        overrideKey: 'label',
        newValue: instance.update.label,
        originalValue: fieldMetadata.label,
        locale,
      })
    ) {
      return;
    }

    this.setOverrideValue(update, 'label', instance.update.label, locale);
  }
}
