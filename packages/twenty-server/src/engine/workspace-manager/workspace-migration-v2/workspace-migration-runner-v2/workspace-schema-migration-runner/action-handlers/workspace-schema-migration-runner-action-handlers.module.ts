import { Module } from '@nestjs/common';

import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { CreateFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/create-field-action-handler.service';
import { DeleteFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/delete-field-action-handler.service';
import { UpdateFieldActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/update-field-action-handler.service';
import { CreateIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/index/services/create-index-action-handler.service';
import { DeleteIndexActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/index/services/delete-index-action-handler.service';
import { CreateObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/create-object-action-handler.service';
import { DeleteObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/delete-object-action-handler.service';
import { UpdateObjectActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/update-object-action-handler.service';

@Module({
  imports: [WorkspaceSchemaManagerModule],
  providers: [
    CreateFieldActionHandlerService,
    UpdateFieldActionHandlerService,
    DeleteFieldActionHandlerService,

    CreateObjectActionHandlerService,
    UpdateObjectActionHandlerService,
    DeleteObjectActionHandlerService,

    CreateIndexActionHandlerService,
    DeleteIndexActionHandlerService,
  ],
})
export class WorkspaceSchemaMigrationRunnerActionHandlersModule {}
