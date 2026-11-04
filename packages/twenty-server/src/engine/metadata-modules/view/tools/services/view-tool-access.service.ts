import { Injectable } from '@nestjs/common';

import { type ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewAccessService } from 'src/engine/permissions/view/services/view-access.service';
import { ViewEntityLookupService } from 'src/engine/permissions/view/services/view-entity-lookup.service';
import { type ViewChildEntityKind } from 'src/engine/permissions/view/types/view-permissions.type';

type ViewToolCaller = {
  workspaceId: string;
  userWorkspaceId?: string;
  authContext?: WorkspaceAuthContext;
};

// Tools call the view services directly, so they run the endpoint guards' checks here
@Injectable()
export class ViewToolAccessService {
  constructor(
    private readonly viewService: ViewService,
    private readonly viewEntityLookupService: ViewEntityLookupService,
    private readonly viewAccessService: ViewAccessService,
  ) {}

  async assertCanCreateViewOrThrow({
    visibility,
    ...caller
  }: ViewToolCaller & { visibility: ViewVisibility }): Promise<void> {
    await this.viewAccessService.canUserCreateView(visibility, caller);
  }

  async findViewEditableByUserOrThrow({
    viewId,
    nextVisibility,
    ...caller
  }: ViewToolCaller & {
    viewId: string;
    nextVisibility?: ViewVisibility;
  }): Promise<ViewDTO> {
    const view = await this.viewService.findById(viewId, caller.workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        `View with id ${viewId} not found`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.viewAccessService.assertCanModifyView({
      view,
      accessContext: caller,
      nextVisibility,
      // Holding VIEWS does not let an agent change another member's unlisted view
      unlistedViewsOwnerOnly: true,
    });

    return view;
  }

  async findParentViewEditableByUserOrThrow({
    kind,
    entityId,
    ...caller
  }: ViewToolCaller & {
    kind: ViewChildEntityKind;
    entityId: string;
  }): Promise<ViewDTO | null> {
    const viewId =
      await this.viewEntityLookupService.findViewIdByEntityIdAndKind(
        kind,
        entityId,
        caller.workspaceId,
      );

    if (!isDefined(viewId)) {
      return null;
    }

    return this.findViewEditableByUserOrThrow({ viewId, ...caller });
  }
}
