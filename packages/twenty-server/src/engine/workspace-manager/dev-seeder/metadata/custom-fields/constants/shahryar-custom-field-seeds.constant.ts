import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';
import { SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER } from 'twenty-shared/shahryar';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';
import {
  SHAHRYAR_ABSENCE_CUSTOM_OBJECT_SEED,
  SHAHRYAR_MARKET_CUSTOM_OBJECT_SEED,
  SHAHRYAR_MOBILE_DEVICE_CUSTOM_OBJECT_SEED,
  SHAHRYAR_PAYMENT_CUSTOM_OBJECT_SEED,
  SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_OBJECT_SEED,
  SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_OBJECT_SEED,
  SHAHRYAR_WORKING_TIME_CUSTOM_OBJECT_SEED,
} from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/shahryar-custom-object-seeds.constant';

type ShahryarFieldSeedConfig = {
  objectName: string;
  seeds: FieldMetadataSeed[];
};

const SHAHRYAR_INT_NUMBER_SETTINGS = {
  dataType: NumberDataType.INT,
  type: 'number',
} as const;

export const SHAHRYAR_WORKSPACE_MEMBER_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] =
  [
    {
      type: FieldMetadataType.TEXT,
      label: 'ناوی بەکارهێنەر',
      name: 'username',
      icon: 'IconUserCircle',
      isUnique: true,
    },
  ];

export const SHAHRYAR_MARKET_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'ناوی خاوەن',
    name: 'ownerName',
    icon: 'IconUser',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'ژمارەی تەلەفۆن',
    name: 'phoneNumber',
    icon: 'IconPhone',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'GPS',
    name: 'gpsLocation',
    icon: 'IconMapPin',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'ناونیشان',
    name: 'marketAddress',
    icon: 'IconMap2',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'ناوچە',
    name: 'district',
    icon: 'IconMap',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'دۆخی پارەدان',
    name: 'paymentStatus',
    icon: 'IconCurrencyDollar',
    options: [
      { label: 'پارەدان کرا', value: 'PAID', position: 0, color: 'green' },
      { label: 'قەرز ماوە', value: 'DEBT_OPEN', position: 1, color: 'red' },
      { label: 'بەشێک دراوە', value: 'PARTIAL', position: 2, color: 'orange' },
    ],
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'قەرز / پارەدان',
    name: 'balanceAmount',
    icon: 'IconCash',
    settings: SHAHRYAR_INT_NUMBER_SETTINGS,
  },
  {
    type: FieldMetadataType.FILES,
    label: 'وێنەی دوکان',
    name: 'shopPhotos',
    icon: 'IconPhoto',
    settings: {
      maxNumberOfValues: 4,
    },
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'تێبینی',
    name: 'notes',
    icon: 'IconNotes',
    settings: {
      displayedMaxRows: 4,
    },
  },
  {
    type: FieldMetadataType.BOOLEAN,
    label: 'چالاکە',
    name: 'isActiveMarket',
    icon: 'IconCircleCheck',
    defaultValue: true,
  },
];

export const SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] =
  [
    {
      type: FieldMetadataType.DATE_TIME,
      label: 'کاتی Check-in',
      name: 'checkInAt',
      icon: 'IconLogin',
    },
    {
      type: FieldMetadataType.DATE_TIME,
      label: 'کاتی Check-out',
      name: 'checkOutAt',
      icon: 'IconLogout',
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'GPS',
      name: 'gpsLocation',
      icon: 'IconMapPin',
    },
    {
      type: FieldMetadataType.NUMBER,
      label: 'چەند کارتۆن فرۆشرا',
      name: 'soldCartons',
      icon: 'IconPackage',
      settings: SHAHRYAR_INT_NUMBER_SETTINGS,
    },
    {
      type: FieldMetadataType.NUMBER,
      label: 'داواکاری کارتۆن',
      name: 'requestedCartons',
      icon: 'IconShoppingCart',
      settings: SHAHRYAR_INT_NUMBER_SETTINGS,
    },
    {
      type: FieldMetadataType.FILES,
      label: 'وێنە',
      name: 'photos',
      icon: 'IconPhoto',
      universalIdentifier:
        SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
      settings: {
        maxNumberOfValues: 8,
      },
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'کێشە چییە؟',
      name: 'issue',
      icon: 'IconAlertTriangle',
      settings: {
        displayedMaxRows: 4,
      },
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'کێ بڕیاری دا',
      name: 'decisionMaker',
      icon: 'IconUserShield',
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'داواکاری',
      name: 'requestDetails',
      icon: 'IconClipboardList',
      settings: {
        displayedMaxRows: 4,
      },
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'ڕاپۆرت',
      name: 'report',
      icon: 'IconReport',
      settings: {
        displayedMaxRows: 6,
      },
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'تێبینی',
      name: 'notes',
      icon: 'IconNotes',
      settings: {
        displayedMaxRows: 5,
      },
    },
  ];

export const SHAHRYAR_WORKING_TIME_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.DATE,
    label: 'ڕێکەوت',
    name: 'workDate',
    icon: 'IconCalendar',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'دەستپێکردن',
    name: 'checkInAt',
    icon: 'IconLogin',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'کۆتایی',
    name: 'checkOutAt',
    icon: 'IconLogout',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'GPS',
    name: 'gpsLocation',
    icon: 'IconMapPin',
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'خولەکی کارکردن',
    name: 'totalMinutes',
    icon: 'IconClockHour4',
    settings: SHAHRYAR_INT_NUMBER_SETTINGS,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'دۆخ',
    name: 'status',
    icon: 'IconCircleCheck',
    options: [
      { label: 'ئامادە', value: 'PRESENT', position: 0, color: 'green' },
      { label: 'درەنگ', value: 'LATE', position: 1, color: 'orange' },
      { label: 'غیاب', value: 'ABSENT', position: 2, color: 'red' },
    ],
  },
];

