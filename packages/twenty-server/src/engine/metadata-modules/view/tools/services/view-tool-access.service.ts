import { Injectable } from '@nestjs/common';

import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

// Stricter than ViewAccessService: holding VIEWS does not let an agent change another member's unlisted view
@Injectable()
export class ViewToolAccessService {
  constructor(private readonly viewService: ViewService) {}

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
}
