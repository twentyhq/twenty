import { type CanActivate, Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';
import { pipeline } from 'node:stream/promises';

jest.mock('node:stream/promises', () => ({
  pipeline: jest.fn(),
}));

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { FrontComponentRestApiExceptionFilter } from 'src/engine/metadata-modules/front-component/filters/front-component-rest-api-exception.filter';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';

import { FrontComponentController } from './front-component.controller';

const createMockStream = (): Readable => {
  const stream = new Readable();

  stream.push('component source');
  stream.push(null);

  return stream;
};

const createMockResponse = ({
  headersSent = false,
}: { headersSent?: boolean } = {}) => ({
  setHeader: jest.fn(),
  redirect: jest.fn(),
  json: jest.fn(),
  headersSent,
  destroy: jest.fn(),
});

const mockPipeline = jest.mocked(pipeline);

describe('FrontComponentController', () => {
  let controller: FrontComponentController;
  let frontComponentService: FrontComponentService;
  const mock_WorkspaceAuthGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };
  const mock_NoPermissionGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };
  const workspace = { id: 'workspace-id' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrontComponentController],
      providers: [
        {
          provide: FrontComponentService,
          useValue: {
            getBuiltComponentPresignedUrlOrStream: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(WorkspaceAuthGuard)
      .useValue(mock_WorkspaceAuthGuard)
      .overrideGuard(NoPermissionGuard)
      .useValue(mock_NoPermissionGuard)
      .overrideFilter(PermissionsRestApiExceptionFilter)
      .useValue({})
      .overrideFilter(FrontComponentRestApiExceptionFilter)
      .useValue({})
      .overrideFilter(FlatEntityMapsRestApiExceptionFilter)
      .useValue({})
      .overrideFilter(WorkspaceMigrationRunnerRestApiExceptionFilter)
      .useValue({})
      .compile();

    controller = module.get<FrontComponentController>(FrontComponentController);
    frontComponentService = module.get<FrontComponentService>(
      FrontComponentService,
    );

    mockPipeline.mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBuiltJs', () => {
    it('should return the presigned URL in a JSON body instead of a 302 redirect', async () => {
      jest
        .spyOn(frontComponentService, 'getBuiltComponentPresignedUrlOrStream')
        .mockResolvedValue({
          type: 'redirect',
          presignedUrl: 'https://s3.example.com/component.js?signed=abc',
        });

      const mockResponse = createMockResponse() as any;

      await controller.getBuiltJs(
        mockResponse,
        'front-component-id',
        workspace,
      );

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        url: 'https://s3.example.com/component.js?signed=abc',
      });
    });

    it('should mark the JSON handoff response as non-cacheable', async () => {
      jest
        .spyOn(frontComponentService, 'getBuiltComponentPresignedUrlOrStream')
        .mockResolvedValue({
          type: 'redirect',
          presignedUrl: 'https://s3.example.com/component.js?signed=abc',
        });

      const mockResponse = createMockResponse() as any;

      await controller.getBuiltJs(
        mockResponse,
        'front-component-id',
        workspace,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'private, no-store',
      );
    });

    it('should stream with headers when no presigned URL (local driver)', async () => {
      const mockStream = createMockStream();

      jest
        .spyOn(frontComponentService, 'getBuiltComponentPresignedUrlOrStream')
        .mockResolvedValue({
          type: 'stream',
          stream: mockStream,
          mimeType: 'application/javascript',
        });

      const mockResponse = createMockResponse() as any;

      await controller.getBuiltJs(
        mockResponse,
        'front-component-id',
        workspace,
      );

      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/javascript',
      );
      expect(mockPipeline).toHaveBeenCalledWith(mockStream, mockResponse);
    });

    it('should map a FILE_NOT_FOUND storage failure to FRONT_COMPONENT_NOT_FOUND', async () => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      jest
        .spyOn(frontComponentService, 'getBuiltComponentPresignedUrlOrStream')
        .mockRejectedValue(
          new FileStorageException(
            'Front component built file not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          ),
        );

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getBuiltJs(mockResponse, 'missing-id', workspace),
      ).rejects.toThrow(
        new FrontComponentException(
          'Front component built file not found',
          FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        ),
      );
    });

    it('should destroy the response without throwing when the stream errors after headers are sent', async () => {
      const mockStream = createMockStream();

      jest
        .spyOn(frontComponentService, 'getBuiltComponentPresignedUrlOrStream')
        .mockResolvedValue({
          type: 'stream',
          stream: mockStream,
          mimeType: 'application/javascript',
        });

      mockPipeline.mockRejectedValue(new Error('socket reset mid-flight'));

      const mockResponse = createMockResponse({ headersSent: true }) as any;

      await controller.getBuiltJs(
        mockResponse,
        'front-component-id',
        workspace,
      );

      expect(mockResponse.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
