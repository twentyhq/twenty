import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';

export const fromFlatFrontComponentToFrontComponentDto = (
  flatFrontComponent: FlatFrontComponent,
): FrontComponentDTO => ({
  id: flatFrontComponent.id,
  name: flatFrontComponent.name,
  workspaceId: flatFrontComponent.workspaceId,
  applicationId: flatFrontComponent.applicationId,
  createdAt: new Date(flatFrontComponent.createdAt),
  updatedAt: new Date(flatFrontComponent.updatedAt),
});
