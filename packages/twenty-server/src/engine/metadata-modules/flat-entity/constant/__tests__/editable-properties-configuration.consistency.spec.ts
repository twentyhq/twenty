import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { FLAT_AGENT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-agent/constants/flat-agent-editable-properties.constant';
import { FLAT_APPLICATION_VARIABLE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-application-variable/constants/flat-application-variable-editable-properties.constant';
import { FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-command-menu-item/constants/flat-command-menu-item-editable-properties.constant';
import { FLAT_CONNECTION_PROVIDER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-connection-provider/constants/flat-connection-provider-editable-properties.constant';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { FLAT_FIELD_PERMISSION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-permission/constants/flat-field-permission-editable-properties.constant';
import { FLAT_FRONT_COMPONENT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-front-component/constants/flat-front-component-editable-properties.constant';
import { FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/flat-navigation-menu-item-editable-properties.constant';
import { FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-editable-properties.constant';
import { FLAT_OBJECT_PERMISSION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-permission/constants/flat-object-permission-editable-properties.constant';
import { FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout/constants/flat-page-layout-editable-properties.constant';
import { FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-tab/constants/flat-page-layout-tab-editable-properties.constant';
import { FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/flat-page-layout-widget-editable-properties.constant';
import { FLAT_PERMISSION_FLAG_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-permission-flag/constants/flat-permission-flag-editable-properties.constant';
import { FLAT_ROLE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-role/constants/flat-role-editable-properties.constant';
import { FLAT_ROLE_TARGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-role-target/constants/flat-role-target-editable-properties.constant';
import { FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/flat-row-level-permission-predicate-editable-properties.constant';
import { FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/flat-row-level-permission-predicate-group-editable-properties.constant';
import { FLAT_SKILL_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-skill/constants/flat-skill-editable-properties.constant';
import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant';
import { FLAT_VIEW_FIELD_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field/constants/flat-view-field-editable-properties.constant';
import { FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field-group/constants/flat-view-field-group-editable-properties.constant';
import { FLAT_VIEW_FILTER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-editable-properties.constant';
import { FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter-group/constants/flat-view-filter-group-editable-properties.constant';
import { FLAT_VIEW_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-group/constants/flat-view-group-editable-properties.constant';
import { FLAT_VIEW_SORT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-sort/constants/flat-view-sort-editable-properties.constant';
import { FLAT_WEBHOOK_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-webhook/constants/flat-webhook-editable-properties.constant';
import { FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/logic-function/constants/flat-logic-function-editable-properties.constant';

type MetadataName =
  keyof typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME;

type EditablePropertiesByMetadataName = Partial<
  Record<MetadataName, readonly string[]>
>;

type EditablePropertiesComparisonAllowList = Partial<
  Record<MetadataName, Record<string, string>>
>;

const uniqueProperties = (properties: readonly string[]) => [
  ...new Set(properties),
];

const combineProperties = (
  ...propertiesByType: readonly (readonly string[])[]
) => uniqueProperties(propertiesByType.flat());

const EDITABLE_PROPERTIES_BY_METADATA_NAME = {
  agent: FLAT_AGENT_EDITABLE_PROPERTIES,
  applicationVariable: FLAT_APPLICATION_VARIABLE_EDITABLE_PROPERTIES,
  commandMenuItem: FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES,
  connectionProvider: FLAT_CONNECTION_PROVIDER_EDITABLE_PROPERTIES,
  fieldMetadata: combineProperties(
    FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.custom,
    FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.standard,
  ),
  fieldPermission: FLAT_FIELD_PERMISSION_EDITABLE_PROPERTIES,
  frontComponent: FLAT_FRONT_COMPONENT_EDITABLE_PROPERTIES,
  logicFunction: FLAT_LOGIC_FUNCTION_EDITABLE_PROPERTIES,
  navigationMenuItem: FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES,
  objectMetadata: combineProperties(
    FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.custom,
    FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard,
  ),
  objectPermission: FLAT_OBJECT_PERMISSION_EDITABLE_PROPERTIES,
  pageLayout: FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES,
  pageLayoutTab: FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES,
  pageLayoutWidget: FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
  permissionFlag: FLAT_PERMISSION_FLAG_EDITABLE_PROPERTIES,
  role: FLAT_ROLE_EDITABLE_PROPERTIES,
  roleTarget: FLAT_ROLE_TARGET_EDITABLE_PROPERTIES,
  rowLevelPermissionPredicate:
    FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES,
  rowLevelPermissionPredicateGroup:
    FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES,
  skill: FLAT_SKILL_EDITABLE_PROPERTIES,
  view: FLAT_VIEW_EDITABLE_PROPERTIES,
  viewField: FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
  viewFieldGroup: FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES,
  viewFilter: FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
  viewFilterGroup: FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES,
  viewGroup: FLAT_VIEW_GROUP_EDITABLE_PROPERTIES,
  viewSort: FLAT_VIEW_SORT_EDITABLE_PROPERTIES,
  webhook: FLAT_WEBHOOK_EDITABLE_PROPERTIES,
} as const satisfies EditablePropertiesByMetadataName;

const EDITABLE_PROPERTIES_ALLOWED_TO_SKIP_COMPARISON: EditablePropertiesComparisonAllowList =
  {
    commandMenuItem: {
      pageLayoutId:
        'Existing parent-link exception; command menu item page layout moves need a separate product and migration decision.',
    },
    navigationMenuItem: {
      pageLayoutId:
        'Existing parent-link exception; navigation menu item page layout moves need a separate product and migration decision.',
    },
    pageLayoutTab: {
      layoutMode:
        'Existing exposed field whose migration semantics were already disabled before this guardrail; decide separately whether tab layout-mode updates should persist.',
    },
  };

const getPropertyConfiguration = ({
  metadataName,
  propertyName,
}: {
  metadataName: MetadataName;
  propertyName: string;
}) => {
  const propertyConfigurationByName =
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[
      metadataName
    ] as Record<string, { toCompare: boolean } | undefined>;

  return propertyConfigurationByName[propertyName];
};

describe('editable flat entity properties configuration', () => {
  it('keeps editable properties comparable unless explicitly allowlisted', () => {
    const nonComparableEditableProperties = Object.entries(
      EDITABLE_PROPERTIES_BY_METADATA_NAME,
    ).flatMap(([metadataName, editableProperties]) =>
      editableProperties.flatMap((propertyName) => {
        const propertyConfiguration = getPropertyConfiguration({
          metadataName: metadataName as MetadataName,
          propertyName,
        });
        const allowListReason =
          EDITABLE_PROPERTIES_ALLOWED_TO_SKIP_COMPARISON[
            metadataName as MetadataName
          ]?.[propertyName];

        if (
          propertyConfiguration?.toCompare === false &&
          allowListReason === undefined
        ) {
          return [`${metadataName}.${propertyName}`];
        }

        return [];
      }),
    );

    expect(nonComparableEditableProperties).toEqual([]);
  });

  it('keeps comparison allowlist entries current and documented', () => {
    const staleAllowListEntries = Object.entries(
      EDITABLE_PROPERTIES_ALLOWED_TO_SKIP_COMPARISON,
    ).flatMap(([metadataName, propertyReasons]) =>
      Object.entries(propertyReasons).flatMap(([propertyName, reason]) => {
        const propertyConfiguration = getPropertyConfiguration({
          metadataName: metadataName as MetadataName,
          propertyName,
        });

        if (
          reason.trim().length === 0 ||
          propertyConfiguration?.toCompare !== false
        ) {
          return [`${metadataName}.${propertyName}`];
        }

        return [];
      }),
    );

    expect(staleAllowListEntries).toEqual([]);
  });
});
