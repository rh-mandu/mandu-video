import {VideoConverter} from "./converter.ts";
import {MediaConvertClient} from "@aws-sdk/client-mediaconvert";
import {MediaConverterAdapter} from "./MediaConverterAdapter.ts";
import {LambdaClientConfig} from "@aws-sdk/client-lambda/dist-types/LambdaClient";
import {NodeHttpHandler} from "@smithy/node-http-handler";
import {HttpsProxyAgent} from "https-proxy-agent";
import {LambdaClient} from "@aws-sdk/client-lambda";

export function createMediaConverterAdapter():VideoConverter{
    const config: LambdaClientConfig = {
        region: "ap-northeast-2",
        requestHandler: new NodeHttpHandler({
            httpsAgent: new HttpsProxyAgent("http://172.31.46.254:8888")
        }),
    };
    const client = new LambdaClient(config);
    return new MediaConverterAdapter(client);
}