/**
 * /!\ DO NOT EDIT THE IDS OF THIS FILE /!\
 * This file contains static ids for standard objects.
 * These ids are used to identify standard objects in the database and compare them even when renamed.
 * For readability keys can be edited but the values should not be changed.
 */

// TODO: check if this can be deleted

export const MKT_CUSTOMER_FIELD_IDS = {
  // fields
  name: 'bc3ac7d1-2e1c-4fe0-a43d-0fa961552cb6',
  type: '204aef63-5db1-43d4-b1d6-d01f36df5558',
  email: 'fbd13f57-d03b-48c4-9e23-ef6c0a412244',
  phone: '9e0b45ef-5ca8-4d71-a087-96aae069287f',
  taxCode: '57685c22-fab6-4be8-85b2-5e4420274698',
  companyName: 'b10c1418-0f38-4f63-8363-b7fbf3f7dd94',
  address: '35ce5702-4618-4488-8e00-5d78a96596c3',
  status: '805eddee-a726-41c2-a996-74c3f976b2cc',
  tier: '4103c22a-f604-4f24-aa53-799cb97ce6d0',
  lifecycleStage: 'dae0670f-1e04-407b-bc1e-e8c40c9834d7',
  registrationDate: '7fb838c4-c6d2-4965-9685-3aa15f861aab',
  totalOrderValue: '3142cb73-ef17-4d43-87e5-d32551bea490',
  churnRiskScore: '04537b93-1bb2-47d7-b5b6-46f37c07dc4b',
  engagementScore: 'fa17e8e2-a908-48c0-aad6-81a220a99946',
  tags: '940e3766-a147-4cf4-bd50-805b1c8c8880',
  // relations
  salesId: '78be7072-50eb-4edc-81fc-c3e25658d7bd',
  supportId: 'a1ed4146-269d-46a5-ac7e-7cba043974e1',
  affiliateId: '940e3766-a147-4cf4-bd50-805b1c8c8880',
  mktLicenses: '4ac28e1a-089a-45d3-9725-b40861e98b15',
  // common relations or fields
  position: 'e3ca3ebd-4812-4c82-abde-e14b13a01829',
  createdBy: '4e6d0176-22f4-4b25-bbf2-0a3ed6d7a5e1',
  accountOwner: '0ccf0130-8651-4165-b061-a1d1c3bd7aa7',
  timelineActivities: '78be7072-50eb-4edc-81fc-c3e25658d7bd',
  searchVector: 'a1ed4146-269d-46a5-ac7e-7cba043974e1',
};

export const MKT_PRODUCT_FIELD_IDS = {
  name: 'f96cff34-9749-4e6e-bdf1-87feb2d63c5b',
  code: '18f99112-4829-4c38-a455-d7be4ad976a2',
  category: '068471f1-bffe-4023-a13a-53b3849876ee',
  type: 'b24db70c-928d-4459-8467-321e6952e45d',
  description: '5efb1028-bd85-4d04-94ba-2daffc2f2d24',
  sku: '9b24a4d4-5ac1-45f7-8a5c-965d56cab9b4',
  inStock: '1acd77e3-6ee5-4570-984b-c884777d34b4',
  price: '42337fcf-349b-4c77-885e-4dd80afb9e27',
  isActive: 'a5cc9c09-5825-4311-85d8-804227ff0cf6',
  position: '6b515d7c-778e-4806-ba73-f8c3fec57e7d',
  createdBy: '8ad53940-cd6a-45cf-a4bd-46611f04b20b',
  // TODO: check if this can be deleted
  mktVariants: 'fa92f83f-888d-4ab7-a2ba-4fc034bcadd8',
  orderItems: 'c9d8e7f6-5432-1098-7654-321098765432',
  accountOwner: 'f836dd4e-1a6e-40ec-b8ce-4bcee5125fe0',
  timelineActivities: 'e4ecfb53-2ad5-4a78-ae3f-a293a8478405',
  searchVector: 'dc61cde2-4483-4418-91e4-bb7bc8ded759',
};

export const MKT_ATTRIBUTE_FIELD_IDS = {
  // fields
  name: '3b51b01f-a14b-4b2a-94d3-14c8de478175',
  description: 'dc049ccf-0bb2-4a07-bd98-47bac689e918',
  // relations
  mktValues: '93bf64b2-6d26-4f82-b504-9ec6c804d1f8',
  mktVariantAttributes: 'b92536b2-59bd-46d3-bb78-7525d51b0570',
  // common relations or fields
  position: 'e6d77b37-d693-4e1a-bc40-c036865710ad',
  createdBy: '7fdc0236-4b38-4be2-af20-291b138c5f94',
  accountOwner: 'dd99e723-8fc6-48fc-8bd1-e9d3001f2aab',
  timelineActivities: 'd64fa54f-30dd-40ff-9813-c09eca9c587d',
  searchVector: '501862d6-de43-4dd5-a5ed-c7130d9652e0',
};

