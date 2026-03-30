import {VideoRepository} from "./storage.ts";
import {Video} from "./models.ts";
import {Client} from "pg"
import {doQuery} from "./PgQueryHelper.ts";


export class PostgresVideoRepository implements VideoRepository {

    constructor() {
    }

    async save(video: Video): Promise<void> {
        console.log("save request : ",video);
        await doQuery(async (connect: Client) => {
            let newVar1 = await connect.query("insert into video_jpa_entity(video_id,type,path,duration_seconds) values ($1, $2, $3, $4)",
                [video.videoId,'S3FileLocation',video.path,video.duration_second]);
            console.log(newVar1)
        });
    }
}