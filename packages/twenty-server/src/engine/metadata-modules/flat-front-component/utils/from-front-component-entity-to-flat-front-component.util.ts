import { isDefined } from 'twenty-shared/utils';

import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { fromFrontComponentWidgetAvailabilityToUniversalWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-widget-availability-to-universal-widget-availability.util';
import { DEFAULT_FRONT_COMPONENT_WIDGET_AVAILABILITY } from 'src/engine/metadata-modules/front-component/constants/default-front-component-widget-availability.constant';
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

  const universalWidgetAvailability = isDefined(
    frontComponentEntity.widgetAvailability,
  )
    ? fromFrontComponentWidgetAvailabilityToUniversalWidgetAvailability({
        widgetAvailability: frontComponentEntity.widgetAvailability,
        objectMetadataUniversalIdentifierById,
      })
    : DEFAULT_FRONT_COMPONENT_WIDGET_AVAILABILITY;

  return {
    ...frontComponentScalarEntity,
    ...relationUniversalIdentifiers,
    universalWidgetAvailability,
  };
};
