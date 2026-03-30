export interface VideoCacheRepository {
    findByKey(key: string): Promise<any | null>;
    save(key: string, data: any): Promise<void>;
}