export const SHAHRYAR_PAYMENT_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.NUMBER,
    label: 'بڕ',
    name: 'amount',
    icon: 'IconCurrencyDollar',
    settings: SHAHRYAR_INT_NUMBER_SETTINGS,
  },
  {
    type: FieldMetadataType.DATE,
    label: 'ڕێکەوتی قەرز',
    name: 'dueDate',
    icon: 'IconCalendarDue',
  },
  {
    type: FieldMetadataType.DATE,
    label: 'ڕێکەوتی پارەدان',
    name: 'paidAt',
    icon: 'IconCalendarCheck',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'دۆخ',
    name: 'status',
    icon: 'IconCircleCheck',
    options: [
      { label: 'داخراو', value: 'CLOSED', position: 0, color: 'green' },
      { label: 'کراوە', value: 'OPEN', position: 1, color: 'red' },
      { label: 'بەشێک دراوە', value: 'PARTIAL', position: 2, color: 'orange' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'تێبینی',
    name: 'notes',
    icon: 'IconNotes',
  },
];

export const SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] =
  [
    {
      type: FieldMetadataType.TEXT,
      label: 'هۆکار',
      name: 'reason',
      icon: 'IconAlertTriangle',
    },
    {
      type: FieldMetadataType.NUMBER,
      label: 'بڕ',
      name: 'amount',
      icon: 'IconCurrencyDollar',
      settings: SHAHRYAR_INT_NUMBER_SETTINGS,
    },
    {
      type: FieldMetadataType.DATE,
      label: 'ڕێکەوت',
      name: 'penaltyDate',
      icon: 'IconCalendar',
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'بڕیاری دا',
      name: 'decidedBy',
      icon: 'IconUserShield',
    },
  ];

export const SHAHRYAR_ABSENCE_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.DATE,
    label: 'ڕێکەوت',
    name: 'absenceDate',
    icon: 'IconCalendar',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'کاتی کارکردن',
    name: 'workingTime',
    icon: 'IconClockHour4',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'GPS',
    name: 'gpsLocation',
    icon: 'IconMapPin',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'هۆکار',
    name: 'reason',
    icon: 'IconCalendarX',
    options: [
      { label: 'غیاب', value: 'ABSENT', position: 0, color: 'red' },
      { label: 'درەنگ هات', value: 'LATE', position: 1, color: 'orange' },
      { label: 'کار نەکرا', value: 'NO_WORK', position: 2, color: 'yellow' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'تێبینی',
    name: 'notes',
    icon: 'IconNotes',
  },
];

export const SHAHRYAR_MOBILE_DEVICE_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'ناسنامەی ئامێر',
    name: 'deviceId',
    icon: 'IconDeviceMobile',
    isUnique: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Expo Push Token',
    name: 'expoPushToken',
    icon: 'IconBellRinging',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'پلاتفۆرم',
    name: 'platform',
    icon: 'IconDeviceMobile',
    options: [
      { label: 'Android', value: 'ANDROID', position: 0, color: 'green' },
      { label: 'iOS', value: 'IOS', position: 1, color: 'blue' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'ئاگادارکردنەوە چالاکەکان',
    name: 'enabledNotificationKinds',
    icon: 'IconBell',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'دوایین تۆمارکردن',
    name: 'lastRegisteredAt',
    icon: 'IconClockHour4',
  },
];

export const SHAHRYAR_CUSTOM_FIELD_SEED_CONFIGS: ShahryarFieldSeedConfig[] = [
  {
    objectName: 'workspaceMember',
    seeds: SHAHRYAR_WORKSPACE_MEMBER_CUSTOM_FIELD_SEEDS,
  },
  {
    objectName: SHAHRYAR_MARKET_CUSTOM_OBJECT_SEED.nameSingular,
    seeds: SHAHRYAR_MARKET_CUSTOM_FIELD_SEEDS,
  },
  {
    objectName: SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_OBJECT_SEED.nameSingular,
    seeds: SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_FIELD_SEEDS,
  },
  {
    objectName: SHAHRYAR_WORKING_TIME_CUSTOM_OBJECT_SEED.nameSingular,
    seeds: SHAHRYAR_WORKING_TIME_CUSTOM_FIELD_SEEDS,
  },
  {
    objectName: SHAHRYAR_PAYMENT_CUSTOM_OBJECT_SEED.nameSingular,
    seeds: SHAHRYAR_PAYMENT_CUSTOM_FIELD_SEEDS,
  },
  {
    objectName: SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_OBJECT_SEED.nameSingular,
    seeds: SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_FIELD_SEEDS,
  },
  {
    objectName: SHAHRYAR_ABSENCE_CUSTOM_OBJECT_SEED.nameSingular,
    seeds: SHAHRYAR_ABSENCE_CUSTOM_FIELD_SEEDS,
  },
  {
    objectName: SHAHRYAR_MOBILE_DEVICE_CUSTOM_OBJECT_SEED.nameSingular,
    seeds: SHAHRYAR_MOBILE_DEVICE_CUSTOM_FIELD_SEEDS,
  },
];
