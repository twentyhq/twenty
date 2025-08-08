import { SeedAttributeModuleCommand } from 'src/mkt-core/commands/mkt-attribute-data-seed-dev-workspace.command';
import { SeedProductModuleCommand } from 'src/mkt-core/commands/mkt-product-data-seed-dev-workspace.command.ts';
import { SeedValueModuleCommand } from 'src/mkt-core/commands/mkt-value-data-seed-dev-workspace.command';
import { SeedVariantAttributeModuleCommand } from 'src/mkt-core/commands/mkt-variant-attribute-data-seed-dev-workspace.command';
import { SeedVariantModuleCommand } from 'src/mkt-core/commands/mkt-variant-data-seed-dev-workspace.command';
import { SeedOrderModuleCommand } from 'src/mkt-core/commands/mkt-order-data-seed-dev-workspace.command';

export const MKT_DATABASE_COMMAND_MODULES = [
  // product commands
  SeedProductModuleCommand,
  SeedAttributeModuleCommand,
  SeedVariantModuleCommand,
  SeedValueModuleCommand,
  SeedVariantAttributeModuleCommand,
  // order commands
  SeedOrderModuleCommand,
];
