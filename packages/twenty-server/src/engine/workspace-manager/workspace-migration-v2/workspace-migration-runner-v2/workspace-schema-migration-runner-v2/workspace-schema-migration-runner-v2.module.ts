import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { WorkspaceSchemaActionRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/registry/workspace-schema-action-registry.service';
import { FieldCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/field/actions/field-create-action.service';
import { FieldDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/field/actions/field-delete-action.service';
import { FieldUpdateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/field/actions/field-update-action.service';
import { IndexCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/index/actions/index-create-action.service';
import { IndexDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/index/actions/index-delete-action.service';
import { ObjectCreateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/object/actions/object-create-action.service';
import { ObjectDeleteActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/object/actions/object-delete-action.service';
import { ObjectUpdateActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/entities/object/actions/object-update-action.service';
import { WorkspaceSchemaMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/workspace-schema-migration-runner-v2.service';

@Module({
  imports: [DiscoveryModule],
  providers: [
    WorkspaceSchemaActionRegistryService,
    WorkspaceSchemaMigrationRunnerV2Service,

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
  exports: [WorkspaceSchemaMigrationRunnerV2Service],
})
export class WorkspaceSchemaMigrationRunnerV2Module {}