export const MKT_VALUE_FIELD_IDS = {
  name: '3b51b01f-a14b-4b2a-94d3-14c8de478176',
  position: '997a0837-1c0d-41f2-bcee-28287638dd48',
  createdBy: 'f5a6b7c8-9f12-4e56-8acd-5678901234fe',
  // TODO: check if this can be deleted
  mktAttribute: 'c2d3e4f5-3f89-4b23-8bcd-2345678901fb',
  accountOwner: '140ac958-4c2e-4ccf-96b9-e05f3fb98055',
  timelineActivities: '0c31bdd6-3c1e-4e37-9e5f-df7fcff44c3a',
  searchVector: 'fa2199eb-2793-425c-9075-2b1b3bfae5dd',
};

export const MKT_VARIANT_FIELD_IDS = {
  // fields
  name: 'd6c89b25-a22b-44ad-8069-793e596d39b4',
  description: '6d571e40-46e0-43ff-a9dc-3b9697051187',
  sku: 'fbf401ab-6f1b-47eb-86e9-1ac2d422d938',
  price: '37fda670-3261-4b47-b184-2a1224dcb832',
  inStock: 'edd56ccf-2997-4098-9440-cb48783d77a8',
  isActive: '270edf3a-1c06-445f-93a9-7d7315aa4d52',

  // relations
  mktLicenses: '403d1410-7c35-4044-988e-2a7fbe8845ab',
  mktProduct: '7cfa6d7b-db26-4fb5-9beb-3ec348f9fed7',
  mktVariantAttribute: 'b57069ab-7e21-4823-a61f-8de0726bfbe1',
  mktOrderItems: 'f0e7b2d7-aa06-4173-bb81-0b0060da95ae',
  mktComboVariants: 'b594a150-07df-4c1e-aae1-86c25e195a63',
  // common relations or fields
  position: '03ed978a-61d9-46a6-8d28-bf0964437849',
  createdBy: 'e87d1e5d-e0f5-4ed0-ab23-3ebbb0a1beae',
  accountOwner: '60914403-db18-454f-a11c-7b8387539edf',
  timelineActivities: 'af6607e3-b106-44e9-9c3a-483a7ee342f3',
  searchVector: '1b50d19d-459d-466f-8560-c1ec12470936',
};

export const MKT_VARIANT_ATTRIBUTE_FIELD_IDS = {
  name: '0a41f166-a5c1-43e4-ac72-d2249d4355a4',
  position: 'e6b79bb3-f9cb-4795-958a-c8abb2e7d6d6',
  createdBy: '050b0590-781a-42d9-90b5-bbc8cd902448',
  // TODO: check if this can be deleted
  mktVariant: 'fa8e0243-fd39-4bc2-a4ea-d27922bb99f7',
  mktAttribute: 'd2b08210-69ab-4809-a73c-9b3a7898e037',
  accountOwner: '94f09209-0fc6-41c8-aed7-29e882f4551b',
  timelineActivities: '9a2679ed-def4-4b4e-818c-28e5ae723bf0',
  searchVector: '4d4928e3-c0f1-4bc7-a777-a051f54f0e3a',
};

export const MKT_COMBO_FIELD_IDS = {
  // fields
  name: '99043074-8401-41df-8a06-7a4046c926c6',
  description: '8edce791-47ca-4176-b860-28e7bd78e21b',
  price: '26883384-31dc-423e-affe-62da7ee52c9f',
  status: '15987ddb-ddc6-49c3-baa5-8efcffb7a94a',
  // relations
  mktComboVariants: 'fe91d850-43ab-4402-9ff8-fe2b0ad8b98d',
  mktOrderItems: '2686efc6-922a-4a5b-9fdd-4224111e9170',
  // common relations or fields
  position: 'e6f9f40b-eb19-4390-bbda-05e07e1751e6',
  createdBy: '04775818-c461-433f-99d0-215fdb9337bf',
  accountOwner: 'cd7abf69-3d66-48ff-b192-402715f5355b',
  timelineActivities: '9edb03a2-204c-4fc1-aa54-72790acc5aba',
  searchVector: '0e0b0b65-b8de-4e29-95b1-7cbe63744be2',
};

export const MKT_COMBO_VARIANT_FIELD_IDS = {
  // fields
  name: 'dfe28f31-3093-460e-87e2-97d308105c8f',
  quantity: '240219f0-538c-4e42-9160-4e37d0c3f916',
  // relations
  mktCombo: 'b9802ad4-4e08-4d40-a6d3-1de7f92e5756',
  mktVariant: '0f3e6c07-12b8-487c-b5cc-7272945bea9f',
  // common relations or fields
  position: '5ccba7a3-a54c-458e-bd04-75bcb989ff84',
  createdBy: '00c68d0b-24d4-4e1a-be1d-a26af47c11a8',
  accountOwner: '89effb22-9513-409c-abfc-947465be7c22',
  timelineActivities: 'f74902f8-df88-4938-a87e-27f01cb8e120',
  searchVector: '89dd1f65-ac8e-4561-af0e-2cdd10987866',
};

