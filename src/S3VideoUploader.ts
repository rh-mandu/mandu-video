import {VideoUploader} from "./storage.ts";
import {UploadVideoData} from "./UploadVideoData.ts";
import {Saved} from "./dto.ts";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3"


export class S3VideoUploader implements VideoUploader {

    constructor(private readonly s3Client: S3Client) {
    }

    async save(data: UploadVideoData): Promise<URL> {
        console.log("데이터 받아오기 : ",data);
        const dataInfo = await data.toDataInfo();

        console.log("s3 save request : ",data)
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: data.filePath,
            ContentLength: dataInfo.len,
            Body: dataInfo.data
        });
        await this.s3Client.send(command);
        console.log("s3 save success : ",data)
        return new URL(data.filePath,`https://${process.env.S3_BUCKET}.s3.ap-northeast-2.amazonaws.com`)
    }
}