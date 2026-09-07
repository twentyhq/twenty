import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
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
} from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

type TranslatableFlatEntity = FlatObjectMetadata | FlatFieldMetadata;

type TranslatableEntity = {
  metadataName: 'objectMetadata' | 'fieldMetadata';
  recordId: string;
  objectMetadataId: string | null;
  applicationId: string | undefined;
  entity: TranslatableFlatEntity;
};

// The registry decides which property to read, so this is where a dynamic
// name meets the concrete entity type.
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

@Injectable()
export class MetadataTranslationService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
    private readonly i18nService: I18nService,
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
      const { standardApplicationId, catalogByApplicationId } =
        await this.applicationTranslationCatalogService.getCatalogs({
          applicationIds: [applicationId],
          locale,
          workspaceId,
        });
      const i18nInstance = this.i18nService.getI18nInstance(locale);

      for (const property of ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[
        metadataName
      ] ?? []) {
        const sourceValue = readStringProperty(entity, property);
        const overrideValue = (overrides as Record<string, unknown> | null)?.[
          property
        ];
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
          i18nContext: {
            locale,
            i18nInstance,
            isStandardApp: applicationId === standardApplicationId,
            applicationCatalog: isDefined(applicationId)
              ? catalogByApplicationId.get(applicationId)
              : undefined,
          },
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
              overrides,
              locale,
              property,
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
