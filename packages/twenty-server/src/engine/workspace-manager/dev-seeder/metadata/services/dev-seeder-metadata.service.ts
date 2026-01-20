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
  // Reference field by object.fieldName (for morph fields, any sibling works)
  junctionTargetFieldRef: string;
};

// Update an existing field to use junction config (for auto-created inverse fields)
type JunctionUpdateSeed = {
  objectName: string;
  fieldName: string;
  junctionTargetFieldRef: string;
  label?: string;
};

// Helper type for flat entity maps
type FlatMaps = {
  fieldMaps: { byId: Record<string, { name: string; morphId?: string }> };
  objectMaps: { byId: Record<string, { fieldMetadataIds: string[] }> };
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
      // Junction fields with junctionTargetFieldId config
      junctionFields?: JunctionFieldSeed[];
      // Update existing fields to use junction config (for auto-created inverse fields)
      junctionUpdates?: JunctionUpdateSeed[];
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
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.caretakerPerson`,
        },
      ],
      // Update auto-created inverse fields to show target records via junction
      junctionUpdates: [
        // Company.caredForPets -> shows Pets via PetCareAgreement
        {
          objectName: 'company',
          fieldName: 'caredForPets',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.pet`,
        },
        // Person.caredForPets -> shows Pets via PetCareAgreement
        {
          objectName: 'person',
          fieldName: 'caredForPets',
          junctionTargetFieldRef: `${PET_CARE_AGREEMENT_CUSTOM_OBJECT_SEED.nameSingular}.pet`,
        },
        // Company.employmentHistories -> shows People via EmploymentHistory
        {
          objectName: 'company',
          fieldName: 'employmentHistories',
          junctionTargetFieldRef: `${EMPLOYMENT_HISTORY_CUSTOM_OBJECT_SEED.nameSingular}.person`,
          label: 'Employees',
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

    const flatMaps = await this.getFreshFlatMaps(workspaceId);

    // Seed regular relations (single target)
    for (const relation of config.regularRelations ?? []) {
      await this.seedRegularRelations({
        workspaceId,
        relation,
        objectIdByNameSingular: flatMaps.objectIdByName,
      });
    }

    // Seed morph relations (multiple targets)
    for (const relation of config.morphRelations ?? []) {
      await this.seedMorphRelations({
        workspaceId,
        relation,
        objectIdByNameSingular: flatMaps.objectIdByName,
      });
    }

    // Seed junction fields (after relations are created so we can resolve field IDs)
    if (config.junctionFields && config.junctionFields.length > 0) {
      const updatedMaps = await this.getFreshFlatMaps(workspaceId);

      for (const junctionField of config.junctionFields) {
        await this.seedJunctionField({
          workspaceId,
          junctionField,
          flatMaps: updatedMaps,
        });
      }
    }

    // Update existing fields to use junction config
    if (config.junctionUpdates && config.junctionUpdates.length > 0) {
      const refreshedMaps = await this.getFreshFlatMaps(workspaceId);

      for (const update of config.junctionUpdates) {
        await this.applyJunctionUpdate({
          workspaceId,
          update,
          flatMaps: refreshedMaps,
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

  private async applyJunctionUpdate({
    workspaceId,
    update,
    flatMaps,
  }: {
    workspaceId: string;
    update: JunctionUpdateSeed;
    flatMaps: FlatMaps;
  }): Promise<void> {
    const [targetObjectName, targetFieldName] =
      update.junctionTargetFieldRef.split('.');

    const junctionTargetFieldId = this.findFieldId(
      targetObjectName,
      targetFieldName,
      flatMaps,
    );

    const fieldId = this.findFieldId(
      update.objectName,
      update.fieldName,
      flatMaps,
    );

    await this.fieldMetadataService.updateOneField({
      workspaceId,
      updateFieldInput: {
        id: fieldId,
        ...(update.label && { label: update.label }),
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId,
        },
      },
    });
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
    flatMaps,
  }: {
    workspaceId: string;
    junctionField: JunctionFieldSeed;
    flatMaps: FlatMaps;
  }): Promise<void> {
    const sourceObjectMetadataId =
      flatMaps.objectIdByName[junctionField.sourceObjectName];
    const targetObjectMetadataId =
      flatMaps.objectIdByName[junctionField.targetObjectName];

    if (!isDefined(sourceObjectMetadataId)) {
      throw new Error(
        `Source object not found: ${junctionField.sourceObjectName}`,
      );
    }

    if (!isDefined(targetObjectMetadataId)) {
      throw new Error(
        `Target object not found: ${junctionField.targetObjectName}`,
      );
    }

    const [objectName, fieldName] =
      junctionField.junctionTargetFieldRef.split('.');

    const junctionTargetFieldId = this.findFieldId(
      objectName,
      fieldName,
      flatMaps,
    );

    await this.fieldMetadataService.createManyFields({
      createFieldInputs: [
        {
          type: FieldMetadataType.RELATION,
          label: junctionField.label,
          name: junctionField.name,
          icon: junctionField.icon,
          objectMetadataId: sourceObjectMetadataId,
          settings: {
            relationType: RelationType.ONE_TO_MANY,
            junctionTargetFieldId,
          },
          relationCreationPayload: {
            type: RelationType.ONE_TO_MANY,
            targetFieldLabel: junctionField.targetFieldLabel,
            targetFieldIcon: junctionField.targetFieldIcon,
            targetObjectMetadataId,
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

    for (const fieldId of objectMetadata.fieldMetadataIds) {
      if (flatMaps.fieldMaps.byId[fieldId]?.name === fieldName) {
        return fieldId;
      }
    }

    throw new Error(`Field not found: ${objectName}.${fieldName}`);
  }
}
