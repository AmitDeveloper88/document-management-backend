import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.VIEWER,
      };

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const expectedUser = {
        id: 1,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);
      expect(result.email).toEqual(createUserDto.email);
      expect(result.role).toEqual(createUserDto.role);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.VIEWER,
      };

      mockRepository.findOne.mockResolvedValue({ id: 1, ...createUserDto });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const expectedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.VIEWER,
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const expectedUsers = [
        { id: 1, email: 'user1@example.com', role: UserRole.ADMIN },
        { id: 2, email: 'user2@example.com', role: UserRole.EDITOR },
      ];

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        role: UserRole.VIEWER,
      };

      const updatedUser = {
        ...existingUser,
        role: UserRole.EDITOR,
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateRole(1, UserRole.EDITOR);
      expect(result.role).toEqual(UserRole.EDITOR);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateRole(999, UserRole.EDITOR)).rejects.toThrow(NotFoundException);
    });
  });
});