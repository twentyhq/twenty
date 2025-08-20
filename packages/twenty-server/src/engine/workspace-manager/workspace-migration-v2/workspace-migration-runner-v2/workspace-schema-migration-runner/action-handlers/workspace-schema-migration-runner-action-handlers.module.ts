import { Module } from '@nestjs/common';

import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { FieldCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/field-create-action.service';
import { FieldDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/field-delete-action.service';
import { FieldUpdateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/field-update-action.service';
import { IndexCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/index/services/index-create-action.service';
import { IndexDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/index/services/index-delete-action.service';
import { ObjectCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/object-create-action.service';
import { ObjectDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/object-delete-action.service';
import { ObjectUpdateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/object-update-action.service';

@Module({
  imports: [WorkspaceSchemaManagerModule],
  providers: [
    FieldCreateActionService,
    FieldUpdateActionService,
    FieldDeleteActionService,

    ObjectCreateActionService,
    ObjectUpdateActionService,
    ObjectDeleteActionService,

    IndexCreateActionService,
    IndexDeleteActionService,
  ],
})
export class WorkspaceSchemaMigrationRunnerActionHandlersModule {}
