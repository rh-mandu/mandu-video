import {ConvertData} from "./ConvertData.ts";

export interface VideoConverter {
    convert(videoPath: URL): Promise<ConvertData>;
}