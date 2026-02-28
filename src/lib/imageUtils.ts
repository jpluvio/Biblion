import * as https from 'https';
import * as http from 'http';
import * as path from 'path';

export async function downloadImage(url: string | null | undefined): Promise<string | null> {
    if (!url) return null;

    // If it's already a local path or data URI, return as is
    if (url.startsWith('/') || url.startsWith('data:')) return url;

    try {

        const proto = url.startsWith('https') ? https : http;

        return new Promise((resolve, reject) => {
            proto.get(url, (response) => {
                if (response.statusCode !== 200) {
                    resolve(url);
                    return;
                }

                const chunks: Buffer[] = [];
                response.on('data', (chunk) => chunks.push(chunk));

                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);

                    const ext = path.extname(url).split('?')[0].toLowerCase() || '.jpg';
                    let mimeType = 'image/jpeg';
                    if (ext === '.png') mimeType = 'image/png';
                    else if (ext === '.gif') mimeType = 'image/gif';
                    else if (ext === '.webp') mimeType = 'image/webp';

                    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
                    resolve(base64Data);
                });
            }).on('error', (err) => {
                console.error('Error downloading image:', err);
                resolve(url); // Fallback to original URL
            });
        });

    } catch (error) {
        console.error('Image download failed:', error);
        return url; // Fallback
    }
}
