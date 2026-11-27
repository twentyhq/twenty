import { msg, t } from '@lingui/core/macro';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatViewTypeIsNotInbox = ({
  type,
  universalOverrides,
}: Partial<
  Pick<UniversalFlatView, 'type' | 'universalOverrides'>
>): FlatEntityValidationError[] => {
  const overriddenViewTypes = Object.values(universalOverrides ?? {})
    .filter(isDefined)
    .map((authoredOverrides) => authoredOverrides.type);

  if (![type, ...overriddenViewTypes].includes(ViewType.INBOX)) {
    return [];
  }

  return [
    {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Inbox view type is no longer available`,
      userFriendlyMessage: msg`This view type is no longer available`,
    },
  ];
};
