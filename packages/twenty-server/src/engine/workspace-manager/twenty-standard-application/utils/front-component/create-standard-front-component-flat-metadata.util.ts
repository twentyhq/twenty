import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { STANDARD_FRONT_COMPONENTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-front-component.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardFrontComponentFlatMetadata = ({
  frontComponentName,
  frontComponentId,
  workspaceId,
  twentyStandardApplicationId,
  now,
}: {
  frontComponentName: keyof typeof STANDARD_FRONT_COMPONENTS;
  frontComponentId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatFrontComponent => {
  const definition = STANDARD_FRONT_COMPONENTS[frontComponentName];

  return {
    id: frontComponentId,
    universalIdentifier: definition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    name: definition.name,
    description: null,
    sourceComponentPath: definition.sourceComponentPath,
    builtComponentPath: definition.builtComponentPath,
    componentName: definition.componentName,
    builtComponentChecksum: definition.builtComponentChecksum,
    isHeadless: definition.isHeadless,
    usesSdkClient: false,
    createdAt: now,
    updatedAt: now,
  };
};
