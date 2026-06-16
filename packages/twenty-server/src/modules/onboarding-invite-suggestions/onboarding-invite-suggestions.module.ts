import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { FetchOnboardingInviteSuggestionsJob } from 'src/modules/onboarding-invite-suggestions/jobs/fetch-onboarding-invite-suggestions.job';
import { CalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/calendar-attendees.service';
import { GoogleCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/google-calendar-attendees.service';
import { MicrosoftCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/microsoft-calendar-attendees.service';
import { OnboardingInviteSuggestionsService } from 'src/modules/onboarding-invite-suggestions/services/onboarding-invite-suggestions.service';

@Module({
  imports: [
    OAuth2ClientManagerModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
  ],
  providers: [
    GoogleCalendarAttendeesService,
    MicrosoftCalendarAttendeesService,
    CalendarAttendeesService,
    OnboardingInviteSuggestionsService,
    FetchOnboardingInviteSuggestionsJob,
  ],
  exports: [OnboardingInviteSuggestionsService],
})
export class OnboardingInviteSuggestionsModule {}
