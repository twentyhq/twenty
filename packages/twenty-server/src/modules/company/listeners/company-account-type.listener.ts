import { Injectable } from '@nestjs/common';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

const PARENT_SUFFIX = ' (Parent)';

// accountType is a custom field not present on the TypeScript entity type.
type CompanyWithAccountType = CompanyWorkspaceEntity & {
  accountType?: string | null;
};

@Injectable()
export class CompanyAccountTypeListener {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @OnDatabaseBatchEvent('company', DatabaseEventAction.UPDATED)
  async handleUpdated(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<CompanyWorkspaceEntity>
    >,
  ) {
    const workspaceId = payload.workspaceId;
    const authContext = buildSystemAuthContext(workspaceId);

    // Use updatedFields (pre-computed by the event system) to check if accountType changed.
    const relevantEvents = payload.events.filter((event) =>
      event.properties.updatedFields.includes('accountType'),
    );

    if (relevantEvents.length === 0) return;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const companyRepository =
        await this.globalWorkspaceOrmManager.getRepository<CompanyWorkspaceEntity>(
          workspaceId,
          'company',
        );

      for (const event of relevantEvents) {
        const after = event.properties.after as CompanyWithAccountType;

        const newAccountType = after.accountType;
        // Use after.name as base so if the user also renamed the company in the same
        // save, we apply the suffix to their intended name rather than the old name.
        const currentName = after.name ?? '';
        const isNowParent = newAccountType === 'PARENT';
        const alreadyHasSuffix = currentName.endsWith(PARENT_SUFFIX);

        let newName: string | null = null;

        if (isNowParent && !alreadyHasSuffix) {
          newName = currentName + PARENT_SUFFIX;
        } else if (!isNowParent && alreadyHasSuffix) {
          newName = currentName.slice(0, -PARENT_SUFFIX.length);
        }

        if (newName !== null) {
          await companyRepository.update(event.recordId, { name: newName });
        }
      }
    }, authContext);
  }
}
