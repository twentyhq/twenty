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
      throw new BadRequestException("Standard Fields can't be updated");
    }

    this.checkIfFieldIsEditable(instance.update);

    return instance;
  }

  // This is temporary until we properly use the MigrationRunner to update column names
  private checkIfFieldIsEditable(update: UpdateFieldInput) {
    if (update.name || update.label) {
      throw new BadRequestException("Field's name and label can't be updated");
    }
  }
}
