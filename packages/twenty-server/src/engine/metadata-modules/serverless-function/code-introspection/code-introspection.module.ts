import { Module } from '@nestjs/common';

import { CodeIntrospectionService } from 'src/engine/metadata-modules/serverless-function/code-introspection/code-introspection.service';

@Module({
  providers: [CodeIntrospectionService],
  exports: [CodeIntrospectionService],
})
export class CodeIntrospectionModule {}
