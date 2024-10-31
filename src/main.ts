import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MyLogger } from './winston/Mylogger';
import { WINSTON_LOGGER_TOKEN } from './winston/winston.module';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(join(__dirname, '../uploads'), {prefix: '/uploads'});

  app.enableCors();

  app.useLogger(app.get(WINSTON_LOGGER_TOKEN) as LoggerService);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
