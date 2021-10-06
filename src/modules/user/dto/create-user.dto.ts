import { IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @ApiPropertyOptional()
  firstName: string;

  @IsString()
  @ApiPropertyOptional()
  lastName: string;

  public static of(params: Partial<CreateUserDto>): CreateUserDto {
    const createuserdto = new CreateUserDto();
    Object.assign(createuserdto, params);
    return createuserdto;
  }
}
