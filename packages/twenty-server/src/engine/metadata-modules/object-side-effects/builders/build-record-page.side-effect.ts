import { getRecordPageLayoutUniversalIdentifier } from 'twenty-shared/application';

import { type ObjectSideEffectBuilder } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-builder.type';
import { computeUniversalFlatRecordPageToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-universal-flat-record-page-to-create.util';

export const buildRecordPageSideEffect: ObjectSideEffectBuilder = ({
  object,
  fields,
  context,
}) => {
  const pageLayoutUniversalIdentifier = getRecordPageLayoutUniversalIdentifier({
    applicationUniversalIdentifier: context.flatApplication.universalIdentifier,
    objectUniversalIdentifier: object.universalIdentifier,
  });

  if (
    context.existingPageLayoutUniversalIdentifiers.has(
      pageLayoutUniversalIdentifier,
    )
  ) {
    return {};
  }

  const { view, viewFields, pageLayout, pageLayoutTabs, pageLayoutWidgets } =
    computeUniversalFlatRecordPageToCreate({
      flatObjectMetadata: object,
      objectFlatFieldMetadatas: fields,
      flatApplication: context.flatApplication,
      now: context.now,
    });

  return {
    view: [view],
    viewField: viewFields,
    pageLayout: [pageLayout],
    pageLayoutTab: pageLayoutTabs,
    pageLayoutWidget: pageLayoutWidgets,
  };
};
