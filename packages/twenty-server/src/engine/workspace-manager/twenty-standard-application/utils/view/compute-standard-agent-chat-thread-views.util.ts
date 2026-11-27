import { msg } from '@lingui/core/macro';
import { ViewPresetFilter } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { INBOX_THREAD_LIST_VIEW_SETTINGS } from 'src/engine/workspace-manager/twenty-standard-application/constants/inbox-thread-list-view-settings.constant';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardAgentChatThreadViews = (
  args: Omit<CreateStandardViewArgs<'agentChatThread'>, 'context'>,
): Record<string, FlatView> => {
  return {
    open: createStandardViewFlatMetadata({
      ...args,
      objectName: 'agentChatThread',
      context: {
        viewName: 'open',
        name: i18nLabel(msg({ message: `Open`, context: 'view.name' })),
        ...INBOX_THREAD_LIST_VIEW_SETTINGS,
        key: null,
        position: 0,
        icon: 'IconCircleDashed',
        presetFilter: ViewPresetFilter.INBOX_OPEN,
      },
    }),
    needsInput: createStandardViewFlatMetadata({
      ...args,
      objectName: 'agentChatThread',
      context: {
        viewName: 'needsInput',
        name: i18nLabel(msg({ message: `Needs input`, context: 'view.name' })),
        ...INBOX_THREAD_LIST_VIEW_SETTINGS,
        key: null,
        position: 1,
        icon: 'IconHandClick',
        presetFilter: ViewPresetFilter.INBOX_OPEN,
      },
    }),
    mentions: createStandardViewFlatMetadata({
      ...args,
      objectName: 'agentChatThread',
      context: {
        viewName: 'mentions',
        name: i18nLabel(msg({ message: `Mentions`, context: 'view.name' })),
        ...INBOX_THREAD_LIST_VIEW_SETTINGS,
        key: null,
        position: 2,
        icon: 'IconAt',
        presetFilter: ViewPresetFilter.INBOX_MENTIONS,
      },
    }),
    assignedToMe: createStandardViewFlatMetadata({
      ...args,
      objectName: 'agentChatThread',
      context: {
        viewName: 'assignedToMe',
        name: i18nLabel(
          msg({ message: `Assigned to me`, context: 'view.name' }),
        ),
        ...INBOX_THREAD_LIST_VIEW_SETTINGS,
        key: null,
        position: 3,
        icon: 'IconUserCircle',
        presetFilter: ViewPresetFilter.INBOX_OPEN,
      },
    }),
    snoozed: createStandardViewFlatMetadata({
      ...args,
      objectName: 'agentChatThread',
      context: {
        viewName: 'snoozed',
        name: i18nLabel(msg({ message: `Snoozed`, context: 'view.name' })),
        ...INBOX_THREAD_LIST_VIEW_SETTINGS,
        key: null,
        position: 4,
        icon: 'IconZzz',
        presetFilter: ViewPresetFilter.INBOX_SNOOZED,
      },
    }),
    done: createStandardViewFlatMetadata({
      ...args,
      objectName: 'agentChatThread',
      context: {
        viewName: 'done',
        name: i18nLabel(msg({ message: `Done`, context: 'view.name' })),
        ...INBOX_THREAD_LIST_VIEW_SETTINGS,
        key: null,
        position: 5,
        icon: 'IconCircleCheck',
        presetFilter: ViewPresetFilter.INBOX_DONE,
      },
    }),
  };
};
