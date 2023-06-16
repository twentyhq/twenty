import { Test, TestingModule } from '@nestjs/testing';
import { PasswordAuthController } from './password-auth.controller';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

describe('PasswordAuthController', () => {
  let controller: PasswordAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordAuthController],
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

    controller = module.get<PasswordAuthController>(PasswordAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
