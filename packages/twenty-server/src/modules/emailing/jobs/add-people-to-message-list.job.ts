import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AddPeopleToMessageListService } from 'src/modules/emailing/services/add-people-to-message-list.service';
import { type AddPeopleToMessageListJobData } from 'src/modules/emailing/types/add-people-to-message-list-job-data.type';

@Processor(MessageQueue.campaignQueue)
export class AddPeopleToMessageListJob {
  constructor(
    private readonly addPeopleToMessageListService: AddPeopleToMessageListService,
  ) {}

  @Process(AddPeopleToMessageListJob.name)
  async handle(data: AddPeopleToMessageListJobData): Promise<void> {
    await this.addPeopleToMessageListService.addPeopleToMessageList(data);
  }
}
