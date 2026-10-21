import { type ConditionalDisplay } from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { normalizeConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/normalize-conditional-display.util';

export const getConditionalDisplayUpdate = ({
  inputField,
  existingField,
}: {
  inputField: { conditionalDisplay?: ConditionalDisplay | null };
  existingField: { conditionalDisplay: ConditionalDisplay | null };
}): {
  hasChanged: boolean;
  editableProperties: { conditionalDisplay?: ConditionalDisplay | null };
} => {
  if (inputField.conditionalDisplay === undefined) {
    return { hasChanged: false, editableProperties: {} };
  }

  const conditionalDisplay = normalizeConditionalDisplay(
    inputField.conditionalDisplay,
  );

  return {
    hasChanged: !fastDeepEqual(
      existingField.conditionalDisplay,
      conditionalDisplay,
    ),
    editableProperties: { conditionalDisplay },
  };
};
