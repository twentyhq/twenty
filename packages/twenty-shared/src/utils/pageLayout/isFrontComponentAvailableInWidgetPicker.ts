import { isDefined } from '@/utils/validation/isDefined';

import { type PageLayoutType } from '@/types';

export const isFrontComponentAvailableInWidgetPicker = ({
  frontComponent,
  pageLayoutType,
  objectMetadataId,
}: {
  frontComponent: {
    isHeadless: boolean;
    widgetAvailability: {
      pageLayoutType: `${PageLayoutType}`;
      objectMetadataId?: string | null;
    }[];
  };
  pageLayoutType: `${PageLayoutType}`;
  objectMetadataId?: string | null;
}): boolean => {
  return (
    !frontComponent.isHeadless &&
    frontComponent.widgetAvailability.some(
      (availability) =>
        availability.pageLayoutType === pageLayoutType &&
        (!isDefined(availability.objectMetadataId) ||
          availability.objectMetadataId === objectMetadataId),
    )
  );
};
