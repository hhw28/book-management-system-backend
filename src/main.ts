import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MyLogger } from './Mylogger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(join(__dirname, '../uploads'), {prefix: '/uploads'});

  app.enableCors();

  app.useLogger(new MyLogger());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
