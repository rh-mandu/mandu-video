import { before, after, beforeEach, test } from 'node:test';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgresVideoRepository } from '../src/PostgresVideoRepository.ts';
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
        CREATE TABLE video_jpa_entity (
            id              SERIAL PRIMARY KEY,
            video_id        VARCHAR(255) NOT NULL,
            type            VARCHAR(50),
            path            TEXT,
            duration_seconds INTEGER
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
    await client.query("DELETE FROM video_jpa_entity WHERE video_id = 'testId'");
    await client.end();
});

test('포스트 그리스에 정상 저장', async () => {
    const repository = new PostgresVideoRepository();
    const testVideo = { duration_second: 3, path: 'testPath', videoId: 'testId' };

    await repository.save(testVideo);

    const rows = await selectByVideoId('testId');
    assert.strictEqual(rows.length, 1);
    assert.deepStrictEqual(rows[0], testVideo);
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

async function selectByVideoId(videoId: string) {
    const client = newClient();
    await client.connect();
    const result = await client.query(
        'SELECT video_id, duration_seconds, path FROM video_jpa_entity WHERE video_id = $1',
        [videoId],
    );
    await client.end();
    return result.rows.map(row => ({
        videoId: row.video_id as string,
        duration_second: parseInt(row.duration_seconds),
        path: row.path as string,
    }));
}
