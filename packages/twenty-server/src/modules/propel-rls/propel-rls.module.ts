import { Module } from '@nestjs/common';

import { SecondaryOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/secondary-opportunity-rls.pre-query.hook';
import { SellOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/sell-opportunity-rls.pre-query.hook';
import { OffPlanOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/offplan-opportunity-rls.pre-query.hook';
import { InstitutionalOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/institutional-opportunity-rls.pre-query.hook';
import { RcbiOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/rcbi-opportunity-rls.pre-query.hook';
import { ListingRlsPreQueryHook } from 'src/modules/propel-rls/listing-rls.pre-query.hook';
import { DealRlsPreQueryHook } from 'src/modules/propel-rls/deal-rls.pre-query.hook';
import { OfferRlsPreQueryHook } from 'src/modules/propel-rls/offer-rls.pre-query.hook';
import { HeldMoneyRlsPreQueryHook } from 'src/modules/propel-rls/held-money-rls.pre-query.hook';
import { ChainLinkRlsPreQueryHook } from 'src/modules/propel-rls/chain-link-rls.pre-query.hook';
import { OffPlanMilestoneRlsPreQueryHook } from 'src/modules/propel-rls/offplan-milestone-rls.pre-query.hook';
import { PortalSyncRlsPreQueryHook } from 'src/modules/propel-rls/portal-sync-rls.pre-query.hook';
import { TrakheesiPermitRlsPreQueryHook } from 'src/modules/propel-rls/trakheesi-permit-rls.pre-query.hook';

// Propel clean-room RLS hooks. AGPL @WorkspaceQueryHook services that inject
// per-tier row filters on the auto-generated query path (findMany), keyed off the
// workspaceMember `propelTier` field. NOT derived from the @license Enterprise RLS.
// attributionRollup is intentionally excluded (brokerage-wide metric, not isolated).
@Module({
  providers: [
    SecondaryOpportunityRlsPreQueryHook,
    SellOpportunityRlsPreQueryHook,
    OffPlanOpportunityRlsPreQueryHook,
    InstitutionalOpportunityRlsPreQueryHook,
    RcbiOpportunityRlsPreQueryHook,
    ListingRlsPreQueryHook,
    DealRlsPreQueryHook,
    OfferRlsPreQueryHook,
    HeldMoneyRlsPreQueryHook,
    ChainLinkRlsPreQueryHook,
    OffPlanMilestoneRlsPreQueryHook,
    PortalSyncRlsPreQueryHook,
    TrakheesiPermitRlsPreQueryHook,
  ],
})
export class PropelRlsModule {}
