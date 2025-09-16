import { Module } from '@nestjs/common';

import { MktInvoiceModule } from 'src/mkt-core/invoice/mkt-invoice.module';
import { MktLicenseModule } from 'src/mkt-core/license/mkt-license.module';
import { MktDepartmentModule } from 'src/mkt-core/mkt-department/mkt-department.module';
import { MktOrganizationLevelModule } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.module';
import { MktOrderModule } from 'src/mkt-core/order/mkt-order.module';
import { PersonUserManagementModule } from 'src/mkt-core/user-management/person-user-management.module';

@Module({
  imports: [
    MktOrderModule,
    MktInvoiceModule,
    MktLicenseModule,
    MktDepartmentModule,
    MktOrganizationLevelModule,
    PersonUserManagementModule,
  ],
})
export class MktCoreModule {}
