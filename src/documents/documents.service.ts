import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, file: Express.Multer.File, user: User): Promise<Document> {
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      filePath: file.path,
      owner: user,
    });
    return this.documentsRepository.save(document);
  }

  async findAll(): Promise<Document[]> {
    return this.documentsRepository.find({
      relations: ['owner'],
    });
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async remove(id: number): Promise<void> {
    const result = await this.documentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Document not found');
    }
  }

  async triggerIngestion(id: number): Promise<Document> {
    const document = await this.findOne(id);
    document.isProcessed = true;
    return this.documentsRepository.save(document);
  }
  
  async update(id: number, updateDocumentDto: UpdateDocumentDto, file?: Express.Multer.File): Promise<Document> {
    const document = await this.findOne(id);
    
    if (updateDocumentDto.title) {
      document.title = updateDocumentDto.title;
    }

    if (file) {
      document.filePath = file.path;
    }

    return this.documentsRepository.save(document);
  }
}