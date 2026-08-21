import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  type CampaignVariableDefinition,
  isDefined,
  listCampaignVariablesForFields,
} from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export type PersonCampaignVariables = {
  definitions: CampaignVariableDefinition[];
  knownVariableNames: Set<string>;
};

const COMPUTED_VARIABLE_NAMES = ['fullName', 'personId'];

const MAX_VARIABLES_IN_ERROR_MESSAGE = 40;

@Injectable()
export class CampaignVariableService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getPersonCampaignVariables(
    workspaceId: string,
  ): Promise<PersonCampaignVariables> {
    const fields = await this.getPersonFields(workspaceId);
    const definitions = listCampaignVariablesForFields(fields);
    const knownVariableNames = new Set<string>([
      ...definitions.map((definition) => definition.name),
      ...COMPUTED_VARIABLE_NAMES,
    ]);

    return { definitions, knownVariableNames };
  }

  async assertKnownVariables(
    workspaceId: string,
    usedVariableNames: Iterable<string>,
  ): Promise<void> {
    const { definitions, knownVariableNames } =
      await this.getPersonCampaignVariables(workspaceId);

    const unknownVariables = [...usedVariableNames].filter(
      (variableName) => !knownVariableNames.has(variableName),
    );

    if (unknownVariables.length === 0) {
      return;
    }

    const availableList = [
      ...COMPUTED_VARIABLE_NAMES,
      ...definitions.map((definition) => definition.name),
    ]
      .slice(0, MAX_VARIABLES_IN_ERROR_MESSAGE)
      .join(', ');

    throw new EmailingDomainException(
      `Unknown campaign variables: ${unknownVariables.join(', ')}. ` +
        `Available variables: ${availableList}`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
    );
  }

  async buildVariablesForPerson(
    workspaceId: string,
    person: PersonWorkspaceEntity | null,
  ): Promise<Record<string, string>> {
    const { definitions } = await this.getPersonCampaignVariables(workspaceId);
    const fieldsByName = await this.getPersonFieldsByName(workspaceId);

    const variables: Record<string, string> = {};

    for (const definition of definitions) {
      variables[definition.name] = this.formatValue(
        this.resolveValue(person, definition.name),
        definition,
        fieldsByName.get(definition.fieldName),
      );
    }

    variables.personId = this.stringify(this.resolveValue(person, 'id'));
    variables.fullName = [
      this.stringify(this.resolveValue(person, 'name.firstName')),
      this.stringify(this.resolveValue(person, 'name.lastName')),
    ]
      .filter(Boolean)
      .join(' ');

    return variables;
  }

  private async getPersonFields(
    workspaceId: string,
  ): Promise<FlatFieldMetadata[]> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const personFlatObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person
      ];

    if (!isDefined(personFlatObject)) {
      return [];
    }

    return getFlatFieldsFromFlatObjectMetadata(
      personFlatObject,
      flatFieldMetadataMaps,
    );
  }

  private async getPersonFieldsByName(
    workspaceId: string,
  ): Promise<Map<string, FlatFieldMetadata>> {
    const fields = await this.getPersonFields(workspaceId);

    return new Map(fields.map((field) => [field.name, field]));
  }

  private resolveValue(
    person: PersonWorkspaceEntity | null,
    path: string,
  ): unknown {
    if (!isDefined(person)) {
      return null;
    }

    return path
      .split('.')
      .reduce<unknown>(
        (value, segment) =>
          typeof value === 'object' && value !== null
            ? (value as Record<string, unknown>)[segment]
            : null,
        person,
      );
  }

  private formatValue(
    value: unknown,
    definition: CampaignVariableDefinition,
    field: FlatFieldMetadata | undefined,
  ): string {
    if (!isDefined(value) || value === '') {
      return '';
    }

    switch (definition.fieldType) {
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME: {
        const date = new Date(value as string);

        return Number.isNaN(date.getTime())
          ? this.stringify(value)
          : date.toISOString().slice(0, 10);
      }
      case FieldMetadataType.SELECT:
      case FieldMetadataType.RATING: {
        const option = field?.options?.find(
          (fieldOption) => fieldOption.value === value,
        );

        return option?.label ?? this.stringify(value);
      }
      default:
        return this.stringify(value);
    }
  }

  private stringify(value: unknown): string {
    return isDefined(value) ? String(value) : '';
  }
}
