import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FlatSkillModule } from 'src/engine/metadata-modules/flat-skill/flat-skill.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { SkillGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/skill/interceptors/skill-graphql-api-exception.interceptor';
import { SkillResolver } from 'src/engine/metadata-modules/skill/skill.resolver';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillEntity]),
    PermissionsModule,
    FlatSkillModule,
  ],
  providers: [SkillService, SkillResolver, SkillGraphqlApiExceptionInterceptor],
  exports: [SkillService, TypeOrmModule.forFeature([SkillEntity])],
})
export class SkillModule {}
