import { Inject, Injectable } from "@nestjs/common";
import { logger } from "@common/winston";
import { ConfigType } from "@nestjs/config";
import Redis from "ioredis";
import { RedisModuleConfig } from "@config";

@Injectable()
export class RedisService extends Redis {
    constructor(
        @Inject(RedisModuleConfig.KEY)
        config: ConfigType<typeof RedisModuleConfig>
    ) {
        super(config);
        this.on("connect", () => {
            logger.info("A connection is established to the Redis", {
                context: "Redis"
            });
        });
        this.on("close", () => {
            logger.error("an established Redis connection has closed", {
                context: "Redis"
            });
        });
        this.on("error", () => {
            logger.error("an error occurs while connecting", {
                context: "Redis"
            });
        });
    }

    public async count(key: string): Promise<number> {
        const allKeys = await this.keys(key);
        return allKeys.length;
    }

    public async existsKey(key: string): Promise<boolean> {
        return !!(await this.count(key));
    }

    public async getAllKeyValues(wildcard: string): Promise<any[]> {
        const keys = await this.keys(wildcard);
        return await Promise.all(
            keys.map(async key => {
                const value = await this.get(key);
                return { key, value };
            })
        );
    }
}
