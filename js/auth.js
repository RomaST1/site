import { supabase } from './api.js';

export const currentUser = () => JSON.parse(localStorage.getItem("currentUser"));

window.loginUser = async function(username, password) {
    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single();
        if (error || !user) { alert("Невірний логін або пароль!"); return; }
        const userData = { id: user.id, fullName: user.fullName || "Користувач", role: user.role || "user", username: user.username };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = "index.html";
    } catch (e) { alert("Сталася помилка при спробі авторизації."); }
};

export function checkAuthAndRoles(path) {
    const user = currentUser();
    if (!user && !path.includes("login.html")) { window.location.href = "login.html"; return false; }
    if (path.includes("login.html")) return false;
    
    // Блокування доступу за ролями
    if (user) {
        const role = user.role ? user.role.toLowerCase().trim() : 'user';
        if (role === 'user' || role === 'client') {
            if (path.includes("devices.html") || path.includes("users.html")) { window.location.href = "index.html"; return false; }
        } else if (role === 'maneger' || role === 'manager') {
            if (path.includes("users.html")) { window.location.href = "index.html"; return false; }
        }
    }
    return user;
}

// НОВЕ: Логіка виходу
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = "login.html";
};

// НОВЕ: Ініціалізація меню
export function initUserMenu() {
    const user = currentUser();
    if (!user) return;
    
    const btn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    
    if (document.getElementById('user-name-display')) document.getElementById('user-name-display').innerText = user.fullName || user.username;
    if (document.getElementById('dropdown-role')) document.getElementById('dropdown-role').innerText = `Роль: ${user.role}`;

    if (btn && dropdown) {
        btn.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); };
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) dropdown.classList.add('hidden');
        });
    }
}