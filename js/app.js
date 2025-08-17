/* ======================================================================= */
/* FILE: js/app.js                                                         */
/* ======================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_REPO = 'abdallah-7amza/MED-Portal-NUB';
    const github = new GitHubService(GITHUB_REPO);
    const params = new URLSearchParams(window.location.search);

    // --- THEME MANAGEMENT ---
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if(lightIcon) lightIcon.style.display = 'none';
            if(darkIcon) darkIcon.style.display = 'block';
        } else {
            document.body.classList.remove('dark-mode');
            if(lightIcon) lightIcon.style.display = 'block';
            if(darkIcon) darkIcon.style.display = 'none';
        }
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

    // --- PAGE-SPECIFIC LOGIC ---
    const path = window.location.pathname;

    if (path.endsWith('branches.html')) {
        const year = params.get('year');
        if (year) loadBranches(year);
    } else if (path.endsWith('lessons-list.html')) {
        const year = params.get('year');
        const branch = params.get('branch');
        if (year && branch) loadLessons(year, branch);
    }

    // --- DATA LOADING FUNCTIONS ---
    async function loadBranches(year) {
        document.getElementById('year-title').textContent = `${formatName(year)} Branches`;
        const grid = document.getElementById('branches-grid');
        const contents = await github.getContents(`lessons/${year}`);
        const branches = contents.filter(item => item.type === 'dir');
        renderCards(grid, branches, (branch) => `lessons-list.html?year=${year}&branch=${branch.name}`);
    }

    async function loadLessons(year, branch) {
        document.getElementById('branch-title').textContent = `Lessons in ${formatName(branch)}`;
        document.getElementById('back-to-branches-link').href = `branches.html?year=${year}`;
        const grid = document.getElementById('lessons-grid');
        const contents = await github.getContents(`lessons/${year}/${branch}`);
        const lessons = contents.filter(item => item.name.endsWith('.md'));
        
        const lessonData = lessons.map(lesson => ({
            name: lesson.name.replace('.md', ''),
            path: `lesson.html?year=${year}&branch=${branch}&lesson=${lesson.name.replace('.md', '')}`
        }));

        renderCards(grid, lessonData, (lesson) => lesson.path);

        const searchBar = document.getElementById('search-bar');
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filteredLessons = lessonData.filter(lesson => lesson.name.replace(/-/g, ' ').includes(query));
            renderCards(grid, filteredLessons, (lesson) => lesson.path);
        });
    }

    // --- UTILITY FUNCTIONS ---
    function renderCards(grid, items, urlBuilder) {
        if (!grid) return;
        if (items.length === 0) {
            grid.innerHTML = '<p class="message-box">No content has been added to this section yet.</p>';
            return;
        }
        grid.innerHTML = items.map(item => `
            <a href="${urlBuilder(item)}" class="card">
                <h3>${formatName(item.name)}</h3>
            </a>
        `).join('');
    }

    function formatName(name) {
        return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
});
