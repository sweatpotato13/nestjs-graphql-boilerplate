import { plainToClass } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { UserDto } from "./dto/user.dto";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ default: true })
    isActive: boolean;

    toDto() {
        return plainToClass(UserDto, this);
    }

    public static of(params: Partial<User>): User {
        const user = new User();
        Object.assign(user, params);
        return user;
    }
}
