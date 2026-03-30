import {VideoConverter} from "./converter.ts";
import {ConvertData} from "./ConvertData.ts";
import {LambdaClient, InvokeCommand, InvokeCommandInput} from "@aws-sdk/client-lambda";

export class MediaConverterAdapter implements VideoConverter {

    constructor(private client: LambdaClient) {
    }

    async convert(videoPath: URL): Promise<ConvertData> {
        console.log("call convert uri : ", videoPath);
        return this.invokeLambda("thumbnail-save-dev-hello", {videoPath: videoPath.href});

    }

    async invokeLambda(functionName: string, payload: any): Promise<ConvertData> {
        try {
            // 2. 파라미터 구성
            const params: InvokeCommandInput = {
                FunctionName: functionName, // 호출할 함수명 또는 ARN
                Payload: JSON.stringify(payload), // 전달할 데이터 (JSON 문자열)
                InvocationType: "RequestResponse", // 동기 호출 (결과를 기다림)
            };

            const command = new InvokeCommand(params);
            const response = await this.client.send(command);

            // 4. 결과 파싱 (Uint8Array로 오기 때문에 문자열 변환 필요)
            const result = JSON.parse(new TextDecoder().decode(response.Payload));
            console.log("Lambda 결과:", result);
            console.log(JSON.parse(result.body));
            const data: ConvertData = {
                thumbnailPath: new URL(JSON.parse(result.body).thumbnailPath),
                streamPath: new URL(JSON.parse(result.body).streamPath)
            };
            console.log("response: ", data);
            return data;

        } catch (error) {
            console.error("호출 실패:", error);
            throw error;
        }
    };
}