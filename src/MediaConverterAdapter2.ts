import {VideoConverter} from "./converter.ts";
import {ConvertData} from "./ConvertData.ts";
import {LambdaClient, InvokeCommand, InvokeCommandInput} from "@aws-sdk/client-lambda";
import {
    AccelerationMode, AudioDefaultSelection,
    BillingTagsSource,
    CreateJobCommand,
    InputTimecodeSource,
    MediaConvertClient, OutputGroupType, StatusUpdateInterval, TimecodeSource
} from "@aws-sdk/client-mediaconvert";

export class MediaConverterAdapter2 implements VideoConverter {

    constructor(private client: MediaConvertClient) {
    }

    async convert(videoPath: URL): Promise<ConvertData> {
        const param = {
            Queue: process.env.MEDIA_QUEUE,
            UserMetadata: {},
            Role: process.env.MEDIA_ROLE,
            Settings: {
                TimecodeConfig: { Source: TimecodeSource.ZEROBASED },
                OutputGroups: [
                    {
                        Name: "Apple HLS",
                        Outputs: [{ Preset: "720x1280_video", NameModifier: "-720p" }],
                        OutputGroupSettings: {
                            Type: OutputGroupType.HLS_GROUP_SETTINGS,
                            HlsGroupSettings: {
                                SegmentLength: 10,
                                Destination: `s3://${process.env.S3_BUCKET}/stream/`,
                                MinSegmentLength: 0
                            }
                        }
                    },
                    {
                        Name: "File Group",
                        Outputs: [{ Preset: "save-thumbnail", NameModifier: "-thumbnail" }],
                        OutputGroupSettings: {
                            Type: OutputGroupType.FILE_GROUP_SETTINGS,
                            FileGroupSettings: { Destination: `s3://${process.env.S3_BUCKET}/thumbnail/` }
                        }
                    }
                ],
                FollowSource: 1,
                Inputs: [
                    {
                        AudioSelectors: { "Audio Selector 1": { DefaultSelection: AudioDefaultSelection.DEFAULT } },
                        VideoSelector: {},
                        TimecodeSource: InputTimecodeSource.ZEROBASED,
                        FileInput: videoPath.href
                    }
                ]
            },
            BillingTagsSource: BillingTagsSource.JOB,
            AccelerationSettings: { Mode: AccelerationMode.DISABLED },
            StatusUpdateInterval: StatusUpdateInterval.SECONDS_60,
            Priority: 0
        };

        let createJobCommand = new CreateJobCommand(param);
        try {
            await this.client.send(createJobCommand);
            const id = this.getId(videoPath.href);
            return {
                thumbnailPath: new URL(`/thumbnail/${id}-thumbnail.0000000.jpg`, "https://mandu-1.s3.ap-northeast-2.amazonaws.com"),
                streamPath: new URL(`/stream/${id}.m3u8`, "https://mandu-1.s3.ap-northeast-2.amazonaws.com")
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    getId(videoPath:string) {
        const match = videoPath.match(/([^/]+)(?=\.mp4$)/);
        if (!match) throw new Error("ID not found");
        return match[1];
    }
}