import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CreateOneFieldMetadataInput } from 'src/metadata/field-metadata/dtos/create-field.input';
import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';
import {
  RelationFromOneSideDTO as RelationFromOneSideDTO,
  RelationFromOneSideType,
} from 'src/metadata/field-metadata/dtos/relation-from-one-side.dto';
import { UpdateOneFieldMetadataInput } from 'src/metadata/field-metadata/dtos/update-field.input';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

@UseGuards(JwtAuthGuard)
@Resolver(() => FieldMetadataDTO)
export class FieldMetadataResolver {
  constructor(
    private readonly fieldMetadataService: FieldMetadataService,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
  ) {}

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

  @ResolveField(() => RelationFromOneSideDTO, { nullable: true })
  async relationFromThisFieldPointOfView(
    @Parent() fieldMetadata: FieldMetadataDTO,
  ): Promise<RelationFromOneSideDTO | null> {
    console.log({
      fieldMetadata,
      _this: this,
    });

    if (fieldMetadata.type !== FieldMetadataType.RELATION) {
      return null;
    }

    const foundRelationMetadata = await this.relationMetadataRepository.findOne(
      {
        where: [
          { fromFieldMetadataId: fieldMetadata.id },
          { toFieldMetadataId: fieldMetadata.id },
        ],
        relations: [
          'fromObjectMetadata',
          'toObjectMetadata',
          'fromFieldMetadata',
          'toFieldMetadata',
        ],
      },
    );

    if (!foundRelationMetadata) {
      throw new Error('RelationMetadata not found');
    }

    const isRelationFromSource =
      foundRelationMetadata.fromFieldMetadata.id === fieldMetadata.id;

    // TODO: implement MANY_TO_MANY
    if (
      foundRelationMetadata.relationType === RelationMetadataType.MANY_TO_MANY
    ) {
      throw new Error(`
        Relation type ${foundRelationMetadata.relationType} not supported
      `);
    }

    if (isRelationFromSource) {
      const direction =
        foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? RelationFromOneSideType.ONE_TO_ONE
          : RelationFromOneSideType.ONE_TO_MANY;

      const description =
        foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? `A ${foundRelationMetadata.fromObjectMetadata.nameSingular} has one ${foundRelationMetadata.toObjectMetadata.nameSingular}`
          : `A ${foundRelationMetadata.fromObjectMetadata.nameSingular} has many ${foundRelationMetadata.toObjectMetadata.namePlural}`;

      const fieldMappingOverview =
        `${foundRelationMetadata.fromObjectMetadata.nameSingular}.${foundRelationMetadata.fromFieldMetadata.name} -> ` +
        (foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? `${capitalize(foundRelationMetadata.toObjectMetadata.nameSingular)}`
          : `${capitalize(
              foundRelationMetadata.toObjectMetadata.nameSingular,
            )}[]`);

      return {
        sourceObjectMetadata: foundRelationMetadata.fromObjectMetadata,
        sourceFieldMetadata: foundRelationMetadata.fromFieldMetadata,
        targetObjectMetadata: foundRelationMetadata.toObjectMetadata,
        targetFieldMetadataForOppositeSide:
          foundRelationMetadata.toFieldMetadata,
        direction,
        originalRelationMetadata: foundRelationMetadata,
        description,
        fieldMappingOverview,
      };
    } else {
      const direction =
        foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? RelationFromOneSideType.ONE_TO_ONE
          : RelationFromOneSideType.MANY_TO_ONE;

      const description =
        foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? `A ${foundRelationMetadata.toObjectMetadata.nameSingular} has one ${foundRelationMetadata.fromObjectMetadata.nameSingular}`
          : `Multiple ${foundRelationMetadata.toObjectMetadata.namePlural} have a ${foundRelationMetadata.fromObjectMetadata.nameSingular}`;

      const fieldMappingOverview =
        `${foundRelationMetadata.toObjectMetadata.nameSingular}.${foundRelationMetadata.toFieldMetadata.name} -> ` +
        (foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? `${capitalize(
              foundRelationMetadata.fromObjectMetadata.nameSingular,
            )}`
          : `${capitalize(
              foundRelationMetadata.fromObjectMetadata.nameSingular,
            )}`);

      return {
        sourceObjectMetadata: foundRelationMetadata.toObjectMetadata,
        sourceFieldMetadata: foundRelationMetadata.toFieldMetadata,
        targetObjectMetadata: foundRelationMetadata.fromObjectMetadata,
        targetFieldMetadataForOppositeSide:
          foundRelationMetadata.fromFieldMetadata,
        direction,
        originalRelationMetadata: foundRelationMetadata,
        description,
        fieldMappingOverview,
      };
    }
  }
}
