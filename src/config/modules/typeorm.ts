import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export default registerAs(
    "typeorm",
    (): TypeOrmModuleOptions => ({
        type: "postgres",
        host: process.env.PG_HOST || "localhost",
        port: parseInt(process.env.PG_PORT || "5432"),
        username: process.env.PG_USER || "postgres",
        password:
            process.env.PG_PASSWORD ||
            "12cad546caac9631353b91e9072c6d2a5800bf41bc531824deac1fea81621826",
        database: process.env.PG_DB_NAME || "postgres",
        synchronize: process.env.PG_SYNC === "true",
        logging: true,
        entities: [__dirname + "/**/**.entity{.ts,.js}"]
    })
);
