import { supabase, getClients } from './api.js';
import { getStatusColor } from './utils.js';

export let state = { currentPage: 1, itemsPerPage: 6, currentFilteredList: [] };

function updateCounters(count) {
    const mainCounter = document.getElementById("client-count");
    const adminCounter = document.getElementById("admin-results-count");
    if (mainCounter) mainCounter.innerText = count;
    if (adminCounter) adminCounter.innerText = count;
}

export function renderMainGrid(list) {
    const grid = document.getElementById("clientsGrid");
    if (!grid) return;
    state.currentFilteredList = list;
    updateCounters(list.length);
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const paginatedItems = list.slice(start, start + state.itemsPerPage);
    grid.innerHTML = paginatedItems.length === 0 ? "<p>Жодного пристрою</p>" : 
    paginatedItems.map(c => `
        <article class="card-item" onclick="showClientDetails('${c.id}')" style="cursor: pointer; border-top: 4px solid ${getStatusColor(c.status)};">
            <h4 class="card-item__title">${c.name}</h4>
            <p class="card-company" style="color: #5c59f2; font-weight: 700;">🏠 Кімната: ${c.company || "Загальна"}</p>
            <p>📊 Стан: <b>${c.email || 'Немає даних'}</b></p>
            <p>🔢 S/N: ${c.phone || '—'}</p>
            <span class="card-itemtag" style="background-color: ${getStatusColor(c.status)}; color: white;">${c.status}</span>
        </article>
    `).join("");
    renderPagination(list.length);
}

export function renderPagination(totalItems) {
    const el = document.getElementById("pagination");
    if (!el) return;
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    el.innerHTML = "";
    if (totalPages <= 1) return;

    const container = document.createElement("div");
    container.className = "pagination-container";

    // Кнопка "Назад"
    const prevBtn = document.createElement("button");
    prevBtn.className = "btn btn--ghost";
    prevBtn.innerText = "« Назад";
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.onclick = () => { if (state.currentPage > 1) { state.currentPage--; renderMainGrid(state.currentFilteredList); } };
    container.appendChild(prevBtn);

    // Сторінки
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = state.currentPage === i ? "btn btn--primary" : "btn btn--ghost";
        btn.innerText = i;
        btn.onclick = () => { state.currentPage = i; renderMainGrid(state.currentFilteredList); };
        container.appendChild(btn);
    }

    // Кнопка "Вперед"
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn--ghost";
    nextBtn.innerText = "Вперед »";
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.onclick = () => { if (state.currentPage < totalPages) { state.currentPage++; renderMainGrid(state.currentFilteredList); } };
    container.appendChild(nextBtn);

    el.appendChild(container);
}

export function renderAdminTable(list) {
    const table = document.getElementById("adminTableBody");
    if (!table) return;
    table.innerHTML = list.map((c) => `
        <tr>
            <td><b>${c.name}</b></td><td>${c.company || "—"}</td>
            <td><span class="card-itemtag" style="background-color: ${getStatusColor(c.status)}; color:white;">${c.status}</span></td>
            <td style="text-align: right;">
                <div class="action-buttons">
                    <button onclick="prepareEdit('${c.id}')" class="btn-action btn-edit">Ред.</button>
                    <button onclick="selectClientForEdit('${c.id}')" class="btn-action btn-edit">✎ Стан</button>
                    <button onclick="deleteClient('${c.id}')" class="btn-action btn-del">Вид.</button>
                </div>
            </td>
        </tr>
    `).join("");
}

export function renderManagementStats() {
    const devices = getClients();
    const total = devices.length;
    const active = devices.filter(c => ['on', 'увімкнено'].includes(c.status?.toLowerCase())).length;
    const off = devices.filter(c => ['off', 'вимкнено'].includes(c.status?.toLowerCase())).length;
    if (document.getElementById("total-clients")) document.getElementById("total-clients").innerText = total;
    if (document.getElementById("vip-clients")) document.getElementById("vip-clients").innerText = active;
    if (document.getElementById("new-leads")) document.getElementById("new-leads").innerText = off;
    const distributionEl = document.getElementById("status-distribution");
    if (distributionEl && total > 0) {
        const statuses = {};
        devices.forEach(c => { statuses[c.status] = (statuses[c.status] || 0) + 1; });
        distributionEl.innerHTML = Object.entries(statuses).map(([name, count]) => {
            const percent = Math.round((count / total) * 100);
            return `<div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Статус <b>${name}</b></span><b>${count} (${percent}%)</b>
                    </div>
                    <div style="background: #edf2f7; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: ${getStatusColor(name)}; width: ${percent}%; height: 100%;"></div>
                    </div></div>`;
        }).join("");
    }
}

export async function renderUsersTable() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;
    const { data: users } = await supabase.from('users').select('*');
    tbody.innerHTML = (!users || users.length === 0) ? "<tr><td colspan='5' style='text-align:center;'>Немає користувачів</td></tr>" : 
    users.map(u => `<tr>
            <td><b>${u.fullName || ''}</b></td><td>${u.username}</td><td>••••••••</td>
            <td><span class="card-itemtag" style="background:#e0e7ff; color:#4338ca;">${u.role}</span></td>
            <td style="text-align: right; padding-right:15px;">
                <button onclick="prepareUserEdit('${u.id}')" class="btn-action btn-edit">Ред.</button>
                <button onclick="deleteUser('${u.id}')" class="btn-action btn-del">Вид.</button>
            </td></tr>`).join("");
}

