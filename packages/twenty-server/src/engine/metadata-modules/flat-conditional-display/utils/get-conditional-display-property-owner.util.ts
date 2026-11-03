import { type ConditionalDisplayContextKeyDefinition } from 'twenty-shared/types';

import { type ConditionalDisplayProperty } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-property.type';

export const getConditionalDisplayPropertyOwner = (
  property: ConditionalDisplayProperty,
): ConditionalDisplayContextKeyDefinition['owner'] => {
  switch (property) {
    case 'conditionalAvailability':
    case 'conditionalPinned':
      return 'engine';
    case 'conditionalDisplay':
      return 'admin';
  }
};
