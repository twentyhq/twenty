import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  BeforeUpdateOneHook,
  UpdateOneInputType,
} from '@ptc-org/nestjs-query-graphql';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

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
  constructor(
    readonly fieldMetadataService: FieldMetadataService,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  async run(
    instance: UpdateOneInputType<T>,
    workspaceId: string,
  ): Promise<UpdateOneInputType<T>> {
    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const fieldMetadata = await this.getFieldMetadata(instance, workspaceId);

    if (!fieldMetadata.isCustom) {
      return this.handleStandardFieldUpdate(instance, fieldMetadata);
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
  ): UpdateOneInputType<T> {
    const update: StandardFieldUpdate = {};
    const allowedFields = ['isActive', 'isLabelSyncedWithName'];
    const allowedStandardOverrides = ['label', 'icon', 'description'];

    const hasDisallowedFields = Object.keys(instance.update).some(
      (key) =>
        !allowedFields.includes(key) && !allowedStandardOverrides.includes(key),
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

    if (hasDisallowedFields) {
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
    this.handleStandardOverrides(instance, fieldMetadata, update);

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
  ): void {
    const hasStandardOverrides =
      isDefined(instance.update.description) ||
      isDefined(instance.update.icon) ||
      isDefined(instance.update.label);

    if (!hasStandardOverrides) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    this.handleDescriptionOverride(instance, fieldMetadata, update);
    this.handleIconOverride(instance, fieldMetadata, update);
    this.handleLabelOverride(instance, fieldMetadata, update);
  }

  private handleDescriptionOverride(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.description)) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    if (instance.update.description === fieldMetadata.description) {
      update.standardOverrides.description = null;

      return;
    }

    update.standardOverrides.description = instance.update.description;
  }

  private handleIconOverride(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    update: StandardFieldUpdate,
  ): void {
    if (!isDefined(instance.update.icon)) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    if (instance.update.icon === fieldMetadata.icon) {
      update.standardOverrides.icon = null;

      return;
    }

    update.standardOverrides.icon = instance.update.icon;
  }

  private handleLabelOverride(
    instance: UpdateOneInputType<T>,
    fieldMetadata: FieldMetadataEntity,
    update: StandardFieldUpdate,
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

    update.standardOverrides = update.standardOverrides || {};

    if (instance.update.label === fieldMetadata.label) {
      update.standardOverrides.label = null;

      return;
    }

    update.standardOverrides.label = instance.update.label;
  }
}
