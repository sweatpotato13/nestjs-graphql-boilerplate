
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class CreateBookDto {
    name: string;
    price: number;
}

export class BookDto {
    id: string;
    name: string;
    price: number;
}

export abstract class IQuery {
    abstract getBooks(): BookDto[] | Promise<BookDto[]>;
}

export abstract class IMutation {
    abstract createBook(data: CreateBookDto): BookDto | Promise<BookDto>;
}

export type JSON = any;
export type JSONObject = any;
export type Upload = any;
