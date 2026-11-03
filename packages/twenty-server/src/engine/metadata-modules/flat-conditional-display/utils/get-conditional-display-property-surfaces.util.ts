import { type ConditionalDisplaySurface } from 'twenty-shared/types';

import { type ConditionalDisplayProperty } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-property.type';

export const getConditionalDisplayPropertySurfaces = (
  property: ConditionalDisplayProperty,
): ConditionalDisplaySurface[] => {
  switch (property) {
    case 'conditionalAvailability':
      return ['commandMenuItem', 'pageLayoutWidget'];
    case 'conditionalPinned':
      return ['commandMenuItem'];
    case 'conditionalDisplay':
      return [
        'pageLayoutWidget',
        'pageLayoutTab',
        'viewField',
        'commandMenuItem',
        'navigationMenuItem',
      ];
  }
};
