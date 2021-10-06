import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  isActive: boolean;

  public static of(params: Partial<UserDto>): UserDto {
    const userdto = new UserDto();
    Object.assign(userdto, params);
    return userdto;
  }
}
