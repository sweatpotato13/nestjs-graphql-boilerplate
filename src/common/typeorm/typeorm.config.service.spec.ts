import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmConfigService } from "./typeorm.config.service";
import { TypeOrmModuleConfig } from "@config";

describe("RepositoryConfig", () => {
    let configService: TypeOrmConfigService;
    let config: ConfigService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [TypeOrmModuleConfig]
                })
            ],
            providers: [TypeOrmConfigService]
        }).compile();

        configService = module.get<TypeOrmConfigService>(TypeOrmConfigService);
        config = module.get<ConfigService>(ConfigService);
    });

    describe("#createTypeOrmOptions()", () => {
        it("should return option", () => {
            const options = configService.createTypeOrmOptions();

            expect(options).toEqual(config);
        });
    });
});
