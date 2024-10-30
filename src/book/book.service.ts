import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { Book } from './entities/book.entity';

function randomNum() {
    return Math.floor(Math.random() * 1000000);
}

@Injectable()
export class BookService {
  @Inject()
  dbService: DbService;

  list() {
    return this.dbService.read();
  }

  async findById(id: number) {
    const books: Book[] = await this.dbService.read();
    return books.find((item) => item.id === id);
  }

  async create(createBookDto: CreateBookDto) {
    const books: Book[] = await this.dbService.read();
    const id = randomNum();
    books.push({
      id,
      ...createBookDto,
    });
    await this.dbService.write(books);
    return { ...createBookDto, id };
  }

  async update(updateBookDto: UpdateBookDto) {
    const books: Book[] = await this.dbService.read();

    const foundBook = books.find((book) => book.id === updateBookDto.id);

    if (!foundBook) {
      throw new BadRequestException('该图书不存在');
    }

    const index = books.findIndex((item) => item.id === updateBookDto.id);
    books[index] = updateBookDto;
    await this.dbService.write(books);
    return updateBookDto;
  }

  async delete(id: number) {
    const books: Book[] = await this.dbService.read();
    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
      books.splice(index, 1);
      await this.dbService.write(books);
      return true;
    } else {
      throw new BadRequestException('该图书不存在');
    }
  }
}
