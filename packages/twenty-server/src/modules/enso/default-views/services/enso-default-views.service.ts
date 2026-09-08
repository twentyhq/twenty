import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { ensoRoleDefaultViewsKey } from 'src/modules/enso/default-views/constants/enso-default-views.constants';

// Which view a member lands on for a given object.
//
// Twenty has no role dimension on views — a view is workspace-wide or personal
// (`visibility`, `createdByUserWorkspaceId`) and nothing more — so a role
// default has to live outside the view itself. A view carries the columns,
// filters, sorts, grouping and view type, so pointing a role at a view is
// enough to give that role its own list layout without duplicating any of it.
@Injectable()
export class EnsoDefaultViewsService {
  private readonly logger = new Logger(EnsoDefaultViewsService.name);

  constructor(private readonly keyValuePairService: KeyValuePairService) {}

  async getRoleDefaultViews({
    workspaceId,
    roleId,
  }: {
    workspaceId: string;
    roleId: string;
  }): Promise<Record<string, string>> {
    const rows = await this.keyValuePairService.get({
      type: KeyValuePairType.USER_VARIABLE,
      userId: null,
      workspaceId,
      key: ensoRoleDefaultViewsKey(roleId),
    });

    const stored = rows?.[0]?.value;

    if (!isDefined(stored) || typeof stored !== 'object') {
      return {};
    }

    // Stored by a provisioning script, so treat it as untrusted shape rather
    // than assuming: a malformed entry should drop out, not break the sidebar.
    return Object.fromEntries(
      Object.entries(stored as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  }

  async setRoleDefaultViews({
    workspaceId,
    roleId,
    defaultViewIdByObjectMetadataId,
  }: {
    workspaceId: string;
    roleId: string;
    defaultViewIdByObjectMetadataId: Record<string, string>;
  }): Promise<void> {
    await this.keyValuePairService.set({
      userId: null,
      workspaceId,
      key: ensoRoleDefaultViewsKey(roleId),
      value: defaultViewIdByObjectMetadataId,
      type: KeyValuePairType.USER_VARIABLE,
    });

    this.logger.log(
      `role ${roleId} default views set for ${Object.keys(defaultViewIdByObjectMetadataId).length} object(s)`,
    );
  }
}
