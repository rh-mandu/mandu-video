import {VideoUploader} from "./storage.ts";
import {S3VideoUploader} from "./S3VideoUploader.ts";
import {S3Client} from "@aws-sdk/client-s3";

export function createS3VideoUploader(): VideoUploader {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'ap-northeast-2',
        requestStreamBufferSize: 65_536
    });
    return new S3VideoUploader(s3Client);
}