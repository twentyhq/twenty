import { Injectable } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  listTranslatablePropertyPathValues,
  NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
} from 'twenty-shared/i18n';
import { APP_LOCALES } from 'twenty-shared/translations';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  MetadataTranslationDTO,
  MetadataTranslationProvenance,
} from 'src/engine/metadata-modules/metadata-translation/dtos/metadata-translation.dto';
import { type MetadataTranslationsInput } from 'src/engine/metadata-modules/metadata-translation/dtos/metadata-translations.input';
import {
  readOverrideTranslation,
  resolveEffectiveEntityPropertyByName,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

type TranslatableFlatEntity = FlatObjectMetadata | FlatFieldMetadata;

type TranslatableEntity = {
  recordId: string;
  objectMetadataId: string | null;
  applicationId: string | undefined;
} & (
  | { metadataName: 'objectMetadata'; entity: FlatObjectMetadata }
  | { metadataName: 'fieldMetadata'; entity: FlatFieldMetadata }
);

const readStringProperty = (
  entity: TranslatableFlatEntity,
  property: string,
): string => {
  const value = (entity as Record<string, unknown>)[property];

  return typeof value === 'string' ? value : '';
};

const resolveProvenance = ({
  workspaceTranslation,
  value,
  canonicalValue,
}: {
  workspaceTranslation: string | undefined;
  value: string;
  canonicalValue: string;
}): MetadataTranslationProvenance => {
  if (isDefined(workspaceTranslation)) {
    return MetadataTranslationProvenance.WORKSPACE;
  }

  if (value !== canonicalValue) {
    return MetadataTranslationProvenance.SHIPPED;
  }

  return MetadataTranslationProvenance.INHERITED;
};

const getSourceValueByProperty = ({
  translatableEntity,
  isLocaleScoped,
}: {
  translatableEntity: TranslatableEntity;
  isLocaleScoped: boolean;
}): [string, string][] => {
  const { metadataName, entity } = translatableEntity;
  const propertySourceValues: [string, string][] = (
    ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? []
  ).map((property) => [property, readStringProperty(entity, property)]);

  if (
    translatableEntity.metadataName !== 'fieldMetadata' ||
    !isLocaleScoped ||
    !isFieldMetadataSelectKind(translatableEntity.entity.type)
  ) {
    return propertySourceValues;
  }

  return [
    ...propertySourceValues,
    ...Object.keys(
      NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.fieldMetadata,
    ).flatMap((pattern) =>
      listTranslatablePropertyPathValues({
        pattern,
        value: translatableEntity.entity,
      }).flatMap(({ property, value }): [string, string][] =>
        isString(value) ? [[property, value]] : [],
      ),
    ),
  ];
};

@Injectable()
export class MetadataTranslationService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  async findMetadataTranslations({
    input,
    workspaceId,
  }: {
    input: MetadataTranslationsInput;
    workspaceId: string;
  }): Promise<MetadataTranslationDTO[]> {
    const translatableEntity = await this.findTranslatableEntity({
      input,
      workspaceId,
    });

    if (!isDefined(translatableEntity)) {
      return [];
    }

    const { metadataName, recordId, objectMetadataId, applicationId, entity } =
      translatableEntity;
    const overrides = entity.overrides;
    const locales = isDefined(input.locale)
      ? [input.locale]
      : (Object.keys(APP_LOCALES) as (keyof typeof APP_LOCALES)[]);

    const translations: MetadataTranslationDTO[] = [];

    for (const locale of locales) {
      const getI18nContext =
        await this.applicationTranslationCatalogService.getI18nContextByApplicationId(
          {
            applicationIds: [applicationId],
            locale,
            workspaceId,
          },
        );

      const i18nContext = getI18nContext(applicationId);

      for (const [property, sourceValue] of getSourceValueByProperty({
        translatableEntity,
        isLocaleScoped: isDefined(input.locale),
      })) {
        const overrideValue = readAuthoredOverrideProperty({
          metadataName,
          overrides,
          path: [property],
          authorContext: i18nContext,
        });
        const canonicalValue = isNonEmptyString(overrideValue)
          ? overrideValue
          : sourceValue;

        if (canonicalValue === '') {
          continue;
        }

        const value = resolveEffectiveEntityPropertyByName({
          metadataName,
          baseValue: sourceValue,
          overrides,
          property,
          i18nContext,
        });

        translations.push({
          metadataName,
          recordId,
          objectMetadataId,
          property,
          locale,
          sourceValue,
          canonicalValue,
          value,
          provenance: resolveProvenance({
            workspaceTranslation: readOverrideTranslation({
              metadataName,
              overrides,
              locale,
              property,
              authorContext: i18nContext,
            }),
            value,
            canonicalValue,
          }),
        });
      }
    }

    return translations;
  }

  private async findTranslatableEntity({
    input,
    workspaceId,
  }: {
    input: MetadataTranslationsInput;
    workspaceId: string;
  }): Promise<TranslatableEntity | null> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    if (isDefined(input.objectMetadataId)) {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: input.objectMetadataId,
      });

      return isDefined(flatObjectMetadata)
        ? {
            metadataName: 'objectMetadata',
            recordId: flatObjectMetadata.id,
            objectMetadataId: null,
            applicationId: flatObjectMetadata.applicationId ?? undefined,
            entity: flatObjectMetadata,
          }
        : null;
    }

    if (isDefined(input.fieldMetadataId)) {
      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: input.fieldMetadataId,
      });

      return isDefined(flatFieldMetadata)
        ? {
            metadataName: 'fieldMetadata',
            recordId: flatFieldMetadata.id,
            objectMetadataId: flatFieldMetadata.objectMetadataId,
            applicationId: flatFieldMetadata.applicationId ?? undefined,
            entity: flatFieldMetadata,
          }
        : null;
    }

    throw new UserInputError(
      'metadataTranslations requires an objectMetadataId or a fieldMetadataId',
    );
  }
}
