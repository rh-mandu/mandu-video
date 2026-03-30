import { VideoService } from './VideoService.ts';
import { VideoCacheRepository } from './VideoCacheRepository.ts';

export class VideoSaveController {
    constructor(
        private service: VideoService,
        private cacheRepository: VideoCacheRepository,
    ) {}

    async saveVideo(reelsId: string, uri: string): Promise<any> {
        if (reelsId) {
            const cached = await this.cacheRepository.findByKey(reelsId);
            if (cached !== null) {
                console.log('hit cache');
                return cached;
            }
        }
        console.log('miss cache');
        const saved = await this.service.save(uri);
        const result = {
            status: 200,
            data: JSON.stringify({
                originUri: 'https://mandeureomeokja.life' + this.getPath(saved.originUri),
                streamUri: 'https://mandeureomeokja.life' + this.getPath(saved.streamUri),
                thumbnailUri: 'https://mandeureomeokja.life' + this.getPath(saved.thumbnailUri),
            }),
        };
        if (reelsId) {
            await this.cacheRepository.save(reelsId, result);
        }
        return result;
    }

    private getPath(url: URL): string {
        return url.pathname + url.search + url.hash;
    }
}
