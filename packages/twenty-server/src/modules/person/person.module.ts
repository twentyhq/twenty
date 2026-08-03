import { Module } from '@nestjs/common';

import { PersonOpenTaskCountListener } from 'src/modules/person/listeners/person-open-task-count.listener';
import { PersonOpenTaskCountService } from 'src/modules/person/services/person-open-task-count.service';

@Module({
  providers: [PersonOpenTaskCountService, PersonOpenTaskCountListener],
  exports: [PersonOpenTaskCountService],
})
export class PersonModule {}
