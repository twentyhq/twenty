import { getAgentUniversalIdentifier } from '@/application/deterministic-identifier/get-agent-universal-identifier.util';
import { getApplicationVariableUniversalIdentifier } from '@/application/deterministic-identifier/get-application-variable-universal-identifier.util';
import {
  getCommandMenuItemUniversalIdentifier,
  getNavigationCommandUniversalIdentifier,
} from '@/application/deterministic-identifier/get-command-menu-item-universal-identifier.util';
import { getConnectionProviderUniversalIdentifier } from '@/application/deterministic-identifier/get-connection-provider-universal-identifier.util';
import { getFieldPermissionUniversalIdentifier } from '@/application/deterministic-identifier/get-field-permission-universal-identifier.util';
import { getFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-field-universal-identifier.util';
import { getFrontComponentUniversalIdentifier } from '@/application/deterministic-identifier/get-front-component-universal-identifier.util';
import { getIndexUniversalIdentifier } from '@/application/deterministic-identifier/get-index-universal-identifier.util';
import { getLogicFunctionUniversalIdentifier } from '@/application/deterministic-identifier/get-logic-function-universal-identifier.util';
import { getNavigationMenuItemUniversalIdentifier } from '@/application/deterministic-identifier/get-navigation-menu-item-universal-identifier.util';
import { getObjectPermissionUniversalIdentifier } from '@/application/deterministic-identifier/get-object-permission-universal-identifier.util';
import { getObjectUniversalIdentifier } from '@/application/deterministic-identifier/get-object-universal-identifier.util';
import { getPageLayoutTabUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-tab-universal-identifier.util';
import {
  getPageLayoutUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
} from '@/application/deterministic-identifier/get-page-layout-universal-identifier.util';
import { getPageLayoutWidgetUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-widget-universal-identifier.util';
import { getPermissionFlagUniversalIdentifier } from '@/application/deterministic-identifier/get-permission-flag-universal-identifier.util';
import { getRolePermissionFlagUniversalIdentifier } from '@/application/deterministic-identifier/get-role-permission-flag-universal-identifier.util';
import { getRoleUniversalIdentifier } from '@/application/deterministic-identifier/get-role-universal-identifier.util';
import { getSelectOptionUniversalIdentifier } from '@/application/deterministic-identifier/get-select-option-universal-identifier.util';
import { getSkillUniversalIdentifier } from '@/application/deterministic-identifier/get-skill-universal-identifier.util';
import { getViewFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-view-field-universal-identifier.util';
import { getViewFilterUniversalIdentifier } from '@/application/deterministic-identifier/get-view-filter-universal-identifier.util';
import { getViewGroupUniversalIdentifier } from '@/application/deterministic-identifier/get-view-group-universal-identifier.util';
import { getViewSortUniversalIdentifier } from '@/application/deterministic-identifier/get-view-sort-universal-identifier.util';
import {
  getFieldsWidgetViewUniversalIdentifier,
  getIndexViewUniversalIdentifier,
  getViewUniversalIdentifier,
} from '@/application/deterministic-identifier/get-view-universal-identifier.util';

const APP = '11111111-1111-1111-1111-111111111111';

describe('deterministic identifier utils', () => {
  it('locks the universalIdentifier of every syncable usecase', () => {
    const object = getObjectUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      nameSingular: 'rocket',
    });
    const field = getFieldUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      objectUniversalIdentifier: object,
      name: 'createdAt',
    });
    const view = getViewUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      objectUniversalIdentifier: object,
      name: 'My View',
    });
    const role = getRoleUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      label: 'Admin',
    });
    const permissionFlag = getPermissionFlagUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      key: 'WORKFLOWS',
    });
    const pageLayout = getPageLayoutUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      objectUniversalIdentifier: object,
      name: 'My Dashboard',
    });
    const tab = getPageLayoutTabUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      pageLayoutUniversalIdentifier: pageLayout,
      title: 'Home',
    });
    const fieldsWidget = getPageLayoutWidgetUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      pageLayoutTabUniversalIdentifier: tab,
      title: 'Fields',
    });
    const frontComponent = getFrontComponentUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      componentName: 'HelloWorld',
    });

    expect({
      object,
      field,
      selectOption: getSelectOptionUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        fieldUniversalIdentifier: field,
        value: 'OPTION_A',
      }),
      view,
      indexView: getIndexViewUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: object,
      }),
      fieldsWidgetView: getFieldsWidgetViewUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        pageLayoutWidgetUniversalIdentifier: fieldsWidget,
      }),
      viewField: getViewFieldUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        viewUniversalIdentifier: view,
        fieldMetadataUniversalIdentifier: field,
      }),
      viewSort: getViewSortUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        viewUniversalIdentifier: view,
        fieldMetadataUniversalIdentifier: field,
      }),
      viewGroup: getViewGroupUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        viewUniversalIdentifier: view,
        fieldValue: 'DONE',
      }),
      viewFilter: getViewFilterUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        viewUniversalIdentifier: view,
        fieldMetadataUniversalIdentifier: field,
        operand: 'is',
      }),
      index: getIndexUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: object,
        name: 'IDX_a1b2c3',
      }),
      pageLayout,
      recordPageLayout: getRecordPageLayoutUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: object,
      }),
      pageLayoutTab: tab,
      pageLayoutWidget: fieldsWidget,
      role,
      objectPermission: getObjectPermissionUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        roleUniversalIdentifier: role,
        objectUniversalIdentifier: object,
      }),
      fieldPermission: getFieldPermissionUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        roleUniversalIdentifier: role,
        fieldUniversalIdentifier: field,
      }),
      rolePermissionFlag: getRolePermissionFlagUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        roleUniversalIdentifier: role,
        permissionFlagUniversalIdentifier: permissionFlag,
      }),
      permissionFlag,
      agent: getAgentUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'My Agent',
      }),
      skill: getSkillUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'My Skill',
      }),
      frontComponent,
      logicFunction: getLogicFunctionUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'myFunction',
      }),
      connectionProvider: getConnectionProviderUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'myProvider',
      }),
      applicationVariable: getApplicationVariableUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        key: 'MY_VARIABLE',
      }),
      commandMenuItem: getCommandMenuItemUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        label: 'My Command',
      }),
      navigationMenuItem: getNavigationMenuItemUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'My Folder',
      }),
      navigationCommand: getNavigationCommandUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: object,
      }),
    }).toMatchSnapshot();
  });

  it('is deterministic for the same inputs', () => {
    const object = getObjectUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      nameSingular: 'rocket',
    });
    const first = getFieldUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      objectUniversalIdentifier: object,
      name: 'createdAt',
    });
    const second = getFieldUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      objectUniversalIdentifier: object,
      name: 'createdAt',
    });

    expect(first).toBe(second);
  });

  it('scopes by owner application (different app yields a different id)', () => {
    const ownedByA = getObjectUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      nameSingular: 'rocket',
    });
    const ownedByB = getObjectUniversalIdentifier({
      ownerApplicationUniversalIdentifier:
        '99999999-9999-9999-9999-999999999999',
      nameSingular: 'rocket',
    });

    expect(ownedByA).not.toBe(ownedByB);
  });

  it('does not collide across usecases that share a parent and key', () => {
    const object = getObjectUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      nameSingular: 'rocket',
    });
    const view = getViewUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      objectUniversalIdentifier: object,
      name: 'Shared',
    });
    const field = getFieldUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      objectUniversalIdentifier: object,
      name: 'Shared',
    });

    const viewSort = getViewSortUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      viewUniversalIdentifier: view,
      fieldMetadataUniversalIdentifier: field,
    });
    const viewField = getViewFieldUniversalIdentifier({
      ownerApplicationUniversalIdentifier: APP,
      viewUniversalIdentifier: view,
      fieldMetadataUniversalIdentifier: field,
    });

    expect(view).not.toBe(field);
    expect(viewSort).not.toBe(viewField);
  });
});
