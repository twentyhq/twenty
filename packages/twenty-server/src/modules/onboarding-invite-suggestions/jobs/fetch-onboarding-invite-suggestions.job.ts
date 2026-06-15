import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { OnboardingInviteSuggestionsService } from 'src/modules/onboarding-invite-suggestions/services/onboarding-invite-suggestions.service';

export type FetchOnboardingInviteSuggestionsJobData = {
  workspaceId: string;
  userId: string;
  connectedAccountId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
})
export class FetchOnboardingInviteSuggestionsJob {
  constructor(
    private readonly onboardingInviteSuggestionsService: OnboardingInviteSuggestionsService,
  ) {}

  @Process(FetchOnboardingInviteSuggestionsJob.name)
  async handle(data: FetchOnboardingInviteSuggestionsJobData): Promise<void> {
    await this.onboardingInviteSuggestionsService.computeAndCacheSuggestions(
      data,
    );
  }
}
