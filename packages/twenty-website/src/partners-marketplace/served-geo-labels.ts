import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type ServedGeo } from './served-geos';

export const SERVED_GEO_LABELS: Record<ServedGeo, MessageDescriptor> = {
  EUROPE: msg`Europe`,
  US: msg`US`,
  LATAM: msg`LATAM`,
  MENA: msg`MENA`,
  APAC: msg`APAC`,
  AFRICA: msg`Africa`,
};
