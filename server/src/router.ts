import * as Router from 'koa-router';
import { IRouterContext } from 'koa-router';
import { Student } from './interface';
import { writeFile, createReadStream } from 'fs';
import {
    validateFilename,
    getBody,
    RequestRateLimiter,
    copyTheFile,
    makeDir,
    compressFile,
    removeThePath,
    writeToFile,
    DeadlineManager,
    moveFile,
    cleanUpDir
} from './utils';
import { Assignment, InfoFilename, AssignmentInfo, loadAssignmentInfoFromJson } from './assignment';
import { config } from './config';
import * as globby from 'globby';
import { join, basename } from 'path';

export const router = new Router();
const requestRateLimiter = new RequestRateLimiter(config.requestCooldown);
const deadlineManager = new DeadlineManager();

export async function getSubmissionList(): Promise<Array<AssignmentInfo>> {
    const files = await globby(join(
        config.assignmentPath,
        '*',
        InfoFilename
    ));
    const submissionInfoList = new Array<AssignmentInfo>();
    for (const file of files) {
        submissionInfoList.push(await loadAssignmentInfoFromJson(file));
    }
    return submissionInfoList;
}

router.post('/submit', async (ctx: IRouterContext, next: () => Promise<any>) => {

    if (requestRateLimiter.isRestricted(ctx.request.ip)) {
        ctx.response.status = 400;
        ctx.response.body = getBody(
            '',
            `You are submitting too fast, please wait for a while.`,
            true
        );
        return;

    }

    const body = (<any>ctx.request).body;

    const title: string = body.fields['title'];
    const className: string = body.fields['class'];
    const department: string = body.fields['department'];
    const major: string = body.fields['major'];
    const students: Array<Student> = JSON.parse(body.fields['students']);
    const file = body.files['file'];

    const assignment = new Assignment(
        title,
        className,
        department,
        major,
        students,
        file,
        new Date()
    );
    const deadline = await deadlineManager.getDeadline();
    if (deadline.getTime() < new Date().getTime()) {
        ctx.response.body = getBody(
            '',
            `The deadline has passed, you can't submit anymore.`,
            true
        )
        return;
    }

    if (!assignment.validateFields()) {
        ctx.response.status = 400;
        ctx.response.body = getBody(
            '',
            `Incomplete submission, one or more required fields are missing.`,
            true
        );
        return;
    }

    if (!validateFilename(file.name)) {
        ctx.response.status = 400;
        ctx.response.body = getBody(
            '',
            `Invalid File Extension: ${file.name}`,
            true
        );
        return;
    }

    await assignment.save();

    requestRateLimiter.access(ctx.request.ip);
    ctx.response.body = getBody('Upload Succeed.');
});

router.get('/submissions', async (ctx: IRouterContext, next: () => Promise<any>) => {
    ctx.response.body = await getSubmissionList();
});

router.get('/deadline', async (ctx: IRouterContext, next: () => Promise<any>) => {
    const deadline = await deadlineManager.getDeadline();
    ctx.response.body = getBody(deadline.getTime());
});

router.post('/deadline', async (ctx: IRouterContext, next: () => Promise<any>) => {
    const deadline = new Date((<any>ctx.request).body.deadline);
    deadlineManager.setDeadline(deadline);
    ctx.response.body = getBody("", "Deadline successfully updated.");
});

router.get('/download', async (ctx: IRouterContext, next: () => Promise<any>) => {
    const submissionList = await getSubmissionList();
    const tempDirPath = join(config.tempPath, `assignment_submission_${new Date().getTime()}`);
    const compressedFile = `${tempDirPath}.tar.gz`
    await makeDir(tempDirPath);
    for (const submission of submissionList) {
        const srcPath = join(
            config.assignmentPath,
            submission.dirname,
            submission.filename
        );
        console.log(submission);
        const studentNameString = submission.students
            .map(student => { return student.name })
            .join('_');
        const dstPath = join(
            tempDirPath,
            `${studentNameString}_${submission.filename}`
        )
        await copyTheFile(srcPath, dstPath);
    }
    await compressFile(tempDirPath, compressedFile);
    ctx.response.attachment(compressedFile);
    ctx.response.body = createReadStream(compressedFile);
    removeThePath(tempDirPath);
});

router.post('/archieve', async (ctx: IRouterContext, next: () => Promise<any>) => {
    const tempFilename = `assignments.${new Date().getTime()}.tar.gz`;
    const tempFile = join(
        config.tempPath,
        tempFilename
    );
    await compressFile(
        config.assignmentPath,
        tempFile
    );

    await moveFile(
        tempFile,
        join(
            config.archievePath,
            tempFilename
        )
    );

    await cleanUpDir(config.assignmentPath);

    ctx.response.body = getBody("", "Submissions are all archieved.");

});