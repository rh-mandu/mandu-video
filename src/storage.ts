import {Video} from "./models.ts";
import {Saved} from "./dto.ts";
import {UploadVideoData} from "./UploadVideoData.ts";

export interface VideoRepository {
    save(video: Video): Promise<void>;
}

export interface VideoUploader {
    save(data: UploadVideoData): Promise<URL>;
}