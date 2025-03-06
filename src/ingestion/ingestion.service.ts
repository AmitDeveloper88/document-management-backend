import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingestion, IngestionStatus } from './ingestion.entity';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(Ingestion)
    private ingestionRepository: Repository<Ingestion>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async trigger(documentId: number) {
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const ingestion = this.ingestionRepository.create({
      documentId: document.id,
      status: IngestionStatus.PENDING,
    });

    return this.ingestionRepository.save(ingestion);
  }

  async getStatus(documentId: number) {
    return this.ingestionRepository.findOne({
      where: { document: { id: documentId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllStatus() {
    return this.ingestionRepository.find({
      relations: ['document'],
      order: { createdAt: 'DESC' },
    });
  }
}