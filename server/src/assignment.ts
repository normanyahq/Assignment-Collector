import { Student } from './interface';
import { extname, join, basename } from 'path';
import * as sanitize from 'sanitize-filename';
import { rename, mkdir, exists } from 'fs';
import { config } from './config';
import { moveFile, makeDir, writeToFile, readTheFile } from './utils';
import * as globby from 'globby';

export const InfoFilename = 'info.json';


export interface AssignmentInfo {
    title: string;
    className: string;
    department: string;
    major: string;
    students: Array<Student>;
    dirname: string;
    filename: string;
}

export function loadAssignmentInfoFromJson(path: string): Promise<AssignmentInfo> {
    return readTheFile(path).then(data => {
        return JSON.parse(data);
    });
}

export class Assignment {
    constructor(
        public title: string,
        public className: string,
        public department: string,
        public major: string,
        public students: Array<Student>,
        public file: any,
        public date: Date
    ) { }

    public toJson(): string {
        const content: AssignmentInfo = {
            title: this.title,
            className: this.className,
            department: this.department,
            major: this.major,
            students: this.students,
            dirname: this.getDirName(),
            filename: this.getFileName()
        };
        return JSON.stringify(
            content,
            null,
            4
        );
    }

    public getDirName(): string {
        const name = [
            this.title,
            this.department,
            this.major,
            this.className
        ]
            .concat(
            this.students
                .map(student => student.name)
                .sort() // keep it unique
            )
            .join("_");

        return sanitize(name);
    }

    public getFileName(): string {
        return `${this.title}.${this.date.getTime()}${extname(this.file.name)}`
    }

    public validateFields(): boolean {
        return Boolean(
            this.title &&
            this.className &&
            this.department &&
            this.major &&
            this.students &&
            this.students.length &&
            this.file
        );
    }

    private async makeDirectory(): Promise<any> {
        const path = join(
            config.assignmentPath,
            this.getDirName()
        );
        await makeDir(path);
    }

    private async saveFile(): Promise<any> {
        const docPath = join(
            config.assignmentPath,
            this.getDirName(),
            this.getFileName()
        );

        const infoPath = join(
            config.assignmentPath,
            this.getDirName(),
            InfoFilename
        );

        await moveFile(this.file.path, docPath);
        await writeToFile(this.toJson(), infoPath);
    }

    private async archieve(): Promise<any> {
        const archieveDirname = 'archieve';
        const path = join(
            config.assignmentPath,
            this.getDirName(),
            archieveDirname
        );
        await makeDir(path);
        const patterns = config.allowedExtension.map(ext =>
            join(
                config.assignmentPath,
                this.getDirName(),
                `*.${ext}`)
        );
        const docs = await globby(patterns);
        for (const file of docs) {
            await moveFile(
                file,
                join(
                    config.assignmentPath,
                    this.getDirName(),
                    archieveDirname,
                    basename(file)
                )
            );
        }
    }

    public async save(): Promise<any> {
        await this.makeDirectory();
        await this.archieve();
        await this.saveFile();
    }
}