export const MKT_ORDER_FIELD_IDS = {
  //fields
  name: 'a5faa4d8-e788-465f-811b-a311d07c0aa2',
  orderCode: 'b6db3443-3b87-4fad-b27f-77ec6eb6e57a',
  status: 'c384db65-a8ae-436f-a3c0-63175c91bd53',
  totalAmount: '3d9ea0ed-00bf-4626-bb2a-659d80c39107',
  currency: 'c7d46917-51ff-4dc3-a81e-6937e6f245ea',
  note: '60377888-15dc-42df-b868-5015a1f43c2e',
  requireContract: '3bc491e5-3e65-44d4-97d5-f71300ab3d41',
  subtotal: 'a54ffe1f-a15e-471a-b644-f2a8f6396863',
  discount: '97e1ed20-01ba-48f0-b3b9-15eca354a115',
  tax: '86a4bf34-9808-4908-b2d6-65cb4d146bc0',

  // relations
  mktContracts: '66277a67-41c6-4709-820f-dda8df091ae9', // ONE_TO_MANY relation with contracts
  mktLicense: '837f7353-df5d-449a-961c-fef566d663b9',
  mktInvoices: '0d4664c7-90ef-491a-8a34-02cdf51ef518',
  items: '5c818b2a-bd61-4423-b1bc-ac89781f4324',
  person: '4d6b6ef3-6d6b-4323-9e4f-a7f01d97e68d',
  mktComboVariants: '28a25b7e-3b7e-4746-ac46-7ac7a2a1d67b',
  //common relations or fields
  position: '9d970deb-f1e5-4cc4-8b36-9ad83ca03ee5',
  createdBy: '6d52adfa-9230-4df0-84fc-d51c646e8538',
  accountOwner: '8e8ab1f5-3777-488f-ac6b-495f6b816c5f',
  timelineActivities: '5ddc8d4c-e8f3-4b36-a367-3b812d9f7d02',
  searchVector: '68623375-43f6-49ed-b29f-291f4cd34921',
  orderItems: '1a2b3c4d-5e6f-7890-1234-567890abcdef',
};

export const MKT_ORDER_ITEM_FIELD_IDS = {
  // fields
  name: 'f1e2d3c4-b5a6-9786-5432-109876543210',
  quantity: '2b3c4d5e-6d70-8192-3456-789012345678',
  unitPrice: '3c4d5e6f-7081-9293-4567-890123456789',
  totalPrice: '4d5e6f70-8192-a3b4-5678-901234567890',
  snapshotProductName: '3c3f5fdd-434f-4f02-aa07-59f1df4dd241',
  unitName: 'a7bf1c2e-ed32-46bd-a1c9-337d7bb09f42',
  taxPercentage: '83bcdbfe-21a1-47dc-b734-564586e52807',
  taxAmount: '2b69aed9-7a4a-472d-8966-fe6162aafa30',
  totalAmountWithTax: '47e19201-d41f-43e2-89a0-beeb0da30731',

  // relations
  mktOrder: '7081a3b4-c5d6-e7f8-8901-234567890123',
  mktProduct: '81a3b4c5-d6e7-f890-9012-345678901234',
  mktVariant: '63c0be01-54b2-4b5e-b24c-7879c881b479',
  mktCombo: '45c7d839-e7f7-44db-9d86-37dc84415dd5',
  // common relations or fields
  position: '5e6f7081-9293-b4c5-6789-012345678901',
  createdBy: '6f708192-a3b4-c5d6-7890-123456789012',
  accountOwner: '9a3b4c5d-6e7f-8091-0123-456789012345',
  timelineActivities: 'a3b4c5d6-e7f8-9012-1234-567890123456',
  searchVector: 'b4c5d6e7-f890-1234-2345-678901234567',
};

export const MKT_LICENSE_FIELD_IDS = {
  // fields
  name: 'e19495b8-a787-4533-b9fb-e9ff272a04a8',
  licenseKey: 'e36bef57-69a6-4da7-9f50-c1f7da57e182',
  status: 'b992d78d-27cd-42a9-a91e-0f5422a14ca2',
  activatedAt: '38d52287-727f-479a-a970-2ac0e869f39b',
  expiresAt: '5c490b82-749b-41a1-908e-254f53ab19a4',
  lastLoginAt: '803df1b5-d057-438e-abcf-d6e4840df0a4',
  deviceInfo: '7dc3c246-0a81-48b0-9343-70bf0431dfca',
  notes: 'dbf0752c-ed7c-45eb-88c0-e390ec42aed0',
  // relations
  mktCustomer: '11a10308-2c5c-4322-847d-4ec12d056d9c',
  mktSales: '4bb927d7-a6d2-4746-b771-731cb6ab9950', // nullable
  mktVariant: 'f2d1ae3c-12d8-4e24-8cb5-dc82d422f12b',
  mktAffiliate: '8e48e8f3-5ad3-4936-b570-e061ef2e5959', // nullable
  mktOrder: '72da2e23-0de4-44b6-9038-eaa574985103',
  // common relations or fields
  position: '2549eb4e-b75b-4b19-ba58-243614fff9b6',
  createdBy: 'ae3d630f-39f8-49b7-953e-20fc898bdcef',
  accountOwner: '782947ce-bc49-407f-a739-abfd4be15b89',
  timelineActivities: '83271794-654e-4bc1-9fc3-cdadca5a3c77',
  searchVector: '7e2e3eda-2ba6-40d4-b7bc-8ab1370f8b31',
};

