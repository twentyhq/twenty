import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { type ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FrontComponentLambdaDriver } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/drivers/front-component-lambda.driver';
import { FrontComponentLocalDriver } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/drivers/front-component-local.driver';
import { type FrontComponentDriver } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/types/front-component-driver.type';

export class FrontComponentDriverFactory extends DriverFactoryBase<FrontComponentDriver> {
  constructor(
    twentyConfigService: TwentyConfigService,
    configGroupHashService: ConfigGroupHashService,
    private readonly cacheLockService: CacheLockService,
    private readonly cacheStorageService: CacheStorageService,
  ) {
    super(twentyConfigService, configGroupHashService);
  }

  protected buildConfigKey(): string {
    const driverType = this.twentyConfigService.get('LOGIC_FUNCTION_TYPE');
    return driverType === LogicFunctionDriverType.LAMBDA
      ? `lambda|${this.configGroupHashService.computeHash(ConfigVariablesGroup.LOGIC_FUNCTION_CONFIG)}`
      : driverType;
  }

  protected createDriver(): FrontComponentDriver {
    const driverType = this.twentyConfigService.get('LOGIC_FUNCTION_TYPE');
    switch (driverType) {
      case LogicFunctionDriverType.LOCAL:
        return new FrontComponentLocalDriver();
      case LogicFunctionDriverType.LAMBDA:
        return new FrontComponentLambdaDriver({
          ...getLambdaConnectionOptions(this.twentyConfigService),
          cacheLockService: this.cacheLockService,
          cacheStorageService: this.cacheStorageService,
        });
      default:
        throw new Error(
          `Frontend component compilation is unavailable with driver ${driverType}`,
        );
    }
  }
}
