import { test } from 'node:test';
import { handle } from '../src/handler.ts';
import { anything, instance, mock, when } from 'ts-mockito';
import { VideoSaveController } from '../src/VideoSaveController.ts';
import { setControllerFactory } from '../src/VideoControllerFactory.ts';
import assert from 'assert';
import {APIGatewayProxyStructuredResultV2} from "aws-lambda/trigger/api-gateway-proxy";

const mockSavedResult = {
    status: 200,
    data: JSON.stringify({
        originUri: 'https://mandeureomeokja.life/video/test.mp4',
        streamUri: 'https://mandeureomeokja.life/stream/test.m3u8',
        thumbnailUri: 'https://mandeureomeokja.life/thumb/test.jpg',
    }),
};

test('핸들러 정상 동작 - body에서 uri/reelsId 파싱 후 saveVideo 호출', async () => {
    const mockController = mock(VideoSaveController);
    when(mockController.saveVideo(anything(), anything())).thenResolve(mockSavedResult);

    setControllerFactory({ create: () => instance(mockController) });

    const event = { body: JSON.stringify({ uri: 'https://instagram.com/video', reelsId: 'reels123' }) };
    const result = await handle(event as any, {} as any, () => {}) as APIGatewayProxyStructuredResultV2;

    assert.strictEqual(result.status, 200);
    const data = JSON.parse(result.data!);
    assert(data.originUri.startsWith('https://mandeureomeokja.life'));
});

test('핸들러 body 없으면 빈 객체로 saveVideo 호출', async () => {
    const mockController = mock(VideoSaveController);
    when(mockController.saveVideo(anything(), anything())).thenResolve(mockSavedResult);

    setControllerFactory({ create: () => instance(mockController) });

    const event = { requestContext: { http: { method: 'POST' } } };
    const result = await handle(event as any, {} as any, () => {});

    assert(result);
});
