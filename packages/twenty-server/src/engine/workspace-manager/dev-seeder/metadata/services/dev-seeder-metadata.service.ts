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
import { EMPLOYMENT_HISTORY_CUSTOM_RELATION_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/employment-history-custom-relation-field-seeds.constant';
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

// Regular relation seed (single target)
type RegularRelationSeed = FieldMetadataSeed & {
  targetObjectMetadataName: string;
};

// Morph relation seed (multiple targets)
type MorphRelationSeed = FieldMetadataSeed & {
  targetObjectMetadataNames: string[];
};

// Junction field seed - a relation field that has junction config
type JunctionFieldSeed = {
  sourceObjectName: string;
  label: string;
  name: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
  // For junctionTargetFieldId - reference field by object.fieldName
  junctionTargetFieldRef?: string;
  // For junctionTargetMorphId - reference morph by object.fieldName (will resolve to morphId)
  junctionTargetMorphRef?: string;
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
      // Morph relations (multiple targets)
      morphRelations?: {
        objectName: string;
        seeds: MorphRelationSeed[];
      }[];
      // Regular relations (single target)
      regularRelations?: {
        objectName: string;
        seeds: RegularRelationSeed[];
      }[];
      // Junction fields with junctionTargetFieldId or junctionTargetMorphId config
      junctionFields?: JunctionFieldSeed[];
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
        // PetCareAgreement caretaker morph (Person/Company)
        {
          objectName: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular,
          seeds: [PET_CARE_AGREEMENT_CARETAKER_MORPH_SEED],
        },
      ],
      regularRelations: [
        // EmploymentHistory relations (person relation is auto-created by junction field)
        {
          objectName: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular,
          seeds: EMPLOYMENT_HISTORY_CUSTOM_RELATION_FIELD_SEEDS,
        },
        // Note: PetCareAgreement.pet is auto-created by the Pet.caretakers junction field
      ],
      junctionFields: [
        // Person.previousCompanies - shows Companies directly via EmploymentHistory
        {
          sourceObjectName: 'person',
          label: 'Previous Companies',
          name: 'previousCompanies',
          icon: 'IconBuildingSkyscraper',
          targetObjectName: EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Person',
          targetFieldIcon: 'IconUser',
          junctionTargetFieldRef: `${EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular}.company`,
        },
        // Pet.caretakers - shows caretakers (Person/Company) directly via PetCareAgreement
        {
          sourceObjectName: PET_CUSTOM_OBJECT_SEED.nameSingular,
          label: 'Caretakers',
          name: 'caretakers',
          icon: 'IconUser',
          targetObjectName: PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular,
          targetFieldLabel: 'Pet',
          targetFieldIcon: 'IconCat',
          junctionTargetMorphRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.caretaker`,
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

    // TODO get
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

    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const { idByNameSingular: objectIdByNameSingular } =
      buildObjectIdByNameMaps(flatObjectMetadataMaps);

    // Seed regular relations (single target)
    if (config.regularRelations) {
      for (const relation of config.regularRelations) {
        await this.seedRegularRelations({
          workspaceId,
          relation,
          objectIdByNameSingular,
        });
      }
    }

    // Seed morph relations (multiple targets)
    if (config.morphRelations) {
      for (const relation of config.morphRelations) {
        await this.seedMorphRelations({
          workspaceId,
          relation,
          objectIdByNameSingular,
        });
      }
    }

    // Seed junction fields (after relations are created so we can resolve field IDs)
    if (config.junctionFields) {
      // Invalidate and refresh the flat entity maps to get the newly created fields
      await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
      });

      const {
        flatObjectMetadataMaps: updatedObjectMaps,
        flatFieldMetadataMaps,
      } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
          },
        );

      const { idByNameSingular: updatedObjectIdByNameSingular } =
        buildObjectIdByNameMaps(updatedObjectMaps);

      for (const junctionField of config.junctionFields) {
        await this.seedJunctionField({
          workspaceId,
          junctionField,
          objectIdByNameSingular: updatedObjectIdByNameSingular,
          // Type assertions needed because FlatEntityMaps uses Partial<Record<...>>
          // but method expects non-partial for type safety in accessing byId
          flatFieldMetadataMaps: flatFieldMetadataMaps as {
            byId: Record<string, { name: string; morphId?: string }>;
          },
          flatObjectMetadataMaps: updatedObjectMaps as {
            byId: Record<string, { fieldMetadataIds: string[] }>;
          },
        });
      }

      // Update Company/Person caredForPets to show Pet names via junction config
      // Need to refresh cache since Pet.caretakers just created PetCareAgreement.pet
      if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
        await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        });
        const {
          flatObjectMetadataMaps: refreshedObjectMaps,
          flatFieldMetadataMaps: refreshedFieldMaps,
        } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
            },
          );
        const { idByNameSingular: refreshedObjectIdByNameSingular } =
          buildObjectIdByNameMaps(refreshedObjectMaps);

        const fieldMaps = refreshedFieldMaps as {
          byId: Record<string, { name: string; morphId?: string }>;
        };
        const objectMaps = refreshedObjectMaps as {
          byId: Record<string, { fieldMetadataIds: string[] }>;
        };

        const petFieldId = this.findFieldIdByObjectAndName({
          objectName: 'petCareAgreement',
          fieldName: 'pet',
          objectIdByNameSingular: refreshedObjectIdByNameSingular,
          flatFieldMetadataMaps: fieldMaps,
          flatObjectMetadataMaps: objectMaps,
        });

        for (const objName of ['company', 'person']) {
          const fieldId = this.findFieldIdByObjectAndName({
            objectName: objName,
            fieldName: 'caredForPets',
            objectIdByNameSingular: refreshedObjectIdByNameSingular,
            flatFieldMetadataMaps: fieldMaps,
            flatObjectMetadataMaps: objectMaps,
          });

          await this.fieldMetadataService.updateOneField({
            workspaceId,
            updateFieldInput: {
              id: fieldId,
              settings: {
                relationType: RelationType.ONE_TO_MANY,
                junctionTargetFieldId: petFieldId,
              },
            },
          });
        }
      }
    }
  }

  private async seedRegularRelations({
    workspaceId,
    relation,
    objectIdByNameSingular,
  }: {
    workspaceId: string;
    relation: {
      objectName: string;
      seeds: RegularRelationSeed[];
    };
    objectIdByNameSingular: Record<string, string>;
  }): Promise<void> {
    const objectMetadataId = objectIdByNameSingular[relation.objectName];

    if (!isDefined(objectMetadataId)) {
      throw new Error(
        `Object metadata id not found for: ${relation.objectName}`,
      );
    }

    const createFieldInputs = relation.seeds.map((seed) => {
      const targetObjectMetadataId =
        objectIdByNameSingular[seed.targetObjectMetadataName];

      if (!isDefined(targetObjectMetadataId)) {
        throw new Error(
          `Target object metadata id not found for: ${seed.targetObjectMetadataName}`,
        );
      }

      if (!isDefined(seed.relationCreationPayload)) {
        throw new Error('Relation creation payload is not defined');
      }

      return {
        type: seed.type,
        label: seed.label,
        name: seed.name,
        icon: seed.icon,
        objectMetadataId,
        relationCreationPayload: {
          type: seed.relationCreationPayload.type,
          targetFieldLabel: seed.relationCreationPayload.targetFieldLabel,
          targetFieldIcon: seed.relationCreationPayload.targetFieldIcon,
          targetObjectMetadataId,
        },
      };
    });

    await this.fieldMetadataService.createManyFields({
      createFieldInputs,
      workspaceId,
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
    junctionField,
    objectIdByNameSingular,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }: {
    workspaceId: string;
    junctionField: JunctionFieldSeed;
    objectIdByNameSingular: Record<string, string>;
    flatFieldMetadataMaps: {
      byId: Record<string, { name: string; morphId?: string }>;
    };
    flatObjectMetadataMaps: {
      byId: Record<string, { fieldMetadataIds: string[] }>;
    };
  }): Promise<void> {
    const sourceObjectMetadataId =
      objectIdByNameSingular[junctionField.sourceObjectName];
    const targetObjectMetadataId =
      objectIdByNameSingular[junctionField.targetObjectName];

    if (!isDefined(sourceObjectMetadataId)) {
      throw new Error(
        `Source object metadata id not found for: ${junctionField.sourceObjectName}`,
      );
    }

    if (!isDefined(targetObjectMetadataId)) {
      throw new Error(
        `Target object metadata id not found for: ${junctionField.targetObjectName}`,
      );
    }

    // Resolve junction target settings
    const settings: {
      relationType: RelationType;
      junctionTargetFieldId?: string;
      junctionTargetMorphId?: string;
    } = {
      relationType: RelationType.ONE_TO_MANY,
    };

    if (junctionField.junctionTargetFieldRef) {
      const [objectName, fieldName] =
        junctionField.junctionTargetFieldRef.split('.');
      const fieldId = this.findFieldIdByObjectAndName({
        objectName,
        fieldName,
        objectIdByNameSingular,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });

      settings.junctionTargetFieldId = fieldId;
    }

    if (junctionField.junctionTargetMorphRef) {
      const [objectName, fieldName] =
        junctionField.junctionTargetMorphRef.split('.');
      const morphId = this.findMorphIdByObjectAndName({
        objectName,
        fieldName,
        objectIdByNameSingular,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });

      settings.junctionTargetMorphId = morphId;
    }

    const createFieldInput = {
      type: FieldMetadataType.RELATION,
      label: junctionField.label,
      name: junctionField.name,
      icon: junctionField.icon,
      objectMetadataId: sourceObjectMetadataId,
      settings,
      relationCreationPayload: {
        type: RelationType.ONE_TO_MANY,
        targetFieldLabel: junctionField.targetFieldLabel,
        targetFieldIcon: junctionField.targetFieldIcon,
        targetObjectMetadataId,
      },
    };

    await this.fieldMetadataService.createManyFields({
      createFieldInputs: [createFieldInput],
      workspaceId,
    });
  }

  private findFieldIdByObjectAndName({
    objectName,
    fieldName,
    objectIdByNameSingular,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }: {
    objectName: string;
    fieldName: string;
    objectIdByNameSingular: Record<string, string>;
    flatFieldMetadataMaps: {
      byId: Record<string, { name: string; morphId?: string }>;
    };
    flatObjectMetadataMaps: {
      byId: Record<string, { fieldMetadataIds: string[] }>;
    };
  }): string {
    const objectId = objectIdByNameSingular[objectName];

    if (!isDefined(objectId)) {
      throw new Error(`Object not found: ${objectName}`);
    }

    // Get the object to find its field IDs - access via byId
    const objectMetadata = flatObjectMetadataMaps.byId[objectId];

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found for id: ${objectId}`);
    }

    // Find the field by name - access via byId
    for (const fieldId of objectMetadata.fieldMetadataIds) {
      const field = flatFieldMetadataMaps.byId[fieldId];

      if (field?.name === fieldName) {
        return fieldId;
      }
    }

    throw new Error(`Field not found: ${objectName}.${fieldName}`);
  }

  private findMorphIdByObjectAndName({
    objectName,
    fieldName,
    objectIdByNameSingular,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }: {
    objectName: string;
    fieldName: string;
    objectIdByNameSingular: Record<string, string>;
    flatFieldMetadataMaps: {
      byId: Record<string, { name: string; morphId?: string }>;
    };
    flatObjectMetadataMaps: {
      byId: Record<string, { fieldMetadataIds: string[] }>;
    };
  }): string {
    const objectId = objectIdByNameSingular[objectName];

    if (!isDefined(objectId)) {
      throw new Error(`Object not found: ${objectName}`);
    }

    // Access via byId
    const objectMetadata = flatObjectMetadataMaps.byId[objectId];

    if (!isDefined(objectMetadata)) {
      throw new Error(`Object metadata not found for id: ${objectId}`);
    }

    // Find the morph field by name pattern (morph creates fields like caretakerPerson, caretakerCompany)
    // We need to find any field that starts with the morph name and has a morphId
    for (const fieldId of objectMetadata.fieldMetadataIds) {
      const field = flatFieldMetadataMaps.byId[fieldId];

      if (field?.name.startsWith(fieldName) && isDefined(field.morphId)) {
        return field.morphId;
      }
    }

    throw new Error(`Morph field not found: ${objectName}.${fieldName}`);
  }
}
