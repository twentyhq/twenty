import { getIndexViewUniversalIdentifier } from 'twenty-shared/application';

import { type ObjectSideEffectBuilder } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-builder.type';
import { computeFlatIndexViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-index-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';

export const buildIndexViewSideEffect: ObjectSideEffectBuilder = ({
  object,
  fields,
  context,
}) => {
  const indexViewUniversalIdentifier = getIndexViewUniversalIdentifier({
    applicationUniversalIdentifier: context.flatApplication.universalIdentifier,
    objectUniversalIdentifier: object.universalIdentifier,
  });

  if (
    context.existingViewUniversalIdentifiers.has(indexViewUniversalIdentifier)
  ) {
    return {};
  }

  const view = computeFlatIndexViewToCreate({
    objectMetadata: object,
    flatApplication: context.flatApplication,
  });

  const viewFields = computeFlatViewFieldsToCreate({
    flatApplication: context.flatApplication,
    objectFlatFieldMetadatas: fields,
    labelIdentifierFieldMetadataUniversalIdentifier:
      object.labelIdentifierFieldMetadataUniversalIdentifier,
    viewUniversalIdentifier: view.universalIdentifier,
  });

  return { view: [view], viewField: viewFields };
};
