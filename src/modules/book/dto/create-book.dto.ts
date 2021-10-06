import { Field, Int, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBookDto {
  @Field()
  name: string;

  @Field(() => Int)
  price: number;

  public static of(params: Partial<CreateBookDto>): CreateBookDto {
    const createbookdto = new CreateBookDto();
    Object.assign(createbookdto, params);
    return createbookdto;
  }
}
