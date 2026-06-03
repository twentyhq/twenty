import { Injectable } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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
import { SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/shahryar-custom-field-seeds.constant';
import { SHAHRYAR_RELATION_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/shahryar-relation-field-seeds.constant';
import { SURVEY_RESULT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/survey-results-field-seeds.constant';
import { EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/employment-history-custom-object-seed.constant';
import { PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/pet-care-agreement-custom-object-seed.constant';
import { PET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/pet-custom-object-seed.constant';
import { ROCKET_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/rocket-custom-object-seed.constant';
import { SHAHRYAR_CUSTOM_OBJECT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/shahryar-custom-object-seeds.constant';
import { SURVEY_RESULT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/survey-results-object-seed.constant';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';
import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';
import { type RelationFieldSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/relation-field-seed.type';

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

type WorkspaceSeedConfig = {
  objects: { seed: ObjectMetadataSeed; fields?: FieldMetadataSeed[] }[];
  fields: { objectName: string; seeds: FieldMetadataSeed[] }[];
  morphRelations?: { objectName: string; seeds: MorphRelationSeed[] }[];
  relationFields?: RelationFieldSeed[];
  junctionFields?: JunctionFieldSeed[];
  junctionConfigs?: JunctionConfigSeed[];
};

type FlatMaps = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  objectIdByName: Record<string, string>;
};

const SHAHRYAR_WORKSPACE_SEED_CONFIG: WorkspaceSeedConfig = {
  objects: SHAHRYAR_CUSTOM_OBJECT_SEEDS.map((seed) => ({
    seed,
  })),
  fields: SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS,
  relationFields: SHAHRYAR_RELATION_FIELD_SEEDS,
};

@Injectable()
export class DevSeederMetadataService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private readonly workspaceConfigs: Record<string, WorkspaceSeedConfig> = {
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
        ...SHAHRYAR_WORKSPACE_SEED_CONFIG.objects,
      ],
      fields: [
        { objectName: 'company', seeds: COMPANY_CUSTOM_FIELD_SEEDS },
        { objectName: 'person', seeds: PERSON_CUSTOM_FIELD_SEEDS },
        ...SHAHRYAR_WORKSPACE_SEED_CONFIG.fields,
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
      relationFields: SHAHRYAR_WORKSPACE_SEED_CONFIG.relationFields,
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
        ...SHAHRYAR_WORKSPACE_SEED_CONFIG.objects,
      ],
      fields: [
        { objectName: 'company', seeds: COMPANY_CUSTOM_FIELD_SEEDS },
        { objectName: 'person', seeds: PERSON_CUSTOM_FIELD_SEEDS },
        ...SHAHRYAR_WORKSPACE_SEED_CONFIG.fields,
      ],
      relationFields: SHAHRYAR_WORKSPACE_SEED_CONFIG.relationFields,
    },
  };

  private getLightConfig(_config: WorkspaceSeedConfig): WorkspaceSeedConfig {
    return {
      objects: [],
      fields: [],
    };
  }

  private getConfig(workspaceId: string, light: boolean): WorkspaceSeedConfig {
    const config = this.workspaceConfigs[workspaceId];

    if (!config) {
      throw new Error(
        `Workspace configuration not found for workspaceId: ${workspaceId}`,
      );
    }

    return light ? this.getLightConfig(config) : config;
  }

  public async seed({
    workspaceId,
    light = false,
  }: {
    workspaceId: string;
    light?: boolean;
  }) {
    const config = this.getConfig(workspaceId, light);

    for (const obj of config.objects) {
      await this.seedCustomObject({
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

  public async seedShahryarMetadata({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    await this.seedMissingCustomObjects({
      workspaceId,
      objectMetadataSeeds: SHAHRYAR_WORKSPACE_SEED_CONFIG.objects.map(
        ({ seed }) => seed,
      ),
    });

    for (const fieldConfig of SHAHRYAR_WORKSPACE_SEED_CONFIG.fields) {
      await this.seedMissingCustomFields({
        workspaceId,
        objectMetadataNameSingular: fieldConfig.objectName,
        fieldMetadataSeeds: fieldConfig.seeds,
      });
    }

    await this.seedMissingRelationFields({
      workspaceId,
      relationFields: SHAHRYAR_WORKSPACE_SEED_CONFIG.relationFields ?? [],
    });
  }

  private async seedCustomObject({
    workspaceId,
    objectMetadataSeed,
  }: {
    workspaceId: string;
    objectMetadataSeed: ObjectMetadataSeed;
  }): Promise<void> {
    await this.objectMetadataService.createOneObject({
      createObjectInput: objectMetadataSeed,
      workspaceId,
    });
  }

  private async seedMissingCustomObjects({
    workspaceId,
    objectMetadataSeeds,
  }: {
    workspaceId: string;
    objectMetadataSeeds: ObjectMetadataSeed[];
  }): Promise<void> {
    const maps = await this.getFreshFlatMaps(workspaceId);
    const existingObjectNames = new Set(
      Object.values(maps.flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((objectMetadata) => objectMetadata.nameSingular),
    );

    for (const objectMetadataSeed of objectMetadataSeeds) {
      if (existingObjectNames.has(objectMetadataSeed.nameSingular)) {
        continue;
      }

      await this.seedCustomObject({
        workspaceId,
        objectMetadataSeed,
      });

      existingObjectNames.add(objectMetadataSeed.nameSingular);
    }
  }

  private async seedMissingCustomFields({
    workspaceId,
    objectMetadataNameSingular,
    fieldMetadataSeeds,
  }: {
    workspaceId: string;
    objectMetadataNameSingular: string;
    fieldMetadataSeeds: FieldMetadataSeed[];
  }): Promise<void> {
    const maps = await this.getFreshFlatMaps(workspaceId);
    const existingFieldNames = this.getFieldNamesForObject({
      flatMaps: maps,
      objectName: objectMetadataNameSingular,
    });
    const missingFieldMetadataSeeds = fieldMetadataSeeds.filter(
      (fieldMetadataSeed) => !existingFieldNames.has(fieldMetadataSeed.name),
    );

    if (missingFieldMetadataSeeds.length === 0) {
      return;
    }

    await this.seedCustomFields({
      workspaceId,
      objectMetadataNameSingular,
      fieldMetadataSeeds: missingFieldMetadataSeeds,
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

  public async seedRelations({
    workspaceId,
    light = false,
  }: {
    workspaceId: string;
    light?: boolean;
  }) {
    const config = this.getConfig(workspaceId, light);

    // 1. Seed morph relations (creates inverses on target objects)
    let maps = await this.getFreshFlatMaps(workspaceId);

    for (const relation of config.morphRelations ?? []) {
      await this.seedMorphRelations({
        workspaceId,
        relation,
        objectIdByNameSingular: maps.objectIdByName,
      });
    }

    // 2. Seed direct relation fields (creates inverse fields on target objects)
    maps = await this.getFreshFlatMaps(workspaceId);

    for (const field of config.relationFields ?? []) {
      await this.seedRelationField({ workspaceId, field, flatMaps: maps });
    }

    // 3. Seed junction fields (creates relations + inverses on junction objects)
    maps = await this.getFreshFlatMaps(workspaceId);

    for (const field of config.junctionFields ?? []) {
      await this.seedJunctionField({ workspaceId, field, flatMaps: maps });
    }

    // 4. Configure junction settings (after all fields exist)
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

  private async seedMissingRelationFields({
    workspaceId,
    relationFields,
  }: {
    workspaceId: string;
    relationFields: RelationFieldSeed[];
  }): Promise<void> {
    let maps = await this.getFreshFlatMaps(workspaceId);

    for (const relationField of relationFields) {
      const existingFieldNames = this.getFieldNamesForObject({
        flatMaps: maps,
        objectName: relationField.sourceObjectName,
      });

      if (existingFieldNames.has(relationField.name)) {
        continue;
      }

      await this.seedRelationField({
        workspaceId,
        field: relationField,
        flatMaps: maps,
      });

      maps = await this.getFreshFlatMaps(workspaceId);
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
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      objectIdByName: idByNameSingular,
    };
  }

  private getFieldNamesForObject({
    flatMaps,
    objectName,
  }: {
    flatMaps: FlatMaps;
    objectName: string;
  }): Set<string> {
    const objectId = flatMaps.objectIdByName[objectName];

    if (!isDefined(objectId)) {
      throw new Error(`Object not found: ${objectName}`);
    }

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectId,
      flatEntityMaps: flatMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found: ${objectName}`);
    }

    return new Set(
      objectMetadata.fieldIds.flatMap((fieldId) => {
        const field = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldId,
          flatEntityMaps: flatMaps.flatFieldMetadataMaps,
        });

        return isDefined(field) ? [field.name] : [];
      }),
    );
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

  private async seedRelationField({
    workspaceId,
    field,
    flatMaps,
  }: {
    workspaceId: string;
    field: RelationFieldSeed;
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
            type: field.relationType,
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

    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectId,
      flatEntityMaps: flatMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found: ${objectName}`);
    }

    for (const fieldId of objectMetadata.fieldIds) {
      const field = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatMaps.flatFieldMetadataMaps,
      });

      if (field?.name === fieldName) {
        return fieldId;
      }
    }

    throw new Error(`Field not found: ${objectName}.${fieldName}`);
  }
}
