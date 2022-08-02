import { errorStream,logger } from "@common/winston";
import { config } from "@config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder,SwaggerModule } from "@nestjs/swagger";
import bodyParser from "body-parser";
import rTracer from "cls-rtracer";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import {
    initializeTransactionalContext,
    patchTypeORMRepositoryWithBaseRepository
} from "typeorm-transactional-cls-hooked";

import { AppModule } from "./modules/main/app.module";

initializeTransactionalContext(); // Initialize cls-hooked
patchTypeORMRepositoryWithBaseRepository(); // patch Repository with BaseRepository.

async function bootstrap() {
    try {
        const app = await NestFactory.create<NestExpressApplication>(
            AppModule,
        );

        const documentOptions = new DocumentBuilder()
            .setTitle(config.appTitle)
            .setDescription(config.appDescription)
            .setVersion(config.apiVersion)
            .build();
        const document = SwaggerModule.createDocument(app, documentOptions);
        const validationOptions = {
            skipMissingProperties: true,
            validationError: { target: false }
        };

        app.useGlobalPipes(new ValidationPipe(validationOptions));
        app.setGlobalPrefix(config.apiPrefix);

        // added security
        app.use(helmet());

        app.use(rTracer.expressMiddleware());

        app.use(bodyParser.json({ limit: "50mb" }));
        app.use(
            bodyParser.urlencoded({
                limit: "50mb",
                extended: true,
                parameterLimit: 50000
            })
        );

        // rateLimit
        app.use(
            rateLimit({
                windowMs: 1000 * 60 * 60, // an hour
                max: config.rateLimitMax, // limit each IP to 100 requests per windowMs
                message:
                    "⚠️  Too many request created from this IP, please try again after an hour"
            })
        );

        app.use(
            morgan("tiny", {
                skip(req, res) {
                    return res.statusCode < 400;
                },
                stream: errorStream
            })
        );

        // NOTE: size limit
        app.use("*", (req, res, next) => {
            const query = req.query.query || req.body.query || "";
            if (query.length > 2000) {
                throw new Error("Query too large");
            }
            next();
        });

        SwaggerModule.setup(config.swaggerPath, app, document);
        await app.listen(config.port, () => {
            !config.isProduction
                ? logger.info(
                      `🚀  Server ready at http://${config.host}:${config.port}${config.apiPath}`,
                      { context: "BootStrap" }
                  )
                : logger.info(
                      `🚀  Server is listening on port ${config.port}`,
                      { context: "BootStrap" }
                  );

            !config.isProduction &&
                logger.info(
                    `🚀  Subscriptions ready at ws://${config.host}:${config.port}${config.apiPath}`,
                    { context: "BootStrap" }
                );
        });
    } catch (error) {
        logger.error(`❌  Error starting server, ${error}`, {
            context: "BootStrap"
        });
        process.exit();
    }
}

bootstrap();
