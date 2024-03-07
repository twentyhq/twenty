import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CreateOneFieldMetadataInput } from 'src/metadata/field-metadata/dtos/create-field.input';
import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';
import { FieldRelationInfoDTO } from 'src/metadata/field-metadata/dtos/field-relation-info.dto';
import { UpdateOneFieldMetadataInput } from 'src/metadata/field-metadata/dtos/update-field.input';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import { reverseRelationType } from 'src/metadata/field-metadata/utils/reverse-relation-type';

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

  // On a déjà RelationMetadata dans from / to field metadata
  // On peut retourner direction avec deduceRelationDirection
  // Voir d'autres exemples de ResolveField
  @ResolveField(() => FieldRelationInfoDTO, { nullable: true })
  async relationInfo(@Parent() fieldMetadata: FieldMetadataDTO) {
    console.log({
      fieldMetadata,
      _this: this,
    });

    if (fieldMetadata.type !== FieldMetadataType.RELATION) {
      return null;
    }

    const foundFieldMetadata = await this.fieldMetadataService.findOneOrFail(
      fieldMetadata.id,
      {
        relations: ['toRelationMetadata', 'fromRelationMetadata'],
      },
    );

    console.log({ foundFieldMetadataItem: foundFieldMetadata });

    if (!foundFieldMetadata) {
      throw new Error('FieldMetadata not found');
    }

    // TODO: implement MANY_TO_MANY and ONE_TO_ONE
    if (foundFieldMetadata.toRelationMetadata) {
      return {
        sourceObjectMetadataItem:
          foundFieldMetadata.toRelationMetadata.fromObjectMetadata,
        sourceFieldMetadataItem:
          foundFieldMetadata.toRelationMetadata.fromFieldMetadata,
        targetObjectMetadataItem:
          foundFieldMetadata.toRelationMetadata.toObjectMetadata,
        targetFieldMetadataItem:
          foundFieldMetadata.toRelationMetadata.toFieldMetadata,
        relationType: foundFieldMetadata.toRelationMetadata.relationType,
        originalRelationMetadata: foundFieldMetadata.toRelationMetadata,
      };
    } else if (foundFieldMetadata.fromRelationMetadata) {
      return {
        sourceObjectMetadataItem:
          foundFieldMetadata.fromRelationMetadata.toObjectMetadata,
        sourceFieldMetadataItem:
          foundFieldMetadata.fromRelationMetadata.toFieldMetadata,
        targetObjectMetadataItem:
          foundFieldMetadata.fromRelationMetadata.fromObjectMetadata,
        targetFieldMetadataItem:
          foundFieldMetadata.fromRelationMetadata.fromFieldMetadata,
        relationType: reverseRelationType(
          foundFieldMetadata.fromRelationMetadata.relationType,
        ),
        originalRelationMetadata: foundFieldMetadata.fromRelationMetadata,
      };
    }

    return null;
  }
}
