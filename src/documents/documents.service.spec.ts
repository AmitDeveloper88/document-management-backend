import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.ADMIN,
    documents: [],
  };

  const mockFile = {
    path: 'uploads/test-file.pdf',
  } as Express.Multer.File;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const createDocumentDto = {
        title: 'Test Document',
      };

      const expectedDocument = {
        id: 1,
        ...createDocumentDto,
        filePath: mockFile.path,
        owner: mockUser,
        isProcessed: false,
      };

      mockRepository.create.mockReturnValue(expectedDocument);
      mockRepository.save.mockResolvedValue(expectedDocument);

      const result = await service.create(createDocumentDto, mockFile, mockUser);
      expect(result).toEqual(expectedDocument);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const expectedDocuments = [
        {
          id: 1,
          title: 'Test Document 1',
          filePath: 'path/to/file1',
          owner: mockUser,
        },
        {
          id: 2,
          title: 'Test Document 2',
          filePath: 'path/to/file2',
          owner: mockUser,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedDocuments);

      const result = await service.findAll();
      expect(result).toEqual(expectedDocuments);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      const expectedDocument = {
        id: 1,
        title: 'Test Document',
        filePath: 'path/to/file',
        owner: mockUser,
      };

      mockRepository.findOne.mockResolvedValue(expectedDocument);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.not.toThrow();
    });

    it('should throw NotFoundException when document not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const updateDocumentDto = {
        title: 'Updated Title',
      };

      const existingDocument = {
        id: 1,
        title: 'Old Title',
        filePath: 'path/to/file',
        owner: mockUser,
      };

      const updatedDocument = {
        ...existingDocument,
        ...updateDocumentDto,
      };

      mockRepository.findOne.mockResolvedValue(existingDocument);
      mockRepository.save.mockResolvedValue(updatedDocument);

      const result = await service.update(1, updateDocumentDto);
      expect(result).toEqual(updatedDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { title: 'New Title' })).rejects.toThrow(NotFoundException);
    });
  });
});