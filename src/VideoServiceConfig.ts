import {VideoService} from "./VideoService.ts";
import {PostgresVideoRepository} from "./PostgresVideoRepository.ts";
import {createS3VideoUploader} from "./S3VideoUploaderConfig.ts";
import {VideoFactory} from "./VideoFactory.ts";
import {createMediaConverterAdapter} from "./MediaConverterAdapterConfig.ts";

export interface VideoServiceFactory {
    create() : VideoService;
}

class DefaultVideoFactory implements VideoServiceFactory {
    create(): VideoService {
        return  new VideoService(
            new PostgresVideoRepository(),
            createS3VideoUploader(),
            new VideoFactory(),
            createMediaConverterAdapter()
        );
    }
}


let controllerFactory: VideoServiceFactory = new DefaultVideoFactory();

export function createVideoService(){
    return controllerFactory.create();
}

export function setFactory(factory:VideoServiceFactory){
    controllerFactory = factory;
}