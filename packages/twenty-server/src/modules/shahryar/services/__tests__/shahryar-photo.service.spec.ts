import { type DataSource } from 'typeorm';

import { type FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { type FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { type ShahryarMobileSyncService } from 'src/modules/shahryar/services/shahryar-mobile-sync.service';
import {
  ShahryarPhotoService,
  type ShahryarUploadedPhotoFile,
} from 'src/modules/shahryar/services/shahryar-photo.service';

type ShahryarQueryMock = jest.Mock<Promise<unknown>, [string, unknown[]?]>;

const createMockDataSource = (query: ShahryarQueryMock) =>
  ({
    query,
  }) as unknown as DataSource;

describe('ShahryarPhotoService', () => {
  it('should upload files through the files field service and associate them to Shahryar records', async () => {
    const query = jest
      .fn<Promise<unknown>, [string, unknown[]?]>()
      .mockResolvedValueOnce([{ id: 'field-metadata-1' }]);
    const uploadedFile: FileWithSignedUrlDTO = {
      id: '20202020-0101-4000-8000-000000000005',
      path: 'files/shop.jpg',
      size: 128,
      createdAt: new Date('2026-06-01T10:00:00.000Z'),
      url: 'https://files.example.test/shop.jpg',
    };
    const uploadFile = jest
      .fn<
        Promise<FileWithSignedUrlDTO>,
        [Parameters<FilesFieldService['uploadFile']>[0]]
      >()
      .mockResolvedValueOnce(uploadedFile);
    const associatePhoto = jest
      .fn<
        Promise<
          Awaited<ReturnType<ShahryarMobileSyncService['associatePhoto']>>
        >,
        [Parameters<ShahryarMobileSyncService['associatePhoto']>[0]]
      >()
      .mockResolvedValueOnce({
        localPhotoId: 'shop.jpg',
        fileId: uploadedFile.id,
        targetType: 'market',
        targetId: 'market-1',
        associatedAt: '2026-06-01T10:01:00.000Z',
      });
    const service = new ShahryarPhotoService(
      createMockDataSource(query),
      { uploadFile } as unknown as FilesFieldService,
      { associatePhoto } as unknown as ShahryarMobileSyncService,
    );
    const file: ShahryarUploadedPhotoFile = {
      buffer: Buffer.from('photo-bytes'),
      originalname: 'shop.jpg',
    };

    await expect(
      service.uploadAndAssociatePhoto({
        authorizedSupervisorId: 'supervisor-1',
        file,
        request: {
          capturedAt: '2026-06-01T10:00:00.000Z',
          targetId: 'market-1',
          targetType: 'market',
        },
        workspaceId: '20202020-0000-4000-8000-000000000001',
      }),
    ).resolves.toEqual({
      fileId: uploadedFile.id,
      filename: 'shop.jpg',
      targetType: 'market',
      targetId: 'market-1',
      associatedAt: '2026-06-01T10:01:00.000Z',
      url: uploadedFile.url,
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('"fieldMetadata"'),
      ['20202020-0000-4000-8000-000000000001', 'shahryarMarket', 'shopPhotos'],
    );
    expect(uploadFile).toHaveBeenCalledWith({
      file: file.buffer,
      filename: 'shop.jpg',
      fieldMetadataId: 'field-metadata-1',
      workspaceId: '20202020-0000-4000-8000-000000000001',
    });
    expect(associatePhoto).toHaveBeenCalledWith({
      authorizedSupervisorId: 'supervisor-1',
      request: {
        capturedAt: '2026-06-01T10:00:00.000Z',
        fileId: uploadedFile.id,
        localPhotoId: 'shop.jpg',
        targetId: 'market-1',
        targetType: 'market',
      },
      workspaceId: '20202020-0000-4000-8000-000000000001',
    });
  });
});
