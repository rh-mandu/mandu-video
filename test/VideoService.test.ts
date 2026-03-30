import { test } from 'node:test';
import assert from 'assert';
import { VideoService } from '../src/VideoService.ts';
import type { VideoRepository, VideoUploader } from '../src/storage.ts';
import type { Video } from '../src/models.ts';
import type { ConvertData } from '../src/ConvertData.ts';
import type { VideoConverter } from '../src/converter.ts';
import { VideoFactory } from '../src/VideoFactory.ts';
import { mock, when, instance, anything, verify } from 'ts-mockito';

const originUrl = new URL('https://s3.example.com/video/test.mp4');
const convertResult: ConvertData = {
    streamPath: new URL('https://s3.example.com/stream/test.m3u8'),
    thumbnailPath: new URL('https://s3.example.com/thumb/test.jpg'),
};

test('정상 영상 저장 시 originUri/streamUri/thumbnailUri 반환 및 repository 저장', async () => {
    const mockUploader = mock<VideoUploader>();
    const mockFactory = mock(VideoFactory);
    const mockRepo = mock<VideoRepository>();
    const mockConverter = mock<VideoConverter>();

    when(mockUploader.save(anything())).thenResolve(originUrl);
    when(mockFactory.create(anything(), anything())).thenResolve({
        duration_second: 10,
        path: originUrl.href,
        videoId: 'test-videoId',
    } as Video);
    when(mockRepo.save(anything())).thenResolve();
    when(mockConverter.convert(anything())).thenResolve(convertResult);

    const videoService = new VideoService(
        instance(mockRepo),
        instance(mockUploader),
        instance(mockFactory),
        instance(mockConverter),
    );

    const saved = await videoService.save('https://instagram.com/video');

    assert(saved);
    assert(saved.originUri instanceof URL);
    assert(saved.streamUri instanceof URL);
    assert(saved.thumbnailUri instanceof URL);
    assert.strictEqual(saved.originUri.href, originUrl.href);
    assert.strictEqual(saved.streamUri.href, convertResult.streamPath.href);
    assert.strictEqual(saved.thumbnailUri.href, convertResult.thumbnailPath.href);
    verify(mockRepo.save(anything())).once();
    verify(mockConverter.convert(anything())).once();
});

test('duration이 0인 영상이면 저장하지 않고 예외 반환', async () => {
    const mockUploader = mock<VideoUploader>();
    const mockFactory = mock(VideoFactory);
    const mockRepo = mock<VideoRepository>();
    const mockConverter = mock<VideoConverter>();

    when(mockUploader.save(anything())).thenResolve(originUrl);
    when(mockFactory.create(anything(), anything())).thenReject(
        new Error('Duration should be less than 0'),
    );

    const videoService = new VideoService(
        instance(mockRepo),
        instance(mockUploader),
        instance(mockFactory),
        instance(mockConverter),
    );

    await assert.rejects(
        () => videoService.save('https://instagram.com/video'),
        { message: 'Duration should be less than 0' },
    );

    verify(mockRepo.save(anything())).never();
    verify(mockConverter.convert(anything())).never();
});