export const MKT_INVOICE_FIELD_IDS = {
  name: 'e1f98b9c-a4df-4852-8b5a-817c2484d1e8',
  amount: '076ecd76-e7ec-40ba-a410-ce277b439109',
  status: '6104f95e-7bfb-4337-981f-ddbea7d180b4',
  vat: 'edd5c034-2fcd-4b61-b3fd-4ba07d59682b',
  totalAmount: 'ce102ddf-26af-4dd5-aa44-53aeab7a20eb',
  sInvoiceCode: '671561b1-ddf5-4a31-a66e-969135648638',
  sentAt: '0adeb47b-0c7d-43ec-890f-19ecf8e3714a',
  supplierTaxCode: '58422f09-b22f-4f60-bc18-1437dd94e1b7',
  invoiceType: '50ba3465-0697-4066-b257-b77899bae78b',
  templateCode: 'df3b3f45-f560-4a20-9f74-b39ec77040e9',
  invoiceSeries: 'f8c75e9d-2689-4f5b-a40e-7d0faee7c9e7',
  invoiceNo: '6c0702a9-36af-42ad-9b3d-e7d32d4806c1',
  transactionUuid: '36c6c1e3-1aab-4c50-b544-ccb13f5216f3',
  issueDate: 'ba5552fd-dfa7-44fd-b8e4-dc31c50fdd9a',
  totalWithoutTax: 'd0e3fb71-08a6-44f1-9cd7-46cc14963782',
  totalTax: 'cfd0765b-f7fb-4217-9244-92a81d520030',
  totalWithTax: 'e21d045a-8a27-4c46-a9c8-6cb96edb3fd0',
  taxInWords: '35214b59-87a5-4548-8b78-8e275629473f',

  // relations
  mktTemplate: '768581ac-7240-4fd1-bc4c-6a49445d8ad0',
  mktOrder: '3cf48a8e-fa6d-41c2-bcb9-302e90dbe03c',

  // common relations or fields
  position: 'faf1d878-72c2-4011-a76c-da088e6ad92f',
  createdBy: '752aed66-9ddc-4d25-b805-ceac7943788f',
  accountOwner: '244704b8-1beb-400e-be86-ebc92c165a07',
  timelineActivities: 'fafa89ea-f3d3-439e-a3c2-8d42939aa6e8',
  searchVector: '7df8f89a-374c-4ba1-8326-a8a78c5d6b6c',
};

export const MKT_TEMPLATE_FIELD_IDS = {
  //fields
  name: '9b5a19c7-fa6c-4a31-ab8f-7e0e83fb678b',
  type: '35760f3b-3bb8-48df-9eef-1ca4c05f12c7',
  content: '3a3b49a8-6fed-4f99-a8c2-d3df9a4efa09',
  version: '2e6ade87-6f35-4dbc-8eb0-c3f4b25dc5c8',

  //relations
  mktContracts: '5ff3cd2e-32f0-48f8-8196-2c879e15e7b8',
  mktInvoices: '6b51b55c-e22c-4472-91a8-c9e920cf942b',
  //common relations or fields
  position: '81ba7aae-3b8f-41b0-891a-dc0d003d52bf',
  createdBy: '8bf41ea9-eaaf-4718-a8c9-4a071e51b840',
  accountOwner: '2ad28a81-0905-4592-9070-708aa6920e82',
  timelineActivities: '9ec4140d-a6dd-42e0-b882-5f6b35556530',
  searchVector: '7efe35b6-1956-48e2-9e43-183998ebc800',
};

export const MKT_CONTRACT_FIELD_IDS = {
  name: '5c81d04d-b56c-40a9-9d3e-8c0bdba1af0b',
  status: '90a61a70-1871-4534-8215-8031ca107a99',
  startDate: '5cfe9cf4-3f1a-4a9a-bc84-7296da244819',
  endDate: '14548624-e9a4-4203-a1a2-c9b6341a5536',
  // relations
  mktOrder: '8d607784-4a7f-4b03-b084-ed33561cb830',
  mktOrderId: '9e8ab2f5-3a4c-4d5e-8f1b-7c9d8e0f1a2b',
  // mktTemplate: 'd7eb704c-1c00-4c08-b49d-4e1db26e5472',
  // common relations or fields
  position: '5781e4a6-4a32-46ab-8fe0-f72c6887c83c',
  createdBy: 'ff1664c1-9788-45c4-a1f6-e20626e9d6f4',
  accountOwner: 'b2e28989-9da6-4323-aa4f-9e208425c922',
  timelineActivities: '87d27317-4b2e-4643-a35c-b86065223abb',
  searchVector: '4769af80-5c7a-4c51-8272-e85bd5377a39',
};

