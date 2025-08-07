import {SeedAttributeModuleCommand} from "src/mkt-core/commands/mkt-attribute-data-seed-dev-workspace.command";
import { SeedProductModuleCommand } from "src/mkt-core/commands/mkt-product-data-seed-dev-workspace.command.ts";
import {SeedValueModuleCommand} from "src/mkt-core/commands/mkt-value-data-seed-dev-workspace.command";
import {SeedVariantAttributeModuleCommand} from "src/mkt-core/commands/mkt-variant-attribute-data-seed-dev-workspace.command";
import {SeedVariantModuleCommand} from "src/mkt-core/commands/mkt-variant-data-seed-dev-workspace.command";
import {SeedCustomerModuleCommand} from "src/mkt-core/mkt-example/libs/customers/seed-customer-module.command";

export const MKT_DATABASE_COMMAND_MODULES = [
    SeedCustomerModuleCommand,
    SeedProductModuleCommand,
    SeedAttributeModuleCommand,
    SeedVariantModuleCommand,
    SeedValueModuleCommand,
    SeedVariantAttributeModuleCommand,
    // Add other commands here if needed
]
