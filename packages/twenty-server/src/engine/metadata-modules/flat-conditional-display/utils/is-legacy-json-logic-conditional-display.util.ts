import { isPlainObject } from 'twenty-shared/utils';

import { isConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/is-conditional-display.util';

export const isLegacyJsonLogicConditionalDisplay = (
  conditionalDisplay: unknown,
): conditionalDisplay is Record<string, unknown> =>
  isPlainObject(conditionalDisplay) &&
  !isConditionalDisplay(conditionalDisplay);
