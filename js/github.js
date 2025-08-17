/* ======================================================================= */
/* FILE: js/github.js                                                      */
/* PURPOSE: Handles all communication with the GitHub API.                 */
/* VERSION: 2.0 - Optimized for direct raw content fetching.               */
/* ======================================================================= */

class GitHubService {
    constructor(repo) {
        this.repo = repo; // e.g., "abdallah-7amza/MED-Portal-NUB"
        this.apiBase = `https://api.github.com/repos/${repo}`;
        // This is the crucial part: we will build direct links to the raw content.
        this.rawBase = `https://raw.githubusercontent.com/${repo}/main`;
    }

    /**
     * Fetches directory contents from a given path in the repository.
     * This is used to discover what folders/files exist.
     * @param {string} path - The path to fetch, e.g., 'lessons' or 'lessons/fifth-year'.
     * @returns {Promise<Array>} A promise that resolves to an array of directory items.
     */
    async getContents(path = '') {
        const url = `${this.apiBase}/contents/${path}`;
        try {
            // We add a cache-busting parameter to ensure we get the latest directory listing
            const response = await fetch(`${url}?t=${new Date().getTime()}`);
            if (response.status === 404) return []; // Not found is not an error, just an empty folder.
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            
            const data = await response.json();
            // Ensure the response is an array before returning
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(`Failed to fetch contents from path: ${path}`, error);
            return []; // Return empty array on failure to prevent the site from crashing.
        }
    }

    /**
     * Fetches the raw text content of a file using a direct URL.
     * This is more reliable than using the API for file content.
     * @param {string} path - The full path to the file, e.g., 'lessons/year/branch/lesson.md'.
     * @returns {Promise<string>} A promise that resolves to the file content as text.
     */
    async getRawFile(path) {
        const url = `${this.rawBase}/${path}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch raw file from ${url}. Status: ${response.status}`);
        return await response.text();
    }

    /**
     * Fetches and parses a JSON file using the direct raw URL method.
     * @param {string} path - The full path to the JSON file.
     * @returns {Promise<Object>} A promise that resolves to the parsed JSON object.
     */
    async getJsonFile(path) {
        const content = await this.getRawFile(path);
        return JSON.parse(content);
    }
}
