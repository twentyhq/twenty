import { isString } from '@sniptt/guards';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentDraft } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft.type';

export const buildFrontComponentPreviewContext = (
  draft: Pick<
    FrontComponentDraft,
    | 'pageLayoutType'
    | 'sampleRecords'
    | 'query'
    | 'objectMetadataId'
    | 'objectNamePlural'
  >,
) => {
  const recordId = draft.sampleRecords[0]?.id;

  if (
    draft.pageLayoutType !== PageLayoutType.RECORD_PAGE ||
    !isString(recordId) ||
    !isDefined(draft.objectMetadataId)
  ) {
    return { selectedRecordIds: [], selectedObjectMetadata: null };
  }

  return {
    selectedRecordIds: [recordId],
    selectedObjectMetadata: {
      id: draft.objectMetadataId,
      nameSingular: draft.query.objectName,
      namePlural: draft.objectNamePlural,
    },
  };
};
