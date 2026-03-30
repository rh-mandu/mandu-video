import { test } from 'node:test';
import ffprobePath from 'ffprobe-static';
import { UploadVideoData } from '../src/UploadVideoData.ts';
import { isValidVideo, isEqualsVideo } from './video_helper.ts';
import https from 'node:https';
import { Readable } from 'node:stream';
import assert from 'assert';

process.env.FFPROBE_PATH = ffprobePath.path;

test('url를 기준으로 data 생성', async () => {
    const uploadVideoData = UploadVideoData.fromUri(
        'Big_Buck_Bunny_360_10s_1MB.mp4',
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    );

    assert(uploadVideoData);
});

test('uri로 정상적인 데이터 스트림 생성', async () => {
    const videoLink = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';
    const uploadVideoData = UploadVideoData.fromUri('Big_Buck_Bunny_360_10s_1MB.mp4', videoLink);

    assert(await isValidVideo((await uploadVideoData.toDataInfo()).data));
    assert(await isEqualsVideo(await getVideoStream(videoLink), (await uploadVideoData.toDataInfo()).data));
});

async function getVideoStream(videoLink: string): Promise<Readable> {
    return new Promise((resolve, reject) => {
        https.get(videoLink, resolve).on('error', reject);
    });
}
