import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { INBOX_THREAD_LIST_VIEW_SETTINGS } from 'src/engine/workspace-manager/twenty-standard-application/constants/inbox-thread-list-view-settings.constant';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const INBOX_THREAD_LIST_VIEW_UNIVERSAL_PROPERTIES = {
  type: INBOX_THREAD_LIST_VIEW_SETTINGS.type,
  isCompact: INBOX_THREAD_LIST_VIEW_SETTINGS.isCompact,
  listPinnedFieldMetadataUniversalIdentifier:
    STANDARD_OBJECTS.agentChatThread.fields[
      INBOX_THREAD_LIST_VIEW_SETTINGS.listPinnedFieldName
    ].universalIdentifier,
} as const satisfies Pick<
  UniversalFlatView,
  'type' | 'isCompact' | 'listPinnedFieldMetadataUniversalIdentifier'
>;
