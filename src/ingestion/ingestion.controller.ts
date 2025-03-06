import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('documents/:id/trigger')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async triggerIngestion(@Param('id') id: string) {
    return this.ingestionService.trigger(+id);
  }

  @Get('documents/:id/status')
  async getStatus(@Param('id') id: string) {
    return this.ingestionService.getStatus(+id);
  }

  @Get('status')
  @Roles(UserRole.ADMIN)
  async getAllStatus() {
    return this.ingestionService.getAllStatus();
  }
}