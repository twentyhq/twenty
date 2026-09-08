import { Module } from '@nestjs/common';

import { EnsoPostHogService } from 'src/modules/enso/routing-availability/services/enso-posthog.service';
import { RoutingAvailabilityAuditService } from 'src/modules/enso/routing-availability/services/routing-availability-audit.service';
import { RoutingAvailabilitySelfService } from 'src/modules/enso/routing-availability/services/routing-availability-self.service';
import { RoutingAvailabilityResolver } from 'src/modules/enso/routing-availability/resolvers/routing-availability.resolver';

// Kept SEPARATE from RoutingAvailabilityModule, which holds the query hook and
// is imported by ModulesModule. A @MetadataResolver only reaches the metadata
// GraphQL schema from the CoreEngineModule graph, and a resolver in the wrong
// graph fails silently. See TelephonyOutboundModule.
@Module({
  providers: [
    RoutingAvailabilityResolver,
    RoutingAvailabilitySelfService,
    RoutingAvailabilityAuditService,
    EnsoPostHogService,
  ],
})
export class EnsoRoutingAvailabilitySelfModule {}
