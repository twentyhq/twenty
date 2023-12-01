import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { WorkspaceSchemaStorageService } from 'src/workspace/workspace-schema-storage/workspace-schema-storage.service';
import { ScalarsExplorerService } from 'src/workspace/services/scalars-explorer.service';

import { WorkspaceFactory } from './workspace.factory';

import { WorkspaceResolverFactory } from './workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaFactory } from './workspace-schema-builder/workspace-graphql-schema.factory';

describe('WorkspaceFactory', () => {
  let service: WorkspaceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceFactory,
        {
          provide: DataSourceService,
          useValue: {},
        },
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
        {
          provide: ScalarsExplorerService,
          useValue: {},
        },
        {
          provide: WorkspaceGraphQLSchemaFactory,
          useValue: {},
        },
        {
          provide: WorkspaceResolverFactory,
          useValue: {},
        },
        {
          provide: WorkspaceSchemaStorageService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceFactory>(WorkspaceFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
