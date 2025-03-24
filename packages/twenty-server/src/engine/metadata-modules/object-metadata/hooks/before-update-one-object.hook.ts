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
import { Equal, In, Repository } from 'typeorm';

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
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  // TODO: this logic could be moved to a policy guard
  async run(
    instance: UpdateOneInputType<T>,
    workspaceId: string,
  ): Promise<UpdateOneInputType<T>> {
    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const objectMetadata = await this.getObjectMetadata(instance, workspaceId);

    if (!objectMetadata.isCustom) {
      return this.handleStandardObjectUpdate(instance, objectMetadata);
    }

    await this.validateIdentifierFields(instance, workspaceId);

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
  ): UpdateOneInputType<T> {
    const update: StandardObjectUpdate = {};
    const allowedFields = ['isActive', 'isLabelSyncedWithName'];
    const allowedStandardOverrides = [
      'labelSingular',
      'labelPlural',
      'icon',
      'description',
    ];

    // Check if any field is not allowed
    const disallowedFields = Object.keys(instance.update).filter(
      (key) =>
        !allowedFields.includes(key) && !allowedStandardOverrides.includes(key),
    );

    const hasDisallowedFields = disallowedFields.length > 0;

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

    if (hasDisallowedFields) {
      throw new BadRequestException(
        `Only isActive, isLabelSyncedWithName, labelSingular, labelPlural, icon and description fields can be updated for standard objects. Disallowed fields: ${disallowedFields.join(', ')}`,
      );
    }

    //  preserve existing overrides
    update.standardOverrides = objectMetadata.standardOverrides
      ? { ...objectMetadata.standardOverrides }
      : {};

    this.handleActiveField(instance, update);
    this.handleLabelSyncedWithNameField(instance, update);
    this.handleStandardOverrides(instance, objectMetadata, update);

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

    this.handleDescriptionOverride(instance, objectMetadata, update);
    this.handleIconOverride(instance, objectMetadata, update);
    this.handleLabelOverrides(instance, objectMetadata, update);
  }

  private handleDescriptionOverride(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
  ): void {
    if (!isDefined(instance.update.description)) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    if (instance.update.description === objectMetadata.description) {
      update.standardOverrides.description = null;

      return;
    }

    update.standardOverrides.description = instance.update.description;
  }

  private handleIconOverride(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
  ): void {
    if (!isDefined(instance.update.icon)) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    if (instance.update.icon === objectMetadata.icon) {
      update.standardOverrides.icon = null;

      return;
    }

    update.standardOverrides.icon = instance.update.icon;
  }

  private handleLabelOverrides(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
  ): void {
    // Skip label updates if labels are synced with name or will be synced
    if (
      objectMetadata.isLabelSyncedWithName ||
      update.isLabelSyncedWithName === true
    ) {
      return;
    }

    this.handleLabelSingularOverride(instance, objectMetadata, update);
    this.handleLabelPluralOverride(instance, objectMetadata, update);
  }

  private handleLabelSingularOverride(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
  ): void {
    if (!isDefined(instance.update.labelSingular)) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    if (instance.update.labelSingular === objectMetadata.labelSingular) {
      update.standardOverrides.labelSingular = null;

      return;
    }

    update.standardOverrides.labelSingular = instance.update.labelSingular;
  }

  private handleLabelPluralOverride(
    instance: UpdateOneInputType<T>,
    objectMetadata: ObjectMetadataEntity,
    update: StandardObjectUpdate,
  ): void {
    if (!isDefined(instance.update.labelPlural)) {
      return;
    }

    update.standardOverrides = update.standardOverrides || {};

    if (instance.update.labelPlural === objectMetadata.labelPlural) {
      update.standardOverrides.labelPlural = null;

      return;
    }

    update.standardOverrides.labelPlural = instance.update.labelPlural;
  }

  private async validateIdentifierFields(
    instance: UpdateOneInputType<T>,
    workspaceId: string,
  ): Promise<void> {
    if (
      !instance.update.labelIdentifierFieldMetadataId &&
      !instance.update.imageIdentifierFieldMetadataId
    ) {
      return;
    }

    const fields = await this.fieldMetadataRepository.findBy({
      workspaceId: Equal(workspaceId),
      objectMetadataId: Equal(instance.id.toString()),
      id: In(
        [
          instance.update.labelIdentifierFieldMetadataId,
          instance.update.imageIdentifierFieldMetadataId,
        ].filter((id) => id !== null),
      ),
    });

    const fieldIds = fields.map((field) => field.id);

    this.validateLabelIdentifier(instance, fieldIds);
    this.validateImageIdentifier(instance, fieldIds);
  }

  private validateLabelIdentifier(
    instance: UpdateOneInputType<T>,
    fieldIds: string[],
  ): void {
    if (
      instance.update.labelIdentifierFieldMetadataId &&
      !fieldIds.includes(instance.update.labelIdentifierFieldMetadataId)
    ) {
      throw new BadRequestException('This label identifier does not exist');
    }
  }

  private validateImageIdentifier(
    instance: UpdateOneInputType<T>,
    fieldIds: string[],
  ): void {
    if (
      instance.update.imageIdentifierFieldMetadataId &&
      !fieldIds.includes(instance.update.imageIdentifierFieldMetadataId)
    ) {
      throw new BadRequestException('This image identifier does not exist');
    }
  }
}
