import { before, after, beforeEach, test } from 'node:test';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgresVideoCacheRepository } from '../src/PostgresVideoCacheRepository.ts';
import { Client } from 'pg';
import assert from 'assert';

let container: StartedPostgreSqlContainer;

before(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine').start();

    process.env.PGHOST = container.getHost();
    process.env.PGPORT = String(container.getMappedPort(5432));
    process.env.PGUSER = container.getUsername();
    process.env.PGPASSWORD = container.getPassword();
    process.env.PGDATABASE = container.getDatabase();
    process.env.PGSSLMODE = 'disable';
    delete process.env.CURRENT_SCHEMA;

    const client = newClient();
    await client.connect();
    await client.query(`
        CREATE TABLE video_cache (
            key  VARCHAR(255) PRIMARY KEY,
            data JSONB
        )
    `);
    await client.end();
}, { timeout: 60000 });

after(async () => {
    await container.stop();
});

beforeEach(async () => {
    const client = newClient();
    await client.connect();
    await client.query('DELETE FROM video_cache');
    await client.end();
});

test('키가 없으면 null 반환', async () => {
    const repo = new PostgresVideoCacheRepository();

    const result = await repo.findByKey('nonexistent');

    assert.strictEqual(result, null);
});

test('저장 후 같은 키로 조회하면 데이터 반환', async () => {
    const repo = new PostgresVideoCacheRepository();
    const data = { status: 200, data: '{"originUri":"https://mandeureomeokja.life/video/test.mp4"}' };

    await repo.save('reels123', data);
    const result = await repo.findByKey('reels123');

    assert.deepStrictEqual(result, data);
});

test('다른 키로 조회하면 null 반환', async () => {
    const repo = new PostgresVideoCacheRepository();
    const data = { status: 200, data: '{"originUri":"https://mandeureomeokja.life/video/test.mp4"}' };

    await repo.save('reels123', data);
    const result = await repo.findByKey('reels999');

    assert.strictEqual(result, null);
});

function newClient(): Client {
    return new Client({
        host: container.getHost(),
        port: container.getMappedPort(5432),
        user: container.getUsername(),
        password: container.getPassword(),
        database: container.getDatabase(),
    });
}
