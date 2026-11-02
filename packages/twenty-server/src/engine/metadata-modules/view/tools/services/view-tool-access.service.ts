import { Injectable } from '@nestjs/common';

import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewEntityLookupService } from 'src/engine/permissions/view/services/view-entity-lookup.service';
import { type ViewChildEntityKind } from 'src/engine/permissions/view/types/view-permissions.type';

// Stricter than ViewAccessService: holding VIEWS does not let an agent change another member's unlisted view
@Injectable()
export class ViewToolAccessService {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewEntityLookupService: ViewEntityLookupService,
  ) {}

  async findViewEditableByUserOrThrow({
    viewId,
    workspaceId,
    userWorkspaceId,
    operation,
  }: {
    viewId: string;
    workspaceId: string;
    userWorkspaceId?: string;
    operation: 'update' | 'delete';
  }): Promise<ViewDTO> {
    const view = await this.viewService.findById(viewId, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        `View with id ${viewId} not found`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    if (
      view.visibility === ViewVisibility.UNLISTED &&
      view.createdByUserWorkspaceId !== userWorkspaceId
    ) {
      throw new ViewException(
        `You can only ${operation} your own unlisted views`,
        ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
      );
    }

    return view;
  }

  async findParentViewEditableByUserOrThrow({
    kind,
    entityId,
    workspaceId,
    userWorkspaceId,
  }: {
    kind: ViewChildEntityKind;
    entityId: string;
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<ViewDTO | null> {
    const viewId =
      await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
        kind,
        entityId,
        workspaceId,
      );

    if (!isDefined(viewId)) {
      return null;
    }

    return this.findViewEditableByUserOrThrow({
      viewId,
      workspaceId,
      userWorkspaceId,
      operation: 'update',
    });
  }
}
