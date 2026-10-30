import { type FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { getAiFrontComponentSourcePath } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-ai-front-component-source-path.util';

export const isAiFrontComponent = (
  frontComponent: Pick<FrontComponentEntity, 'id' | 'sourceComponentPath'>,
): boolean =>
  frontComponent.sourceComponentPath ===
  getAiFrontComponentSourcePath(frontComponent.id);
