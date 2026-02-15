
// Authentication Logic
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isLoginPage = window.location.pathname.includes('login.html');
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

    // 1. Mandatory Protection for Admin Pages
    if (!isLoggedIn && !isLoginPage && !isIndexPage) {
        window.location.href = 'login.html';
    }

    // 2. UI Updates for POS Page (index.html)
    if (isIndexPage) {
        const adminLinks = document.querySelectorAll('.admin-only');
        const userControls = document.getElementById('user-controls');

        if (!isLoggedIn) {
            // Hide Admin Links
            adminLinks.forEach(link => link.classList.add('hidden'));

            // Replace User Profile with Login Button
            if (userControls) {
                userControls.innerHTML = `
                    <a href="login.html" class="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                        <i data-lucide="log-in" class="w-4 h-4"></i> Admin Login
                    </a>
                `;
                lucide.createIcons();
            }
        }
    }

    // 3. Logout Handling (for all pages)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('adminUser');
                window.location.href = 'index.html';
            }
        };
    }
});
