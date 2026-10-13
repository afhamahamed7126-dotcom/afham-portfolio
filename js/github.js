const GITHUB_USERNAME = "afhamahamed7126-dotcom";
const GITHUB_API = "https://api.github.com";

document.addEventListener("DOMContentLoaded", function () {
    loadGitHubRepositories();
    loadGitHubProfile();
});


// ================================
// LOAD GITHUB PROFILE
// ================================

async function loadGitHubProfile() {

    const profileBox = document.getElementById("github-profile-summary");

    if (!profileBox) {
        console.error("GitHub profile container not found.");
        return;
    }

    try {

        const response = await fetch(
            GITHUB_API + "/users/" + encodeURIComponent(GITHUB_USERNAME),
            {
                cache: "no-store",
                headers: {
                    Accept: "application/vnd.github+json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "GitHub profile request failed: " + response.status
            );
        }

        const profile = await response.json();

        profileBox.innerHTML = `
            <div class="github-profile-preview">

                <img
                    src="${escapeHtml(profile.avatar_url)}"
                    alt="GitHub Profile"
                    class="github-avatar"
                >

                <div>

                    <h3 style="font-size:1.25rem; margin-bottom:4px;">
                        ${escapeHtml(profile.name || "Afham Ahamed")}
                    </h3>

                    <p style="font-size:0.88rem; color:var(--text-accent); margin:0;">
                        @${escapeHtml(profile.login)}
                    </p>

                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
                        ${escapeHtml(profile.bio || "Developer & AI Enthusiast")}
                    </p>

                </div>

            </div>

            <a
                href="${escapeHtml(profile.html_url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary btn-sm"
            >
                <i class="fab fa-github"></i>
                View My GitHub
            </a>
        `;

    } catch (error) {

        console.error("GitHub profile error:", error);

    }
}


// ================================
// LOAD ALL GITHUB REPOSITORIES
// ================================

async function loadGitHubRepositories() {

    const reposContainer = document.getElementById("github-repos-grid");

    if (!reposContainer) {
        console.error("GitHub repositories container not found.");
        return;
    }

    reposContainer.innerHTML = `
        <div class="state-box">

            <i class="fab fa-github fa-spin state-icon"></i>

            <h4>Loading GitHub projects...</h4>

            <p>
                Fetching public repositories from @${GITHUB_USERNAME}
            </p>

        </div>
    `;

    try {

        const repositories = await fetchAllRepositories();

        if (repositories.length === 0) {

            reposContainer.innerHTML = `
                <div class="state-box">

                    <i class="fab fa-github state-icon"></i>

                    <h4>No Public Repositories Found</h4>

                    <p>
                        No public repositories were found.
                    </p>

                </div>
            `;

            return;
        }

        renderRepositories(
            repositories,
            reposContainer
        );

    } catch (error) {

        console.error(
            "GitHub repositories error:",
            error
        );

        reposContainer.innerHTML = `
            <div class="state-box">

                <i class="fas fa-exclamation-triangle state-icon"></i>

                <h4>Unable to Load GitHub Projects</h4>

                <p>
                    ${escapeHtml(error.message)}
                </p>

                <a
                    href="https://github.com/${GITHUB_USERNAME}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    <i class="fab fa-github"></i>
                    View GitHub Profile
                </a>

            </div>
        `;
    }
}


// ================================
// FETCH ALL REPOSITORIES
// ================================

async function fetchAllRepositories() {

    let allRepositories = [];
    let page = 1;

    while (true) {

        const url =
            GITHUB_API +
            "/users/" +
            encodeURIComponent(GITHUB_USERNAME) +
            "/repos?type=owner&sort=updated&direction=desc&per_page=100&page=" +
            page;

        const response = await fetch(
            url,
            {
                cache: "no-store",
                headers: {
                    Accept: "application/vnd.github+json"
                }
            }
        );

        if (!response.ok) {

            if (response.status === 403) {
                throw new Error(
                    "GitHub API rate limit exceeded."
                );
            }

            if (response.status === 404) {
                throw new Error(
                    "GitHub user was not found."
                );
            }

            throw new Error(
                "GitHub API request failed: " +
                response.status
            );
        }

        const repositories = await response.json();

        if (!Array.isArray(repositories)) {
            throw new Error(
                "Invalid response received from GitHub."
            );
        }

        allRepositories =
            allRepositories.concat(repositories);

        if (repositories.length < 100) {
            break;
        }

        page++;

        if (page > 10) {
            break;
        }
    }


    // Public repositories only
    allRepositories = allRepositories.filter(function (repo) {

        return repo.private === false;

    });


    // Remove forks
    allRepositories = allRepositories.filter(function (repo) {

        return repo.fork === false;

    });


    // Latest updated first
    allRepositories.sort(function (a, b) {

        return new Date(b.updated_at) -
               new Date(a.updated_at);

    });


    return allRepositories;
}


// ================================
// RENDER REPOSITORIES
// ================================

function renderRepositories(
    repositories,
    container
) {

    container.innerHTML = repositories.map(
        function (repo) {

            const description =
                repo.description ||
                "GitHub development project by Afham Ahamed.";

            const language =
                repo.language ||
                "Code";

            const topics =
                Array.isArray(repo.topics)
                    ? repo.topics
                    : [];

            return `
                <article class="repo-card">

                    <div class="repo-header">

                        <h3 class="repo-name">

                            <i
                                class="fab fa-github"
                                style="color:var(--accent-cyan); margin-right:6px;"
                            ></i>

                            ${escapeHtml(repo.name)}

                        </h3>

                        <span class="badge">
                            Public
                        </span>

                    </div>


                    <p class="repo-desc">
                        ${escapeHtml(description)}
                    </p>


                    ${
                        topics.length > 0
                        ?
                        `
                        <div class="repo-topics">

                            ${topics
                                .slice(0, 6)
                                .map(function (topic) {

                                    return `
                                        <span class="repo-topic-tag">
                                            #${escapeHtml(topic)}
                                        </span>
                                    `;

                                })
                                .join("")
                            }

                        </div>
                        `
                        :
                        ""
                    }


                    <div class="repo-footer">

                        <div class="repo-stats">

                            <span class="repo-stat-item">
                                ${escapeHtml(language)}
                            </span>

                            <span class="repo-stat-item">
                                <i class="far fa-star"></i>
                                ${repo.stargazers_count || 0}
                            </span>

                            <span class="repo-stat-item">
                                <i class="fas fa-code-branch"></i>
                                ${repo.forks_count || 0}
                            </span>

                        </div>

                        <span>
                            Updated ${formatDate(repo.updated_at)}
                        </span>

                    </div>


                    <div style="margin-top:16px;">

                        <a
                            href="${escapeHtml(repo.html_url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-outline btn-sm"
                            style="width:100%;"
                        >

                            <i class="fab fa-github"></i>

                            View on GitHub

                        </a>

                    </div>

                </article>
            `;

        }
    ).join("");
}


// ================================
// DATE FORMAT
// ================================

function formatDate(dateString) {

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();

    const difference =
        now.getTime() -
        date.getTime();

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );

    if (days <= 0) {
        return "today";
    }

    if (days === 1) {
        return "1 day ago";
    }

    if (days < 30) {
        return days + " days ago";
    }

    const months =
        Math.floor(days / 30);

    if (months < 12) {

        return months === 1
            ? "1 month ago"
            : months + " months ago";
    }

    const years =
        Math.floor(months / 12);

    return years === 1
        ? "1 year ago"
        : years + " years ago";
}


// ================================
// HTML ESCAPE
// ================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ================================
// MANUAL REFRESH FUNCTION
// ================================

window.refreshGitHubProjects = function () {

    loadGitHubRepositories();
    loadGitHubProfile();

};