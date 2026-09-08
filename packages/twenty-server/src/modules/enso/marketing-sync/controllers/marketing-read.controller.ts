import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DittofeedAdminClientService } from 'src/modules/enso/marketing-sync/services/dittofeed-admin-client.service';

// Authenticated read API for the in-CRM marketing-journey widget (Tier B). A
// logged-in manager's browser calls this; the server proxies Dittofeed's Admin
// API so the admin key stays server-side. Mirrors ChatwootController's guards.
// (The journey-callback receiver is a SEPARATE public controller.)
@Controller('rest/enso/marketing')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class MarketingReadController {
  constructor(
    private readonly dittofeedAdminClientService: DittofeedAdminClientService,
  ) {}

  // Messages (email/SMS) Dittofeed has sent to this person. personId is the CRM
  // person UUID, which is also the Dittofeed userId.
  @Get('deliveries')
  @UseGuards(NoPermissionGuard)
  async deliveries(
    @Query('personId') personId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const deliveries =
      await this.dittofeedAdminClientService.getDeliveriesForUser(
        workspace.id,
        personId,
      );

    return { deliveries };
  }
}
