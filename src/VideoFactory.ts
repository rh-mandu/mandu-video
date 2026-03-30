import {Saved} from "./dto.ts";
import {Video} from "./models.ts";
import {getDuration} from "./helper.ts";

export class VideoFactory {
    async create(videoId: string, videoPath: URL) {
        const model: Video = {
            videoId: videoId,
            duration_second: await getDuration(videoPath.href),
            path: videoPath.href
        }
        if (model.duration_second <= 0) {
            return Promise.reject(new Error("Duration should be less than 0"));
        }
        return model;
    }
}