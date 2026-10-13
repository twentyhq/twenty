import { PageLayoutType } from 'twenty-shared/types';

import { type FrontComponentWidgetAvailability } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

export const DEFAULT_FRONT_COMPONENT_WIDGET_AVAILABILITY: FrontComponentWidgetAvailability[] =
  [
    { pageLayoutType: PageLayoutType.RECORD_PAGE },
    { pageLayoutType: PageLayoutType.DASHBOARD },
  ];
