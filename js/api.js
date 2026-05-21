import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://mqvznnhiniqadngotizq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qKtLi3TmNmdlLI0yrERGvw_mJ8K6zgo';

let supabase;

window.onload = async () => {
    const path = window.location.pathname.toLowerCase();
    const user = checkAuthAndRoles(path);
    if (!user && !path.includes("login.html")) return; 
    if (path.includes("login.html")) return;

    // Ініціалізуємо красиве меню профілю
    initUserMenu();

    await initData(); 
    const data = getClients();

    // Запуск рендерів
    if (typeof window.refreshAll === 'function') window.refreshAll();
    if (document.getElementById("usersTableBody")) renderUsersTable();
    if (path.includes("devices") || document.getElementById("total-clients")) {
        renderAdminTable(data); renderManagementStats();
    }
}

export function getClient() {
    if (!supabase) {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabase;
}

export async function query(table, options = {}) {
    const db = getClient();
    let req = db.from(table).select(options.select ?? '*');
    if (options.filter) req = req.eq(options.filter.column, options.filter.value);
    if (options.order) req = req.order(options.order.column, { ascending: options.order.asc ?? true });
    
    const { data, error } = await req;
    if (error) throw error;
    return data;
}

export async function insert(table, payload) {
    const { data, error } = await getClient().from(table).insert(payload).select();
    if (error) throw error;
    return data;
}

export async function remove(table, id) {
    const { error } = await getClient().from(table).delete().eq('id', id);
    if (error) throw error;
}

export async function update(table, id, payload) {
    const { data, error } = await getClient().from(table).update(payload).eq('id', id).select();
    if (error) throw error;
    return data;
}