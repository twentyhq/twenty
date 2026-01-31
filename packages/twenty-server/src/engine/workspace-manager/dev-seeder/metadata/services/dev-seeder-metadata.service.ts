import { Injectable } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { COMPANY_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/company-custom-field-seeds.constant';
import { PERSON_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/person-custom-field-seeds.constant';
import { PET_CARE_AGREEMENT_CARETAKER_MORPH_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/pet-care-agreement-custom-relation-field-seeds.constant';
import { PET_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/pet-custom-field-seeds.constant';
import { PET_CUSTOM_RELATION_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/pet-custom-relation-field-seeds.constant';
import { SURVEY_RESULT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/survey-results-field-seeds.constant';
import { EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/employment-history-custom-object-seed.constant';
import { PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/pet-care-agreement-custom-object-seed.constant';
import { PET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/pet-custom-object-seed.constant';
import { ROCKET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/rocket-custom-object-seed.constant';
import { SURVEY_RESULT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/survey-results-object-seed.constant';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

type MorphRelationSeed = FieldMetadataSeed & {
  targetObjectMetadataNames: string[];
};

type JunctionFieldSeed = {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
};

type JunctionConfigSeed = {
  objectName: string;
  fieldName: string;
  junctionTargetFieldRef: string;
  label?: string;
};

// Helper type for flat entity maps
type FlatMaps = {
  fieldMaps: { byId: Record<string, { name: string; morphId?: string }> };
  objectMaps: { byId: Record<string, { fieldIds: string[] }> };
  objectIdByName: Record<string, string>;
};

@Injectable()
export class DevSeederMetadataService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private readonly workspaceConfigs: Record<
    string,
    {
      objects: { seed: ObjectMetadataSeed; fields?: FieldMetadataSeed[] }[];
      fields: { objectName: string; seeds: FieldMetadataSeed[] }[];
      morphRelations?: { objectName: string; seeds: MorphRelationSeed[] }[];
      // Junction fields create relations to junction objects (inverses auto-created)
      junctionFields?: JunctionFieldSeed[];
      // Configure junction settings on fields after all relations exist
      junctionConfigs?: JunctionConfigSeed[];
    }
  > = {
    [SEED_APPLE_WORKSPACE_ID]: {
      objects: [
        { seed: ROCKET_CUSTOM_OBJECT_SEED },
        { seed: PET_CUSTOM_OBJECT_SEED, fields: PET_CUSTOM_FIELD_SEEDS },
        {
          seed: SURVEY_RESULT_CUSTOM_OBJECT_SEED,
          fields: SURVEY_RESULT_CUSTOM_FIELD_SEEDS,
        },
        // Junction objects (minimal pivots)
        { seed: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED },
        { seed: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED },
      ],
      fields: [
        { objectName: 'company', seeds: COMPANY_CUSTOM_FIELD_SEEDS },
        { objectName: 'person', seeds: PERSON_CUSTOM_FIELD_SEEDS },
      ],
      morphRelations: [
        {
          objectName: PET_CUSTOM_OBJECT_SEED.nameSingular,
          seeds: PET_CUSTOM_RELATION_FIELD_SEEDS,
        },
        {
          objectName: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular,
          seeds: [PET_CARE_AGREEMENT_CARETAKER_MORPH_SEED],
        },
      ],
      junctionFields: [
        // Employment History: Person <-> Company
        {
          sourceObjectName: 'person',
          name: 'previousCompanies',
          label: 'Previous Companies',
          icon: 'IconBuildingSkyscraper',
          targetObjectName: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Person',
          targetFieldIcon: 'IconUser',
        },
        {
          sourceObjectName: 'company',
          name: 'previousEmployees',
          label: 'Previous Employees',
          icon: 'IconUser',
          targetObjectName: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Company',
          targetFieldIcon: 'IconBuildingSkyscraper',
        },
        // Pet Care Agreement: Pet -> caretakers
        {
          sourceObjectName: PET_CUSTOM_OBJECT_SEED.nameSingular,
          name: 'caretakers',
          label: 'Caretakers',
          icon: 'IconUser',
          targetObjectName: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Pet',
          targetFieldIcon: 'IconCat',
        },
      ],
      junctionConfigs: [
        // Employment History junction configs
        {
          objectName: 'person',
          fieldName: 'previousCompanies',
          junctionTargetFieldRef: `${EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular}.company`,
        },
        {
          objectName: 'company',
          fieldName: 'previousEmployees',
          junctionTargetFieldRef: `${EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular}.person`,
        },
        // Pet Care Agreement junction configs
        {
          objectName: PET_CUSTOM_OBJECT_SEED.nameSingular,
          fieldName: 'caretakers',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.caretakerPerson`,
        },
        {
          objectName: 'company',
          fieldName: 'caredForPets',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.pet`,
        },
        {
          objectName: 'person',
          fieldName: 'caredForPets',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.pet`,
        },
      ],
    },
    [SEED_YCOMBINATOR_WORKSPACE_ID]: {
      objects: [
        {
          seed: SURVEY_RESULT_CUSTOM_OBJECT_SEED,
          fields: SURVEY_RESULT_CUSTOM_FIELD_SEEDS,
        },
      ],
      fields: [
        { objectName: 'company', seeds: COMPANY_CUSTOM_FIELD_SEEDS },
        { objectName: 'person', seeds: PERSON_CUSTOM_FIELD_SEEDS },
      ],
    },
  };

  public async seed({
    dataSourceMetadata,
    workspaceId,
  }: {
    dataSourceMetadata: DataSourceEntity;
    workspaceId: string;
  }) {
    const config = this.workspaceConfigs[workspaceId];

    if (!config) {
      throw new Error(
        `Workspace configuration not found for workspaceId: ${workspaceId}`,
      );
    }

    for (const obj of config.objects) {
      await this.seedCustomObject({
        dataSourceId: dataSourceMetadata.id,
        workspaceId,
        objectMetadataSeed: obj.seed,
      });

      if (obj.fields) {
        await this.seedCustomFields({
          workspaceId,
          objectMetadataNameSingular: obj.seed.nameSingular,
          fieldMetadataSeeds: obj.fields,
        });
      }
    }

    for (const fieldConfig of config.fields) {
      await this.seedCustomFields({
        workspaceId,
        objectMetadataNameSingular: fieldConfig.objectName,
        fieldMetadataSeeds: fieldConfig.seeds,
      });
    }
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
    await this.objectMetadataService.createOneObject({
      createObjectInput: {
        ...objectMetadataSeed,
        dataSourceId,
      },
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

    if (!isDefined(objectMetadata)) {
      throw new Error(
        `Object metadata not found for: ${objectMetadataNameSingular}`,
      );
    }
    const createFieldInputs = fieldMetadataSeeds.map((fieldMetadataSeed) => ({
      ...fieldMetadataSeed,
      objectMetadataId: objectMetadata.id,
    }));

    await this.fieldMetadataService.createManyFields({
      createFieldInputs,
      workspaceId,
    });
  }

  public async seedRelations({ workspaceId }: { workspaceId: string }) {
    const config = this.workspaceConfigs[workspaceId];

    if (!config) {
      throw new Error(
        `Workspace configuration not found for workspaceId: ${workspaceId}`,
      );
    }

    // 1. Seed morph relations (creates inverses on target objects)
    let maps = await this.getFreshFlatMaps(workspaceId);

    for (const relation of config.morphRelations ?? []) {
      await this.seedMorphRelations({
        workspaceId,
        relation,
        objectIdByNameSingular: maps.objectIdByName,
      });
    }

    // 2. Seed junction fields (creates relations + inverses on junction objects)
    // Use same maps for all - matches original working behavior
    maps = await this.getFreshFlatMaps(workspaceId);

    for (const field of config.junctionFields ?? []) {
      await this.seedJunctionField({ workspaceId, field, flatMaps: maps });
    }

    // 3. Configure junction settings (after all fields exist)
    if (config.junctionConfigs && config.junctionConfigs.length > 0) {
      maps = await this.getFreshFlatMaps(workspaceId);

      for (const junctionConfig of config.junctionConfigs) {
        await this.applyJunctionConfig({
          workspaceId,
          junctionConfig,
          flatMaps: maps,
        });
      }
    }
  }

  private async getFreshFlatMaps(workspaceId: string): Promise<FlatMaps> {
    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
    });

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    return {
      fieldMaps: flatFieldMetadataMaps as FlatMaps['fieldMaps'],
      objectMaps: flatObjectMetadataMaps as FlatMaps['objectMaps'],
      objectIdByName: idByNameSingular,
    };
  }

  private async applyJunctionConfig({
    workspaceId,
    junctionConfig,
    flatMaps,
  }: {
    workspaceId: string;
    junctionConfig: JunctionConfigSeed;
    flatMaps: FlatMaps;
  }): Promise<void> {
    const [targetObjectName, targetFieldName] =
      junctionConfig.junctionTargetFieldRef.split('.');

    const junctionTargetFieldId = this.findFieldId(
      targetObjectName,
      targetFieldName,
      flatMaps,
    );

    const fieldId = this.findFieldId(
      junctionConfig.objectName,
      junctionConfig.fieldName,
      flatMaps,
    );

    await this.fieldMetadataService.updateOneField({
      workspaceId,
      updateFieldInput: {
        id: fieldId,
        ...(junctionConfig.label && { label: junctionConfig.label }),
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId,
        },
      },
    });
  }

  private async seedMorphRelations({
    workspaceId,
    relation,
    objectIdByNameSingular,
  }: {
    workspaceId: string;
    relation: {
      objectName: string;
      seeds: MorphRelationSeed[];
    };
    objectIdByNameSingular: Record<string, string>;
  }): Promise<void> {
    const objectMetadataId = objectIdByNameSingular[relation.objectName];

    if (!isDefined(objectMetadataId)) {
      throw new Error(
        `Object metadata id not found for: ${relation.objectName}`,
      );
    }

    const createFieldInputs = relation.seeds.map((seed) => ({
      type: seed.type,
      label: seed.label,
      name: seed.name,
      icon: seed.icon,
      objectMetadataId,
      morphRelationsCreationPayload: seed.targetObjectMetadataNames.map(
        (targetObjectMetadataName) => {
          const targetObjectMetadataId =
            objectIdByNameSingular[targetObjectMetadataName];

          if (!isDefined(targetObjectMetadataId)) {
            throw new Error(
              `Target object metadata id not found for: ${targetObjectMetadataName}`,
            );
          }

          if (!isDefined(seed.morphRelationsCreationPayload)) {
            throw new Error('Morph relations creation payload is not defined');
          }

          return {
            type: seed.morphRelationsCreationPayload[0].type,
            targetFieldLabel:
              seed.morphRelationsCreationPayload[0].targetFieldLabel,
            targetFieldIcon:
              seed.morphRelationsCreationPayload[0].targetFieldIcon,
            targetObjectMetadataId,
          };
        },
      ),
    }));

    await this.fieldMetadataService.createManyFields({
      createFieldInputs,
      workspaceId,
    });
  }

  private async seedJunctionField({
    workspaceId,
    field,
    flatMaps,
  }: {
    workspaceId: string;
    field: JunctionFieldSeed;
    flatMaps: FlatMaps;
  }): Promise<void> {
    const sourceObjectId = flatMaps.objectIdByName[field.sourceObjectName];
    const targetObjectId = flatMaps.objectIdByName[field.targetObjectName];

    if (!isDefined(sourceObjectId)) {
      throw new Error(`Source object not found: ${field.sourceObjectName}`);
    }
    if (!isDefined(targetObjectId)) {
      throw new Error(`Target object not found: ${field.targetObjectName}`);
    }

    await this.fieldMetadataService.createManyFields({
      createFieldInputs: [
        {
          type: FieldMetadataType.RELATION,
          name: field.name,
          label: field.label,
          icon: field.icon,
          objectMetadataId: sourceObjectId,
          relationCreationPayload: {
            type: RelationType.ONE_TO_MANY,
            targetFieldLabel: field.targetFieldLabel,
            targetFieldIcon: field.targetFieldIcon,
            targetObjectMetadataId: targetObjectId,
          },
        },
      ],
      workspaceId,
    });
  }

  private findFieldId(
    objectName: string,
    fieldName: string,
    flatMaps: FlatMaps,
  ): string {
    const objectId = flatMaps.objectIdByName[objectName];

    if (!isDefined(objectId)) {
      throw new Error(`Object not found: ${objectName}`);
    }

    const objectMetadata = flatMaps.objectMaps.byId[objectId];

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found: ${objectName}`);
    }

    for (const fieldId of objectMetadata.fieldIds) {
      if (flatMaps.fieldMaps.byId[fieldId]?.name === fieldName) {
        return fieldId;
      }
    }

    throw new Error(`Field not found: ${objectName}.${fieldName}`);
  }
}
