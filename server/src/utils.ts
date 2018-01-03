import { config } from './config';
import { exists, mkdir, rename, writeFile, readFile, copyFile, readdir } from 'fs';
import { setInterval } from 'timers';
import { execFile } from 'child_process';
import { dirname, basename, join } from 'path';
import { AuthRule } from './interface';
import * as globby from 'globby';

export function validateExtension(filename: string, allowedExtension: Array<string>): Boolean {
    const pattern = allowedExtension
        .map(extension => `(.*${extension}$)`)
        .join("|");
    return Boolean(filename.match(pattern));
}

export function validateFilename(filename: string) {
    return validateExtension(filename, config.allowedExtension);
}

export function getBody(body: any, message?: string, error?: boolean) {
    error = error || false;
    return { body: body, message: message, error: error };
}

export function readTheFile(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        readFile(path, {}, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }

        });
    })
}

export function copyTheFile(src: string, dst: string): Promise<any> {
    return new Promise<string>((resolve, reject) => {
        copyFile(src, dst, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }

        })
    })
}

export function executeFile(file: string, args: string[]): Promise<{ stdout: string, stderr: string }> {
    return new Promise<any>((resolve, reject) => {
        execFile(file, args, null, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve({ stdout: stdout, stderr: stderr })
            }

        })
    })
}

export function compressFile(src: string, dst: string): Promise<any> {
    return executeFile('tar', ['-C', dirname(src), '-czf', dst, basename(src)]);
}

export function removeThePath(path: string): Promise<any> {
    return executeFile('rm', ['-rf', path]);
}

export function moveFile(fromPath: string, toPath: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        rename(
            fromPath,
            toPath,
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    })
}

export function makeDir(path: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        exists(path, (result) => {
            if (result) {
                resolve()
            } else {
                mkdir(
                    path,
                    (err) => {
                        if (err) {
                            console.log(err)
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
            }
        });
    })
}

export function listDir(path: string): Promise<string[]> {
    return new Promise<any>((resolve, reject) => {
        readdir(path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files.map(filename => {
                    return join(path, filename);
                }));
            }
        });
    })
}

export async function cleanUpDir(path: string): Promise<any> {
    const files = await listDir(path);
    await executeFile('rm', ['-rf'].concat(files));
}


export class RequestRateLimiter {
    private requests: Map<string, Date>;
    /**
     * @param cooldown cooldown for submit in ms
     */
    constructor(private cooldown: number) {
        this.requests = new Map<string, Date>();

        setInterval(() => {
            const toDelete = new Array<string>();
            for (const entry of this.requests.entries()) {
                if (new Date().getTime() - entry[1].getTime() > this.cooldown) {
                    toDelete.push(entry[0]);
                }
            }
            for (const entry of toDelete) {
                this.requests.delete(entry);
            }
        }, this.cooldown);
    }

    public access(ip: string) {
        this.requests.set(ip, new Date());
    }

    public isRestricted(ip: string) {
        return this.requests.has(ip);
    }
}

export class DeadlineManager {

    private deadline: Date;

    // stores the numeric value corresponding to the time for the specified date according to universal time
    constructor(private deadlineFilename: string = 'deadline.txt') {
        this.deadline = new Date();
        this.readDeadline();

    }
    public async setDeadline(time: Date) {
        const path = join(
            config.assignmentPath,
            this.deadlineFilename
        )
        await writeToFile(time.getTime().toString(), path);
        this.deadline = time;
    }

    public async readDeadline() {
        const path = join(
            config.assignmentPath,
            this.deadlineFilename
        )
        await readTheFile(path).then(time => {
            this.deadline.setTime(JSON.parse(time));
        }).catch(err => {
            this.deadline.setTime(new Date().getTime());
        })
    }

    public getDeadline(): Promise<Date> {
        return this.readDeadline().then(() => {
            return this.deadline;
        });
    }

}

export function parseAuthInfo(authHeader: string): { username: string; password: string } {
    const result = {
        username: '',
        password: ''
    }

    try {
        if (authHeader) {
            const value = authHeader.split(' ')[1];
            const tokens = Buffer
                .from(value, 'base64')
                .toString()
                .split(":", 2);
            result.username = tokens[0];
            result.password = tokens[1];
        }
    } catch (e) {
        console.log(e);
    }

    return result;
}

export function RouteRuleMatch(url: string, method: string, rules: AuthRule[]): boolean {
    for (const rule of rules) {
        if (url.startsWith(rule.route) && method == rule.method) {
            return true;
        }
    }
    return false;
}

export function writeToFile(content: string, path: string) {
    return new Promise<any>((resolve, reject) => {
        writeFile(path, content, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        })
    })
}