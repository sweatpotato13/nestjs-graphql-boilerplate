import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { plainToClass } from "class-transformer";
import { BookDto } from "@src/common/graphql/generator/graphql.schema";

@Entity()
export class Book {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column()
    price: number;

    toDto() {
        return plainToClass(BookDto, this);
    }

    public static of(params: Partial<Book>): Book {
        const book = new Book();
        Object.assign(book, params);
        return book;
    }
}
