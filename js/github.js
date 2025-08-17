/* ======================================================================= */
/* FILE: js/github.js                                                      */
/* ======================================================================= */
class GitHubService {
    constructor(repo) {
        this.repo = repo;
        this.apiBase = `https://api.github.com/repos/${repo}`;
        this.rawBase = `https://raw.githubusercontent.com/${repo}/main`;
    }

    async getContents(path = '') {
        const url = `${this.apiBase}/contents/${path}`;
        try {
            const response = await fetch(url);
            if (response.status === 404) return []; // Not found is not an error, just empty
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(`Failed to fetch contents from path: ${path}`, error);
            return [];
        }
    }

    async getRawFile(path) {
        const url = `${this.rawBase}/${path}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch raw file: ${path}`);
        return response.text();
    }

    async getJsonFile(path) {
        const content = await this.getRawFile(path);
        return JSON.parse(content);
    }
}
