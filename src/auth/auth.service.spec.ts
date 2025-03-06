import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.VIEWER,
      };

      mockUsersService.create.mockResolvedValue({
        id: 1,
        ...registerDto,
      });

      const result = await service.register(registerDto);

      expect(result).toEqual({
        id: 1,
        ...registerDto,
      });
    });
  });
  describe('register', () => {
    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.VIEWER,
      };

      mockUsersService.create.mockRejectedValue(new Error('Email already exists'));

      await expect(service.register(registerDto)).rejects.toThrow('Email already exists');
    });
  });
  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.VIEWER,
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        access_token: 'test-token',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
  it('should throw error when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({
        email: 'nonexistent@example.com',
        password: 'password123',
      })).rejects.toThrow('Invalid credentials');
    });
  it('should throw error when password is invalid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.VIEWER,
      };

      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(service.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Invalid credentials');
    });
  });
});