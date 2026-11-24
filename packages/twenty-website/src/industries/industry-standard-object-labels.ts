import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type IndustryStandardObjectId } from './industry-page-types';

// Objects every Twenty workspace has: pages reference them without
// declaring them in their data model.
export const INDUSTRY_STANDARD_OBJECT_LABELS: Record<
  IndustryStandardObjectId,
  MessageDescriptor
> = {
  person: msg`People`,
  company: msg`Companies`,
  task: msg`Tasks`,
  note: msg`Notes`,
};
