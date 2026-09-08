import { Module } from '@nestjs/common';

import { GoogleChatWebhookModule } from 'src/modules/enso/notifications/google-chat-webhook.module';
import { ClaimCheckJob } from 'src/modules/enso/lead-pipeline/jobs/claim-check.job';
import { ManagerNotifyJob } from 'src/modules/enso/lead-pipeline/jobs/manager-notify.job';
import { NotifyManagerAssignmentJob } from 'src/modules/enso/lead-pipeline/jobs/notify-manager-assignment.job';
import { ResolveOpportunityFromActivityJob } from 'src/modules/enso/lead-pipeline/jobs/resolve-opportunity-from-activity.job';
import { RouteOpportunityJob } from 'src/modules/enso/lead-pipeline/jobs/route-opportunity.job';
import { ConsentFromActivityService } from 'src/modules/enso/lead-pipeline/services/consent-from-activity.service';
import { ManagerNotificationService } from 'src/modules/enso/lead-pipeline/services/manager-notification.service';
import { OpportunityClaimService } from 'src/modules/enso/lead-pipeline/services/opportunity-claim.service';
import { OpportunityNameService } from 'src/modules/enso/lead-pipeline/services/opportunity-name.service';
import { OpportunityResolutionService } from 'src/modules/enso/lead-pipeline/services/opportunity-resolution.service';
import { OpportunityRoutingService } from 'src/modules/enso/lead-pipeline/services/opportunity-routing.service';
import { ProjectNotificationService } from 'src/modules/enso/lead-pipeline/services/project-notification.service';
import { PersonFirstTouchService } from 'src/modules/enso/lead-pipeline/services/person-first-touch.service';
import { PersonTimelineService } from 'src/modules/enso/lead-pipeline/services/person-timeline.service';
import { CallFollowUpService } from 'src/modules/enso/telephony/services/call-follow-up.service';
import { ConsentEventService } from 'src/modules/enso/person-project-consent/services/consent-event.service';
import { PersonProjectAssignmentNameService } from 'src/modules/enso/person-project-assignment/services/person-project-assignment-name.service';
import { PersonProjectConsentNameService } from 'src/modules/enso/person-project-consent/services/person-project-consent-name.service';

// WORKER side of the lead pipeline: the four BullMQ jobs (resolve → route →
// notify + the delayed claim-check) and the services they depend on. Imported
// by JobsModule, which the queue worker (QueueWorkerModule) loads — that's where
// the message-queue explorer discovers @Processor classes. The server-side POST
// hooks live in LeadPipelineModule.
//
// Every service a job reaches must be listed HERE as well as in
// LeadPipelineModule — the two graphs are separate and Nest resolves them
// independently. Adding a constructor dependency to a shared service and only
// registering it on the server side crashes the WORKER at boot with
// UnknownDependenciesException, which is how OpportunityClaimService took the
// worker down: the server had it, this module did not.
@Module({
  imports: [GoogleChatWebhookModule],
  providers: [
    CallFollowUpService,
    OpportunityNameService,
    OpportunityResolutionService,
    // Needed by OpportunityResolutionService: an answered call opens its deal
    // straight at CONNECTED, and the sticky assignment is written from here
    // because raw-ORM writes bypass the update hook that normally does it.
    OpportunityClaimService,
    PersonProjectAssignmentNameService,
    OpportunityRoutingService,
    PersonFirstTouchService,
    PersonTimelineService,
    ConsentFromActivityService,
    PersonProjectConsentNameService,
    ConsentEventService,
    ManagerNotificationService,
    // The marketing lane's poster. Same reason OpportunityClaimService is
    // listed here: OpportunityResolutionService depends on it, and this graph
    // resolves independently of the server one.
    ProjectNotificationService,
    ResolveOpportunityFromActivityJob,
    RouteOpportunityJob,
    NotifyManagerAssignmentJob,
    ClaimCheckJob,
    ManagerNotifyJob,
  ],
})
export class LeadPipelineJobsModule {}
