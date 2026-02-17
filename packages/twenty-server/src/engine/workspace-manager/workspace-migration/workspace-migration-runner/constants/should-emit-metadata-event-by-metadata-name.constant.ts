import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

export const shouldEmitMetadataEvent = (
  metadataName: AllMetadataName,
): boolean => {
  switch (metadataName) {
    case 'frontComponent':
      return true;
    case 'objectMetadata':
    case 'fieldMetadata':
    case 'view':
    case 'viewField':
    case 'viewFieldGroup':
    case 'viewGroup':
    case 'viewFilter':
    case 'viewFilterGroup':
    case 'role':
    case 'roleTarget':
    case 'agent':
    case 'skill':
    case 'pageLayout':
    case 'pageLayoutWidget':
    case 'pageLayoutTab':
    case 'commandMenuItem':
    case 'navigationMenuItem':
    case 'webhook':
    case 'rowLevelPermissionPredicate':
    case 'rowLevelPermissionPredicateGroup':
    case 'index':
    case 'logicFunction':
      return false;
    default:
      return assertUnreachable(metadataName);
  }
};
