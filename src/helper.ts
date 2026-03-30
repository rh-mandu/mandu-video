import ffmpeg from 'fluent-ffmpeg';
import {ulid} from "ulid";
import axios from 'axios';
import {HttpsProxyAgent} from "https-proxy-agent";


export async function fetchVideo(uri: string): Promise<any> {
    const proxyUrl = process.env.PROXY_URL;
    const axiosConfig: Record<string, any> = {
        timeout: 15000,
        responseType: "stream",
    };
    if (proxyUrl) {
        axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
        axiosConfig.proxy = false;
    }

    try {
        console.log(`Fetching ${uri}`);
        const response = await axios.get(uri, axiosConfig);
        console.log(`finish ${uri}`);

        return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            headers: {
                get: (name: string) => response.headers[name.toLowerCase()] ?? null
            },
            body: response.data,
            json: async () => {
                const chunks: Buffer[] = [];
                for await (const chunk of response.data) {
                    chunks.push(chunk);
                }
                return JSON.parse(Buffer.concat(chunks).toString("utf8"));
            },
            text: async () => {
                const chunks: Buffer[] = [];
                for await (const chunk of response.data) {
                    chunks.push(chunk);
                }
                return Buffer.concat(chunks).toString("utf8");
            }
        };

    } catch (error: any) {
        console.error(`[Fetch Error] ${error.message}`);
        throw error;
    }
}

export async function getDuration(filePath: string): Promise<number> {
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH ?? '/opt/ffmpeg/bin/ffprobe');
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration ?? 0);
        });
    });
}

export function createVideoId(): string {
    return ulid();
}
