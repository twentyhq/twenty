import { type I18n } from '@lingui/core';

import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { type ViewFieldGroupOverrides } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';

export const resolveViewFieldGroupName = ({
  name,
  applicationId,
  twentyStandardApplicationId,
  overrides,
  i18nInstance,
}: {
  name: string;
  applicationId: string;
  twentyStandardApplicationId: string;
  overrides?: ViewFieldGroupOverrides | null;
  i18nInstance: I18n;
}): string => {
  if (applicationId !== twentyStandardApplicationId) {
    return name;
  }

  if (isDefined(overrides?.name)) {
    return name;
  }

  const messageId = generateMessageId(name);
  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return name;
  }

  return translatedMessage;
};
