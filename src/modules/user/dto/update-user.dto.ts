import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean,IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @ApiPropertyOptional()
  firstName: string;

  @IsString()
  @ApiPropertyOptional()
  lastName: string;

  @IsBoolean()
  @ApiPropertyOptional()
  isActive: boolean;

  public static of(params: Partial<UpdateUserDto>): UpdateUserDto {
    const updateuserdto = new UpdateUserDto();
    Object.assign(updateuserdto, params);
    return updateuserdto;
  }
}
