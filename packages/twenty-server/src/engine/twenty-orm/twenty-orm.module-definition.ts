import { ConfigurableModuleBuilder } from '@nestjs/common';

import { TwentyORMOptions } from './interfaces/twenty-orm-options.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<TwentyORMOptions>().build();
