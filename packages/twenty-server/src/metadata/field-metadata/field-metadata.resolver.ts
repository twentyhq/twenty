import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CreateOneFieldMetadataInput } from 'src/metadata/field-metadata/dtos/create-field.input';
import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';
import { UpdateOneFieldMetadataInput } from 'src/metadata/field-metadata/dtos/update-field.input';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => FieldMetadataDTO)
export class FieldMetadataResolver {
  constructor(private readonly fieldMetadataService: FieldMetadataService) {}

  @Mutation(() => FieldMetadataDTO)
  createOneField(
    @Args('input') input: CreateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.fieldMetadataService.createOne({
      ...input.field,
      workspaceId,
    });
  }

  @Mutation(() => FieldMetadataDTO)
  updateOneField(
    @Args('input') input: UpdateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.fieldMetadataService.updateOne(input.id, {
      ...input.update,
      workspaceId,
    });
  }
}
