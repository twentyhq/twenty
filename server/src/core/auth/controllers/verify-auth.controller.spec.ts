import { Test, TestingModule } from '@nestjs/testing';
import { VerifyAuthController } from './verify-auth.controller';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

describe('VerifyAuthController', () => {
  let controller: VerifyAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifyAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<VerifyAuthController>(VerifyAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
