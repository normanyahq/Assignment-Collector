import * as Koa from 'koa';
import { router } from './router'
import { logMiddleWare } from './logger';
import { mkdirSync, existsSync } from 'fs';
import { config } from './config';
import { authMiddleware } from './auth';
import { execFileSync } from 'child_process';

const serve = require('koa-static');
const bodyParser = require('koa-body');

const servingPort = config.port;

function init() {
    const paths = [
        config.tempPath,
        config.storagePath,
        config.assignmentPath,
        config.archievePath
    ]
    for (const path of paths) {
        execFileSync('mkdir', ['-p', path]);
    }
}

function start() {
    const app = new Koa();

    app.use(serve('./static'));
    app.use(bodyParser({ multipart: true }));
    app.use(logMiddleWare());
    app.use(authMiddleware());
    app.use(router.routes());

    app.listen(servingPort);
    console.log(`app running on ${servingPort}`);

}


init();
start();