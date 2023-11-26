import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  BeforeUpdateOneHook,
  UpdateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { UpdateFieldInput } from 'src/metadata/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';

@Injectable()
export class BeforeUpdateOneField<T extends UpdateFieldInput>
  implements BeforeUpdateOneHook<T, any>
{
  constructor(readonly fieldMetadataService: FieldMetadataService) {}

  // TODO: this logic could be moved to a policy guard
  async run(
    instance: UpdateOneInputType<T>,
    context: any,
  ): Promise<UpdateOneInputType<T>> {
    const workspaceId = context?.req?.user?.workspace?.id;

    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const fieldMetadata =
      await this.fieldMetadataService.findOneWithinWorkspace(
        instance.id.toString(),
        workspaceId,
      );

    if (!fieldMetadata) {
      throw new BadRequestException('Field does not exist');
    }

    if (!fieldMetadata.isCustom) {
      if (
        Object.keys(instance.update).length === 1 &&
        instance.update.hasOwnProperty('isActive') &&
        instance.update.isActive !== undefined
      ) {
        return {
          id: instance.id,
          update: {
            isActive: instance.update.isActive,
          } as T,
        };
      }

      throw new BadRequestException(
        'Only isActive field can be updated for standard fields',
      );
    }

    this.checkIfFieldIsEditable(instance.update, fieldMetadata);

    return instance;
  }

  // This is temporary until we properly use the MigrationRunner to update column names
  private checkIfFieldIsEditable(
    update: UpdateFieldInput,
    fieldMetadata: FieldMetadataEntity,
  ) {
    if (update.name && update.name !== fieldMetadata.name) {
      throw new BadRequestException(
        "Field's name can't be updated. Please create a new field instead",
      );
    }

    if (update.label && update.label !== fieldMetadata.label) {
      throw new BadRequestException(
        "Field's label can't be updated. Please create a new field instead",
      );
    }
  }
}
