/**
 * /!\ DO NOT EDIT THE IDS OF THIS FILE /!\
 * This file contains static ids for standard objects.
 * These ids are used to identify standard objects in the database and compare them even when renamed.
 * For readability keys can be edited but the values should not be changed.
 */

// TODO: check if this can be deleted

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
  name: 'd6c89b25-a22b-44ad-8069-793e596d39b4',
  description: '6d571e40-46e0-43ff-a9dc-3b9697051187',
  sku: 'fbf401ab-6f1b-47eb-86e9-1ac2d422d938',
  price: '37fda670-3261-4b47-b184-2a1224dcb832',
  inStock: 'edd56ccf-2997-4098-9440-cb48783d77a8',
  isActive: '270edf3a-1c06-445f-93a9-7d7315aa4d52',
  position: '03ed978a-61d9-46a6-8d28-bf0964437849',
  createdBy: 'e87d1e5d-e0f5-4ed0-ab23-3ebbb0a1beae',
  // TODO: check if this can be deleted
  mktProduct: '7cfa6d7b-db26-4fb5-9beb-3ec348f9fed7',
  mktVariantAttribute: 'b57069ab-7e21-4823-a61f-8de0726bfbe1',
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

export const MKT_ORDER_FIELD_IDS = {
  //fields
  name: 'a5faa4d8-e788-465f-811b-a311d07c0aa2',
  orderCode: 'b6db3443-3b87-4fad-b27f-77ec6eb6e57a',
  status: 'c384db65-a8ae-436f-a3c0-63175c91bd53',
  totalAmount: '3d9ea0ed-00bf-4626-bb2a-659d80c39107',
  currency: 'c7d46917-51ff-4dc3-a81e-6937e6f245ea',
  note: '60377888-15dc-42df-b868-5015a1f43c2e',
  requireContract: '3bc491e5-3e65-44d4-97d5-f71300ab3d41',

  // relations
  mktContracts: '66277a67-41c6-4709-820f-dda8df091ae9', // ONE_TO_MANY relation with contracts
  mktLicense: '837f7353-df5d-449a-961c-fef566d663b9',
  mktInvoices: '0d4664c7-90ef-491a-8a34-02cdf51ef518',
  items: '5c818b2a-bd61-4423-b1bc-ac89781f4324',
  person: '4d6b6ef3-6d6b-4323-9e4f-a7f01d97e68d',
  //common relations or fields
  position: '9d970deb-f1e5-4cc4-8b36-9ad83ca03ee5',
  createdBy: '6d52adfa-9230-4df0-84fc-d51c646e8538',
  accountOwner: '8e8ab1f5-3777-488f-ac6b-495f6b816c5f',
  timelineActivities: '5ddc8d4c-e8f3-4b36-a367-3b812d9f7d02',
  searchVector: '68623375-43f6-49ed-b29f-291f4cd34921',
  orderItems: '1a2b3c4d-5e6f-7890-1234-567890abcdef',
};

export const MKT_ORDER_ITEM_FIELD_IDS = {
  name: 'f1e2d3c4-b5a6-9786-5432-109876543210',
  quantity: '2b3c4d5e-6f70-8192-3456-789012345678',
  unitPrice: '3c4d5e6f-7081-9293-4567-890123456789',
  totalPrice: '4d5e6f70-8192-a3b4-5678-901234567890',
  position: '5e6f7081-9293-b4c5-6789-012345678901',
  createdBy: '6f708192-a3b4-c5d6-7890-123456789012',
  mktOrder: '7081a3b4-c5d6-e7f8-8901-234567890123',
  mktProduct: '81a3b4c5-d6e7-f890-9012-345678901234',
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
  // relations
  person: '11a10308-2c5c-4322-847d-4ec12d056d9c',
  mktSales: '4bb927d7-a6d2-4746-b771-731cb6ab9950', // nullable
  mktProduct: 'f2d1ae3c-12d8-4e24-8cb5-dc82d422f12b',
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
};

//EXTENDS FROM WORKSPACE_MEMBER_STANDARD_FIELD_IDS
export const WORKSPACE_MEMBER_MKT_FIELD_IDS = {
  //products
  accountOwnerForMktProducts: 'fa7e06e6-3d12-4185-928a-db45e0257b95',
  accountOwnerForMktAttributes: '84954c00-5b31-46ab-9b6c-e95b81ae8d94',
  accountOwnerForMktVariants: '27b1e5ab-980b-4c3c-8168-c8ed77e86363',
  accountOwnerForMktValues: '7bdf395c-9f67-4fc9-9149-e58ba5c135de',
  accountOwnerForMktVariantAttributes: '6cd393a4-db2a-4cc6-b444-8e9ca99f93ec',
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
};
