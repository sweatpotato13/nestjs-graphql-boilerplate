import { logger } from "@src/config/winston";
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        logger.info("[nestjs-graphql-example] Before...");

        const now = Date.now();
        return next
            .handle()
            .pipe(
                tap(() =>
                    logger.info(
                        `[nestjs-graphql-example] After... ${Date.now() -
                            now}ms`
                    )
                )
            );
    }
}
