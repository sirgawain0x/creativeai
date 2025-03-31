import { type Media, type Plugin } from './types';
type MediaData = {
  data: Buffer;
  mediaType: string;
};
/**
 * Fetches media data from a list of attachments, supporting both HTTP URLs and local file paths.
 *
 * @param attachments Array of Media objects containing URLs or file paths to fetch media from
 * @returns Promise that resolves with an array of MediaData objects containing the fetched media data and content type
 */
export declare function fetchMediaData(attachments: Media[]): Promise<MediaData[]>;
export declare const bootstrapPlugin: Plugin;
export default bootstrapPlugin;
//# sourceMappingURL=bootstrap.d.ts.map
