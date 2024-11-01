/**
 * GitHub Release
 */
export interface CreateReleaseOptions {
    owner: string;
    repo: string;
    tag_name: string;
    name: string;
    draft: boolean;
    prerelease: boolean;
    generate_release_notes: boolean;
    target_commitish?: string;
    body?: string;
}
/**
 * GitHub Release
 */
export interface Release {
    id: number;
    html_url: string;
    upload_url: string;
}
