export interface CloudConfig {
    provider: 'nextcloud' | 'minio';
    serverUrl: string;
    username: string;
    password: string; // This would be an app password or secret key
}