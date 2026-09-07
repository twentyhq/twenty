import { Module } from '@nestjs/common';

import { EnsoViewerScopeModule } from 'src/modules/enso/record-visibility/enso-viewer-scope.module';
import { EnsoLeadLookupResolver } from 'src/modules/enso/record-lookup/resolvers/enso-lead-lookup.resolver';
import { EnsoLeadLookupService } from 'src/modules/enso/record-lookup/services/enso-lead-lookup.service';
import { EnsoPostHogService } from 'src/modules/enso/routing-availability/services/enso-posthog.service';

// Imported by CoreEngineModule, not ModulesModule: a @MetadataResolver only
// reaches the metadata GraphQL schema from the CoreEngineModule graph, and a
// resolver in the wrong graph fails silently. See TelephonyOutboundModule.
//
// GlobalWorkspaceOrmManager and the cache storage providers are global, so
// neither needs importing here.
@Module({
  imports: [EnsoViewerScopeModule],
  providers: [
    EnsoLeadLookupResolver,
    EnsoLeadLookupService,
    EnsoPostHogService,
  ],
})
export class EnsoLeadLookupModule {}
