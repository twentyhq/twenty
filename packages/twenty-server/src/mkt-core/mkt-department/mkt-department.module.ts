import { Module } from '@nestjs/common';

import { DepartmentService } from 'src/mkt-core/mkt-department/services/department.service';
import { DepartmentTreeResolver } from 'src/mkt-core/mkt-department/resolvers/department-tree.resolver';

@Module({
  imports: [],
  providers: [DepartmentService, DepartmentTreeResolver],
  exports: [],
})
export class MktDepartmentModule {}
