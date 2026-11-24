import { isDefined } from 'twenty-shared/utils';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { isViewVisibleToCaller } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-caller.util';

export const isViewAvailableToCaller = (
  flatView: Pick<
    FlatView,
    | 'deletedAt'
    | 'isPrivate'
    | 'createdByUserWorkspaceId'
    | 'overrides'
    | 'applicationUniversalIdentifier'
  >,
): boolean =>
  !isDefined(flatView.deletedAt) && isViewVisibleToCaller({ view: flatView });
