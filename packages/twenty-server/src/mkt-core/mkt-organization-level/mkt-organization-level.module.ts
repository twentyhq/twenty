import { Module } from '@nestjs/common';

import { OrganizationLevelService } from 'src/mkt-core/mkt-organization-level/services/organization-level.service';
import { OrganizationLevelResolver } from 'src/mkt-core/mkt-organization-level/resolvers/organization-level.resolver';
import { OrganizationLevelHierarchyValidator } from 'src/mkt-core/mkt-organization-level/validators/hierarchy-validator';
import { OrganizationLevelValidationService } from 'src/mkt-core/mkt-organization-level/services/organization-level-validation.service';
import { MktOrganizationLevelCreateOnePreQueryHook } from 'src/mkt-core/mkt-organization-level/hooks/mkt-organization-level-create-one.pre-query.hook';
import { MktOrganizationLevelUpdateOnePreQueryHook } from 'src/mkt-core/mkt-organization-level/hooks/mkt-organization-level-update-one.pre-query.hook';
import { MktOrganizationLevelDeleteOnePreQueryHook } from 'src/mkt-core/mkt-organization-level/hooks/mkt-organization-level-delete-one.pre-query.hook';

@Module({
  imports: [],
  providers: [
    OrganizationLevelService,
    OrganizationLevelResolver,
    OrganizationLevelHierarchyValidator,
    OrganizationLevelValidationService,
    MktOrganizationLevelCreateOnePreQueryHook,
    MktOrganizationLevelUpdateOnePreQueryHook,
    MktOrganizationLevelDeleteOnePreQueryHook,
  ],
  exports: [OrganizationLevelService, OrganizationLevelHierarchyValidator],
})
export class MktOrganizationLevelModule {}
