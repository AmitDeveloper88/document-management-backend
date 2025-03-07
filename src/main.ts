import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeederService } from './seeders/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Seed initial data
  const seeder = app.get(SeederService);
  await seeder.seed();

  await app.listen(3000);
}
bootstrap();
