import { test } from 'node:test';
import assert from 'assert';
import { mock, when, instance, anything, verify } from 'ts-mockito';
import { VideoSaveController } from '../src/VideoSaveController.ts';
import { VideoService } from '../src/VideoService.ts';
import type { VideoCacheRepository } from '../src/VideoCacheRepository.ts';
import type { Saved } from '../src/dto.ts';

const savedResult: Saved = {
    originUri: new URL('https://s3.example.com/video/01.mp4'),
    streamUri: new URL('https://s3.example.com/stream/01.m3u8'),
    thumbnailUri: new URL('https://s3.example.com/thumb/01.jpg'),
};

test('캐시 히트 시 서비스 호출 없이 캐시 데이터 반환', async () => {
    const mockService = mock(VideoService);
    const mockCache = mock<VideoCacheRepository>();
    const cachedData = { status: 200, data: '{"originUri":"https://mandeureomeokja.life/video/01.mp4"}' };

    when(mockCache.findByKey('reels123')).thenResolve(cachedData);

    const controller = new VideoSaveController(instance(mockService), instance(mockCache));
    const result = await controller.saveVideo('reels123', 'https://instagram.com/video');

    assert.deepStrictEqual(result, cachedData);
    verify(mockService.save(anything())).never();
});

test('캐시 미스 시 서비스 호출 후 결과 캐시에 저장', async () => {
    const mockService = mock(VideoService);
    const mockCache = mock<VideoCacheRepository>();

    when(mockCache.findByKey('reels123')).thenResolve(null);
    when(mockService.save(anything())).thenResolve(savedResult);

    const controller = new VideoSaveController(instance(mockService), instance(mockCache));
    const result = await controller.saveVideo('reels123', 'https://instagram.com/video');

    assert(result);
    assert.strictEqual(result.status, 200);
    verify(mockService.save(anything())).once();
    verify(mockCache.save('reels123', anything())).once();
});

test('reelsId 없으면 캐시 조회/저장 없이 서비스만 호출', async () => {
    const mockService = mock(VideoService);
    const mockCache = mock<VideoCacheRepository>();

    when(mockService.save(anything())).thenResolve(savedResult);

    const controller = new VideoSaveController(instance(mockService), instance(mockCache));
    const result = await controller.saveVideo('', 'https://instagram.com/video');

    assert(result);
    assert.strictEqual(result.status, 200);
    verify(mockCache.findByKey(anything())).never();
    verify(mockCache.save(anything(), anything())).never();
    verify(mockService.save(anything())).once();
});

test('반환된 URL이 도메인 앞에 mandeureomeokja.life 붙어서 반환', async () => {
    const mockService = mock(VideoService);
    const mockCache = mock<VideoCacheRepository>();

    when(mockCache.findByKey(anything())).thenResolve(null);
    when(mockService.save(anything())).thenResolve(savedResult);

    const controller = new VideoSaveController(instance(mockService), instance(mockCache));
    const result = await controller.saveVideo('reels456', 'https://instagram.com/video');

    const parsed = JSON.parse(result.data);
    assert(parsed.originUri.startsWith('https://mandeureomeokja.life'));
    assert(parsed.streamUri.startsWith('https://mandeureomeokja.life'));
    assert(parsed.thumbnailUri.startsWith('https://mandeureomeokja.life'));
});
