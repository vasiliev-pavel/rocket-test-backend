import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: 'http://localhost:5173', // Разрешить запросы с этого домена
    methods: 'GET',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
