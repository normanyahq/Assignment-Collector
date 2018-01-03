import { IRouterContext } from 'koa-router';
import { parseAuthInfo, RouteRuleMatch } from './utils';
import { config } from './config';

export const authMiddleware = () => {
    return async (ctx: IRouterContext, next: () => Promise<any>) => {
        const authInfo = parseAuthInfo(ctx.request.headers.authorization);
        if (
            RouteRuleMatch(
                ctx.request.url,
                ctx.request.method,
                config.protectedRoutes
            ) &&
            (
                authInfo.username != config.adminUsername ||
                authInfo.password != config.adminPassword
            )
        ) {
            console.log(`Login Attempt to ${ctx.request.url}: ${authInfo.username || '[empty]'}/${authInfo.password || '[empty]'}`);
            ctx.response.status = 401;
            ctx.response.set('WWW-Authenticate', 'Basic realm="Assignment Submission"');
            return;
        }

        await next();

    }
}