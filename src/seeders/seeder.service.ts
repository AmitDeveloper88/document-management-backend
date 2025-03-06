import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async seed() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const editorPassword = await bcrypt.hash('editor123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);

    const users = [
      {
        email: 'admin@example.com',
        password: adminPassword,
        role: UserRole.ADMIN,
      },
      {
        email: 'editor@example.com',
        password: editorPassword,
        role: UserRole.EDITOR,
      },
      {
        email: 'viewer@example.com',
        password: viewerPassword,
        role: UserRole.VIEWER,
      },
    ];

    for (const user of users) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: user.email },
      });

      if (!existingUser) {
        await this.usersRepository.save(this.usersRepository.create(user));
      }
    }
  }
}