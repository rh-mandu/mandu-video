import { test } from 'node:test';
import ffprobePath from 'ffprobe-static';
import { getDuration } from '../src/helper.ts';
import assert from 'assert';

process.env.FFPROBE_PATH = process.env.FFPROBE_PATH ?? ffprobePath.path;

test('시간_조회', async () => {
    const time: number = await getDuration('https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4');
    assert(time > 0);
});
