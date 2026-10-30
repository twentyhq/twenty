import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { isAiFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/is-ai-front-component.util';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';

@MetadataResolver(() => FrontComponentDTO)
export class AiFrontComponentResolver {
  @ResolveField(() => Boolean)
  isAiComponent(
    @Parent() frontComponent: Pick<
      FrontComponentDTO,
      'id' | 'sourceComponentPath'
    >,
  ): boolean {
    return isAiFrontComponent(frontComponent);
  }
}
