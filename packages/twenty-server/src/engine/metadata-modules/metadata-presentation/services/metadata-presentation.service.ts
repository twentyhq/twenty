import { Injectable } from '@nestjs/common';

import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { resolveEffectiveEntityPropertyByName } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

type PresentableEntity = {
  applicationId?: string | null;
  overrides?: unknown;
};

// The registry decides which property to read, so this is the one place a
// dynamic property name meets a concrete entity. Entities are classes, so an
// index signature on PresentableEntity would exclude every caller.
const readProperty = (entity: PresentableEntity, property: string): unknown =>
  (entity as unknown as Record<string, unknown>)[property];

// The GraphQL resolvers resolve labels through per-request dataloaders, which
// only exist inside a GraphQL context. REST controllers need the same answer,
// so the batching lives here instead: one catalog fetch per application, for
// however many entities the caller is presenting.
@Injectable()
export class MetadataPresentationService {
  constructor(
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
    private readonly i18nService: I18nService,
  ) {}

  async resolvePresentedProperties<TEntity extends PresentableEntity>({
    metadataName,
    entities,
    locale,
    workspaceId,
  }: {
    metadataName: TranslatableMetadataName;
    entities: TEntity[];
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<Record<string, string>[]> {
    if (entities.length === 0) {
      return [];
    }

    const { standardApplicationId, catalogByApplicationId } =
      await this.applicationTranslationCatalogService.getCatalogs({
        applicationIds: [
          ...new Set(
            entities.map((entity) => entity.applicationId ?? undefined),
          ),
        ],
        locale: locale ?? SOURCE_LOCALE,
        workspaceId,
      });
    const i18nInstance = this.i18nService.getI18nInstance(
      locale ?? SOURCE_LOCALE,
    );
    const translatableProperties =
      ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [];

    return entities.map((entity) => {
      const applicationId = entity.applicationId ?? undefined;
      const i18nContext = {
        locale,
        i18nInstance,
        isStandardApp: applicationId === standardApplicationId,
        applicationCatalog: isDefined(applicationId)
          ? catalogByApplicationId.get(applicationId)
          : undefined,
      };

      return Object.fromEntries(
        translatableProperties
          .map((property) => {
            const baseValue = readProperty(entity, property);

            return isDefined(baseValue)
              ? [
                  property,
                  resolveEffectiveEntityPropertyByName({
                    metadataName,
                    baseValue,
                    overrides: entity.overrides,
                    property,
                    i18nContext,
                  }),
                ]
              : undefined;
          })
          .filter(isDefined),
      );
    });
  }
}
