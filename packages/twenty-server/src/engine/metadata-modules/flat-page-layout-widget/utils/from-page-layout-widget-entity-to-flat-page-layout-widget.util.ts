import { isDefined } from 'twenty-shared/utils';

import { pickScalarPropertiesFromEntity } from 'src/engine/metadata-modules/flat-entity/utils/pick-scalar-properties-from-entity.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { fromPageLayoutWidgetOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-overrides-to-universal-overrides.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

type FromPageLayoutWidgetEntityToFlatPageLayoutWidgetArgs =
  FromEntityToFlatEntityArgs<'pageLayoutWidget'> & {
    fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
    frontComponentUniversalIdentifierById?: Partial<Record<string, string>>;
    viewFieldGroupUniversalIdentifierById?: Partial<Record<string, string>>;
    viewUniversalIdentifierById?: Partial<Record<string, string>>;
  };

export const fromPageLayoutWidgetEntityToFlatPageLayoutWidget = (
  args: FromPageLayoutWidgetEntityToFlatPageLayoutWidgetArgs,
): FlatPageLayoutWidget => {
  const {
    entity: pageLayoutWidgetEntity,
    pageLayoutTabIdToUniversalIdentifierMap,
    fieldMetadataUniversalIdentifierById,
    frontComponentUniversalIdentifierById,
    viewFieldGroupUniversalIdentifierById,
    viewUniversalIdentifierById,
  } = args;

  const pageLayoutWidgetEntityWithoutRelations = pickScalarPropertiesFromEntity(
    {
      metadataName: 'pageLayoutWidget',
      entity: pageLayoutWidgetEntity,
    },
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'pageLayoutWidget',
      ...args,
    });

  const configurationWithUniversalIdentifiers =
    fromPageLayoutWidgetConfigurationToUniversalConfiguration({
      configuration: pageLayoutWidgetEntityWithoutRelations.configuration,
      fieldMetadataUniversalIdentifierById,
      frontComponentUniversalIdentifierById,
      viewFieldGroupUniversalIdentifierById,
      viewUniversalIdentifierById,
    });

  const pageLayoutTabUniversalIdentifierById = Object.fromEntries(
    pageLayoutTabIdToUniversalIdentifierMap.entries(),
  );

  const universalOverrides = isDefined(pageLayoutWidgetEntity.overrides)
    ? fromPageLayoutWidgetOverridesToUniversalOverrides({
        overrides: pageLayoutWidgetEntity.overrides,
        pageLayoutTabUniversalIdentifierById,
        shouldThrowOnMissingIdentifier: false,
      })
    : null;

  return {
    ...pageLayoutWidgetEntityWithoutRelations,
    createdAt: pageLayoutWidgetEntity.createdAt.toISOString(),
    updatedAt: pageLayoutWidgetEntity.updatedAt.toISOString(),
    deletedAt: pageLayoutWidgetEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      pageLayoutWidgetEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
    universalConfiguration: configurationWithUniversalIdentifiers,
    universalOverrides,
  };
};
