import { IMiddleware, IRouterContext } from 'koa-router';

export const logMiddleWare = () => {
    return async (ctx: IRouterContext, next: () => Promise<any>) => {
        const start = new Date().getTime();
        console.log(`-> ${ctx.url} ${ctx.ip} ${ctx.method} ${ctx.body || ''}`);
        await next();
        const end = new Date().getTime();
        console.log(`<- ${ctx.url} ${ctx.ip} ${ctx.method} ${end - start}ms`);
    }
}