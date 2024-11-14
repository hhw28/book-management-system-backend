import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';
import { storage } from './my-file-storage';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { MyLogger } from './winston/Mylogger';
import { WINSTON_LOGGER_TOKEN } from './winston/winston.module';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(WINSTON_LOGGER_TOKEN)
  private logger: LoggerService;

  // @Get()
  // getHello(): string {
  //   this.logger.log('getHello', AppController.name);
  //   return this.appService.getHello();
  // }

  @Inject(ConfigService)
  private configService: ConfigService;

  @Get()
  getHello() {
    this.logger.log('getHello', AppController.name);
    return {
      aaa: this.configService.get('aaa'),
      bbb: this.configService.get('bbb'),
      db: this.configService.get('db'),
      application: this.configService.get('application'),
      config2: this.configService.get('aaa.bbb.ccc')
    }
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body,
  ) {
    console.log('body', body);
    console.log('files', files);

    const fileName = body.name.match(/(.+)\-\d+$/)[1];
    const chunkDir = 'uploads/chunks_' + fileName;

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }
    fs.cpSync(files[0].path, chunkDir + '/' + body.name);
    fs.rmSync(files[0].path);
  }

  @Get('merge')
  merge(@Query('name') name: string) {
    const chunkDir = 'uploads/chunks_' + name;

    const files = fs.readdirSync(chunkDir);

    let startPos = 0;
    let count = 0;

    files.map((file) => {
      const filePath = chunkDir + '/' + file;
      const stream = fs.createReadStream(filePath);
      stream
        .pipe(
          fs.createWriteStream('uploads/' + name, {
            start: startPos,
          }),
        )
        .on('finish', () => {
          count++;

          if (count === files.length) {
            fs.rm(
              chunkDir,
              {
                recursive: true,
              },
              () => {},
            );
          }
        });

      startPos += fs.statSync(filePath).size;
    });
  }
}
