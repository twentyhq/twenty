type PetDataSeed = {
  id: string;
  name: string;
  species: string;
  traits: string[];
  comments: string;
  age: number;
  locationAddressStreet1: string;
  locationAddressStreet2: string;
  locationAddressCity: string;
  locationAddressCountry: string;
  locationAddressPostcode: string;
  locationAddressState: string;
  vetPhonePrimaryPhoneCallingCode: string;
  vetPhonePrimaryPhoneCountryCode: string;
  vetPhonePrimaryPhoneNumber: string;
  vetEmailPrimaryEmail: string;
  vetEmailAdditionalEmails: string;
  birthday: string;
  isGoodWithKids: boolean;
  picturesPrimaryLinkUrl: string;
  picturesPrimaryLinkLabel: string;
  picturesSecondaryLinks: string;
  averageCostOfKibblePerMonthAmountMicros: number;
  averageCostOfKibblePerMonthCurrencyCode: string;
  makesOwnerThinkOfFirstName: string;
  makesOwnerThinkOfLastName: string;
  soundSwag: string;
  bio: string;
  interestingFacts: string[];
  extraData: string;
};

export const PET_DATA_SEED_COLUMNS: (keyof PetDataSeed)[] = [
  'id',
  'name',
  'species',
  'traits',
  'comments',
  'age',
  'locationAddressStreet1',
  'locationAddressStreet2',
  'locationAddressCity',
  'locationAddressCountry',
  'locationAddressPostcode',
  'locationAddressState',
  'vetPhonePrimaryPhoneCallingCode',
  'vetPhonePrimaryPhoneCountryCode',
  'vetPhonePrimaryPhoneNumber',
  'vetEmailPrimaryEmail',
  'vetEmailAdditionalEmails',
  'birthday',
  'isGoodWithKids',
  'picturesPrimaryLinkUrl',
  'picturesPrimaryLinkLabel',
  'picturesSecondaryLinks',
  'averageCostOfKibblePerMonthAmountMicros',
  'averageCostOfKibblePerMonthCurrencyCode',
  'makesOwnerThinkOfFirstName',
  'makesOwnerThinkOfLastName',
  'soundSwag',
  'bio',
  'interestingFacts',
  'extraData',
];

export const PET_DATA_SEED_IDS = {
  ID_1: '20202020-0f2a-49d8-8aa2-ec8786153a0b',
};

