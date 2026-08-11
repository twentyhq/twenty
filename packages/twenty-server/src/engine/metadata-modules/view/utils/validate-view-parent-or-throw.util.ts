import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

export const validateViewParentOrThrow = ({
  viewId,
  parentViewId,
  objectMetadataId,
  flatViewMaps,
}: {
  viewId?: string;
  parentViewId: string | null | undefined;
  objectMetadataId: string;
  flatViewMaps: FlatViewMaps;
}): void => {
  if (!isDefined(parentViewId)) {
    return;
  }

  if (parentViewId === viewId) {
    throw new ViewException(
      t`A view cannot be its own parent`,
      ViewExceptionCode.INVALID_VIEW_DATA,
      { userFriendlyMessage: msg`A view cannot be its own parent.` },
    );
  }

  const parentFlatView = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: parentViewId,
    flatEntityMaps: flatViewMaps,
  });

  if (!isDefined(parentFlatView) || isDefined(parentFlatView.deletedAt)) {
    throw new ViewException(
      t`Parent view not found`,
      ViewExceptionCode.VIEW_NOT_FOUND,
      {
        userFriendlyMessage: msg`The stack this view points to no longer exists.`,
      },
    );
  }

  if (parentFlatView.objectMetadataId !== objectMetadataId) {
    throw new ViewException(
      t`Parent view belongs to a different object`,
      ViewExceptionCode.INVALID_VIEW_DATA,
      {
        userFriendlyMessage: msg`A view can only be added to a stack on the same object.`,
      },
    );
  }

  // Stacks are one level deep: the parent must itself be a stack root, and a
  // view that already holds a stack cannot be moved into another one.
  if (isDefined(parentFlatView.parentViewId)) {
    throw new ViewException(
      t`Parent view is already inside a stack`,
      ViewExceptionCode.INVALID_VIEW_DATA,
      {
        userFriendlyMessage: msg`Stacks cannot be nested inside other stacks.`,
      },
    );
  }

  const hasChildren =
    isDefined(viewId) &&
    Object.values(flatViewMaps.byUniversalIdentifier).some(
      (flatView) =>
        isDefined(flatView) &&
        flatView.parentViewId === viewId &&
        !isDefined(flatView.deletedAt),
    );

  if (hasChildren) {
    throw new ViewException(
      t`View already holds a stack`,
      ViewExceptionCode.INVALID_VIEW_DATA,
      {
        userFriendlyMessage: msg`This view already holds a stack, so it cannot be moved into another one.`,
      },
    );
  }
};