export const MKT_PAYMENT_FIELD_IDS = {
  name: '3f8a9b7c-6d5e-4f32-9c1a-8b7f6e5d4c3b',
  amount: '4e9a8b7c-6d5f-4e32-9c1b-8b7f6e5d4c3c',
  currency: '5e9a8b7d-6d5f-4e33-9c1c-8b7f6e5d4c3d',
  status: '6e9a8b7e-6d5f-4e34-9c1d-8b7f6e5d4c3e',
  paymentDate: '7e9a8b7f-6d5f-4e35-9c1e-8b7f6e5d4c3f',
  description: '8e9a8b80-6d5f-4e36-9c1f-8b7f6e5d4c40',
  orderId: '9e9a8b81-6d5f-4e37-9c20-8b7f6e5d4c41',
  invoiceId: 'ae9a8b82-6d5f-4e38-9c21-8b7f6e5d4c42',
  position: 'be9a8b83-6d5f-4e39-9c22-8b7f6e5d4c43',
  createdBy: 'ce9a8b84-6d5f-4e3a-9c23-8b7f6e5d4c44',
  mktPaymentMethod: 'de9a8b85-6d5f-4e3b-9c24-8b7f6e5d4c45',
  accountOwner: 'ee9a8b86-6d5f-4e3c-9c25-8b7f6e5d4c46',
  timelineActivities: 'fe9a8b87-6d5f-4e3d-9c26-8b7f6e5d4c47',
  searchVector: '0f9a8b88-6d5f-4e3e-9c27-8b7f6e5d4c48',
};

export const MKT_PAYMENT_METHOD_FIELD_IDS = {
  name: '1f8a9b7c-6d5e-4f32-9c1a-8b7f6e5d4c3a',
  type: '2f8a9b7d-6d5e-4f33-9c1b-8b7f6e5d4c3b',
  description: '3f8a9b7e-6d5e-4f34-9c1c-8b7f6e5d4c3c',
  isActive: '4f8a9b7f-6d5e-4f35-9c1d-8b7f6e5d4c3d',
  position: '5f8a9b80-6d5e-4f36-9c1e-8b7f6e5d4c3e',
  createdBy: '6f8a9b81-6d5e-4f37-9c1f-8b7f6e5d4c3f',
  mktPayments: '7f8a9b82-6d5e-4f38-9c20-8b7f6e5d4c40',
  accountOwner: '8f8a9b83-6d5e-4f39-9c21-8b7f6e5d4c41',
  timelineActivities: '9f8a9b84-6d5e-4f3a-9c22-8b7f6e5d4c42',
  searchVector: 'af8a9b85-6d5e-4f3b-9c23-8b7f6e5d4c43',
};

//EXTENDS FROM TIMELINE_ACTIVITY_STANDARD_FIELD_IDS
export const TIMELINE_ACTIVITY_MKT_FIELD_IDS = {
  //products
  mktCustomer: 'e42c00cb-dcc8-4682-ab98-2fa5f5c03f08',
  mktProduct: 'fb70cd51-fca9-414c-ac2e-41c00fcb1d45',
  mktAttribute: '18a51a5f-122f-4536-a4c5-cc4672664f93',
  mktVariant: 'b6ecb5e1-14c8-4aaa-b715-e26ed4e81e62',
  mktValue: '9022a8c1-5948-473e-a361-1ddfb017a4f2',
  mktVariantAttribute: 'f656fa33-96e7-42a0-8f4f-f35dfcb0acae',
  //combos
  mktCombo: '94442c1a-1e57-4038-9e5c-dac724d92a74',
  mktComboVariant: 'dffcadf4-8f5e-4530-8794-61230d68324a',
  //orders
  mktOrder: 'e0919045-74af-4800-bb40-ccef297253a9',
  mktLicense: '4b8283ce-daa4-4f11-87d0-2ade1cd6dc81',
  mktContract: 'b8c23b61-29ab-47e5-b412-4789f0653a69',
  mktOrderItem: 'c8d7e6f5-4321-0987-6543-21098765432a',
  //invoices
  mktInvoice: 'a0b038a6-cab6-4777-b51c-861c5671bb49',
  mktTemplate: 'f0fb46f9-c26f-4154-b17e-326ca166f8c9',
  mktPayment: 'bf8a9b90-6d5e-4f40-9c30-8b7f6e5d4c50',
  mktPaymentMethod: 'cf8a9b91-6d5e-4f41-9c31-8b7f6e5d4c51',
  //kpi system - removed timeline activity references as they're not implemented
};

// KPI TEMPLATE HISTORY
export const MKT_KPI_TEMPLATE_HISTORY_FIELD_IDS = {
  // relation to KPI Template
  kpiTemplate: '50505050-7a8b-9c0d-1e2f-3a4b5c6d7e8f',

  // change information
  changeType: '50505050-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  oldValue: '50505050-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  newValue: '50505050-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  changeReason: '50505050-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  changeDescription: '50505050-2f3a-4b5c-6d7e-8f9a0b1c2d3e',

  // change context
  changedByWorkspaceMember: '50505050-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  changeSource: '50505050-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  changeTimestamp: '50505050-5c6d-7e8f-9a0b-1c2d3e4f5a6b',

  // additional data
  additionalData: '50505050-6d7e-8f9a-0b1c-2d3e4f5a6b7c',

  // standard fields
  position: '50505050-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  createdBy: '50505050-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  searchVector: '50505050-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
};

