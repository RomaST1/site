import { supabase, getClients, initData } from './api.js';
import { renderAdminTable, renderMainGrid, state } from './render.js';

window.deleteClient = async (id) => { 
    if (confirm("Видалити пристрій з системи?")) { 
        const { error } = await supabase.from('clients').delete().eq('id', id); 
        if (error) alert("Помилка: " + error.message); else { await initData(); location.reload(); } 
    } 
};

window.prepareEdit = function(id) {
    const client = getClients().find(item => String(item.id) === String(id));
    if (!client) return;
    document.getElementById("submitBtnTitle").innerText = "Редагувати параметри пристрою";
    document.getElementById("objName").value = client.name;
    document.getElementById("objCompany").value = client.company || "";
    document.getElementById("objEmail").value = client.email || "";
    document.getElementById("objPhone").value = client.phone || "";
    document.getElementById("objStatus").value = client.status;
    document.getElementById("editIndex").value = id; 
    document.getElementById("submitBtn").innerText = "Оновити конфігурацію";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.applyAllFilters = function() {
    state.currentPage = 1;
    const text = (document.getElementById("adminSearchInput")?.value || document.getElementById("searchInput")?.value || "").toLowerCase();
    const status = document.getElementById("adminStatusFilter")?.value || document.getElementById("statusFilter")?.value || "all";
    const filtered = getClients().filter(c => {
        const matchT = c.name.toLowerCase().includes(text) || (c.company && c.company.toLowerCase().includes(text));
        const matchS = (status === "all") || (c.status === status);
        return matchT && matchS;
    });
    renderAdminTable(filtered);
    renderMainGrid(filtered);
}

window.refreshAll = function() {
    const data = getClients();
    renderAdminTable(data);
    renderMainGrid(data);
}

window.deleteUser = async (id) => {
    if (confirm("Видалити користувача?")) {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) alert("Помилка: " + error.message); else { location.reload(); }
    }
};

window.prepareUserEdit = async function(id) {
    const { data: u } = await supabase.from('users').select('*').eq('id', id).single();
    if (!u) return;
    document.getElementById("editUserId").value = u.id;
    document.getElementById("userFullName").value = u.fullName || "";
    document.getElementById("userLogin").value = u.username;
    document.getElementById("userPass").value = u.password;
    document.getElementById("userRole").value = u.role;
    document.getElementById("userSubmitBtn").innerText = "Оновити запис";
    document.getElementById("adminUserForm").scrollIntoView({ behavior: 'smooth' });
};
