import { type MessageDescriptor } from '@lingui/core';

import {
  type IndustryStandardObjectId,
  type ResolvedIndustryPage,
} from './industry-page-types';
import { INDUSTRY_STANDARD_OBJECT_LABELS } from './industry-standard-object-labels';

const isStandardObjectId = (
  objectId: string,
): objectId is IndustryStandardObjectId =>
  objectId in INDUSTRY_STANDARD_OBJECT_LABELS;

export const getIndustryObjectLabel = (
  page: ResolvedIndustryPage,
  objectId: string,
): MessageDescriptor | undefined =>
  isStandardObjectId(objectId)
    ? INDUSTRY_STANDARD_OBJECT_LABELS[objectId]
    : page.dataModel.objects.find((object) => object.id === objectId)?.label;
