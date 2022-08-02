import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation,ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ description: '모든 User 조회' })
  async findAll(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ description: 'User 생성' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ description: 'Id가 일치하는 User 정보 조회' })
  async findOne(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ description: 'User 정보 수정' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ description: 'User 삭제' })
  async remove(@Param('id') id: string) {
    return await this.userService.removeUser(id);
  }
}
