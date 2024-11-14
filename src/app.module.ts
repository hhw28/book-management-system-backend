import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DbModule } from './db/db.module';
import { BookModule } from './book/book.module';
import { UploadModule } from './upload/upload.module';
import { WinstonModule } from './winston/winston.module';
import { format, transports } from 'winston';
import * as chalk from 'chalk';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import config from '../config';
import config2 from '../config2';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: [path.join(process.cwd(), '.aaa.env'), path.join(process.cwd(), '.env')]
      load: [config2, config]
    }),
    UserModule,
    DbModule,
    BookModule,
    UploadModule,
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ context, level, message, time }) => {
              const appStr = chalk.green(`[NEST]`);
              const contextStr = chalk.yellow(`[${context}]`);

              return `${appStr} ${time} ${level} ${contextStr} ${message} `;
            }),
          ),
        }),
        new transports.File({
          format: format.combine(format.timestamp(), format.json()),
          filename: '111.log',
          dirname: 'log',
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
