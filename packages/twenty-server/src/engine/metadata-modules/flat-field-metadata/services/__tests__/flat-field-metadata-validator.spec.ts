// import { faker } from '@faker-js';
// import { Test, TestingModule } from '@nestjs/testing';

// import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
// import { FlatFieldMetadataTypeValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-type-validator.service';
// import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
// import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

// describe('FlatFieldMetadataValidatorService', () => {
//   let service: FlatFieldMetadataValidatorService;
//   let flatFieldMetadataTypeValidatorService: FlatFieldMetadataTypeValidatorService;
//   let featureFlagService: jest.Mocked<FeatureFlagService>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         FlatFieldMetadataValidatorService,
//         FlatFieldMetadataTypeValidatorService,
//         {
//           provide: FeatureFlagService,
//           useValue: {
//             isEnabled: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<FlatFieldMetadataValidatorService>(
//       FlatFieldMetadataValidatorService,
//     );
//     flatFieldMetadataTypeValidatorService =
//       module.get<FlatFieldMetadataTypeValidatorService>(
//         FlatFieldMetadataTypeValidatorService,
//       );
//     featureFlagService = module.get(FeatureFlagService);
//   });

//   it('Should validate relation field metadata', async () => {
//     const workspaceId = faker.string.uuid();
//     const existingFlatObjectMetadatas = getFlatObjectMetadataMock({
//       id: '1',
//       namePlural: 'companies',
//       nameSingular: 'company',
//       workspaceId,
//       uniqueIdentifier: '1',
//       flatFieldMetadatas: companyFlatFieldsMetadata =
//     });

//     const errors = await service.validateOneFlatFieldMetadata({
//       existingFlatObjectMetadatas,
//       flatFieldMetadataToValidate,
//       workspaceId,
//       othersFlatObjectMetadataToValidate,
//     });

//     expect(errors).toMatchInlineSnapshot();
//   });
// });
