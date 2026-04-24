import { Test, TestingModule } from '@nestjs/testing';
import { ImapClientService } from '../imap-client.service';

describe('ImapClientService', () => {
  let service: ImapClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImapClientService],
    }).compile();

    service = module.get<ImapClientService>(ImapClientService);
  });

  describe('testConnection', () => {
    it('should return true for valid credentials', async () => {
      // 模拟成功连接
      const config = {
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
          user: 'test@gmail.com',
          pass: 'password',
        },
      };

      // 注: 实际测试需要模拟IMAP服务器
      jest.spyOn(service as any, 'createClient').mockResolvedValue({
        connect: jest.fn().mockResolvedValue(undefined),
        logout: jest.fn().mockResolvedValue(undefined),
      });

      const result = await service.testConnection(config);
      expect(result).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      const config = {
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
          user: 'invalid@gmail.com',
          pass: 'wrong',
        },
      };

      jest.spyOn(service as any, 'createClient').mockRejectedValue(new Error('Auth failed'));

      const result = await service.testConnection(config);
      expect(result).toBe(false);
    });
  });

  describe('parseAddresses', () => {
    it('should parse single address correctly', () => {
      const input = {
        value: [{ name: 'John Doe', address: 'john@example.com' }],
      };

      const result = (service as any).parseAddresses(input);
      expect(result).toEqual([{ name: 'John Doe', address: 'john@example.com' }]);
    });

    it('should parse multiple addresses correctly', () => {
      const input = [
        { value: [{ name: 'John', address: 'john@example.com' }] },
        { value: [{ name: 'Jane', address: 'jane@example.com' }] },
      ];

      const result = (service as any).parseAddresses(input);
      expect(result).toEqual([
        { name: 'John', address: 'john@example.com' },
        { name: 'Jane', address: 'jane@example.com' },
      ]);
    });

    it('should handle empty addresses', () => {
      const result = (service as any).parseAddresses(null);
      expect(result).toEqual([]);
    });
  });
});
