/* ======================================================================= */
/* FILE: js/github.js                                                      */
/* VERSION: 4.0 - Automated Discovery Model                                */
/* ======================================================================= */
class GitHubService {
    constructor(repo) {
        this.repo = repo;
        this.apiBase = `https://api.github.com/repos/${repo}`;
        this.rawBase = `https://raw.githubusercontent.com/${repo}/main`;
    }

    /**
     * Fetches the entire file tree for the repository using the Git Trees API.
     * This is the core function for automated content discovery.
     * @returns {Promise<Array>} A promise that resolves to a structured list of all lesson files.
     */
    async getAllLessons() {
        // This single API call gets a list of all files in the repository.
        const apiUrl = `${this.apiBase}/git/trees/main?recursive=1`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API request failed: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Process the flat file list into a structured lesson object
            const lessonFiles = data.tree
                .filter(file => file.path.startsWith('lessons/') && file.path.endsWith('.md'))
                .map(file => {
                    const pathParts = file.path.split('/'); // e.g., ['lessons', 'fifth-year', 'pediatrics', 'neonatal-jaundice.md']
                    if (pathParts.length < 4) return null; // Ensure the structure is valid (lessons/year/branch/file.md)

                    const year = pathParts[1];
                    const branch = pathParts[2];
                    const fileName = pathParts[3];
                    const lessonId = fileName.replace('.md', '');
                    const title = lessonId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    
                    return { path: file.path, title, year, branch, id: lessonId };
                })
                .filter(Boolean); // Remove any null entries from invalid paths

            return lessonFiles;
        } catch (error) {
            console.error("Error fetching lesson tree:", error);
            return [];
        }
    }

    /**
     * Fetches the raw text content of a file.
     * @param {string} path - The full path to the file, e.g., 'lessons/year/branch/lesson.md'.
     * @returns {Promise<string>} The file content as text.
     */
    async getRawFile(path) {
        const url = `${this.rawBase}/${path}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch raw file: ${path}`);
        return await response.text();
    }

    /**
     * Fetches the JSON content for a lesson's quiz/flashcards.
     * @param {string} path - The full path to the JSON file.
     * @returns {Promise<Object>} The parsed JSON object.
     */
    async getJsonFile(path) {
        const content = await this.getRawFile(path);
        return JSON.parse(content);
    }
}
