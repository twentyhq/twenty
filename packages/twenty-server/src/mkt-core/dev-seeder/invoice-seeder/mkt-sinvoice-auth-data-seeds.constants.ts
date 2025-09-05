type MktSInvoiceAuthDataSeed = {
  id: string;
  name: string;
  username: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_SINVOICE_AUTH_DATA_SEEDS_IDS = {
  ID_1: '36cc8465-5896-4352-b4e4-324dbd92c31e',
  ID_2: '83affbae-5a5a-497a-8629-f56923874d6d',
  ID_3: '8f0fc297-f8ec-469a-a9d7-2a4ad29030c9',
  ID_4: 'ee139321-7b13-4975-a433-36a821caa6ba',
  ID_5: 'b16239ca-ddf3-4a59-b17b-918a87aab9a2',
};

export const MKT_SINVOICE_AUTH_DATA_SEED_COLUMNS: (keyof MktSInvoiceAuthDataSeed)[] = [
  'id',
  'name',
  'username',
  'password',
  'accessToken',
  'refreshToken',
  'expiresAt',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];
export const MKT_SINVOICE_AUTH_DATA_SEEDS: MktSInvoiceAuthDataSeed[] = [
  {
    id: MKT_SINVOICE_AUTH_DATA_SEEDS_IDS.ID_1,
    name: 'SInvoice Auth 1',
    username: 'username1',
    password: '7547c33a-89db-4c3e-80a5-80d4a05e4645',
    accessToken: 'accessToken1',
    refreshToken: 'refreshToken1',
    expiresAt: '2025-01-01',
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },
  {
    id: MKT_SINVOICE_AUTH_DATA_SEEDS_IDS.ID_2,
    name: 'SInvoice Auth 2',
    username: 'username2',
    password: '1d86f238-a9a4-4054-9839-d895bde6500f',
    accessToken: 'accessToken2',
    refreshToken: 'refreshToken2',
    expiresAt: '2025-01-02',
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },
  {
    id: MKT_SINVOICE_AUTH_DATA_SEEDS_IDS.ID_3,
    name: 'SInvoice Auth 3',
    username: 'username3',
    password: '72924e2e-c602-4730-91ff-30a5ff7d6bb6',
    accessToken: 'accessToken3',
    refreshToken: 'refreshToken3',
    expiresAt: '2025-01-03',
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mike Johnson',
  },
  {
    id: MKT_SINVOICE_AUTH_DATA_SEEDS_IDS.ID_4,
    name: 'SInvoice Auth 4',
    username: 'username4',
    password: 'bed5c29f-b84b-4148-8eaa-0b341cc2d043',
    accessToken: 'accessToken4',
    refreshToken: 'refreshToken4',
    expiresAt: '2025-01-04',
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },
  {
    id: MKT_SINVOICE_AUTH_DATA_SEEDS_IDS.ID_5,
    name: 'SInvoice Auth 5',
    username: 'username5',
    password: '7547c33a-89db-4c3e-80a5-80d4a05e4645',
    accessToken: 'accessToken5',
    refreshToken: 'refreshToken5',
    expiresAt: '2025-01-05',
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mike Johnson',
  },
];