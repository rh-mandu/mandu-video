import {Readable} from "node:stream";

export interface Saved {
    originUri: URL;
    streamUri: URL;
    thumbnailUri: URL;
}

export interface VideoDataInfo {
    len: number;
    data: Readable;
}