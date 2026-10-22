import { Module } from '@nestjs/common';

import { WorkspaceFlatMcpServerMapCacheService } from 'src/engine/metadata-modules/flat-mcp-server/services/workspace-flat-mcp-server-map-cache.service';

@Module({
  providers: [WorkspaceFlatMcpServerMapCacheService],
})
export class FlatMcpServerModule {}
