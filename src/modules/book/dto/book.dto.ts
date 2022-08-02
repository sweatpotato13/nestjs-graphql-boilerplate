import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BookDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  price: number;

  public static of(params: Partial<BookDto>): BookDto {
    const bookdto = new BookDto();
    Object.assign(bookdto, params);
    return bookdto;
  }
}
