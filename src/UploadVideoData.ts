import {Readable} from "node:stream";
import {VideoDataInfo} from "./dto.ts";
import {fetchVideo} from "./helper.ts";

export class UploadVideoData {
    constructor(
        public readonly filePath: string,
        private readonly videoDataInfoFactory: () => Promise<VideoDataInfo>,
    ) {
    }

    static fromUri(filePath: string, uri: string): UploadVideoData {
        return new UploadVideoData(filePath, async (): Promise<VideoDataInfo> => {
            const res = await fetchVideo(uri);
            const len = res.headers.get("content-length");
            if (!len) {
                return Promise.reject(new Error(`UploadVideoData from stream: ${uri}`));
            }
            return {
                len: parseInt(len),
                data: Readable.from(res.body!)
            }
        })
    }

    async toDataInfo(): Promise<VideoDataInfo> {
        return await this.videoDataInfoFactory();
    }
}