import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  INITIAL_OBJECT_VIEW_DEFAULT,
  INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/engine/metadata-modules/view/constants/initial-object-view-defaults.constant';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type UpdateInputFlatView = Pick<
  UniversalFlatView,
  'type' | 'position' | 'icon' | 'deletedAt'
>;

export const computeInitialObjectViewDefaultUpdates = <
  TFlatView extends UpdateInputFlatView,
>({
  flatViewMaps,
  initialViewApplicationUniversalIdentifier,
}: {
  flatViewMaps: {
    byUniversalIdentifier: Record<string, TFlatView | undefined>;
  };
  initialViewApplicationUniversalIdentifier: string;
}): TFlatView[] =>
  [...INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER].reduce<
    TFlatView[]
  >((accumulator, [objectUniversalIdentifier, initialObjectViewDefault]) => {
    const flatView =
      flatViewMaps.byUniversalIdentifier[
        getInitialObjectViewUniversalIdentifier({
          viewApplicationUniversalIdentifier:
            initialViewApplicationUniversalIdentifier,
          objectUniversalIdentifier,
        })
      ];

    if (!isDefined(flatView) || isDefined(flatView.deletedAt)) {
      return accumulator;
    }

    const targetIcon = VIEW_TYPE_DEFAULT_ICONS[initialObjectViewDefault.type];

    const isAlreadyAtTarget =
      flatView.type === initialObjectViewDefault.type &&
      flatView.position === initialObjectViewDefault.position &&
      flatView.icon === targetIcon;

    const holdsSeedDefaults =
      flatView.type === INITIAL_OBJECT_VIEW_DEFAULT.type &&
      flatView.position === INITIAL_OBJECT_VIEW_DEFAULT.position &&
      flatView.icon ===
        VIEW_TYPE_DEFAULT_ICONS[INITIAL_OBJECT_VIEW_DEFAULT.type];

    if (isAlreadyAtTarget || !holdsSeedDefaults) {
      return accumulator;
    }

    accumulator.push({
      ...flatView,
      type: initialObjectViewDefault.type,
      position: initialObjectViewDefault.position,
      icon: targetIcon,
    });

    return accumulator;
  }, []);
