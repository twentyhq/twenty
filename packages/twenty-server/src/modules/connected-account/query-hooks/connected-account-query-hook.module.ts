import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ConnectedAccountDeleteOnePreQueryHook } from 'src/modules/connected-account/query-hooks/connected-account-delete-one.pre-query.hook';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
  ],
  providers: [ConnectedAccountDeleteOnePreQueryHook],
})
export class ConnectedAccountQueryHookModule {}
