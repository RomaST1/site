import { supabase, initData, getClients } from './api.js';
import { checkAuthAndRoles } from './auth.js';
import { renderAdminTable, renderMainGrid, renderManagementStats, renderUsersTable } from './render.js';
import './actions.js'; 

window.onload = async () => {
    
    // === Відправка повідомлень зі сторінки Контактів ===
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = "Відправлення..."; 
            btn.disabled = true;

            const payload = {
                name: document.getElementById("contact-name").value,
                subject: document.getElementById("contact-subject").value,
                message: document.getElementById("contact-message").value,
                status: 'new' // 'new' - нове, 'read' - прочитане
            };

            try {
                // Імпортуємо функції безпосередньо тут, щоб не ламати інші сторінки
                const { insert } = await import('./api.js');
                const { showToast } = await import('./utils.js');
                
                await insert('messages', payload);
                showToast("Ваш запит успішно збережено в системі!", "success");
                contactForm.reset();
            } catch (err) {
                alert("Помилка відправки: " + err.message);
            } finally {
                btn.innerText = originalText; 
                btn.disabled = false;
            }
        };
    }
    const path = window.location.pathname.toLowerCase();
    const user = checkAuthAndRoles(path);
    if (!user && !path.includes("login.html")) return; 
    if (path.includes("login.html")) return;

    await initData(); 
    const data = getClients();

    if (document.getElementById("auth-status") && user) {
        document.getElementById("auth-status").innerHTML = `🥷 <span>${user.fullName} (${user.role})</span> 
        <button onclick="localStorage.removeItem('currentUser'); location.reload();" class="btn-top-auth" style="padding: 4px 10px; font-size: 11px; margin-left:10px;">Вийти</button>`;
    }

    if (typeof window.refreshAll === 'function') window.refreshAll();

    if (document.getElementById("usersTableBody")) renderUsersTable();

    if (path.includes("devices") || document.getElementById("total-clients")) {
        renderAdminTable(data); renderManagementStats();
    }

    const userForm = document.getElementById("adminUserForm");
    if (userForm) {
        userForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById("editUserId").value;
            const userData = { fullName: document.getElementById("userFullName").value, username: document.getElementById("userLogin").value, password: document.getElementById("userPass").value, role: document.getElementById("userRole").value };
            let res;
            if (!id || id === "") res = await supabase.from('users').insert([userData]);
            else res = await supabase.from('users').update(userData).eq('id', id);
            if (res.error) alert("Помилка: " + res.error.message); else location.reload();
        };
    }

    const crudForm = document.getElementById("adminCrudForm");
    if (crudForm) {
        crudForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById("editIndex").value;
            const deviceData = { name: document.getElementById("objName").value, company: document.getElementById("objCompany").value, email: document.getElementById("objEmail").value, phone: document.getElementById("objPhone").value, status: document.getElementById("objStatus").value };
            let res;
            if (!id || id === "") res = await supabase.from('clients').insert([deviceData]);
            else res = await supabase.from('clients').update(deviceData).eq('id', id);
            if (res.error) alert("Помилка: " + res.error.message); else { await initData(); location.reload(); }
        };
    }

    ["adminSearchInput", "searchInput", "adminStatusFilter", "statusFilter"].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.oninput = window.applyAllFilters; el.onchange = window.applyAllFilters; }
    });
};
