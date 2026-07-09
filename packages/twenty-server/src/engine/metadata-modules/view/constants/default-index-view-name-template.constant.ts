import { msg } from '@lingui/core/macro';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const DEFAULT_INDEX_VIEW_NAME_TEMPLATE = i18nLabel(
  msg`All {objectLabelPlural}`,
);