//EXTENDS FROM WORKSPACE_MEMBER_STANDARD_FIELD_IDS
export const WORKSPACE_MEMBER_MKT_FIELD_IDS = {
  //customers
  accountOwnerForMktCustomers: '06129dff-8941-4cd4-aed8-e5e89e986fd2',
  //products
  accountOwnerForMktProducts: 'fa7e06e6-3d12-4185-928a-db45e0257b95',
  accountOwnerForMktAttributes: '84954c00-5b31-46ab-9b6c-e95b81ae8d94',
  accountOwnerForMktVariants: '27b1e5ab-980b-4c3c-8168-c8ed77e86363',
  accountOwnerForMktValues: '7bdf395c-9f67-4fc9-9149-e58ba5c135de',
  accountOwnerForMktVariantAttributes: '6cd393a4-db2a-4cc6-b444-8e9ca99f93ec',
  //combos
  accountOwnerForMktCombos: '90e6970d-8c23-4562-8c25-cece175b20e8',
  accountOwnerForMktComboVariants: '35abe762-d4e7-4c16-b4c6-e22c990dc0b5',
  //orders
  accountOwnerForMktOrders: 'dbbf2703-8803-4c21-9b10-2cf38b045d4b',
  accountOwnerForMktLicenses: 'a343e640-2214-4896-a0e2-830ee854a778',
  accountOwnerForMktContracts: '87d29139-844b-44b9-a3e7-3f9e5a3e4165',
  accountOwnerForMktOrderItems: '5f4e3d2c-1b0a-9876-5432-109876543210',
  accountOwnerForMktPayments: 'df8a9b92-6d5e-4f42-9c32-8b7f6e5d4c52',
  accountOwnerForMktPaymentMethods: 'ef8a9b93-6d5e-4f43-9c33-8b7f6e5d4c53',
  //invoices
  accountOwnerForMktInvoices: 'ab600d66-5755-4934-b5c3-19036927cf92',
  accountOwnerForMktTemplates: 'a88096b8-e818-4421-afc2-5b1ab207aca3',
  //kpi system
  accountOwnerForMktKpiTemplates: '40404040-7c8d-9e0f-1a2b-3c4d5e6f7a8b',
  changedKpiHistories: '40404040-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
};

export const MKT_RESELLER_TIER_FIELD_IDS = {
  // fields
  tierCode: '3e0c1c7a-9a4d-4b1e-8b0a-3e1c1c7a9a4d',
  tierName: 'f4d3b3e3-8c7b-4e4a-9b3e-3e3d3b3e38c7',
  tierNameEn: 'a2b1c0d9-7e6f-4d3c-b1a0-d9e8f7d6c5b4',
  minCommitmentAmount: 'b3c2d1e0-8f7a-4e3d-c2b1-e0f9a8b7c6d5',
  maxCommitmentAmount: 'c4d3e2f1-9a8b-4f4e-d3c2-f1a0b9c8d7e6',
  commissionRate: 'd5e4f3a2-a9b8-4a5f-e4d3-a2b1c0d9e8f7',
  systemFeeRate: 'e6f5a4b3-ba9c-4b6a-f5e4-b3c2d1e0f9a8',
  allowedProducts: 'f7a6b5c4-cba9-4c7b-a6f5-c4d3e2f1a0b9',
  specialBenefits: 'a8b7c6d5-dca8-4d8c-b7a6-d5e4f3a2b1c0',
  displayOrder: 'b9c8d7e6-edb7-4e9d-c8b7-e6f5a4b3c2d1',
  isActive: 'ca9d8e7f-fec6-4fae-d9c8-f7a6b5c4d3e2',
  description: 'dbad9f8a-afb5-4abf-ead9-a8b7c6d5e4f3',
  // relations
  resellers: '38a96a35-4b8d-4384-8ce5-10e74a84ed84',
  fromTierHistories: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e',
  toTierHistories: 'c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f',
  createdBy: 'ecbeaf9b-bfca-4bca-fbea-b9c8d7e6f5a4',
};

export const MKT_RESELLER_FIELD_IDS = {
  // business info
  companyName: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d7',
  companyShortName: 'b2c3d4e5-f6a7-8b9c-0d1e-f2a3b4c5d6e8',
  taxCode: 'c3d4e5f6-a7b8-9c0d-1e2f-a3b4c5d6e7f9',
  legalRepresentativeName: 'd4e5f6a7-b8c9-0d1e-2f3a-b4c5d6e7f8a0',
  contactEmail: 'e5f6a7b8-c9d0-1e2f-3a4b-c5d6e7f8a9b1',
  contactPhone: 'f6a7b8c9-d0e1-2f3a-4b5c-d6e7f8a9b0c2',
  address: 'a7b8c9d0-e1f2-3a4b-5c6d-e7f8a9b0c1d3',
  // tier & commitment
  currentTierId: 'b8c9d0e1-f2a3-4b5c-6d7e-f8a9b0c1d2e4',
  commitmentAmount: 'c9d0e1f2-a3b4-5c6d-7e8f-a9b0c1d2e3f5',
  commissionRate: 'd0e1f2a3-b4c5-6d7e-8f9a-b0c1d2e3f4a6',
  // subdomain & multi-tenant
  subdomain: 'e1f2a3b4-c5d6-7e8f-9a0b-c1d2e3f4a5b7',
  customDomain: 'f2a3b4c5-d6e7-8f9a-0b1c-d2e3f4a5b6c8',
  isCustomDomainEnabled: 'a3b4c5d6-e7f8-9a0b-1c2d-e3f4a5b6c7d9',
  // status & performance
  status: 'b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e',
  actualRevenue: 'c5d6e7f8-a9b0-1c2d-3e4f-a5b6c7d8e9fb',
  lastRevenueUpdate: 'd6e7f8a9-b0c1-2d3e-4f5a-6b7c8d9e0f1a',
  // tracking
  position: 'e7f8a9b0-c1d2-3e4f-5a6b-c7d8e9fafbfd',
  createdBy: 'f8a9b0c1-d2e3-4f5a-6b7c-d8e9fafbfcfe',
  // relations
  tierHistories: 'a1b2c3d4-e5f6-789a-bcde-f012345678ab',
};

