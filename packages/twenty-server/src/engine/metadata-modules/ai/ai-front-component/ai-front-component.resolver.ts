import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getAiFrontComponentSourcePath } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-ai-front-component-source-path.util';
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
    return (
      frontComponent.sourceComponentPath ===
      getAiFrontComponentSourcePath(frontComponent.id)
    );
  }
}
