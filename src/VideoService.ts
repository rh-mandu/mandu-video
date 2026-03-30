import {VideoRepository, VideoUploader} from "./storage.ts";
import {Saved} from "./dto.ts";
import {VideoFactory} from "./VideoFactory.ts";
import {UploadVideoData} from "./UploadVideoData.ts";
import {createVideoId} from "./helper.ts";
import {ConvertData} from "./ConvertData.ts";
import {VideoConverter} from "./converter.ts";


export class VideoService {

    constructor(private videoRepository: VideoRepository, private videoUploader: VideoUploader, private videoFactory: VideoFactory, private videoConverter: VideoConverter) {
        this.videoRepository = videoRepository;
        this.videoUploader = videoUploader;
        this.videoFactory = videoFactory;
    }

    async save(uri: string): Promise<Saved> {
        let videoId = createVideoId();
        const uriStream: UploadVideoData = UploadVideoData.fromUri("video/" + videoId + ".mp4", uri);
        const originUrl: URL = await this.videoUploader.save(uriStream);

        try {
            const video = await this.videoFactory.create(videoId, originUrl);
            await this.videoRepository.save(video);
            const convertData: ConvertData = await this.videoConverter.convert(originUrl);
            return {
                originUri: originUrl,
                streamUri: convertData.streamPath,
                thumbnailUri: convertData.thumbnailPath,
            };
        } catch (err) {
            return Promise.reject(err);
        }
    }
}


