import { capitalize } from 'twenty-shared/utils';

import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { INBOX_THREAD_VIEW_FIELD_DEFINITIONS } from 'src/engine/workspace-manager/twenty-standard-application/constants/inbox-thread-view-field-definitions.constant';
import { type AllStandardObjectViewName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-view-name.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

type InboxThreadViewName = AllStandardObjectViewName<'agentChatThread'>;

const INBOX_THREAD_VIEW_NAMES = Object.values({
  open: 'open',
  needsInput: 'needsInput',
  mentions: 'mentions',
  assignedToMe: 'assignedToMe',
  snoozed: 'snoozed',
  done: 'done',
} as const satisfies {
  [ViewName in InboxThreadViewName]: ViewName;
});

export const computeStandardAgentChatThreadViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'agentChatThread'>, 'context'>,
): Record<string, FlatViewField> =>
  Object.fromEntries(
    INBOX_THREAD_VIEW_NAMES.flatMap((viewName) =>
      INBOX_THREAD_VIEW_FIELD_DEFINITIONS.map(
        ({ fieldName, isVisible }, position) => [
          `${viewName}${capitalize(fieldName)}`,
          createStandardViewFieldFlatMetadata({
            ...args,
            objectName: 'agentChatThread',
            context: {
              viewName,
              viewFieldName: fieldName,
              fieldName,
              position,
              isVisible,
              size: DEFAULT_VIEW_FIELD_SIZE,
            },
          }),
        ],
      ),
    ),
  );
