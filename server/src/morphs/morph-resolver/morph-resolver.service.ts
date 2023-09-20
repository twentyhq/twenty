import { Injectable, Scope, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Injectable({ scope: Scope.REQUEST, durable: true })
export class MorphResolverService {
  @UseGuards(JwtAuthGuard)
  findAll(entityName: string, context: any) {
    // Your resolver logic here
    return [];
  }

  @UseGuards(JwtAuthGuard)
  findOne(entityName: string, id: string, context: any) {
    // Your resolver logic here
    return {};
  }
}
