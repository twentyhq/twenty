import { Module } from '@nestjs/common';

import { PersonService } from 'src/workspace/repositories/person/person.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