export const PET_DATA_SEEDS: PetDataSeed[] = [
  {
    id: PET_DATA_SEED_IDS.ID_1,
    name: 'Toby',
    species: 'DOG',
    traits: ['CURIOUS', 'FRIENDLY'],
    comments: 'Needs to have people around.',
    age: 3,
    locationAddressStreet1: '513 Batz Fork',
    locationAddressStreet2: '7344 Haley Loop',
    locationAddressCity: 'Jacksonstad',
    locationAddressCountry: 'United States',
    locationAddressPostcode: '32048-5208',
    locationAddressState: 'North Dakota',
    vetPhonePrimaryPhoneCallingCode: '+33',
    vetPhonePrimaryPhoneCountryCode: 'FR',
    vetPhonePrimaryPhoneNumber: '789012345',
    vetEmailPrimaryEmail: 'john@twenty.com',
    vetEmailAdditionalEmails: JSON.stringify([
      'tim@twenty.com',
      'timapple@twenty.com',
      'johnappletim@twenty.com',
    ]),
    birthday: new Date('2019-01-01').toISOString(),
    isGoodWithKids: false,
    picturesPrimaryLinkUrl:
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    picturesPrimaryLinkLabel: 'Picture 1',
    picturesSecondaryLinks: JSON.stringify([
      {
        url: 'https://images.unsplash.com/photo-1447684808650-354ae64db5b8?q=80&w=3267&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        label: 'Picture 2',
      },
    ]),
    averageCostOfKibblePerMonthAmountMicros: 2000000000,
    averageCostOfKibblePerMonthCurrencyCode: 'USD',
    makesOwnerThinkOfFirstName: 'Brad',
    makesOwnerThinkOfLastName: 'Pitt',
    soundSwag: 'RATING_3',
    bio: '[{"id":"c2fc1fe1-8e44-41ce-a670-1819d1520fb1","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":1},"content":[{"type":"text","text":"First encounter","styles":{}}],"children":[]},{"id":"064cb9b6-caf7-440e-8fbd-bcfa332fe909","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"It was a beautiful day; we went to the kennel because a friend of ours told us that the puppies were hoping to find their humans.","styles":{}}],"children":[]},{"id":"45a6c6d9-a561-49e6-b64a-4555dcb72084","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]},{"id":"3dcdfa35-d200-418d-8b67-0c8540c1fa69","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"TODO","styles":{}}],"children":[]},{"id":"be99fc64-6cd4-4861-a81e-9096d92a6001","type":"checkListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","checked":true},"content":[{"type":"text","text":"Go to the vet","styles":{}}],"children":[]},{"id":"3ab3777a-4258-4396-8545-8acf19ebc113","type":"checkListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Buy kibbles","styles":{}}],"children":[]},{"id":"5c3a5427-4375-4154-be5a-61dceb55b87e","type":"checkListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","checked":false},"content":[{"type":"text","text":"Find a cozy spot for the basket","styles":{}}],"children":[]},{"id":"efca1bfb-59a7-4abe-8b71-a9dfd4a866cf","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]},{"id":"b8671315-309c-4da0-8371-8f5dc96ec42f","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"What it looked like when we met :","styles":{}}],"children":[]},{"id":"07758210-8772-4861-8398-a70b044ed42b","type":"image","props":{"backgroundColor":"default","textAlignment":"left","name":"photo-1530667912788-f976e8ee0bd5?q=80&w=3269&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D","url":"https://images.unsplash.com/photo-1530667912788-f976e8ee0bd5?q=80&w=3269&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D","caption":"","showPreview":true,"previewWidth":512},"children":[]},{"id":"a61a47fa-8635-4160-b336-8459cbe15351","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Table of data :","styles":{}}],"children":[]},{"id":"28738ccc-5643-4497-ad66-e2e8c513bdfb","type":"table","props":{"textColor":"default","backgroundColor":"default"},"content":{"type":"tableContent","rows":[{"cells":[[{"type":"text","text":"Header 1","styles":{"bold":true}}],[{"type":"text","text":"Header 2","styles":{"bold":true}}],[{"type":"text","text":"Header 3","styles":{"bold":true}}]]},{"cells":[[{"type":"text","text":"Row 1 - Cell 1","styles":{}}],[{"type":"text","text":"Row 1 - Cell 2","styles":{}}],[{"type":"text","text":"Row 1 - Cell 3","styles":{}}]]}]},"children":[]},{"id":"3599afec-e653-41d8-97b6-c495afa3724e","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]',
    interestingFacts: [
      'World’s Best Sock Thief',
      'Expert at Puppy Eyes',
      'Fearless Except Around Bananas',
      'Signature Ear Flip',
    ],
    extraData: JSON.stringify({
      settingsOnVetSoftware: {
        vetSoftware: 'VetLink',
        settings: [
          {
            key: 'Vet name',
            value: 'Dr. John Doe',
          },
          {
            key: 'Vet phone',
            value: '234-567-890',
          },
          {
            key: 'Vet email',
            value: 'asd@asd.com',
          },
          {
            key: 'Vet address',
            value:
              '513 Batz Fork, 7344 Haley Loop, Jacksonstad, North Dakota, 32048-5208, United States',
          },
        ],
      },
      additionalData: [
        {
          key: 'Weight',
          value: '5kg',
        },
        {
          key: 'Height',
          value: '30cm',
        },
        {
          key: 'Length',
          value: '50cm',
        },
        {
          key: 'Breed',
          value: 'Golden Retriever',
        },
        {
          key: 'Color',
          value: 'Golden',
        },
        {
          key: 'Eye color',
          value: 'Brown',
        },
        {
          key: 'Fur',
          value: 'Long',
        },
        {
          key: 'Tail',
          value: 'Long',
        },
        {
          key: 'Ears',
          value: 'Long',
        },
        {
          key: 'Paws',
          value: 'Small',
        },
        {
          key: 'Nose',
          value: 'Wet',
        },
        {
          key: 'Teeth',
          value: 'White',
        },
        {
          key: 'Habits',
          value: 'Barks when someone is at the door',
        },
        {
          key: 'Likes',
          value: 'Belly rubs',
        },
        {
          key: 'Dislikes',
          value: 'Being alone',
        },
      ],
    }),
  },
];
