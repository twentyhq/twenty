import { Module } from '@nestjs/common';

import { CodeIntrospectionService } from 'src/modules/code-introspection/code-introspection.service';

@Module({
  providers: [CodeIntrospectionService],
  exports: [CodeIntrospectionService],
})
export class CodeIntrospectionModule {}
