import { Injectable, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './local-storage.module-definition';
import { LocalStorageModuleOptions } from './interfaces';

@Injectable()
export class LocalStorageService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: LocalStorageModuleOptions,
  ) {}
}
