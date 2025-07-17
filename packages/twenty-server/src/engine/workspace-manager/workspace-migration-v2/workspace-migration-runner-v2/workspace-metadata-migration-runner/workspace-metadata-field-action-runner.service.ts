import { Injectable } from '@nestjs/common';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

import {
  CreateFieldAction,
  DeleteFieldAction,
  UpdateFieldAction,
  WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 } from 'uuid';

const tmp = async ({
  relationCreationPayload,
  workspaceId,
}: {
  relationCreationPayload: CreateFieldInput['relationCreationPayload'];
  workspaceId: string;
}) => {
  if (!isDefined(relationCreationPayload)) {
    throw new FieldMetadataException(
      'Relation creation payload is not defined',
      FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
    );
  }
  const targetFieldMetadataName = computeMetadataNameFromLabel(
    relationCreationPayload.targetFieldLabel,
  );

  const targetFieldMetadataToCreate = prepareCustomFieldMetadataForCreation({
    objectMetadataId: relationCreationPayload.targetObjectMetadataId,
    type: FieldMetadataType.RELATION,
    name: targetFieldMetadataName,
    label: relationCreationPayload.targetFieldLabel,
    icon: relationCreationPayload.targetFieldIcon,
    workspaceId,
  });

  const targetFieldMetadataToCreateWithRelation =
    await this.addCustomRelationFieldMetadataForCreation({
      fieldMetadataInput: targetFieldMetadataToCreate,
      relationCreationPayload: {
        targetObjectMetadataId: objectMetadata.id,
        targetFieldLabel: flat.label,
        targetFieldIcon: fieldMetadataInput.icon ?? 'Icon123',
        type:
          relationCreationPayload.type === RelationType.ONE_TO_MANY
            ? RelationType.MANY_TO_ONE
            : RelationType.ONE_TO_MANY,
      },
      objectMetadata,
    });

  // todo better type
  const targetFieldMetadataToCreateWithRelationWithId = {
    id: v4(),
    ...targetFieldMetadataToCreateWithRelation,
  };
};

@Injectable()
export class WorkspaceMetadataFieldActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationFieldActionTypeV2, 'metadata'>
{
  runDeleteFieldMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>) => {
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { flatFieldMetadata } = action;
    switch (flatFieldMetadata.type) {
      case FieldMetadataType.RELATION:
      case FieldMetadataType.MORPH_RELATION: {
        await fieldMetadataRepository.delete({
          id: In([
            flatFieldMetadata.id, // optionall could be an issue ?
            flatFieldMetadata.relationTargetFieldMetadataId, // optional could be an issue ?
          ]),
        });
        break;
      }
      default: {
        await fieldMetadataRepository.delete({
          id: In([flatFieldMetadata.id]),
        });
        break;
      }
    }
  };
  runCreateFieldMetadataMigration = async ({
    action,
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>) => {
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { flatFieldMetadata } = action;
    switch (flatFieldMetadata.type) {
      case FieldMetadataType.RELATION: {
        const sourceFieldMetadata =
          await fieldMetadataRepository.save(flatFieldMetadata); // Should be transpiled ? to partial FieldMetadataEntity for creation ?

        const targetFieldMetadata = await fieldMetadataRepository.save({
          ...targetFieldMetadataToCreateWithRelationWithId,
          relationTargetFieldMetadataId: sourceFieldMetadata.id,
        });

        const createdFieldMetadataItemUpdated =
          await fieldMetadataRepository.save({
            ...sourceFieldMetadata,
            relationTargetFieldMetadataId: targetFieldMetadata.id,
          });

        break;
      }
      case FieldMetadataType.MORPH_RELATION: {
        console.log('TODO implement');
        break;
      }
      default: {
        await fieldMetadataRepository.save(flatFieldMetadata); // Should be transpiled ? to partial FieldMetadataEntity for creation ?
        break;
      }
    }
  };
  runUpdateFieldMetadataMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ) => {
    return;
  };
}
