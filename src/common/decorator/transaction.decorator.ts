import { createParamDecorator } from "@nestjs/common";

// TODO: Typeorm의 @TransactionManager() 데코레이터와 연관성 파악 필요
// Ref: https://dev.to/teamhive/creating-a-transaction-interceptor-using-nest-js-2inb
export const TransactionParam: () => ParameterDecorator = () => {
    return createParamDecorator((_data, req) => {
        return req.transaction;
    });
};
