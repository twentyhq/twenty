import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { FieldCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/field-create-action.service';
import { FieldDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/field-delete-action.service';
import { FieldUpdateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/field/services/field-update-action.service';
import { IndexCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/index/services/index-create-action.service';
import { IndexDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/index/services/index-delete-action.service';
import { ObjectCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/object-create-action.service';
import { ObjectDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/object-delete-action.service';
import { ObjectUpdateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/object/services/object-update-action.service';
import { WorkspaceSchemaActionRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/registry/workspace-schema-action-registry.service';
import { WorkspaceSchemaMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/services/workspace-schema-migration-runner.service';

@Module({
  imports: [DiscoveryModule],
  providers: [
    WorkspaceSchemaActionRegistryService,
    WorkspaceSchemaMigrationRunnerService,

    // Field action services
    FieldCreateActionService,
    FieldUpdateActionService,
    FieldDeleteActionService,

    // Object action services
    ObjectCreateActionService,
    ObjectUpdateActionService,
    ObjectDeleteActionService,

    // Index action services
    IndexCreateActionService,
    IndexDeleteActionService,
  ],
  exports: [WorkspaceSchemaMigrationRunnerService],
})
export class WorkspaceSchemaMigrationRunnerModule {}
