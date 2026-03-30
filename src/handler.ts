import {createVideoController} from "./VideoControllerFactory.ts";
import {APIGatewayProxyEventV2, APIGatewayProxyHandlerV2} from "aws-lambda";
import * as net from "node:net";


export const handle: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
    const videoSaveController = createVideoController();
    const dataJson = getDataJson(event);
    return videoSaveController.saveVideo(dataJson.reelsId,dataJson.uri);
}

const getDataJson = (event: APIGatewayProxyEventV2) => {
    const method = event?.requestContext?.http?.method;

    if (!method) {
        // HTTP 요청 아님 (SQS, EventBridge 등)
        return event;
    }

    return event.body ? JSON.parse(event.body) : {};
}