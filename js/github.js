/**
 * A service class to handle all interactions with the GitHub API.
 */
class GitHubService {
    constructor(repoPath) {
        if (!repoPath || repoPath.split('/').length !== 2) {
            throw new Error("Invalid repository path. Must be in 'owner/repo' format.");
        }
        this.owner = repoPath.split('/')[0];
        this.repo = repoPath.split('/')[1];
        this.baseUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/`;
    }

    /**
     * Fetches a raw text file (like .md) from the repository.
     * @param {string} filePath - The path to the file from the repo root.
     * @returns {Promise<string>} - The text content of the file.
     */
    async getRawFile(filePath) {
        const url = this.baseUrl + filePath;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch raw file: ${filePath}. Status: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * Fetches and parses a JSON file from the repository.
     * @param {string} filePath - The path to the file from the repo root.
     * @returns {Promise<Object>} - The parsed JSON object.
     */
    async getJsonFile(filePath) {
        const textContent = await this.getRawFile(filePath);
        return JSON.parse(textContent);
    }
}