export const MKT_RESELLER_TIER_HISTORY_FIELD_IDS = {
  // relations
  resellerId: 'a9b0c1d2-e3f4-5a6b-7c8d-e9fafbfcfdfe',
  fromTierId: 'b0c1d2e3-f4a5-6b7c-8d9e-fafbfcfdfeaf',
  toTierId: 'c1d2e3f4-a5b6-7c8d-9efa-fbfcfdfea0fb',
  // fields
  changeType: 'd2e3f4a5-b6c7-8d9e-afbf-cfdfea0fb1fc',
  changeReason: 'e3f4a5b6-c7d8-9eaf-bfc0-dfea0fb1fc2d',
  actualRevenue: 'f4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c',
  changedAt: 'a5b6c7d8-e9af-b0c1-d2ea-0fb1fc2d3e4f',
  changedBy: 'b6c7d8e9-afb0-c1d2-e3fb-1fc2d3e4f5a6',
  effectiveFrom: 'c7d8e9af-b0c1-d2e3-f4fc-2d3e4f5a6b7c',
  notes: 'd8e9afb0-c1d2-e3f4-a5fd-3e4f5a6b7c8d',
  // standard fields
  position: 'e9afb0c1-d2e3-f4a5-b6fe-4f5a6b7c8d9e',
  createdBy: 'afb0c1d2-e3f4-a5b6-c7ff-5a6b7c8d9eaf',
};

export const MKT_ORGANIZATION_LEVEL_FIELD_IDS = {
  // level definition
  levelCode: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
  levelName: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
  levelNameEn: 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d',
  description: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e',
  // hierarchy structure
  hierarchyLevel: 'c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f',
  parentLevel: 'd0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a',
  // business rules
  defaultPermissions: 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b',
  accessLimitations: 'f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c',
  // display & status
  displayOrder: 'a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d',
  isActive: 'b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e',
  // standard fields
  position: 'd6e7f8a9-b0c1-2d3e-4f5a-6b7c8d9e0f1a',
  createdBy: 'e7f8a9b0-c1d2-3e4f-5a6b-7c8d9e0f1a2b',
  // relations
  staffMembers: '20202020-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
};

export const MKT_EMPLOYMENT_STATUS_FIELD_IDS = {
  // status definition
  statusCode: 'f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c',
  statusName: 'a9b0c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d',
  statusNameEn: 'b0c1d2e3-f4a5-6b7c-8d9e-0f1a2b3c4d5e',
  description: 'c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f',
  // business rules
  isInitialStatus: 'd2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a',
  isFinalStatus: 'e3f4a5b6-c7d8-9e0f-1a2b-3c4d5e6f7a8b',
  maxDuration: 'f4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c',
  requiresApproval: 'a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d',
  // restrictions & flow
  restrictions: 'b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e',
  allowedNextStatuses: 'c7d8e9f0-a1b2-3c4d-5e6f-7a8b9c0d1e2f',
  // display
  displayOrder: 'd8e9f0a1-b2c3-4d5e-6f7a-8b9c0d1e2f3a',
  statusColor: 'e9f0a1b2-c3d4-5e6f-7a8b-9c0d1e2f3a4b',
  isActive: 'f0a1b2c3-d4e5-6f7a-8b9c-0d1e2f3a4b5c',
  // standard fields
  position: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  createdBy: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  // relations
  staffMembers: '20202020-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
};

export const MKT_STAFF_STATUS_HISTORY_FIELD_IDS = {
  // reference fields
  staffId: 'c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f',
  fromStatusId: 'd0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a',
  toStatusId: 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b',
  // change details
  changeDate: 'f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c',
  changeReason: 'a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d',
  approvedBy: 'b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e',
  notes: 'c5d6e7f8-a9b0-1c2d-3e4f-5a6b7c8d9e0f',
  // expected dates
  expectedEndDate: 'd6e7f8a9-b0c1-2d3e-4f5a-6b7c8d9e0f1a',
  actualEndDate: 'e7f8a9b0-c1d2-3e4f-5a6b-7c8d9e0f1a2b',
  // standard fields
  createdBy: 'f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c',
};

