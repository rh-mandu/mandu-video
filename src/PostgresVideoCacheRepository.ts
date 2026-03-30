import { VideoCacheRepository } from './VideoCacheRepository.ts';
import { doQuery } from './PgQueryHelper.ts';
import { Client, QueryResult } from 'pg';

export class PostgresVideoCacheRepository implements VideoCacheRepository {
    async findByKey(key: string): Promise<any | null> {
        const result: QueryResult<any> = await doQuery(async (connect: Client) => {
            return await connect.query('select * from video_cache where key = $1', [key]);
        });
        if (result && result.rowCount !== 0) {
            return result.rows[0].data;
        }
        return null;
    }

    async save(key: string, data: any): Promise<void> {
        await doQuery(async (connect: Client) => {
            await connect.query('insert into video_cache(key,data) values($1,$2)', [key, data]);
        });
    }
}
