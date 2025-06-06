import { Injectable } from '@nestjs/common';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PET_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/pet-custom-field-seeds.constant';
import { SURVEY_RESULT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/survey-results-field-seeds.constant';
import { PET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/pet-custom-field-seed.constant';
import { ROCKET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/rocket-custom-object-seed.constant';
import { SURVEY_RESULT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/survey-results-field-seed.constant';
import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';
import { ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

@Injectable()
export class DevSeederMetadataService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  public async seedMetadata({
    dataSourceMetadata,
    workspaceId,
  }: {
    dataSourceMetadata: DataSourceEntity;
    workspaceId: string;
  }) {
    await this.seedCustomObject({
      dataSourceId: dataSourceMetadata.id,
      workspaceId,
      objectMetadataSeed: ROCKET_CUSTOM_OBJECT_SEED,
    });

    await this.seedCustomObject({
      dataSourceId: dataSourceMetadata.id,
      workspaceId,
      objectMetadataSeed: PET_CUSTOM_OBJECT_SEED,
    });

    await this.seedCustomFields({
      workspaceId,
      objectMetadataNameSingular: PET_CUSTOM_OBJECT_SEED.nameSingular,
      fieldMetadataSeeds: PET_CUSTOM_FIELD_SEEDS,
    });

    await this.seedCustomObject({
      dataSourceId: dataSourceMetadata.id,
      workspaceId,
      objectMetadataSeed: SURVEY_RESULT_CUSTOM_OBJECT_SEED,
    });

    await this.seedCustomFields({
      workspaceId,
      objectMetadataNameSingular: SURVEY_RESULT_CUSTOM_OBJECT_SEED.nameSingular,
      fieldMetadataSeeds: SURVEY_RESULT_CUSTOM_FIELD_SEEDS,
    });
  }

  private async seedCustomObject({
    dataSourceId,
    workspaceId,
    objectMetadataSeed,
  }: {
    dataSourceId: string;
    workspaceId: string;
    objectMetadataSeed: ObjectMetadataSeed;
  }): Promise<void> {
    await this.objectMetadataService.createOne({
      ...objectMetadataSeed,
      dataSourceId,
      workspaceId,
    });
  }

  private async seedCustomFields({
    workspaceId,
    objectMetadataNameSingular,
    fieldMetadataSeeds,
  }: {
    workspaceId: string;
    objectMetadataNameSingular: string;
    fieldMetadataSeeds: FieldMetadataSeed[];
  }): Promise<void> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: objectMetadataNameSingular },
      });

    if (!objectMetadata) {
      throw new Error('Object metadata not found');
    }

    await this.fieldMetadataService.createMany(
      fieldMetadataSeeds.map((fieldMetadataSeed) => ({
        ...fieldMetadataSeed,
        objectMetadataId: objectMetadata.id,
        workspaceId,
      })),
    );
  }
}
