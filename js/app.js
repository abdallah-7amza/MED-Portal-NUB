
/* ======================================================================= */
/* FILE: js/app.js                                                         */
/* VERSION: 3.1 - Corrected Repository Name                                */
/* ======================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // FIX: Corrected the repository name to match your GitHub Pages URL.
    const GITHUB_REPO = 'abdallah-7amza/MED-Portal-NUB'; 
    const github = new GitHubService(GITHUB_REPO);
    const params = new URLSearchParams(window.location.search);

    // --- THEME MANAGEMENT (No changes) ---
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        if (lightIcon) lightIcon.style.display = theme === 'dark' ? 'none' : 'block';
        if (darkIcon) darkIcon.style.display = theme === 'dark' ? 'block' : 'none';
    };
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // --- AUTOMATED PAGE LOGIC ---
    const path = window.location.pathname;

    async function initializePage() {
        // The homepage is static, so we only need dynamic logic for other pages.
        if (path.endsWith('/') || path.endsWith('index.html')) return;

        try {
            // Fetch all lessons once and build pages from this data.
            const allLessons = await github.getAllLessons();

            if (path.endsWith('branches.html')) {
                const yearId = params.get('year');
                if (yearId) {
                    // Find all unique branch names for the selected year
                    const branchesForYear = [...new Set(allLessons
                        .filter(lesson => lesson.year === yearId)
                        .map(lesson => lesson.branch)
                    )];
                    
                    document.getElementById('year-title').textContent = `${formatName(yearId)} Branches`;
                    const grid = document.getElementById('branches-grid');
                    const branchData = branchesForYear.map(branchId => ({ name: branchId }));
                    renderCards(grid, branchData, (branch) => `lessons-list.html?year=${yearId}&branch=${branch.name}`);
                }
            } else if (path.endsWith('lessons-list.html')) {
                const yearId = params.get('year');
                const branchId = params.get('branch');

                if (yearId && branchId) {
                    // Filter the master list to get only the lessons for this specific branch
                    const lessonsForBranch = allLessons.filter(lesson => lesson.year === yearId && lesson.branch === branchId);
                    
                    document.getElementById('branch-title').textContent = `Lessons in ${formatName(branchId)}`;
                    document.getElementById('back-to-branches-link').href = `branches.html?year=${yearId}`;
                    const grid = document.getElementById('lessons-grid');
                    renderCards(grid, lessonsForBranch, (lesson) => `lesson.html?year=${yearId}&branch=${branchId}&lesson=${lesson.id}`);
                    
                    // Search functionality
                    const searchBar = document.getElementById('search-bar');
                    searchBar.addEventListener('input', (e) => {
                        const query = e.target.value.toLowerCase();
                        const filteredLessons = lessonsForBranch.filter(lesson => lesson.title.toLowerCase().includes(query));
                        renderCards(grid, filteredLessons, (lesson) => `lesson.html?year=${yearId}&branch=${branchId}&lesson=${lesson.id}`);
                    });
                }
            }
        } catch (error) {
            console.error("Initialization Error:", error);
            document.querySelector('main .container').innerHTML = `<p class="error-message">Could not load site content from GitHub.</p>`;
        }
    }

    // --- UTILITY FUNCTIONS ---
    function renderCards(grid, items, urlBuilder) {
        if (!grid) return;
        if (!items || items.length === 0) {
            grid.innerHTML = '<p class="message-box">No content has been added to this section yet.</p>';
            return;
        }
        grid.innerHTML = items.map(item => `
            <a href="${urlBuilder(item)}" class="card">
                <h3>${item.title || formatName(item.name)}</h3>
            </a>
        `).join('');
    }

    function formatName(name) {
        return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    initializePage();
});