window.showClientDetails = function(id) {
    const client = getClients().find(c => String(c.id) === String(id));
    if (!client) return;
    let modal = document.getElementById("client-info-modal");
    if (!modal) {
        modal = document.createElement("div"); modal.id = "client-info-modal";
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; justify-content:center; align-items:center; z-index:9999; backdrop-filter:blur(4px);";
        document.body.appendChild(modal);
    } else { modal.style.display = "flex"; }
    const managerName = client.manager || "Автоматичний режим";
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 16px; width: 90%; max-width: 450px; position: relative;">
            <button onclick="document.getElementById('client-info-modal').style.display='none'" style="position: absolute; right: 20px; top: 20px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8;">&times;</button>
            <h2 style="margin: 0 0 10px 0; color: #1e293b;">${client.name}</h2>
            <span class="card-itemtag" style="background-color: ${getStatusColor(client.status)}; color:white; margin-bottom: 20px;">${client.status}</span>
            <div style="display: flex; flex-direction: column; gap: 15px; margin-top:15px;">
                <div><div style="font-size: 0.75rem; font-weight: bold; color: #64748b;">КІМНАТА</div><div style="font-size: 1.1rem; color: #4f46e5; font-weight: 600;">${client.company || "Загальна"}</div></div>
                <div><div style="font-size: 0.75rem; font-weight: bold; color: #64748b;">ПОКАЗНИКИ</div><div style="font-weight:600;">${client.email || 'Немає показників'}</div></div>
                <div><div style="font-size: 0.75rem; font-weight: bold; color: #64748b;">S/N</div><div>${client.phone || '—'}</div></div>
                <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border-left: 3px solid #6366f1;">
                    <div style="font-size: 0.75rem; font-weight: bold; color: #64748b;">КУРАТОР</div><div style="font-size: 0.95rem; color: #1e293b; font-weight: 500;">${managerName}</div>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    <div style="font-size: 0.75rem; font-weight: bold; color: #64748b;">СЦЕНАРІЙ</div><div style="font-size: 0.9rem; color: #334155;">${client.note || "Немає."}</div>
                </div>
            </div>
        </div>
    `;
    modal.onclick = function(event) { if (event.target === modal) modal.style.display = "none"; };
};

export async function selectClientForEdit(id) {
    const client = getClients().find(c => String(c.id) === String(id));
    if (!client) return;
    const editZone = document.getElementById("edit-zone");
    if (editZone) {
        editZone.style.display = "block";
        const { data: users } = await supabase.from('users').select('*');
        let managerOptions = `<option value="">Автоматичний режим</option>`;
        if (users) {
            users.forEach(u => {
                const isSelected = (client.manager === u.fullName) ? 'selected' : '';
                managerOptions += `<option value="${u.fullName}" ${isSelected}>${u.fullName} (${u.role})</option>`;
            });
        }
        editZone.innerHTML = `
            <h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: #4f46e5;">Швидке керування: ${client.name}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div><label style="font-size: 0.7rem; font-weight: bold; color: #64748b;">ЖИВЛЕННЯ</label>
                    <select id="edit-status" class="form-input" style="width: 100%; padding: 5px; font-size:0.8rem;">
                        <option value="off" ${client.status === 'off' ? 'selected' : ''}>Вимкнено (off)</option>
                        <option value="on" ${client.status === 'on' ? 'selected' : ''}>Увімкнено (on)</option>
                        <option value="offline" ${client.status === 'offline' ? 'selected' : ''}>Офлайн (offline)</option>
                    </select>
                </div>
                <div><label style="font-size: 0.7rem; font-weight: bold; color: #64748b;">КУРАТОР</label>
                    <select id="edit-manager" class="form-input" style="width: 100%; padding: 5px; font-size:0.8rem;">${managerOptions}</select>
                </div>
            </div>
            <label style="font-size: 0.7rem; font-weight: bold; color: #64748b;">СЦЕНАРІЙ / ПРИМІТКА</label>
            <textarea id="edit-note" class="form-input" style="width: 100%; height: 50px; font-size:0.8rem;">${client.note || ""}</textarea>
            <button id="save-edit-btn" class="btn-submit" style="width: 100%; margin-top: 10px; padding: 6px;">Зберегти налаштування</button>
        `;
        const saveBtn = document.getElementById("save-edit-btn");
        saveBtn.onclick = async () => {
            saveBtn.innerText = "Оновлення...";
            const updatedData = { status: document.getElementById("edit-status").value, manager: document.getElementById("edit-manager").value, note: document.getElementById("edit-note").value };
            const { error } = await supabase.from('clients').update(updatedData).eq('id', id);
            if (!error) location.reload(); else { alert("Помилка: " + error.message); saveBtn.innerText = "Зберегти"; }
        };
        editZone.scrollIntoView({ behavior: 'smooth' });
    }
}
window.selectClientForEdit = selectClientForEdit;
