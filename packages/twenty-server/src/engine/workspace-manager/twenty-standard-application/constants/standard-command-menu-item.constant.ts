import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  CommandMenuItemAvailabilityType,
  type ConditionalDisplay,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const STANDARD_COMMAND_MENU_ITEMS = {
  navigateToNextRecord: {
    universalIdentifier: '3db2457d-8e96-4b8e-94c9-ed95d3f95738',
    label: i18nLabel(
      msg({
        message: `Navigate to next {objectLabelSingular}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconChevronDown',
    isPinned: true,
    position: 1,
    shortLabel: null,
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '37662ccb-0b6a-5864-bac2-a7881e27b313',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '117e1f2d-4e9d-51bc-8f82-cd40296fba5d',
          contextKey: 'isInSidePanel',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '23d30e54-4a17-54f7-919e-c93d995a31c2',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["messageCampaign"]',
        },
        {
          id: '4c444fc0-902b-5096-bb6f-34ec100fb634',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["agentChatThread"]',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATE_TO_NEXT_RECORD,
    hotKeys: null,
  },
  navigateToPreviousRecord: {
    universalIdentifier: 'ec10f871-415b-420b-8150-7e09f6f04833',
    label: i18nLabel(
      msg({
        message: `Navigate to previous {objectLabelSingular}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconChevronUp',
    isPinned: true,
    position: 2,
    shortLabel: null,
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '37662ccb-0b6a-5864-bac2-a7881e27b313',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '117e1f2d-4e9d-51bc-8f82-cd40296fba5d',
          contextKey: 'isInSidePanel',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '23d30e54-4a17-54f7-919e-c93d995a31c2',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["messageCampaign"]',
        },
        {
          id: '4c444fc0-902b-5096-bb6f-34ec100fb634',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["agentChatThread"]',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATE_TO_PREVIOUS_RECORD,
    hotKeys: null,
  },
  createNewRecord: {
    universalIdentifier: '08d255bf-58cd-47a5-bd82-78c5c58592f1',
    label: i18nLabel(
      msg({
        message: `Create {objectLabelSingular}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconPlus',
    isPinned: true,
    position: 3,
    shortLabel: i18nLabel(
      msg({
        message: `Create`,
        context: 'commandMenuItem.shortLabel',
      }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '3cb253a5-d948-5398-a6be-31afd3582a63',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: '9f767143-9220-5e8b-b3d4-c42051554ed7',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
        {
          id: 'a8772fc6-1682-5fa4-9bda-5a913d68381b',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '844e248a-8af5-5001-ac11-fce9d3a25479',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS,
          subFieldName: 'isUICreatable',
          value: 'true',
        },
        {
          id: '96f9348a-78a3-5e1a-ac66-704c4c2fe57a',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS,
          subFieldName: 'isUIEditable',
          value: 'true',
        },
        {
          id: '8a055885-4b71-58e8-9d6f-15c7c6eaea08',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS,
          subFieldName: 'isRemote',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    conditionalPinned: {
      recordFilters: [
        {
          id: 'd7dcba01-724a-5a9f-ac3a-feefb2e78263',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '0',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
    hotKeys: null,
  },
  deleteRecords: {
    universalIdentifier: 'd5a55d57-ed1d-4791-89b8-53b7e121d69d',
    label: i18nLabel(
      msg({
        message: `Delete {objectLabel}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconTrash',
    isPinned: false,
    position: 4,
    shortLabel: i18nLabel(
      msg({ message: `Delete`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '4cc11987-937e-51f2-b941-402d7b45d68b',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
          recordFilterGroupId: 'edeceebd-071a-51e1-8529-9ba90768c48d',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'e83077f6-ece0-5ee1-b4c7-7dac5057038d',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
          recordFilterGroupId: 'edeceebd-071a-51e1-8529-9ba90768c48d',
          positionInRecordFilterGroup: 1,
        },
        {
          id: 'e08042ed-c29a-5acb-80e6-3b9a40b2cbb2',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canSoftDeleteObjectRecords',
          value: 'true',
          recordFilterGroupId: 'edeceebd-071a-51e1-8529-9ba90768c48d',
          positionInRecordFilterGroup: 2,
        },
        {
          id: 'f94f83d7-6362-5af3-9cd7-43657080e33c',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: '382bba64-62d6-5894-80a8-b9d7a79d7357',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '69363a59-be07-5106-8224-365f1a5a4982',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '382bba64-62d6-5894-80a8-b9d7a79d7357',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '28f13837-2ed5-5508-b78e-17bff46867f8',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: 'c9140669-e8de-5937-b2f6-1605b6a02443',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'f45ac983-08cb-59e0-9485-bb6748f06859',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canSoftDelete',
          value: 'false',
          recordFilterGroupId: 'c9140669-e8de-5937-b2f6-1605b6a02443',
          positionInRecordFilterGroup: 1,
        },
      ],
      recordFilterGroups: [
        {
          id: 'edeceebd-071a-51e1-8529-9ba90768c48d',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: '382bba64-62d6-5894-80a8-b9d7a79d7357',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'edeceebd-071a-51e1-8529-9ba90768c48d',
          positionInRecordFilterGroup: 3,
        },
        {
          id: 'c9140669-e8de-5937-b2f6-1605b6a02443',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'edeceebd-071a-51e1-8529-9ba90768c48d',
          positionInRecordFilterGroup: 4,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DELETE_RECORDS,
    hotKeys: null,
  },
  restoreRecords: {
    universalIdentifier: '2d733846-8cc5-4314-ab79-916ae0801baa',
    label: i18nLabel(
      msg({
        message: `Restore {objectLabel}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconRefresh',
    isPinned: true,
    position: 5,
    shortLabel: i18nLabel(
      msg({ message: `Restore`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '6b9c3ddf-94ee-5b53-9911-23e6e2340294',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
          recordFilterGroupId: '883436e4-03e1-57ae-b995-26c3f1c9f28c',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '1765cf21-9577-55a8-9320-953bbf74dd58',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: '16d4a651-c50f-5e12-b302-35fb733d9347',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '518841ab-f3f9-5675-8966-c940080263f7',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '16d4a651-c50f-5e12-b302-35fb733d9347',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '56a23a46-3b7c-5944-81ba-68e025a8889e',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canSoftDeleteObjectRecords',
          value: 'true',
          recordFilterGroupId: '883436e4-03e1-57ae-b995-26c3f1c9f28c',
          positionInRecordFilterGroup: 2,
        },
        {
          id: '298ed392-0d58-5cd6-81f0-1a06829d506f',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
          recordFilterGroupId: 'a60e8a81-89db-55ac-8396-34ce903b8889',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '4d5b9221-dfe5-5e75-8b30-6894ee8e0a85',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: 'a60e8a81-89db-55ac-8396-34ce903b8889',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '565ff6f3-13d5-5040-95d7-60073286c201',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: 'feab0801-8cae-5530-be97-fe987711331c',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'fd37bf7d-aeed-56f6-b9a5-c67424d3d772',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canSoftDelete',
          value: 'false',
          recordFilterGroupId: 'feab0801-8cae-5530-be97-fe987711331c',
          positionInRecordFilterGroup: 1,
        },
      ],
      recordFilterGroups: [
        {
          id: '883436e4-03e1-57ae-b995-26c3f1c9f28c',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: '16d4a651-c50f-5e12-b302-35fb733d9347',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '883436e4-03e1-57ae-b995-26c3f1c9f28c',
          positionInRecordFilterGroup: 1,
        },
        {
          id: 'a60e8a81-89db-55ac-8396-34ce903b8889',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '883436e4-03e1-57ae-b995-26c3f1c9f28c',
          positionInRecordFilterGroup: 3,
        },
        {
          id: 'feab0801-8cae-5530-be97-fe987711331c',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '883436e4-03e1-57ae-b995-26c3f1c9f28c',
          positionInRecordFilterGroup: 4,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.RESTORE_RECORDS,
    hotKeys: null,
  },
  destroyRecords: {
    universalIdentifier: '0ea2ebc4-02ca-4d15-b424-5352b9e487df',
    label: i18nLabel(
      msg({
        message: `Permanently destroy {objectLabel}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconTrashX',
    isPinned: false,
    position: 6,
    shortLabel: i18nLabel(
      msg({ message: `Destroy`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'e63def19-eead-5b14-bf23-2820fb57c669',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
          recordFilterGroupId: 'cf6528d1-c8ec-5a0c-a6cf-ea67de972ba9',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '9d517851-cdef-554c-89e5-47c4fe2e44e2',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canDestroyObjectRecords',
          value: 'true',
          recordFilterGroupId: 'cf6528d1-c8ec-5a0c-a6cf-ea67de972ba9',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '2c86dbd1-a60e-591f-9f48-02269c01c09e',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: '05b621f2-1084-5c6e-bb66-d1b928f2b866',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '8449bc34-4cde-53d8-9431-3840ac1c7ee4',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '05b621f2-1084-5c6e-bb66-d1b928f2b866',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '74bb5522-21f0-5353-93b4-a226a8f15a86',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
          recordFilterGroupId: '15184e5d-2755-54a4-963e-e54d76ed0a49',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '5da08cd2-7726-5135-aef3-4c6b66ad6ff2',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: '15184e5d-2755-54a4-963e-e54d76ed0a49',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '261854e2-0e0a-59e0-a38a-baf52eafcd9b',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: '463bc03c-7511-5f27-bb7d-aed7d4dbeb3a',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '9a9074fb-eae2-532a-a195-709c12323534',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canDelete',
          value: 'false',
          recordFilterGroupId: '463bc03c-7511-5f27-bb7d-aed7d4dbeb3a',
          positionInRecordFilterGroup: 1,
        },
      ],
      recordFilterGroups: [
        {
          id: 'cf6528d1-c8ec-5a0c-a6cf-ea67de972ba9',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: '05b621f2-1084-5c6e-bb66-d1b928f2b866',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'cf6528d1-c8ec-5a0c-a6cf-ea67de972ba9',
          positionInRecordFilterGroup: 2,
        },
        {
          id: '15184e5d-2755-54a4-963e-e54d76ed0a49',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'cf6528d1-c8ec-5a0c-a6cf-ea67de972ba9',
          positionInRecordFilterGroup: 3,
        },
        {
          id: '463bc03c-7511-5f27-bb7d-aed7d4dbeb3a',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'cf6528d1-c8ec-5a0c-a6cf-ea67de972ba9',
          positionInRecordFilterGroup: 4,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DESTROY_RECORDS,
    hotKeys: null,
  },
  addToFavorites: {
    universalIdentifier: '38bf80c3-bd55-4753-80ba-38aa66429a03',
    label: i18nLabel(
      msg({ message: `Add to Favorites`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconHeart',
    isPinned: true,
    position: 7,
    shortLabel: null,
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '22634b05-8fe6-5518-8229-0e3c836af794',
          contextKey: 'areAllSelectedRecordsFavorites',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '1b74c5e0-29c5-55ee-9acc-020402ec9486',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: 'e1205eb8-f123-5067-8471-f44bc57a69e1',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: 'd8d4cc26-fb99-57ba-a97d-d458147a08b0',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["messageCampaign"]',
        },
        {
          id: '77930661-74d9-56ed-8f5b-6c5479a32883',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["workflow"]',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
    hotKeys: null,
  },
  removeFromFavorites: {
    universalIdentifier: '3ea42507-44fa-4895-a36d-cbfef7355a50',
    label: i18nLabel(
      msg({
        message: `Remove from Favorites`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconHeartOff',
    isPinned: true,
    position: 8,
    shortLabel: null,
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '04890e3f-bcec-5b1a-9fae-2976a637182d',
          contextKey: 'areAllSelectedRecordsFavorites',
          operand: ViewFilterOperand.IS,
          value: 'true',
        },
        {
          id: 'f6a1fe70-5415-54b5-81b7-0da1046a6189',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: 'f3a780d6-ea10-5f77-9a1a-15f1167b5f4e',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '6f9ae387-0804-53ce-b1e1-3e4fbb769059',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["messageCampaign"]',
        },
        {
          id: '59abccbe-6259-534e-9bec-f1aa9da5a811',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["workflow"]',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.REMOVE_FROM_FAVORITES,
    hotKeys: null,
  },
  exportRecords: {
    universalIdentifier: 'c6f5c54d-d52b-4e75-8188-2190d77126f2',
    label: i18nLabel(
      msg({
        message: `Export {objectLabel}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconFileExport',
    isPinned: false,
    position: 10,
    shortLabel: i18nLabel(
      msg({ message: `Export`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'b0039b05-5fb3-5575-affc-97794cdc7365',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: '14b335f3-b9e8-5cbd-80cb-1e0c776461ef',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'EXPORT_CSV',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.EXPORT_RECORDS,
    hotKeys: null,
  },
  updateMultipleRecords: {
    universalIdentifier: '2e080651-f098-4a78-bea9-7a70002dc57c',
    label: i18nLabel(
      msg({
        message: `Update {objectLabelPlural}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconEdit',
    isPinned: true,
    position: 11,
    shortLabel: i18nLabel(
      msg({ message: `Update`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '21bf01f2-7220-5f4d-8a1d-ac3517af75bb',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '2',
        },
        {
          id: '95021152-acee-5dc7-9b5b-ac57c5b5799d',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.UPDATE_MULTIPLE_RECORDS,
    hotKeys: null,
  },
  mergeMultipleRecords: {
    universalIdentifier: '6c14eb04-8e7e-4d47-93c0-8ec4834e2e60',
    label: i18nLabel(
      msg({
        message: `Merge {objectLabelPlural}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconArrowMerge',
    isPinned: false,
    position: 12,
    shortLabel: i18nLabel(
      msg({ message: `Merge`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '374306d0-6cdd-5ac6-a812-8f4a8234f75e',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '45d2f728-2000-51ab-91df-cfc03b65abf3',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '2',
        },
        {
          id: '3ada5adb-db1a-5b49-80a6-330d2926be4e',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS,
          subFieldName: 'isSystem',
          value: 'false',
        },
        {
          id: 'dfa15eb2-b0d8-5d24-b847-20b81cca2651',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["workflow"]',
        },
        {
          id: '5a3ef48a-8d8f-5701-a3e9-682013265da0',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["dashboard"]',
        },
        {
          id: '45eee304-de65-5ef7-b6fa-79e399354ba4',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
        {
          id: 'b6477a22-ec91-530c-91c0-7f53dd96178f',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canDestroyObjectRecords',
          value: 'true',
        },
        {
          id: 'd67f05f4-651f-5a26-89bc-d30a05c8c4d9',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
          value: '9',
        },
        {
          id: 'e18706e8-f0bc-516b-9431-ff51138777cd',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canUpdate',
          value: 'false',
        },
        {
          id: 'dcab3fa0-573c-591d-99cd-b747b0a6096d',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canDelete',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.MERGE_MULTIPLE_RECORDS,
    hotKeys: null,
  },
  mergeWithRecord: {
    universalIdentifier: 'eb8acbd6-b285-466b-a172-7a643d8d5e3f',
    label: i18nLabel(
      msg({
        message: `Merge with Another {objectLabelSingular}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconArrowMerge',
    isPinned: false,
    position: 12,
    shortLabel: i18nLabel(
      msg({ message: `Merge`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '86d73737-c945-5ba5-9860-328dac4a4ce2',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: 'cd90af74-ff17-5838-a062-2d9a69ab05f9',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '75d0a7ad-c0d2-5c51-a907-036c894cfb25',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '8d205690-0c94-530f-8a37-b9867a9b1e6e',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS,
          subFieldName: 'isSystem',
          value: 'false',
        },
        {
          id: '5273ecbd-afd3-51f9-b72a-e21da541c510',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["workflow"]',
        },
        {
          id: '31097ee1-df28-5d97-83bb-508af04609e9',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["dashboard"]',
        },
        {
          id: '45579e4c-0686-510e-aa8c-a789d372eaed',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
        {
          id: '0bfdcbeb-a7c4-5b48-9128-e3e79752deab',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canDestroyObjectRecords',
          value: 'true',
        },
        {
          id: '735bff1a-140c-570d-a241-d2c624c1347d',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canUpdate',
          value: 'false',
        },
        {
          id: 'e1cd3db6-bb2c-5247-b878-5eb5a67ab8f3',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canDelete',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.MERGE_WITH_RECORD,
    hotKeys: null,
  },
  importRecords: {
    universalIdentifier: 'a2dc9de7-4798-422e-bb55-bfad7b9bdbe8',
    label: i18nLabel(
      msg({
        message: `Import {objectLabelPlural}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconFileImport',
    isPinned: false,
    position: 13,
    shortLabel: i18nLabel(
      msg({ message: `Import`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'ade15ccc-e7d3-5861-bd97-e6de58cdac81',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: '9cf29ebe-36ec-5d2f-b35c-a4b8003aa75b',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '2b68ba47-e40e-5806-b2a2-48aef1c37d04',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IMPORT_CSV',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.IMPORT_RECORDS,
    hotKeys: null,
  },
  exportView: {
    universalIdentifier: '80680f2a-c426-48b3-a839-c63a6183dc4b',
    label: i18nLabel(
      msg({ message: `Export View`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconFileExport',
    isPinned: false,
    position: 14,
    shortLabel: i18nLabel(
      msg({ message: `Export`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'b0039b05-5fb3-5575-affc-97794cdc7365',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: '14b335f3-b9e8-5cbd-80cb-1e0c776461ef',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'EXPORT_CSV',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.EXPORT_VIEW,
    hotKeys: null,
  },
  seeDeletedRecords: {
    universalIdentifier: 'd63c21c3-9785-4750-be87-5f36269b8e0d',
    label: i18nLabel(
      msg({
        message: `See deleted {objectLabelPlural}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconRotate2',
    isPinned: false,
    position: 15,
    shortLabel: i18nLabel(
      msg({
        message: `Deleted {objectLabelPlural}`,
        context: 'commandMenuItem.shortLabel',
      }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '199e8485-002e-550e-b715-a70d3c46765f',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: 'dcb45951-06d8-511d-9190-2707fd3117c1',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEE_DELETED_RECORDS,
    hotKeys: null,
  },
  createNewView: {
    universalIdentifier: '6ec7c339-e167-431d-bec6-d1c737df677c',
    label: i18nLabel(
      msg({ message: `Create View`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconLayout',
    isPinned: false,
    position: 16,
    shortLabel: i18nLabel(
      msg({ message: `Create View`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '199e8485-002e-550e-b715-a70d3c46765f',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: 'dcb45951-06d8-511d-9190-2707fd3117c1',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.CREATE_NEW_VIEW,
    hotKeys: null,
  },
  hideDeletedRecords: {
    universalIdentifier: '1420db7f-0fba-49e2-b23e-4b7caa0fafa0',
    label: i18nLabel(
      msg({
        message: `Hide deleted {objectLabelPlural}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconEyeOff',
    isPinned: false,
    position: 17,
    shortLabel: i18nLabel(
      msg({ message: `Hide deleted`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '301152f2-3242-5e20-a7dd-e097bfa08c42',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: '40c604ee-ce94-5932-b86a-31e569bb025b',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.HIDE_DELETED_RECORDS,
    hotKeys: null,
  },
  editRecordPageLayout: {
    universalIdentifier: 'd9794c67-1799-424f-8871-5ea771dd4a6d',
    label: i18nLabel(
      msg({ message: `Edit Layout`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPencil',
    isPinned: false,
    position: 18,
    shortLabel: i18nLabel(
      msg({ message: `Edit Layout`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '49a5e553-ad5b-542d-b5bc-45e6e2734bfb',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS_NOT,
          value: '["SETTINGS_PAGE"]',
        },
        {
          id: 'f371e46b-d471-5a5a-9afc-0650a98de21a',
          contextKey: 'isLayoutCustomizationModeEnabled',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '8893490b-fdeb-5ebc-acdf-2ae2be1bbef3',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'LAYOUTS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT,
    hotKeys: null,
  },
  editDashboardLayout: {
    universalIdentifier: 'b9b53bbc-3129-4eb9-8344-c3f9628ffa7d',
    label: i18nLabel(
      msg({ message: `Edit Dashboard`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPencil',
    isPinned: true,
    position: 19,
    shortLabel: i18nLabel(
      msg({ message: `Edit`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '89da22af-3eca-53ec-b11c-7c086c0e3f78',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '293ac7e1-243e-5fe5-9b19-9055d92c7188',
          contextKey: 'isDashboardPageLayoutInEditMode',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: 'e43f0110-84a1-550b-8ccb-aaf7c757aa0a',
          contextKey: 'isLayoutCustomizationModeEnabled',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '172ab618-1e62-5e86-b40c-b6342a02bff0',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '1bc2fd01-4ce2-5780-ba48-257ef45e5fbe',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'pageLayoutId',
        },
        {
          id: '581dc8d4-f962-5779-965e-5128a89e12dd',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.EDIT_DASHBOARD_LAYOUT,
    hotKeys: null,
  },
  saveDashboardLayout: {
    universalIdentifier: '18b23908-f816-42ab-bc0a-eb5fae29c695',
    label: i18nLabel(
      msg({ message: `Save Dashboard`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconDeviceFloppy',
    isPinned: true,
    position: 20,
    shortLabel: i18nLabel(
      msg({ message: `Save`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '36bab48d-6519-5f64-9716-fff559cf51f1',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '7ff7f78c-9fd1-51f4-b00a-051d5552c48a',
          contextKey: 'isDashboardPageLayoutInEditMode',
          operand: ViewFilterOperand.IS,
          value: 'true',
        },
        {
          id: 'b3fed787-76f2-56d9-8ae1-020d673233c6',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '669eef60-29bb-5ad9-8268-e71a21de5d68',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'pageLayoutId',
        },
        {
          id: 'e81fce7e-1b0b-5774-a883-102af21e0627',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SAVE_DASHBOARD_LAYOUT,
    hotKeys: null,
  },
  cancelDashboardLayout: {
    universalIdentifier: '030ecd01-0aaf-4e6d-8400-105996548887',
    label: i18nLabel(
      msg({ message: `Cancel Edition`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconCancel',
    isPinned: true,
    position: 21,
    shortLabel: i18nLabel(
      msg({ message: `Cancel`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '36bab48d-6519-5f64-9716-fff559cf51f1',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '7ff7f78c-9fd1-51f4-b00a-051d5552c48a',
          contextKey: 'isDashboardPageLayoutInEditMode',
          operand: ViewFilterOperand.IS,
          value: 'true',
        },
        {
          id: 'b3fed787-76f2-56d9-8ae1-020d673233c6',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '669eef60-29bb-5ad9-8268-e71a21de5d68',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'pageLayoutId',
        },
        {
          id: 'e81fce7e-1b0b-5774-a883-102af21e0627',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.CANCEL_DASHBOARD_LAYOUT,
    hotKeys: null,
  },
  duplicateDashboard: {
    universalIdentifier: '2ee07307-60ce-41ef-bfee-7c718f67557e',
    label: i18nLabel(
      msg({ message: `Duplicate Dashboard`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconCopyPlus',
    isPinned: false,
    position: 22,
    shortLabel: i18nLabel(
      msg({ message: `Duplicate`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'f0cb0a7f-6187-5c93-ba7c-c48700b8b9a8',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '5a5c4b4d-ed12-59fa-a539-a8a44baa23ab',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.dashboard.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DUPLICATE_DASHBOARD,
    hotKeys: null,
  },
  activateWorkflow: {
    universalIdentifier: '44f19c85-0fd0-482f-a14e-da513c60b1b3',
    label: i18nLabel(
      msg({ message: `Activate Workflow`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPower',
    isPinned: true,
    position: 23,
    shortLabel: i18nLabel(
      msg({ message: `Activate`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'c49c5602-dc61-5a63-a0dd-75ee9e542d21',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
          recordFilterGroupId: '3ff49a61-bf4e-577b-9b1b-77f92c5eafb1',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '660e4346-f7bd-5e64-a14f-16913a875ac5',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.trigger',
          recordFilterGroupId: '3ff49a61-bf4e-577b-9b1b-77f92c5eafb1',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '5b7be750-b902-50c3-b19c-87f82b77beb4',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.steps',
          recordFilterGroupId: '3ff49a61-bf4e-577b-9b1b-77f92c5eafb1',
          positionInRecordFilterGroup: 2,
        },
        {
          id: '4a1797ae-aa9e-518b-9d6c-c727a60e17cd',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.steps',
          recordFilterGroupId: '3ff49a61-bf4e-577b-9b1b-77f92c5eafb1',
          positionInRecordFilterGroup: 3,
        },
        {
          id: '2802f26e-b605-5970-b4b7-c6b63128843d',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currentVersion.status',
          value: '"DRAFT"',
          recordFilterGroupId: '29924f2a-c72b-5686-bc37-70f8ccf211ff',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'ada59c64-2fc9-5680-9fb8-622fc3af4295',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.DOES_NOT_CONTAIN,
          subFieldName: 'statuses',
          value: '"ACTIVE"',
          recordFilterGroupId: '29924f2a-c72b-5686-bc37-70f8ccf211ff',
          positionInRecordFilterGroup: 1,
        },
        {
          id: 'f13a1680-7e23-53bc-bf20-94fdf2de061f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '3ff49a61-bf4e-577b-9b1b-77f92c5eafb1',
          positionInRecordFilterGroup: 5,
        },
      ],
      recordFilterGroups: [
        {
          id: '3ff49a61-bf4e-577b-9b1b-77f92c5eafb1',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: '29924f2a-c72b-5686-bc37-70f8ccf211ff',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '3ff49a61-bf4e-577b-9b1b-77f92c5eafb1',
          positionInRecordFilterGroup: 4,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.ACTIVATE_WORKFLOW,
    hotKeys: null,
  },
  deactivateWorkflow: {
    universalIdentifier: '57f21a06-a17a-47b1-a123-90d90dbdf0b7',
    label: i18nLabel(
      msg({ message: `Deactivate Workflow`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPlayerPause',
    isPinned: true,
    position: 24,
    shortLabel: i18nLabel(
      msg({ message: `Deactivate`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '5efada72-46cb-5b33-9e54-fded92159ff7',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
          recordFilterGroupId: 'dbdb1357-0c0d-5d7c-a2bc-ed745e28356f',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'fcd5d9ea-8f9e-5077-a4a2-612719c46711',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currentVersion.status',
          value: '"ACTIVE"',
          recordFilterGroupId: 'd7521f62-256f-5a1a-a0af-673297a15484',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '340fae1e-13c4-53ef-a2dc-bcb2f331b9cd',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.CONTAINS,
          subFieldName: 'statuses',
          value: '"ACTIVE"',
          recordFilterGroupId: 'd7521f62-256f-5a1a-a0af-673297a15484',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '50104b6f-3542-5987-8f5c-4c41efbea1ea',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: 'dbdb1357-0c0d-5d7c-a2bc-ed745e28356f',
          positionInRecordFilterGroup: 2,
        },
        {
          id: '711efe9d-f458-5dd4-bdde-f485edab01a4',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canUpdate',
          value: 'false',
          recordFilterGroupId: 'dbdb1357-0c0d-5d7c-a2bc-ed745e28356f',
          positionInRecordFilterGroup: 3,
        },
      ],
      recordFilterGroups: [
        {
          id: 'dbdb1357-0c0d-5d7c-a2bc-ed745e28356f',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'd7521f62-256f-5a1a-a0af-673297a15484',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'dbdb1357-0c0d-5d7c-a2bc-ed745e28356f',
          positionInRecordFilterGroup: 1,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DEACTIVATE_WORKFLOW,
    hotKeys: null,
  },
  discardDraftWorkflow: {
    universalIdentifier: '4c227f2e-03bb-4a66-9b13-49f263264f4a',
    label: i18nLabel(
      msg({ message: `Discard Draft`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconNoteOff',
    isPinned: true,
    position: 25,
    shortLabel: i18nLabel(
      msg({ message: `Discard Draft`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'f4beb6e3-a6c3-5e6c-88b4-3c1fadc656ae',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'lastPublishedVersionId',
        },
        {
          id: 'cfd1dea2-e676-5743-bc93-dbc70608f005',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currentVersion.status',
          value: '"DRAFT"',
        },
        {
          id: 'ba6fb6b0-2221-524a-8571-43d2b17bf943',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DISCARD_DRAFT_WORKFLOW,
    hotKeys: null,
  },
  testWorkflow: {
    universalIdentifier: 'f85d552a-87a3-4667-99f7-71b47917539c',
    label: i18nLabel(
      msg({ message: `Test Workflow`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPlayerPlay',
    isPinned: true,
    position: 26,
    shortLabel: i18nLabel(
      msg({ message: `Test`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '72fe74ad-14b8-570c-9a5b-9abe7ce20554',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
          recordFilterGroupId: 'c7f7a79d-2962-5445-a810-5154aa00e4e2',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'a6cc0375-9d20-5f98-84ef-0e868e8a1cf0',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.trigger',
          recordFilterGroupId: 'c7f7a79d-2962-5445-a810-5154aa00e4e2',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '04993444-28fa-558b-831c-0c63a0b9fbce',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.steps',
          recordFilterGroupId: 'c7f7a79d-2962-5445-a810-5154aa00e4e2',
          positionInRecordFilterGroup: 2,
        },
        {
          id: 'd73c8321-ba63-5d25-9aa3-3a475dd328e1',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.steps',
          recordFilterGroupId: 'c7f7a79d-2962-5445-a810-5154aa00e4e2',
          positionInRecordFilterGroup: 3,
        },
        {
          id: '51867da4-1fd2-58d4-b5df-91dae83432b9',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currentVersion.trigger.type',
          value: '"MANUAL"',
          recordFilterGroupId: 'd86031aa-a3cd-56d5-bc78-f729f2feb006',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'fdadd068-4757-57f1-a11b-8624f666a1b6',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'currentVersion.trigger.settings.objectType',
          recordFilterGroupId: 'd86031aa-a3cd-56d5-bc78-f729f2feb006',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '029f27be-387d-50ac-8f15-641eedc79c2b',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currentVersion.trigger.type',
          value: '"WEBHOOK"',
          recordFilterGroupId: 'ce81afdc-0593-5831-a5e8-dbe16ccf38dc',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '1a32b2ce-e30c-5239-ad94-d9411179597f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currentVersion.trigger.type',
          value: '"CRON"',
          recordFilterGroupId: 'ce81afdc-0593-5831-a5e8-dbe16ccf38dc',
          positionInRecordFilterGroup: 2,
        },
        {
          id: '1d0f17f4-e917-532d-8eda-45af44c66e4f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: 'c7f7a79d-2962-5445-a810-5154aa00e4e2',
          positionInRecordFilterGroup: 5,
        },
      ],
      recordFilterGroups: [
        {
          id: 'c7f7a79d-2962-5445-a810-5154aa00e4e2',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'ce81afdc-0593-5831-a5e8-dbe16ccf38dc',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: 'c7f7a79d-2962-5445-a810-5154aa00e4e2',
          positionInRecordFilterGroup: 4,
        },
        {
          id: 'd86031aa-a3cd-56d5-bc78-f729f2feb006',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
          parentRecordFilterGroupId: 'ce81afdc-0593-5831-a5e8-dbe16ccf38dc',
          positionInRecordFilterGroup: 0,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.TEST_WORKFLOW,
    hotKeys: null,
  },
  seeRunsWorkflow: {
    universalIdentifier: 'e57efc2d-00a2-493a-b76c-f2dabd23a5eb',
    label: i18nLabel(
      msg({ message: `See Runs`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconHistoryToggle',
    isPinned: true,
    position: 28,
    shortLabel: i18nLabel(
      msg({ message: `See Runs`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '07e92a54-c129-513d-8280-dc8a2938a40a',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '5f2c8176-e0a3-50d2-9ff6-1b7c2d306fe4',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEE_RUNS_WORKFLOW,
    hotKeys: null,
  },
  seeVersionsWorkflow: {
    universalIdentifier: '92781d24-b875-4282-8cdb-d127f04a5c7d',
    label: i18nLabel(
      msg({
        message: `See Versions History`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconVersions',
    isPinned: false,
    position: 29,
    shortLabel: i18nLabel(
      msg({ message: `See Versions`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '07e92a54-c129-513d-8280-dc8a2938a40a',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '5f2c8176-e0a3-50d2-9ff6-1b7c2d306fe4',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEE_VERSIONS_WORKFLOW,
    hotKeys: null,
  },
  tidyUpWorkflow: {
    universalIdentifier: '1f3a3cab-161a-4775-af47-11be4d0bf411',
    label: i18nLabel(
      msg({ message: `Tidy up Workflow`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconReorder',
    isPinned: false,
    position: 31,
    shortLabel: i18nLabel(
      msg({ message: `Tidy up`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '18d8cfdb-1e3d-5c07-9f20-2cb519b9ea99',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '033a7578-86f2-5d0b-bc94-ae32ab34460f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.trigger',
        },
        {
          id: '4bd7fe81-4a1c-5963-8169-4d4d24590231',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.steps',
        },
        {
          id: '4aade542-4faf-5874-bae6-5757fe098404',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion.steps',
        },
        {
          id: '9e297768-eec1-5223-b986-2bb2cdf2e483',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '96003c98-280b-5ab2-a564-c2aae4111e51',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canUpdate',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.TIDY_UP_WORKFLOW,
    hotKeys: null,
  },
  duplicateWorkflow: {
    universalIdentifier: '91094438-b4c2-46ad-a23b-8af4b23ba514',
    label: i18nLabel(
      msg({ message: `Duplicate Workflow`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconCopy',
    isPinned: false,
    position: 32,
    shortLabel: i18nLabel(
      msg({ message: `Duplicate`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'd0dc218d-01a8-56b0-8862-ec6473fc19c5',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'currentVersion',
        },
        {
          id: 'b5cb5e82-5ee7-5001-ab32-a18256215dd0',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '0680a231-a943-5ceb-baaa-391095dcf87c',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canUpdate',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DUPLICATE_WORKFLOW,
    hotKeys: null,
  },
  makeWorkflowPrivate: {
    universalIdentifier: '26f98606-8b6e-42f2-bc97-2cfc4359bada',
    label: i18nLabel(
      msg({
        message: `Make Workflow Private`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconCircleDashed',
    isPinned: false,
    position: 33,
    shortLabel: i18nLabel(
      msg({ message: `Make Private`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '6809c8b4-fb56-5009-ae0f-db24bff6e765',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '08ccb09c-aac1-5ec0-913f-9613abe81504',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'visibility',
          value: '"WORKSPACE"',
        },
        {
          id: '86f214ea-713c-5205-9e0a-14d93d366a27',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'canChangeVisibility',
        },
        {
          id: '2469509b-2ae1-526f-8670-75b8cac231fe',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: 'bd00401d-2d45-5553-9db1-d2644e160aae',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canUpdate',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.TOGGLE_WORKFLOW_VISIBILITY,
    hotKeys: null,
  },
  shareWorkflowWithWorkspace: {
    universalIdentifier: '37745922-ba18-4bea-a1da-8625ad22d233',
    label: i18nLabel(
      msg({
        message: `Share Workflow with Workspace`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconCircle',
    isPinned: false,
    position: 33,
    shortLabel: i18nLabel(
      msg({
        message: `Share with Workspace`,
        context: 'commandMenuItem.shortLabel',
      }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'df62e6ea-807a-5b58-abb6-c797658cfe19',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '07c36aa9-a89c-56ba-92fb-1e3e53dc7992',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'visibility',
          value: '"PRIVATE"',
        },
        {
          id: '7865d6c7-6ac6-596d-8d3f-e2e5643e98da',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'canChangeVisibility',
        },
        {
          id: '77da003d-7644-5c99-8c8f-66068dd4b929',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflow.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.TOGGLE_WORKFLOW_VISIBILITY,
    hotKeys: null,
  },
  seeWorkflowWorkflowRun: {
    universalIdentifier: '9d9cc62d-3543-45c3-93f3-23d2d8979f2b',
    label: i18nLabel(
      msg({ message: `See Workflow`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSettingsAutomation',
    isPinned: true,
    position: 34,
    shortLabel: i18nLabel(
      msg({ message: `See Workflow`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: null,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflowRun.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEE_WORKFLOW_WORKFLOW_RUN,
    hotKeys: null,
  },
  stopWorkflowRun: {
    universalIdentifier: '4c186606-9515-4561-a1eb-9a072b4f5e58',
    label: i18nLabel(
      msg({ message: `Stop`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPlayerStop',
    isPinned: true,
    position: 35,
    shortLabel: i18nLabel(
      msg({ message: `Stop`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'cbdabac2-8f64-538d-aacd-bc5db2f0ba67',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: 'c0f4b484-614d-566e-b254-a99e4d1a51f9',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '7039b1da-d71b-573a-a7a9-dddfa7f06ca0',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"NOT_STARTED"',
          recordFilterGroupId: 'c0f4b484-614d-566e-b254-a99e4d1a51f9',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '318fe83b-d3cd-5c80-8da3-c9347db87d25',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"ENQUEUED"',
          recordFilterGroupId: 'c0f4b484-614d-566e-b254-a99e4d1a51f9',
          positionInRecordFilterGroup: 2,
        },
        {
          id: 'b75ae3c7-0031-5d54-9639-c1ec42e3b46e',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"RUNNING"',
          recordFilterGroupId: 'c0f4b484-614d-566e-b254-a99e4d1a51f9',
          positionInRecordFilterGroup: 3,
        },
      ],
      recordFilterGroups: [
        {
          id: 'c0f4b484-614d-566e-b254-a99e4d1a51f9',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
      selectedRecordsMatch: 'SOME',
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflowRun.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.STOP_WORKFLOW_RUN,
    hotKeys: null,
  },
  retryWorkflowRun: {
    universalIdentifier: '99b97c50-b31b-411a-a532-ec05402123c0',
    label: i18nLabel(
      msg({ message: `Retry`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconRefresh',
    isPinned: true,
    position: 36,
    shortLabel: i18nLabel(
      msg({ message: `Retry`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '2167d9ee-6747-581b-a4d3-9c64eb898b1e',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"FAILED"',
        },
      ],
      selectedRecordsMatch: 'SOME',
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflowRun.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.RETRY_WORKFLOW_RUN,
    hotKeys: null,
  },
  seeRunsWorkflowVersion: {
    universalIdentifier: '44e305c7-4f0a-45ec-803f-6471b56455cb',
    label: i18nLabel(
      msg({ message: `See Runs`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconHistoryToggle',
    isPinned: true,
    position: 37,
    shortLabel: i18nLabel(
      msg({ message: `See Runs`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '8ee0f153-6bcd-50eb-8d00-798d3396fef3',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'workflow',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflowVersion.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEE_RUNS_WORKFLOW_VERSION,
    hotKeys: null,
  },
  seeWorkflowWorkflowVersion: {
    universalIdentifier: 'b43052db-023e-4083-9b63-2c2dfbfd1320',
    label: i18nLabel(
      msg({ message: `See Workflow`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSettingsAutomation',
    isPinned: true,
    position: 38,
    shortLabel: i18nLabel(
      msg({ message: `See Workflow`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '663e3abf-1ea9-5fbe-933d-4eef451aff4f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'workflow.id',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflowVersion.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEE_WORKFLOW_WORKFLOW_VERSION,
    hotKeys: null,
  },
  useAsDraftWorkflowVersion: {
    universalIdentifier: '483c0c1d-ea4d-4a4d-8a59-2dcf9f8e38f6',
    label: i18nLabel(
      msg({ message: `Use as Draft`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPencil',
    isPinned: true,
    position: 39,
    shortLabel: i18nLabel(
      msg({ message: `Use as Draft`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'db01bb10-8a45-5a81-a699-098a3dc06600',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'status',
          value: '"DRAFT"',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflowVersion.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.USE_AS_DRAFT_WORKFLOW_VERSION,
    hotKeys: null,
  },
  seeVersionsWorkflowVersion: {
    universalIdentifier: '1d4abeb7-2750-4af7-9a92-fbadd2a9e4ba',
    label: i18nLabel(
      msg({
        message: `See Versions History`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconVersions',
    isPinned: false,
    position: 40,
    shortLabel: i18nLabel(
      msg({ message: `See Versions`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '8ee0f153-6bcd-50eb-8d00-798d3396fef3',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'workflow',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.workflowVersion.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEE_VERSIONS_WORKFLOW_VERSION,
    hotKeys: null,
  },
  searchRecords: {
    universalIdentifier: 'fa24e25e-68f8-4548-82ff-c7b5168b7c7d',
    label: i18nLabel(
      msg({ message: `Search`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSearch',
    isPinned: false,
    position: 41,
    shortLabel: i18nLabel(
      msg({ message: `Search`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEARCH_RECORDS,
    hotKeys: ['/'],
  },
  searchRecordsFallback: {
    universalIdentifier: 'c659890c-7266-46c9-bfe1-75cefff8b6d0',
    label: i18nLabel(
      msg({ message: `Search`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSearch',
    isPinned: false,
    position: 42,
    shortLabel: i18nLabel(
      msg({ message: `Search`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.FALLBACK,
    conditionalAvailability: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEARCH_RECORDS_FALLBACK,
    hotKeys: ['/'],
  },
  askAi: {
    universalIdentifier: 'ce5fb54d-2b19-4dd1-b7b4-9532a1761a41',
    label: i18nLabel(
      msg({ message: `Ask AI`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconMessageCirclePlus',
    isPinned: true,
    position: 43,
    shortLabel: null,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '4b975042-bf92-5e95-aa01-ca7fb0fc8007',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '448ac662-6ec0-5ec1-82a9-b8441aa44059',
          contextKey: 'isInSidePanel',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
        {
          id: '8e205b23-e19a-5a22-9dac-5d9dc45379bf',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'nameSingular',
          value: '["agentChatThread"]',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.ASK_AI,
    hotKeys: ['@'],
  },
  viewPreviousAiChats: {
    universalIdentifier: '3084c3c9-cc23-4dad-9e00-92025f5cba7a',
    label: i18nLabel(
      msg({
        message: `Open chat`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconMessage',
    isPinned: false,
    position: 44,
    shortLabel: i18nLabel(
      msg({
        message: `Open chat`,
        context: 'commandMenuItem.shortLabel',
      }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '04716c91-fa12-519c-8604-0ffdfec4c60a',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.VIEW_PREVIOUS_AI_CHATS,
    hotKeys: null,
  },
  newAiChat: {
    universalIdentifier: '604bc9b2-e438-4572-bd35-726fa0fb2ec7',
    label: i18nLabel(
      msg({ message: `New chat`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconMessageCirclePlus',
    isPinned: true,
    position: 43,
    shortLabel: i18nLabel(
      msg({ message: `New chat`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '04716c91-fa12-519c-8604-0ffdfec4c60a',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    conditionalPinned: {
      recordFilters: [
        {
          id: 'cc97ceaa-7fc6-5940-b9fc-16f67d3c9d26',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '1b32a4bb-b8e3-54f3-963d-e6fca73f5917',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS,
          subFieldName: 'nameSingular',
          value: '["agentChatThread"]',
        },
        {
          id: 'b3c7e551-62d4-5d9f-9532-b1798d243090',
          contextKey: 'isInSidePanel',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NEW_AI_CHAT,
    hotKeys: null,
  },
  shareRecord: {
    universalIdentifier: 'b9336f9f-d10c-42c0-b7cd-40c94ae235ef',
    label: i18nLabel(
      msg({
        message: `Share {objectLabelSingular}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconShare',
    isPinned: false,
    position: 3,
    shortLabel: i18nLabel(
      msg({ message: `Share`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '07e92a54-c129-513d-8280-dc8a2938a40a',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '5f2c8176-e0a3-50d2-9ff6-1b7c2d306fe4',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SHARE_RECORD,
    hotKeys: null,
  },
  markAiChatAsRead: {
    universalIdentifier: '094d0b1f-91db-4e9a-ae8e-eed425b788b4',
    label: i18nLabel(
      msg({ message: `Mark as read`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconEye',
    isPinned: false,
    position: 73,
    shortLabel: i18nLabel(
      msg({ message: `Mark as read`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '22c04b9a-0704-5418-ac3f-d8dc39d6f00a',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: 'ed6afdaf-7da4-54f8-a30a-44a092b6bc26',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: 'd21d5700-88bd-5c5d-8040-2507a11654e3',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: '11adc863-c9a6-5d90-b8e1-d4d4e610e73b',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '90a7ce7f-32d8-5ee1-aada-8ac5da288624',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'inboxStatus.isUnread',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.MARK_AI_CHAT_AS_READ,
    hotKeys: null,
  },
  markAiChatAsUnread: {
    universalIdentifier: '3a7762aa-2090-4113-85a6-f41295b9aed6',
    label: i18nLabel(
      msg({ message: `Mark as unread`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconEyeOff',
    isPinned: false,
    position: 74,
    shortLabel: i18nLabel(
      msg({ message: `Mark as unread`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'f43baa68-b936-56f9-9983-bd3ca0b3690a',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: 'f559b0f8-d7b2-53b3-8431-b46334f40948',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '14597421-d206-585f-b1ae-a4056737bad8',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: 'ae2f10f6-2028-53a0-9874-cc63fd1cb3ad',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: 'f3519e77-af08-5bfb-8976-c6b2c7c27ac6',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'inboxStatus.isUnread',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.MARK_AI_CHAT_AS_UNREAD,
    hotKeys: null,
  },
  markAiChatAsDone: {
    universalIdentifier: 'be18e927-4873-496d-bc12-b767b995653f',
    label: i18nLabel(
      msg({ message: `Mark as done`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconCheck',
    isPinned: true,
    position: 75,
    shortLabel: i18nLabel(
      msg({ message: `Done`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '1357176a-571a-52af-bd0f-adb0e4da5792',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: 'a8cc854c-73a4-5719-a386-81b8b061c157',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '427e7c63-07e5-5310-8c9a-d27b5be124cc',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: 'faa97ae9-225a-5bc9-b0e8-13184fda0014',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '9c872899-9d82-54e0-b89a-4e7a71348f68',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'inboxStatus.scope',
          value: '"INBOX"',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.MARK_AI_CHAT_AS_DONE,
    hotKeys: ['E'],
  },
  reopenAiChat: {
    universalIdentifier: 'c3166829-0e0e-4821-9851-de5cf18945f3',
    label: i18nLabel(
      msg({ message: `Reopen`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconCircleDashed',
    isPinned: true,
    position: 76,
    shortLabel: i18nLabel(
      msg({ message: `Reopen`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '805e4667-2259-5695-b333-766f726ef0db',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: '08035929-19b8-5f9d-aacc-3921c80de034',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '10bc51f2-a187-5c31-ba3c-438f83f3e47d',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: 'afbbebf6-881b-5f65-b9f0-d45e309f8dbf',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: 'c8dc2002-1a63-5654-adc2-f0759322266f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'inboxStatus.scope',
          value: '"ARCHIVED"',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.REOPEN_AI_CHAT,
    hotKeys: ['E'],
  },
  unsnoozeAiChat: {
    universalIdentifier: '0fdab734-1e64-498d-8d3b-606e7f64d224',
    label: i18nLabel(
      msg({ message: `Unsnooze`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconZzzOff',
    isPinned: true,
    position: 76,
    shortLabel: i18nLabel(
      msg({ message: `Unsnooze`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'ac713890-1c73-5e75-b69f-96b6e699b307',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: '7ccc825f-c05c-5bd8-8a6c-d9e0ed4be5cb',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '1889c9dd-0e87-51d6-b7ba-19ddb4e0b53a',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: 'c0360796-9523-5cc0-b01e-854971338cc2',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '8dfb0b66-5158-59c0-874c-7c857fb8d471',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'inboxStatus.scope',
          value: '"SNOOZED"',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.REOPEN_AI_CHAT,
    hotKeys: ['E'],
  },
  snoozeAiChat: {
    universalIdentifier: '9fbb747d-2e09-4822-a1e5-6792d0a28fb7',
    label: i18nLabel(
      msg({ message: `Snooze`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconZzz',
    isPinned: true,
    position: 77,
    shortLabel: i18nLabel(
      msg({ message: `Snooze`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '52f659ed-6a54-580f-a19f-ffd584deb478',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: 'd4280929-1ca3-5d8e-9da9-a4e9d3a4e60b',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '515e13ad-4671-5971-b68e-ce5f9512e663',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: '2c3c9d15-334a-5979-8c6f-34f37c06c8c7',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '69ecc3a2-188e-5347-a7c4-23fe1f04af4f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          subFieldName: 'inboxStatus',
        },
        {
          id: 'ab01a650-81f1-5396-8069-4711b0f31f50',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'inboxStatus.scope',
          value: '"SNOOZED"',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SNOOZE_AI_CHAT,
    hotKeys: ['H'],
  },
  subscribeToAiChat: {
    universalIdentifier: 'bf5345f0-14d3-438b-ab02-1daa5386743f',
    label: i18nLabel(
      msg({ message: `Subscribe`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconBell',
    isPinned: false,
    position: 78,
    shortLabel: i18nLabel(
      msg({ message: `Subscribe`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '3d1313d4-b69b-548f-9357-570b9f900038',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: 'e166a6a3-de37-538e-bcc1-69a628c5539f',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '052b7b57-4b8e-5611-b016-1e865ee95651',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: '97e7f065-ab41-5dd5-b902-1b38d800e7ba',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '4ef86358-eb93-5903-bec0-686684717075',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'inboxStatus.isSubscribed',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SUBSCRIBE_TO_AI_CHAT,
    hotKeys: null,
  },
  unsubscribeFromAiChat: {
    universalIdentifier: '31dbf857-d442-447a-be76-e4eb8ef34fcf',
    label: i18nLabel(
      msg({ message: `Unsubscribe`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconBellOff',
    isPinned: false,
    position: 79,
    shortLabel: i18nLabel(
      msg({ message: `Unsubscribe`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'f12994ad-a56f-5597-a900-50e49a4f076f',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: '57b55932-25a2-50d3-8b44-e68a996bc982',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: 'f31938ae-7de1-5469-826c-a55f40e2df19',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: '61dcef69-18e6-5971-9e5e-c1370379e3bd',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '36f0790a-9339-5120-8351-8e0f1bf10fbc',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'inboxStatus.isSubscribed',
          value: 'true',
        },
        {
          id: 'bd070d32-811b-5aaa-83ef-f551021b914d',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'inboxStatus.isAssignedToMe',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.UNSUBSCRIBE_FROM_AI_CHAT,
    hotKeys: null,
  },
  assignAiChat: {
    universalIdentifier: '8e5a5bf5-fc62-4fe8-a419-a01051306668',
    label: i18nLabel(
      msg({ message: `Assign`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconUsers',
    isPinned: true,
    position: 80,
    shortLabel: i18nLabel(
      msg({ message: `Assign`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '0d6dc6c5-fe1e-500d-97aa-745c42fda349',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: 'a911468d-e82b-5791-8c2d-074e0c39c6d4',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'AI',
          value: 'true',
        },
        {
          id: '8a0ed405-a545-523c-867d-524dca576fa3',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_AI_CHAT_INBOX_ENABLED',
          value: 'true',
        },
        {
          id: '06ac3893-f194-5e58-a502-3e984dd9bc5c',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: '7c3727fe-05ad-5723-9fdf-23d2004a91fc',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_NOT,
          subFieldName: 'recordPermissions.canUpdate',
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.ASSIGN_AI_CHAT,
    hotKeys: ['A'],
  },
  shareAnyRecord: {
    universalIdentifier: '1e703e2c-9f3a-4a23-8448-107b01be509c',
    label: i18nLabel(
      msg({
        message: `Share {objectLabelSingular}`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconShare',
    isPinned: false,
    position: 3,
    shortLabel: i18nLabel(
      msg({ message: `Share`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '70f3136f-3ad5-5c63-bcc3-1f662e2b85ef',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: 'dbc35ac6-f905-5e3f-8e7a-a49ba3a34d8d',
          contextKey: 'featureFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'IS_RECORD_LEVEL_SHARING_ENABLED',
          value: 'true',
        },
        {
          id: '8172273b-a1ce-549a-9be4-13f0b2bd3c1a',
          contextKey: 'objectMetadataItem',
          operand: ViewFilterOperand.IS,
          subFieldName: 'isSystem',
          value: 'false',
        },
        {
          id: '1f826621-3a78-55d4-b88c-c3454f336f7a',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SHARE_RECORD,
    hotKeys: null,
  },
  replyToEmailThread: {
    universalIdentifier: '8f015cbd-c764-434e-a6c6-bb7581b4be44',
    label: i18nLabel(
      msg({ message: `Reply`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconArrowBackUp',
    isPinned: true,
    position: 45,
    shortLabel: i18nLabel(
      msg({ message: `Reply`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '0bc55c03-ca36-56ad-8eca-1e6da50b571b',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageThread.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.REPLY_TO_EMAIL_THREAD,
    hotKeys: null,
  },
  composeEmail: {
    universalIdentifier: '96457c5a-b028-4d48-94e3-27f4c41296b8',
    label: i18nLabel(
      msg({ message: `Compose Email`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconMail',
    isPinned: false,
    position: 46,
    shortLabel: i18nLabel(
      msg({ message: `Compose`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '694d99e8-6a28-5091-af56-a86296e7b166',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'SEND_EMAIL_TOOL',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.COMPOSE_EMAIL,
    hotKeys: null,
  },
  composeCampaign: {
    universalIdentifier: '30473656-e7cb-42e0-b198-6c4e8b906106',
    label: i18nLabel(
      msg({ message: `Compose Campaign`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSend',
    isPinned: false,
    position: 66,
    shortLabel: i18nLabel(
      msg({ message: `Campaign`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.COMPOSE_CAMPAIGN,
    hotKeys: null,
  },
  composeCampaignPinned: {
    universalIdentifier: '7ad6f0c7-ac02-4062-b5cf-1f36e1664bc8',
    label: i18nLabel(
      msg({ message: `Create Campaign`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPlus',
    isPinned: true,
    position: 67,
    shortLabel: i18nLabel(
      msg({ message: `Create`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '8ec62229-ee83-5d7e-b27c-fc1337c95555',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
      ],
    } satisfies ConditionalDisplay,
    conditionalPinned: {
      recordFilters: [
        {
          id: 'd7dcba01-724a-5a9f-ac3a-feefb2e78263',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '0',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.COMPOSE_CAMPAIGN,
    hotKeys: null,
  },
  sendMessageCampaign: {
    universalIdentifier: 'b08f4ccd-070b-460f-a4b6-6d0c14f1c44d',
    label: i18nLabel(
      msg({ message: `Send Campaign`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSend',
    isPinned: true,
    position: 68,
    shortLabel: i18nLabel(
      msg({ message: `Send`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '03a70e06-9cb1-55d1-85cf-74ce5e7ab83d',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
          recordFilterGroupId: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'fb0c0318-8e01-523f-ae57-02f14263ab83',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"DRAFT"',
          recordFilterGroupId: 'c9f4f94f-34f8-59aa-93c9-2e6de1a09a1f',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '6b6f8725-a1eb-5434-93e2-ee8c947e331e',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"SCHEDULED"',
          recordFilterGroupId: 'c9f4f94f-34f8-59aa-93c9-2e6de1a09a1f',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '820d9792-f62a-5e5f-9d12-4f3dfd8d87ce',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          positionInRecordFilterGroup: 2,
        },
      ],
      recordFilterGroups: [
        {
          id: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'c9f4f94f-34f8-59aa-93c9-2e6de1a09a1f',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          positionInRecordFilterGroup: 1,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEND_MESSAGE_CAMPAIGN,
    hotKeys: null,
  },
  sendMessageCampaignTest: {
    universalIdentifier: 'a6e6fd08-2c75-4d43-8795-1baafbac165e',
    label: i18nLabel(
      msg({ message: `Send Test Email`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconMail',
    isPinned: true,
    position: 69,
    shortLabel: i18nLabel(
      msg({ message: `Test`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '03a70e06-9cb1-55d1-85cf-74ce5e7ab83d',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
          recordFilterGroupId: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'fb0c0318-8e01-523f-ae57-02f14263ab83',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"DRAFT"',
          recordFilterGroupId: 'c9f4f94f-34f8-59aa-93c9-2e6de1a09a1f',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '6b6f8725-a1eb-5434-93e2-ee8c947e331e',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"SCHEDULED"',
          recordFilterGroupId: 'c9f4f94f-34f8-59aa-93c9-2e6de1a09a1f',
          positionInRecordFilterGroup: 1,
        },
        {
          id: '820d9792-f62a-5e5f-9d12-4f3dfd8d87ce',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          positionInRecordFilterGroup: 2,
        },
      ],
      recordFilterGroups: [
        {
          id: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'c9f4f94f-34f8-59aa-93c9-2e6de1a09a1f',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '564b10df-4216-5ab3-b6ba-f6f4ba97110c',
          positionInRecordFilterGroup: 1,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.SEND_MESSAGE_CAMPAIGN_TEST,
    hotKeys: null,
  },
  cancelMessageCampaign: {
    universalIdentifier: 'b266ca2d-f6bb-4c45-aace-a44d5099f6af',
    label: i18nLabel(
      msg({ message: `Cancel Campaign`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconX',
    isPinned: true,
    position: 71,
    shortLabel: i18nLabel(
      msg({ message: `Cancel`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'e17f3450-7374-53f7-a93c-5c44dda1735b',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
          recordFilterGroupId: '36008439-aeb0-5cc5-a0db-75d67e6ca57e',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '5d20e88d-8c9b-5613-b629-3a8be250106d',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"SCHEDULED"',
          recordFilterGroupId: 'd834766d-d5af-5055-a071-c96c79486a8b',
          positionInRecordFilterGroup: 0,
        },
        {
          id: 'dade4ec6-dd9d-5682-958b-73cf7de3648f',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"SENDING"',
          recordFilterGroupId: 'd834766d-d5af-5055-a071-c96c79486a8b',
          positionInRecordFilterGroup: 1,
        },
        {
          id: 'f2f7cdbd-023c-5fcf-803e-817558f751d7',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '36008439-aeb0-5cc5-a0db-75d67e6ca57e',
          positionInRecordFilterGroup: 2,
        },
      ],
      recordFilterGroups: [
        {
          id: '36008439-aeb0-5cc5-a0db-75d67e6ca57e',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'd834766d-d5af-5055-a071-c96c79486a8b',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '36008439-aeb0-5cc5-a0db-75d67e6ca57e',
          positionInRecordFilterGroup: 1,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.CANCEL_MESSAGE_CAMPAIGN,
    hotKeys: null,
  },
  duplicateMessageCampaign: {
    universalIdentifier: 'b85e34bd-abfa-40b5-91c0-e5d64b586341',
    label: i18nLabel(
      msg({ message: `Duplicate Campaign`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconCopy',
    isPinned: true,
    position: 72,
    shortLabel: i18nLabel(
      msg({ message: `Duplicate`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '140e6b86-2ad4-5e26-94d8-051301ca7763',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '43be8d79-37b6-55cf-b5a9-079a95182f8a',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: 'eaf74742-e2ad-5f89-8292-71f0b2b12844',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    conditionalPinned: {
      recordFilters: [
        {
          id: 'c4e43f28-f4db-5169-a74a-35897c3ace1a',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"SENT"',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DUPLICATE_MESSAGE_CAMPAIGN,
    hotKeys: null,
  },
  emailBlockSettings: {
    universalIdentifier: '5c8a2f41-97be-4f3d-9a46-2f18d17f30a2',
    label: i18nLabel(
      msg({ message: `Add Block`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPlus',
    isPinned: true,
    position: 70,
    shortLabel: i18nLabel(
      msg({ message: `Add Block`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '8ba8f872-8c91-5b5a-92f2-b5f2e0703722',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '3ddaaf05-4f61-5521-9cac-349ace7fc7c0',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '9494b4ca-a8ab-59be-bcc1-3c133b052d1e',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"DRAFT"',
        },
        {
          id: '6919beaa-4ca3-5823-b8b1-f55cf4e5af1a',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.EMAIL_BLOCK_SETTINGS,
    hotKeys: null,
  },
  emailPageStyle: {
    universalIdentifier: 'c1c2d63f-7ec3-46aa-8a79-414cefb42705',
    label: i18nLabel(
      msg({ message: `Email Style`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconPaint',
    isPinned: false,
    position: 70.5,
    shortLabel: i18nLabel(
      msg({ message: `Email Style`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '8ba8f872-8c91-5b5a-92f2-b5f2e0703722',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["RECORD_PAGE"]',
        },
        {
          id: '3ddaaf05-4f61-5521-9cac-349ace7fc7c0',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '9494b4ca-a8ab-59be-bcc1-3c133b052d1e',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS,
          subFieldName: 'status',
          value: '"DRAFT"',
        },
        {
          id: '6919beaa-4ca3-5823-b8b1-f55cf4e5af1a',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageCampaign.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.EMAIL_PAGE_STYLE,
    hotKeys: null,
  },
  goToSettings: {
    universalIdentifier: 'ef9aba44-0068-453e-930a-f8c182af18ee',
    label: i18nLabel(
      msg({ message: `Go to Settings`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSettings',
    isPinned: false,
    position: 47,
    shortLabel: i18nLabel(
      msg({ message: `Settings`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: ['G', 'S'],
    payload: { path: '/settings/profile' },
  },
  goToSettingsExperience: {
    universalIdentifier: 'bceb0328-c018-48ba-80d8-a1a97dc0a8ba',
    label: i18nLabel(
      msg({
        message: `Go to Experience Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconColorSwatch',
    isPinned: false,
    position: 48,
    shortLabel: i18nLabel(
      msg({ message: `Experience`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/experience' },
  },
  goToSettingsAccounts: {
    universalIdentifier: '447a65cc-8535-408e-9c48-db24affb7530',
    label: i18nLabel(
      msg({
        message: `Go to Accounts Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconAt',
    isPinned: false,
    position: 49,
    shortLabel: i18nLabel(
      msg({ message: `Accounts`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '2418b11a-efb2-50bc-9ec0-d04fdf2c6761',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'CONNECTED_ACCOUNTS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/accounts' },
  },
  goToSettingsAccountsEmails: {
    universalIdentifier: '4feab22c-165f-4d13-81ca-c9eb6082ca50',
    label: i18nLabel(
      msg({
        message: `Go to Emails Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconMail',
    isPinned: false,
    position: 50,
    shortLabel: i18nLabel(
      msg({ message: `Emails`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '2418b11a-efb2-50bc-9ec0-d04fdf2c6761',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'CONNECTED_ACCOUNTS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/accounts/emails' },
  },
  goToSettingsAccountsCalendars: {
    universalIdentifier: '3267ec0e-9dee-4d9b-8f1b-6005bfd90202',
    label: i18nLabel(
      msg({
        message: `Go to Calendars Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconCalendarEvent',
    isPinned: false,
    position: 51,
    shortLabel: i18nLabel(
      msg({ message: `Calendars`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '2418b11a-efb2-50bc-9ec0-d04fdf2c6761',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'CONNECTED_ACCOUNTS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/accounts/calendars' },
  },
  goToSettingsGeneral: {
    universalIdentifier: 'ad68e516-96ea-455a-a838-c59788e88c23',
    label: i18nLabel(
      msg({
        message: `Go to General Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconSettings',
    isPinned: false,
    position: 52,
    shortLabel: i18nLabel(
      msg({ message: `General`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '4c4f8494-2f30-58b7-8dbc-b3e20e719efb',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'WORKSPACE',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/general' },
  },
  goToSettingsObjects: {
    universalIdentifier: '9302bfeb-f6cd-4858-ab5b-5f70f4d358c4',
    label: i18nLabel(
      msg({
        message: `Go to Data Model Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconHierarchy',
    isPinned: false,
    position: 53,
    shortLabel: i18nLabel(
      msg({ message: `Data Model`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '2466f4f9-a327-562a-a536-94401e6adb49',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'DATA_MODEL',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/objects' },
  },
  goToSettingsMembers: {
    universalIdentifier: 'fb4d9f1b-5b13-49d9-8353-80041719d411',
    label: i18nLabel(
      msg({
        message: `Go to Members Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconUsers',
    isPinned: false,
    position: 54,
    shortLabel: i18nLabel(
      msg({ message: `Members`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'b30e458e-bcae-539e-a370-9e0370e6c4f3',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'WORKSPACE_MEMBERS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/members' },
  },
  goToSettingsRoles: {
    universalIdentifier: '4050f307-c592-4c9f-ad91-89cde330fbf7',
    label: i18nLabel(
      msg({
        message: `Go to Roles Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconLock',
    isPinned: false,
    position: 55,
    shortLabel: i18nLabel(
      msg({ message: `Roles`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'b30e458e-bcae-539e-a370-9e0370e6c4f3',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'WORKSPACE_MEMBERS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/members#roles' },
  },
  goToSettingsDomains: {
    universalIdentifier: '2d071684-fb5e-4222-b560-4c7ab2597fb4',
    label: i18nLabel(
      msg({
        message: `Go to Domains Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconWorld',
    isPinned: false,
    position: 56,
    shortLabel: i18nLabel(
      msg({ message: `Domains`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '4c4f8494-2f30-58b7-8dbc-b3e20e719efb',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'WORKSPACE',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/domains' },
  },
  goToSettingsBilling: {
    universalIdentifier: 'f46a0fb9-14e9-4d48-801d-c33bdd543f74',
    label: i18nLabel(
      msg({
        message: `Go to Billing Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconCreditCard',
    isPinned: false,
    position: 57,
    shortLabel: i18nLabel(
      msg({ message: `Billing`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '4c4f8494-2f30-58b7-8dbc-b3e20e719efb',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'WORKSPACE',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/billing' },
  },
  goToSettingsApiWebhooks: {
    universalIdentifier: 'ed2c2fde-1e7a-4a42-ba63-221eaa7c9759',
    label: i18nLabel(
      msg({
        message: `Go to Developers Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconCode',
    isPinned: false,
    position: 58,
    shortLabel: i18nLabel(
      msg({ message: `Developers`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'fcb417be-139e-57aa-b746-dfe5b875a469',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'API_KEYS_AND_WEBHOOKS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/developers' },
  },
  goToSettingsApplications: {
    universalIdentifier: '44db6d7a-79ac-485e-b3da-da8776bd7777',
    label: i18nLabel(
      msg({ message: `Go to Apps Settings`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconApps',
    isPinned: false,
    position: 59,
    shortLabel: i18nLabel(
      msg({ message: `Apps`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'e1dcbe37-7297-5f01-ad84-c6a1b53e8e71',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'APPLICATIONS',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/applications' },
  },
  goToSettingsAI: {
    universalIdentifier: '3eaec228-809d-452d-b5ef-7b777398c538',
    label: i18nLabel(
      msg({ message: `Go to AI Settings`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconSparkles',
    isPinned: false,
    position: 60,
    shortLabel: i18nLabel(
      msg({ message: `AI`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '4c4f8494-2f30-58b7-8dbc-b3e20e719efb',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'WORKSPACE',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/ai' },
  },
  goToSettingsSecurity: {
    universalIdentifier: '358e69b2-0789-44e2-add7-bdef68413be8',
    label: i18nLabel(
      msg({
        message: `Go to Security Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconKey',
    isPinned: false,
    position: 61,
    shortLabel: i18nLabel(
      msg({ message: `Security`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '0ad31c95-06fc-5489-b926-8c9cd2b96e6f',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'SECURITY',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/security' },
  },
  goToSettingsAdminPanel: {
    universalIdentifier: 'dd22798b-fca6-42af-ba3b-0d48f263afbd',
    label: i18nLabel(
      msg({
        message: `Go to Admin Panel Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconServer',
    isPinned: false,
    position: 62,
    shortLabel: i18nLabel(
      msg({ message: `Admin Panel`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '0d28ade5-86f2-52e3-8856-89a05b11f69b',
          contextKey: 'canImpersonate',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: 'af9e1efc-69e8-5e3b-b897-8ee6e54b9ac2',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '9fd88c45-7c5c-5edd-af72-704cdcdf9d7b',
          contextKey: 'canAccessFullAdminPanel',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: 'af9e1efc-69e8-5e3b-b897-8ee6e54b9ac2',
          positionInRecordFilterGroup: 1,
        },
      ],
      recordFilterGroups: [
        {
          id: 'af9e1efc-69e8-5e3b-b897-8ee6e54b9ac2',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/admin-panel' },
  },
  goToSettingsUpdates: {
    universalIdentifier: '5d1ba354-0090-4a42-9a43-601461b26068',
    label: i18nLabel(
      msg({
        message: `Go to Community Settings`,
        context: 'commandMenuItem.label',
      }),
    ),
    icon: 'IconUsers',
    isPinned: false,
    position: 63,
    shortLabel: i18nLabel(
      msg({ message: `Community`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailability: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    hotKeys: null,
    payload: { path: '/settings/community' },
  },
  composeEmailToPerson: {
    universalIdentifier: 'f01d4b8b-2b4e-4ae0-9c6f-0b9a9a3e5b21',
    label: i18nLabel(
      msg({ message: `Send Email`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconMail',
    isPinned: true,
    position: 64,
    shortLabel: i18nLabel(
      msg({ message: `Send Email`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '9b55f17d-2052-598f-81d7-edf404ac8271',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
        },
        {
          id: '64a155db-1713-5323-86df-4a9d01b03856',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'SEND_EMAIL_TOOL',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.person.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.COMPOSE_EMAIL,
    hotKeys: null,
  },
  composeEmailToCompany: {
    universalIdentifier: 'a76d3ab8-4c3a-4e5d-8a4a-1f5d6e7f8a90',
    label: i18nLabel(
      msg({ message: `Send Email`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconMail',
    isPinned: true,
    position: 65,
    shortLabel: i18nLabel(
      msg({ message: `Send Email`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '145cbf94-8731-51b8-a1b4-489929b1c851',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '9cc48f59-f83b-5a12-952a-6bb59c2ab0c6',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'SEND_EMAIL_TOOL',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.company.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.COMPOSE_EMAIL,
    hotKeys: null,
  },
  composeEmailToOpportunity: {
    universalIdentifier: 'b3e7c9f2-5d6e-4f7a-8b9c-0d1e2f3a4b5c',
    label: i18nLabel(
      msg({ message: `Send Email`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconMail',
    isPinned: true,
    position: 66,
    shortLabel: i18nLabel(
      msg({ message: `Send Email`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '145cbf94-8731-51b8-a1b4-489929b1c851',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '9cc48f59-f83b-5a12-952a-6bb59c2ab0c6',
          contextKey: 'permissionFlags',
          operand: ViewFilterOperand.IS,
          subFieldName: 'SEND_EMAIL_TOOL',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.opportunity.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.COMPOSE_EMAIL,
    hotKeys: null,
  },
  duplicateMessageList: {
    universalIdentifier: '19b519d4-a871-4fc2-980c-f5d6c92c6962',
    label: i18nLabel(
      msg({ message: `Duplicate List`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconCopyPlus',
    isPinned: true,
    position: 71,
    shortLabel: i18nLabel(
      msg({ message: `Duplicate`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '140e6b86-2ad4-5e26-94d8-051301ca7763',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.IS,
          value: '1',
        },
        {
          id: '43be8d79-37b6-55cf-b5a9-079a95182f8a',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
        },
        {
          id: 'eaf74742-e2ad-5f89-8292-71f0b2b12844',
          contextKey: 'objectPermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'canUpdateObjectRecords',
          value: 'true',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.messageList.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.DUPLICATE_MESSAGE_LIST,
    hotKeys: null,
  },
  addToMessageList: {
    universalIdentifier: '22bc988d-c499-43b3-a870-d62a42efc6bb',
    label: i18nLabel(
      msg({ message: `Add to List`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconUserPlus',
    isPinned: false,
    position: 73,
    shortLabel: i18nLabel(
      msg({ message: `Add to List`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    conditionalAvailability: {
      recordFilters: [
        {
          id: 'c532027b-12d8-5099-b2b2-b46c80abc987',
          contextKey: 'targetObjectWritePermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'messageListMember',
          value: 'true',
          recordFilterGroupId: '268d4f6d-0352-5056-9294-e51c0da1e312',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '02df08e2-4452-5607-8017-27aaa2e14417',
          contextKey: 'numberOfSelectedRecords',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '1',
          recordFilterGroupId: '268d4f6d-0352-5056-9294-e51c0da1e312',
          positionInRecordFilterGroup: 1,
        },
        {
          id: 'a6e77faf-a6e8-5d5f-9f06-2c9164ea60d2',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
          recordFilterGroupId: '268d4f6d-0352-5056-9294-e51c0da1e312',
          positionInRecordFilterGroup: 2,
        },
        {
          id: '34cfa711-e765-58d2-87e5-cedb7bb1364e',
          contextKey: 'isSelectAll',
          operand: ViewFilterOperand.IS,
          value: 'true',
          recordFilterGroupId: '540fdf20-d8b9-5262-b2ef-db1746bad1a1',
          positionInRecordFilterGroup: 0,
        },
        {
          id: '1d6c199c-32e8-5b2f-9441-aefa48eb89e7',
          contextKey: 'selectedRecords',
          operand: ViewFilterOperand.IS_EMPTY,
          subFieldName: 'deletedAt',
          recordFilterGroupId: '540fdf20-d8b9-5262-b2ef-db1746bad1a1',
          positionInRecordFilterGroup: 1,
        },
      ],
      recordFilterGroups: [
        {
          id: '268d4f6d-0352-5056-9294-e51c0da1e312',
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: '540fdf20-d8b9-5262-b2ef-db1746bad1a1',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          parentRecordFilterGroupId: '268d4f6d-0352-5056-9294-e51c0da1e312',
          positionInRecordFilterGroup: 3,
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.person.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.ADD_TO_MESSAGE_LIST,
    hotKeys: null,
  },
  addViewToMessageList: {
    universalIdentifier: '679bd5df-324f-4d9c-becc-370d824f4db0',
    label: i18nLabel(
      msg({ message: `Add View to List`, context: 'commandMenuItem.label' }),
    ),
    icon: 'IconUserPlus',
    isPinned: false,
    position: 74,
    shortLabel: i18nLabel(
      msg({ message: `Add to List`, context: 'commandMenuItem.shortLabel' }),
    ),
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
    conditionalAvailability: {
      recordFilters: [
        {
          id: '3c5b2250-0acf-5d82-a989-9eb111269f77',
          contextKey: 'targetObjectWritePermissions',
          operand: ViewFilterOperand.IS,
          subFieldName: 'messageListMember',
          value: 'true',
        },
        {
          id: 'c57c2c2e-c1f8-5624-b9e1-7274340def58',
          contextKey: 'pageType',
          operand: ViewFilterOperand.IS,
          value: '["INDEX_PAGE"]',
        },
        {
          id: '9b3ba0c7-f612-5d44-81fd-26d38e3606e4',
          contextKey: 'hasAnySoftDeleteFilterOnView',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
      ],
    } satisfies ConditionalDisplay,
    availabilityObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS.person.universalIdentifier,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.ADD_VIEW_TO_MESSAGE_LIST,
    hotKeys: null,
  },
} as const;
