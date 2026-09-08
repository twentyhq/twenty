import { Module } from '@nestjs/common';

import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { EnsoDefaultViewsService } from 'src/modules/enso/default-views/services/enso-default-views.service';
import { EnsoViewerScopeResolver } from 'src/modules/enso/record-visibility/resolvers/enso-viewer-scope.resolver';
import { EnsoViewerScopeService } from 'src/modules/enso/record-visibility/services/enso-viewer-scope.service';

// Imported by CoreEngineModule, not ModulesModule: a @MetadataResolver only
// reaches the metadata GraphQL schema from the CoreEngineModule graph, and a
// resolver in the wrong graph fails silently. See TelephonyOutboundModule.
@Module({
  // PermissionsModule is required by SettingsPermissionGuard on the role
  // default-views mutation: that guard is a mixin that injects
  // PermissionsService, and a mixin guard's dependencies must resolve from the
  // module that declares the resolver — Nest cannot reach them otherwise, and
  // the failure is a boot crash, not a runtime error.
  imports: [UserRoleModule, KeyValuePairModule, PermissionsModule],
  providers: [
    EnsoViewerScopeResolver,
    EnsoViewerScopeService,
    EnsoDefaultViewsService,
  ],
  exports: [EnsoViewerScopeService],
})
export class EnsoViewerScopeModule {}
