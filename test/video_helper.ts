import {Readable} from "node:stream";
import leven from "leven";
import ffmpeg, {FfmpegCommand} from "fluent-ffmpeg";
import imghash from "imghash";
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

export async function isEqualsVideo(video1: Readable, video2: Readable) {
    const [video1Hashes,video2Hashes] = await Promise.all([
        getFrameHashForSecondsFromVideoData(video1),
        getFrameHashForSecondsFromVideoData(video2)
    ]);
    for (let i = 0; i < video1Hashes.length; i++) {
        let dist = leven(video1Hashes[i]!, video2Hashes[i]!);
        if (dist > 0){
            return false;
        }
    }
    return true;
}

export async function isValidVideo(readable: Readable): Promise<boolean> {
    const time: number = await new Promise((resolve, reject) => {
        ffmpeg(readable).ffprobe((err, data) => {
            if (err) return reject(err);
            resolve(data.format.duration ?? 0);
        });
    });
    return time > 0;
}

async function getFrameHashForSecondsFromVideoData(video1: Readable): Promise<string[]> {
    const video1FfmpegCommand = ffmpeg(video1);
    const video1Duration = await getDuration(video1FfmpegCommand);
    return await getFrameHashForSeconds(video1FfmpegCommand, video1Duration);
}

async function getDuration(ffmpegCommand: FfmpegCommand): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpegCommand.ffprobe((err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration ?? 0);
        });
    });
}

async function getFrameHashForSeconds(ffmpegCommand: FfmpegCommand, videoDuration: number): Promise<string[]> {
    const hashes: string[] = [];

    return new Promise((resolve, reject) => {
        ffmpegCommand
            .fps(1) // 1초당 1프레임 추출
            .format('image2pipe')
            .outputOptions('-vcodec png')
            .on('error', reject)
            .pipe()
            .on('data', async (chunk: Buffer) => {
                const hash = await imghash.hash(chunk);
                hashes.push(hash);
            })
            .on('end', () => resolve(hashes))
            .on('error', reject);
    });
}
