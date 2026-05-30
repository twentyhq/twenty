import { Module } from '@nestjs/common';

import { SecondaryOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/secondary-opportunity-rls.pre-query.hook';
import { SecondaryOpportunityFindOneRlsPreQueryHook } from 'src/modules/propel-rls/secondary-opportunity-find-one-rls.pre-query.hook';
import { SecondaryOpportunityGroupByRlsPreQueryHook } from 'src/modules/propel-rls/secondary-opportunity-group-by-rls.pre-query.hook';
import { SellOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/sell-opportunity-rls.pre-query.hook';
import { SellOpportunityFindOneRlsPreQueryHook } from 'src/modules/propel-rls/sell-opportunity-find-one-rls.pre-query.hook';
import { SellOpportunityGroupByRlsPreQueryHook } from 'src/modules/propel-rls/sell-opportunity-group-by-rls.pre-query.hook';
import { OffPlanOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/offplan-opportunity-rls.pre-query.hook';
import { OffPlanOpportunityFindOneRlsPreQueryHook } from 'src/modules/propel-rls/offplan-opportunity-find-one-rls.pre-query.hook';
import { OffPlanOpportunityGroupByRlsPreQueryHook } from 'src/modules/propel-rls/offplan-opportunity-group-by-rls.pre-query.hook';
import { InstitutionalOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/institutional-opportunity-rls.pre-query.hook';
import { InstitutionalOpportunityFindOneRlsPreQueryHook } from 'src/modules/propel-rls/institutional-opportunity-find-one-rls.pre-query.hook';
import { InstitutionalOpportunityGroupByRlsPreQueryHook } from 'src/modules/propel-rls/institutional-opportunity-group-by-rls.pre-query.hook';
import { RcbiOpportunityRlsPreQueryHook } from 'src/modules/propel-rls/rcbi-opportunity-rls.pre-query.hook';
import { RcbiOpportunityFindOneRlsPreQueryHook } from 'src/modules/propel-rls/rcbi-opportunity-find-one-rls.pre-query.hook';
import { RcbiOpportunityGroupByRlsPreQueryHook } from 'src/modules/propel-rls/rcbi-opportunity-group-by-rls.pre-query.hook';
import { ListingRlsPreQueryHook } from 'src/modules/propel-rls/listing-rls.pre-query.hook';
import { ListingFindOneRlsPreQueryHook } from 'src/modules/propel-rls/listing-find-one-rls.pre-query.hook';
import { ListingGroupByRlsPreQueryHook } from 'src/modules/propel-rls/listing-group-by-rls.pre-query.hook';
import { DealRlsPreQueryHook } from 'src/modules/propel-rls/deal-rls.pre-query.hook';
import { DealFindOneRlsPreQueryHook } from 'src/modules/propel-rls/deal-find-one-rls.pre-query.hook';
import { DealGroupByRlsPreQueryHook } from 'src/modules/propel-rls/deal-group-by-rls.pre-query.hook';
import { OfferRlsPreQueryHook } from 'src/modules/propel-rls/offer-rls.pre-query.hook';
import { OfferFindOneRlsPreQueryHook } from 'src/modules/propel-rls/offer-find-one-rls.pre-query.hook';
import { OfferGroupByRlsPreQueryHook } from 'src/modules/propel-rls/offer-group-by-rls.pre-query.hook';
import { HeldMoneyRlsPreQueryHook } from 'src/modules/propel-rls/held-money-rls.pre-query.hook';
import { HeldMoneyFindOneRlsPreQueryHook } from 'src/modules/propel-rls/held-money-find-one-rls.pre-query.hook';
import { HeldMoneyGroupByRlsPreQueryHook } from 'src/modules/propel-rls/held-money-group-by-rls.pre-query.hook';
import { ChainLinkRlsPreQueryHook } from 'src/modules/propel-rls/chain-link-rls.pre-query.hook';
import { ChainLinkFindOneRlsPreQueryHook } from 'src/modules/propel-rls/chain-link-find-one-rls.pre-query.hook';
import { ChainLinkGroupByRlsPreQueryHook } from 'src/modules/propel-rls/chain-link-group-by-rls.pre-query.hook';
import { OffPlanMilestoneRlsPreQueryHook } from 'src/modules/propel-rls/offplan-milestone-rls.pre-query.hook';
import { OffPlanMilestoneFindOneRlsPreQueryHook } from 'src/modules/propel-rls/offplan-milestone-find-one-rls.pre-query.hook';
import { OffPlanMilestoneGroupByRlsPreQueryHook } from 'src/modules/propel-rls/offplan-milestone-group-by-rls.pre-query.hook';
import { PortalSyncRlsPreQueryHook } from 'src/modules/propel-rls/portal-sync-rls.pre-query.hook';
import { PortalSyncFindOneRlsPreQueryHook } from 'src/modules/propel-rls/portal-sync-find-one-rls.pre-query.hook';
import { PortalSyncGroupByRlsPreQueryHook } from 'src/modules/propel-rls/portal-sync-group-by-rls.pre-query.hook';
import { TrakheesiPermitRlsPreQueryHook } from 'src/modules/propel-rls/trakheesi-permit-rls.pre-query.hook';
import { TrakheesiPermitFindOneRlsPreQueryHook } from 'src/modules/propel-rls/trakheesi-permit-find-one-rls.pre-query.hook';
import { TrakheesiPermitGroupByRlsPreQueryHook } from 'src/modules/propel-rls/trakheesi-permit-group-by-rls.pre-query.hook';

// Propel clean-room RLS hooks. AGPL @WorkspaceQueryHook services that inject
// per-tier row filters on the auto-generated READ paths (findMany, findOne,
// groupBy), keyed off the workspaceMember `propelTier` field. NOT derived from the
// @license Enterprise RLS. attributionRollup is intentionally excluded (brokerage-
// wide metric). findDuplicates is not hooked (no filter arg — narrow surface).
@Module({
  providers: [
    SecondaryOpportunityRlsPreQueryHook,
    SecondaryOpportunityFindOneRlsPreQueryHook,
    SecondaryOpportunityGroupByRlsPreQueryHook,
    SellOpportunityRlsPreQueryHook,
    SellOpportunityFindOneRlsPreQueryHook,
    SellOpportunityGroupByRlsPreQueryHook,
    OffPlanOpportunityRlsPreQueryHook,
    OffPlanOpportunityFindOneRlsPreQueryHook,
    OffPlanOpportunityGroupByRlsPreQueryHook,
    InstitutionalOpportunityRlsPreQueryHook,
    InstitutionalOpportunityFindOneRlsPreQueryHook,
    InstitutionalOpportunityGroupByRlsPreQueryHook,
    RcbiOpportunityRlsPreQueryHook,
    RcbiOpportunityFindOneRlsPreQueryHook,
    RcbiOpportunityGroupByRlsPreQueryHook,
    ListingRlsPreQueryHook,
    ListingFindOneRlsPreQueryHook,
    ListingGroupByRlsPreQueryHook,
    DealRlsPreQueryHook,
    DealFindOneRlsPreQueryHook,
    DealGroupByRlsPreQueryHook,
    OfferRlsPreQueryHook,
    OfferFindOneRlsPreQueryHook,
    OfferGroupByRlsPreQueryHook,
    HeldMoneyRlsPreQueryHook,
    HeldMoneyFindOneRlsPreQueryHook,
    HeldMoneyGroupByRlsPreQueryHook,
    ChainLinkRlsPreQueryHook,
    ChainLinkFindOneRlsPreQueryHook,
    ChainLinkGroupByRlsPreQueryHook,
    OffPlanMilestoneRlsPreQueryHook,
    OffPlanMilestoneFindOneRlsPreQueryHook,
    OffPlanMilestoneGroupByRlsPreQueryHook,
    PortalSyncRlsPreQueryHook,
    PortalSyncFindOneRlsPreQueryHook,
    PortalSyncGroupByRlsPreQueryHook,
    TrakheesiPermitRlsPreQueryHook,
    TrakheesiPermitFindOneRlsPreQueryHook,
    TrakheesiPermitGroupByRlsPreQueryHook,
  ],
})
export class PropelRlsModule {}
