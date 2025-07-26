import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { i18n } from '@lingui/core';
import {
  BeforeUpdateOneHook,
  UpdateOneInputType,
} from '@ptc-org/nestjs-query-graphql';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectStandardOverridesDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

interface StandardObjectUpdate extends Partial<UpdateObjectPayload> {
  standardOverrides?: ObjectStandardOverridesDTO;
}

@Injectable()
export class BeforeUpdateOneObject<T extends UpdateObjectPayload>
  implements BeforeUpdateOneHook<T>
{
  constructor(
    readonly objectMetadataService: ObjectMetadataService,
    // TODO: Should not use the repository here
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  // TODO: this logic could be moved to a policy guard
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

    const objectMetadata = await this.getObjectMetadata(instance, workspaceId);

    if (!objectMetadata.isCustom) {
      return this.handleStandardObjectUpdate(instance, objectMetadata, locale);
    }

    return instance;
  }

  private async getObjectMetadata(
    instance: UpdateOneInputType<T>,
    workspaceId: string,
  ) {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: instance.id.toString(),
        },
      });

    if (!objectMetadata) {
      throw new BadRequestException('Object does not exist');
    }

    return objectMetadata;
  }

  private handleStandardObjectUpdate(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    locale: keyof typeof APP_LOCALES | undefined,
  ): UpdateOneInputType<T> {
    const update: StandardObjectUpdate = {};
    const updatableFields = ['isActive', 'isLabelSyncedWithName'];
    const overridableFields = [
      'labelSingular',
      'labelPlural',
      'icon',
      'description',
    ];

    const nonUpdatableFields = Object.keys(instance.update).filter(
      (key) =>
        !updatableFields.includes(key) && !overridableFields.includes(key),
    );

    const isUpdatingLabelsWhenSynced =
      (instance.update.labelSingular || instance.update.labelPlural) &&
      objectMetadata.isLabelSyncedWithName &&
      instance.update.isLabelSyncedWithName !== false &&
      (instance.update.labelSingular !== objectMetadata.labelSingular ||
        instance.update.labelPlural !== objectMetadata.labelPlural);

    if (isUpdatingLabelsWhenSynced) {
      throw new BadRequestException(
        'Cannot update labels when they are synced with name',
      );
    }

    if (nonUpdatableFields.length > 0) {
      throw new BadRequestException(
        `Only isActive, isLabelSyncedWithName, labelSingular, labelPlural, icon and description fields can be updated for standard objects. Disallowed fields: ${nonUpdatableFields.join(', ')}`,
      );
    }

    //  preserve existing overrides
    update.standardOverrides = objectMetadata.standardOverrides
      ? { ...objectMetadata.standardOverrides }
      : {};

    this.handleActiveField(instance, update);
    this.handleLabelSyncedWithNameField(instance, update);
    this.handleStandardOverrides(instance, objectMetadata, update, locale);

    return {
      id: instance.id,
      update: update as T,
    };
  }

  private handleActiveField(
    instance: UpdateOneInputType<T>,
    update: StandardObjectUpdate,
  ): void {
    if (!isDefined(instance.update.isActive)) {
      return;
    }

    update.isActive = instance.update.isActive;
  }

  private handleLabelSyncedWithNameField(
    instance: UpdateOneInputType<T>,
    update: StandardObjectUpdate,
  ): void {
    if (!isDefined(instance.update.isLabelSyncedWithName)) {
      return;
    }

    update.isLabelSyncedWithName = instance.update.isLabelSyncedWithName;

    if (instance.update.isLabelSyncedWithName === false) {
      return;
    }

    // If setting isLabelSyncedWithName to true, clear label overrides
    update.standardOverrides = update.standardOverrides || {};
    update.standardOverrides.labelSingular = null;
    update.standardOverrides.labelPlural = null;
  }

  private handleStandardOverrides(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
    locale: keyof typeof APP_LOCALES | undefined,
  ): void {
    const hasStandardOverrides =
      isDefined(instance.update.description) ||
      isDefined(instance.update.icon) ||
      isDefined(instance.update.labelSingular) ||
      isDefined(instance.update.labelPlural);

    if (!hasStandardOverrides) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    this.handleIconOverride(instance, objectMetadata, update);
    this.handleDescriptionOverride(instance, objectMetadata, update, locale);
    this.handleLabelOverrides(instance, objectMetadata, update, locale);
  }

  private resetOverrideIfMatchesOriginal({
    update,
    overrideKey,
    newValue,
    originalValue,
    locale,
  }: {
    update: StandardObjectUpdate;
    overrideKey: 'labelSingular' | 'labelPlural' | 'description' | 'icon';
    newValue: string;
    originalValue: string | null;
    locale?: keyof typeof APP_LOCALES | undefined;
  }): boolean {
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

    const wasOverrideReset = this.resetDefaultOverride(
      update,
      overrideKey,
      newValue,
      originalValue,
    );

    return wasOverrideReset;
  }

  private resetLocalizedOverride(
    update: StandardObjectUpdate,
    overrideKey: 'labelSingular' | 'labelPlural' | 'description' | 'icon',
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
    update: StandardObjectUpdate,
    overrideKey: 'labelSingular' | 'labelPlural' | 'description' | 'icon',
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
    update: StandardObjectUpdate,
    overrideKey: 'labelSingular' | 'labelPlural' | 'description' | 'icon',
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
    update: StandardObjectUpdate,
    overrideKey: 'labelSingular' | 'labelPlural' | 'description' | 'icon',
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
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
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
        originalValue: objectMetadata.description,
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
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
  ): void {
    if (!isDefined(instance.update.icon)) {
      return;
    }

    if (
      this.resetOverrideIfMatchesOriginal({
        update,
        overrideKey: 'icon',
        newValue: instance.update.icon,
        originalValue: objectMetadata.icon,
        locale: undefined,
      })
    ) {
      return;
    }

    this.setOverrideValue(update, 'icon', instance.update.icon);
  }

  private handleLabelOverrides(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    // Skip label updates if labels are synced with name or will be synced
    if (
      objectMetadata.isLabelSyncedWithName ||
      update.isLabelSyncedWithName === true
    ) {
      return;
    }

    this.handleLabelSingularOverride(instance, objectMetadata, update, locale);
    this.handleLabelPluralOverride(instance, objectMetadata, update, locale);
  }

  private handleLabelSingularOverride(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    if (!isDefined(instance.update.labelSingular)) {
      return;
    }

    if (
      this.resetOverrideIfMatchesOriginal({
        update,
        overrideKey: 'labelSingular',
        newValue: instance.update.labelSingular,
        originalValue: objectMetadata.labelSingular,
        locale,
      })
    ) {
      return;
    }

    this.setOverrideValue(
      update,
      'labelSingular',
      instance.update.labelSingular,
      locale,
    );
  }

  private handleLabelPluralOverride(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
    locale?: keyof typeof APP_LOCALES,
  ): void {
    if (!isDefined(instance.update.labelPlural)) {
      return;
    }

    if (
      this.resetOverrideIfMatchesOriginal({
        update,
        overrideKey: 'labelPlural',
        newValue: instance.update.labelPlural,
        originalValue: objectMetadata.labelPlural,
        locale,
      })
    ) {
      return;
    }

    this.setOverrideValue(
      update,
      'labelPlural',
      instance.update.labelPlural,
      locale,
    );
  }
}
