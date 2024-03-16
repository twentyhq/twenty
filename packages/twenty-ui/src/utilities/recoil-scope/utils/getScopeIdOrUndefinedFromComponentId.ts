import { getScopeIdFromComponentId } from '../../recoil-scope/utils/getScopeIdFromComponentId';

export const getScopeIdOrUndefinedFromComponentId = (componentId?: string) =>
  componentId ? getScopeIdFromComponentId(componentId) : undefined;
