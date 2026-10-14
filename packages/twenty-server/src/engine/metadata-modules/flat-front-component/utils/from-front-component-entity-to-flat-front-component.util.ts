import { isDefined } from 'twenty-shared/utils';

import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { fromFrontComponentWidgetAvailabilityToUniversalWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-widget-availability-to-universal-widget-availability.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

type FromFrontComponentEntityToFlatFrontComponentArgs =
  FromEntityToFlatEntityArgs<'frontComponent'> & {
    objectMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  };

export const fromFrontComponentEntityToFlatFrontComponent = (
  args: FromFrontComponentEntityToFlatFrontComponentArgs,
): FlatFrontComponent => {
  const {
    entity: frontComponentEntity,
    objectMetadataUniversalIdentifierById,
  } = args;

  const frontComponentScalarEntity = fromEntityToScalarEntity({
    metadataName: 'frontComponent',
    entity: frontComponentEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'frontComponent',
      ...args,
    });

  // The column is not selected until its upgrade step has run, so fall back
  // to its database default instead of exposing a missing non-nullable field
  const widgetAvailability = isDefined(frontComponentEntity.widgetAvailability)
    ? frontComponentEntity.widgetAvailability
    : [];

  return {
    ...frontComponentScalarEntity,
    ...relationUniversalIdentifiers,
    widgetAvailability,
    universalWidgetAvailability:
      fromFrontComponentWidgetAvailabilityToUniversalWidgetAvailability({
        widgetAvailability,
        objectMetadataUniversalIdentifierById,
      }),
  };
};
