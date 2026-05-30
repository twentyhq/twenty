import { Module } from '@nestjs/common';

import { SecondaryOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/secondary-opportunity-rls.pre-query.hook';

// Propel clean-room RLS hooks. AGPL @WorkspaceQueryHook services that inject
// per-tier row filters on the auto-generated query path. Registered as providers
// so the workspace-query-hook explorer auto-discovers them by decorator metadata.
@Module({
  providers: [SecondaryOpportunityRlsPreQueryHook],
})
export class PropelRlsModule {}
