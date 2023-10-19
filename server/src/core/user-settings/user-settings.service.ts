import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UserSettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique = this.prismaService.client.userSettings.findUnique;

  // Update
  update = this.prismaService.client.userSettings.update;
}
