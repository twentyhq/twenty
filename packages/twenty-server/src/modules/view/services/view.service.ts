import { Injectable, Logger } from '@nestjs/common';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class ViewService {
  private readonly logger = new Logger(ViewService.name);
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resetKanbanAggregateOperationByFieldMetadataId({
    workspaceId,
    fieldMetadataId,
  }: {
    workspaceId: string;
    fieldMetadataId: string;
  }) {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'view',
      );

    await viewRepository.update(
      { kanbanAggregateOperationFieldMetadataId: fieldMetadataId },
      {
        kanbanAggregateOperationFieldMetadataId: null,
        kanbanAggregateOperation: AggregateOperations.COUNT,
      },
    );
  }
}
