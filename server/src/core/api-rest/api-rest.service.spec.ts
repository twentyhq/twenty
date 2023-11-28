import { Test, TestingModule } from '@nestjs/testing';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';

describe('ApiRestService', () => {
  let service: ApiRestService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiRestService],
    }).compile();

    service = module.get<ApiRestService>(ApiRestService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('convertToGraphqlQuery', () => {
    it('should format properly for core objects', () => {
      expect(
        service
          .convertToGraphqlQuery('/api/currentWorkspace')
          .replace(/\s\s+/g, ' '), // replaces multiple space by one space
      ).toEqual(
        `
        query currentWorkspace {
          currentWorkspace {
            id
          }
        }
      `.replace(/\s\s+/g, ' '),
      );
    });
    it('should format properly for schema objects', () => {
      expect(
        service.convertToGraphqlQuery('/api/companies').replace(/\s\s+/g, ' '), // replaces multiple space by one space
      ).toEqual(
        `
        query companies {
          companies {
            edges {
              node {
                id
              }
            }
          }
        }
      `.replace(/\s\s+/g, ' '),
      );
    });
  });
});
