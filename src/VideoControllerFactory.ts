import { VideoSaveController } from './VideoSaveController.ts';
import { createVideoService } from './VideoServiceConfig.ts';
import { PostgresVideoCacheRepository } from './PostgresVideoCacheRepository.ts';

interface VideoControllerFactoryInterface {
    create(): VideoSaveController;
}

class DefaultVideoControllerFactory implements VideoControllerFactoryInterface {
    create(): VideoSaveController {
        return new VideoSaveController(
            createVideoService(),
            new PostgresVideoCacheRepository(),
        );
    }
}

let controllerFactory: VideoControllerFactoryInterface = new DefaultVideoControllerFactory();

export function createVideoController(): VideoSaveController {
    return controllerFactory.create();
}

export function setControllerFactory(factory: VideoControllerFactoryInterface): void {
    controllerFactory = factory;
}
