import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ingestion } from './ingestion.entity';
import { Document } from '../documents/entities/document.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('IngestionService', () => {
  let service: IngestionService;
  let ingestionRepository: Repository<Ingestion>;
  let documentRepository: Repository<Document>;

  const mockIngestionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDocumentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(Ingestion),
          useValue: mockIngestionRepository,
        },
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    ingestionRepository = module.get<Repository<Ingestion>>(getRepositoryToken(Ingestion));
    documentRepository = module.get<Repository<Document>>(getRepositoryToken(Document));
  });

  describe('startIngestion', () => {
    it('should start ingestion process for a document', async () => {
      const documentId = 1;
      const document = {
        id: documentId,
        title: 'Test Document',
        isProcessed: false,
      };

      const expectedIngestion = {
        id: 1,
        status: 'pending',
        document,
        createdAt: new Date(),
      };

      mockDocumentRepository.findOne.mockResolvedValue(document);
      mockIngestionRepository.create.mockReturnValue(expectedIngestion);
      mockIngestionRepository.save.mockResolvedValue(expectedIngestion);

      const result = await service.startIngestion(documentId);
      expect(result).toEqual(expectedIngestion);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(service.startIngestion(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatus', () => {
    it('should return ingestion status for a document', async () => {
      const documentId = 1;
      const expectedStatus = {
        id: 1,
        status: 'completed',
        document: { id: documentId },
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockIngestionRepository.findOne.mockResolvedValue(expectedStatus);

      const result = await service.getStatus(documentId);
      expect(result).toEqual(expectedStatus);
    });

    it('should throw NotFoundException when ingestion not found', async () => {
      mockIngestionRepository.findOne.mockResolvedValue(null);

      await expect(service.getStatus(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllStatus', () => {
    it('should return all ingestion statuses', async () => {
      const expectedStatuses = [
        {
          id: 1,
          status: 'completed',
          document: { id: 1 },
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          status: 'pending',
          document: { id: 2 },
          createdAt: new Date(),
        },
      ];

      mockIngestionRepository.find.mockResolvedValue(expectedStatuses);

      const result = await service.getAllStatus();
      expect(result).toEqual(expectedStatuses);
    });
  });

  describe('completeIngestion', () => {
    it('should mark ingestion as completed', async () => {
      const documentId = 1;
      const document = {
        id: documentId,
        isProcessed: false,
      };
      const ingestion = {
        id: 1,
        status: 'pending',
        document,
      };

      mockIngestionRepository.findOne.mockResolvedValue(ingestion);
      mockIngestionRepository.save.mockImplementation(async (ing) => ({
        ...ing,
        status: 'completed',
        completedAt: expect.any(Date),
      }));

      const result = await service.completeIngestion(documentId);
      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
    });

    it('should throw NotFoundException when ingestion not found', async () => {
      mockIngestionRepository.findOne.mockResolvedValue(null);

      await expect(service.completeIngestion(999)).rejects.toThrow(NotFoundException);
    });
  });
});