export const MKT_DEPARTMENT_FIELD_IDS = {
  // department definition
  departmentCode: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  departmentName: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
  departmentNameEn: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
  description: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
  // department leadership
  departmentHead: 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d',
  // business configuration
  budgetCode: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e',
  costCenter: 'c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f',
  // department rules
  requiresKpiTracking: 'd0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a',
  allowsCrossDepartmentAccess: 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b',
  defaultKpiCategory: 'f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c',
  // display
  displayOrder: 'a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d',
  colorCode: 'b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e',
  iconName: 'c5d6e7f8-a9b0-1c2d-3e4f-5a6b7c8d9e0f',
  isActive: 'd6e7f8a9-b0c1-2d3e-4f5a-6b7c8d9e0f1a',
  // relations
  staffMembers: 'e7f8a9b0-c1d2-3e4f-5a6b-7c8d9e0f1a2b',
  // standard fields
  position: 'f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c',
  createdBy: 'a9b0c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d',
};

export const MKT_KPI_FIELD_IDS = {
  // basic kpi information
  kpiName: '20202020-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
  kpiCode: '20202020-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  kpiType: '20202020-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  kpiCategory: '20202020-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  description: '20202020-1e2f-3a4b-5c6d-7e8f9a0b1c2d',

  // target and actual values
  targetValue: '20202020-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  actualValue: '20202020-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  unitOfMeasure: '20202020-4b5c-6d7e-8f9a-0b1c2d3e4f5a',

  // time period
  periodType: '20202020-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  periodYear: '20202020-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
  periodQuarter: '20202020-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  periodMonth: '20202020-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  periodWeek: '20202020-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
  periodStartDate: '20202020-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
  periodEndDate: '20202020-1c2d-3e4f-5a6b-7c8d9e0f1a2b',

  // assignment
  assigneeType: '20202020-2d3e-4f5a-6b7c-8d9e0f1a2b3c',
  assigneeWorkspaceMember: '20202020-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
  assigneeDepartment: '20202020-4f5a-6b7c-8d9e-0f1a2b3c4d5e',

  // status and progress
  status: '20202020-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
  achievedAt: '20202020-6b7c-8d9e-0f1a-2b3c4d5e6f7a',

  // calculation configuration
  isAutoCalculated: '20202020-7c8d-9e0f-1a2b-3c4d5e6f7a8b',
  calculationFormula: '20202020-8d9e-0b1c-2d3e-4d5e6f7a8b9c',
  alertThresholds: '20202020-9e0f-1a2b-3c4d-5e6f7a8b9c0d',

  // additional information
  notes: '20202020-0f1a-2b3c-4d5e-6f7a8b9c0d1e',
  priority: '20202020-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
  weight: '20202020-2b3c-4d5e-6f7a-8b9c0d1e2f3a',

  // standard fields
  position: '20202020-3c4d-5e6f-7a8b-9c0d1e2f3a4b',
  createdBy: '20202020-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
  createdByPerson: '20202020-5e6f-7a8b-9c0d-1e2f3a4b5c6d',

  // relations
  kpiHistories: '20202020-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
};

export const MKT_KPI_TEMPLATE_FIELD_IDS = {
  // basic template information
  templateName: '30303030-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
  templateCode: '30303030-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  description: '30303030-9c0d-1e2f-3a4b-5c6d7e8f9a0b',

  // target application
  targetRole: '30303030-0d1e-2f3a-4b5c-6d7e8f9a0b1c',

  // default kpi configuration
  kpiType: '30303030-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
  kpiCategory: '30303030-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  unitOfMeasure: '30303030-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  defaultTargetValue: '30303030-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  periodType: '30303030-6d7e-8f9a-0b1c-2d3e4f5a6b7c',

  // calculation configuration
  isAutoCalculated: '30303030-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  calculationFormula: '30303030-8f9a-0b1c-2d3e-4f5a6b7c8d9e',

  // template configuration
  isActive: '30303030-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
  isDefault: '30303030-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
  priority: '30303030-1c2d-3e4f-5a6b-7c8d9e0f1a2b',
  weight: '30303030-2d3e-4f5a-6b7c-8d9e0f1a2b3c',
  templateConfig: '30303030-3e4f-5a6b-7c8d-9e0f1a2b3c4d',

  // standard fields
  position: '30303030-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
  createdBy: '30303030-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
  createdByPerson: '30303030-6b7c-8d9e-0f1a-2b3c4d5e6f7a',

  // relations
  accountOwner: '30303030-7c8d-9e0f-1a2b-3c4d5e6f7a8b',
  searchVector: '30303030-9e0f-1a2b-3c4d-5e6f7a8b9c0d',
};

export const MKT_KPI_HISTORY_FIELD_IDS = {
  // relation to KPI
  kpi: '40404040-7a8b-9c0d-1e2f-3a4b5c6d7e8f',

  // change information
  changeType: '40404040-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
  oldValue: '40404040-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
  newValue: '40404040-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
  changeReason: '40404040-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  changeDescription: '40404040-2f3a-4b5c-6d7e-8f9a0b1c2d3e',

  // change context
  changedByWorkspaceMember: '40404040-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  changeSource: '40404040-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  changeTimestamp: '40404040-5c6d-7e8f-9a0b-1c2d3e4f5a6b',

  // additional data
  additionalData: '40404040-6d7e-8f9a-0b1c-2d3e4f5a6b7c',

  // standard fields
  position: '40404040-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  createdBy: '40404040-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  searchVector: '40404040-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
};
