import { msg } from '@lingui/core/macro';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const INDEX_VIEW_NAME = i18nLabel(
  msg({ message: `All {objectLabelPlural}`, context: 'view.name' }),
);
