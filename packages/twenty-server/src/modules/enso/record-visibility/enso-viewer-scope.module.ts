import { Module } from '@nestjs/common';

import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { EnsoViewerScopeResolver } from 'src/modules/enso/record-visibility/resolvers/enso-viewer-scope.resolver';
import { EnsoViewerScopeService } from 'src/modules/enso/record-visibility/services/enso-viewer-scope.service';

// Imported by CoreEngineModule, not ModulesModule: a @MetadataResolver only
// reaches the metadata GraphQL schema from the CoreEngineModule graph, and a
// resolver in the wrong graph fails silently. See TelephonyOutboundModule.
@Module({
  imports: [UserRoleModule],
  providers: [EnsoViewerScopeResolver, EnsoViewerScopeService],
  exports: [EnsoViewerScopeService],
})
export class EnsoViewerScopeModule {}
