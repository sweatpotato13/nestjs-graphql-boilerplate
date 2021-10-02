
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

export class GetAuthMessageResponse {
    message: string;
}

export abstract class IQuery {
    abstract getAuthMessage(accountName: string): GetAuthMessageResponse | Promise<GetAuthMessageResponse>;

    abstract getBooks(): BookDto[] | Promise<BookDto[]>;
}

export class BookDto {
    id: string;
    name: string;
    price: number;
}

export abstract class IMutation {
    abstract createBook(data: CreateBookDto): BookDto | Promise<BookDto>;
}

export type JSON = any;
export type JSONObject = any;
export type Upload = any;
