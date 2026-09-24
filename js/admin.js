/**
 * ============================================================================
 * ඉම්සද ජ්යෝතිර්විද්යා පර්යේෂණ ආයතනය - පරිපාලක පුවරු ස්ක්‍රිප්ටය (js/admin.js)
 * Admin Portal: Executive Overview, User Management, Appointments & Messages
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  // Session guard: Check if logged in as Admin
  let currentAdmin = api.getCurrentUser();
  if (!currentAdmin || currentAdmin.role !== 'ROLE_ADMIN') {
    // For seamless testing, fallback to mock demo admin
    currentAdmin = {
      id: 'adm-1',
      name: 'ප්‍රධාන පර්යේෂක (පරිපාලක)',
      email: 'admin@imsada.lk',
      phone: '0701122334',
      role: 'ROLE_ADMIN',
      status: 'active'
    };
    localStorage.setItem(API_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentAdmin));
  }

  // Populate admin info in topbar
  const adminNameDisplay = document.getElementById('admin-display-name');
  if (adminNameDisplay) adminNameDisplay.textContent = currentAdmin.name;

  // Logout button
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      api.logout();
      showToast('පරිපාලක ගිණුමෙන් ඉවත් විය.', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
    });
  }

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('dashboard-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Status Badge Helper
  function renderStatusBadge(status) {
    const map = {
      'pending': { text: 'පොරොත්තුවෙන්', class: 'pending' },
      'approved': { text: 'අනුමතයි', class: 'approved' },
      'active': { text: 'ක්‍රියාත්මකයි', class: 'active' },
      'completed': { text: 'සම්පූර්ණයි', class: 'completed' },
      'rejected': { text: 'ප්‍රතික්ෂේපිතයි', class: 'rejected' }
    };
    const s = map[status] || { text: status, class: 'pending' };
    return `<span class="status-pill ${s.class}">● ${s.text}</span>`;
  }

  /* --------------------------------------------------------------------------
     1. ADMIN DASHBOARD OVERVIEW (admin/dashboard.html)
     -------------------------------------------------------------------------- */
  const adminKpiUsers = document.getElementById('admin-kpi-users');
  const adminKpiPending = document.getElementById('admin-kpi-pending');
  const adminKpiToday = document.getElementById('admin-kpi-today');
  const adminKpiCompleted = document.getElementById('admin-kpi-completed');
  const adminRecentAptsTbody = document.getElementById('admin-recent-apts-tbody');

  if (adminKpiUsers || adminRecentAptsTbody) {
    const users = await api.getUsers();
    const appointments = await api.getAppointments();

    if (adminKpiUsers) adminKpiUsers.textContent = users.filter(u => u.role !== 'ROLE_ADMIN').length;
    if (adminKpiPending) adminKpiPending.textContent = appointments.filter(a => a.status === 'pending').length;
    if (adminKpiToday) adminKpiToday.textContent = appointments.filter(a => a.status === 'approved').length;
    if (adminKpiCompleted) adminKpiCompleted.textContent = appointments.filter(a => a.status === 'completed').length;

    if (adminRecentAptsTbody) {
      if (appointments.length === 0) {
        adminRecentAptsTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">හමුවීම් කිසිවක් නැත.</td></tr>`;
      } else {
        adminRecentAptsTbody.innerHTML = appointments.slice(0, 5).map(apt => `
          <tr>
            <td><strong>#${apt.id}</strong></td>
            <td>${apt.userName}<br><small class="text-muted">${apt.userPhone}</small></td>
            <td>${apt.serviceName}</td>
            <td>${apt.date} (${apt.time})</td>
            <td>${renderStatusBadge(apt.status)}</td>
            <td>
              <div class="table-actions">
                ${apt.status === 'pending' ? `
                  <button class="btn btn-sm btn-gold action-approve-btn" data-id="${apt.id}">අනුමත කරන්න</button>
                  <button class="btn btn-sm btn-glass action-reject-btn" data-id="${apt.id}">ප්‍රතික්ෂේප</button>
                ` : `
                  <a href="appointments.html" class="btn btn-outline-gold btn-sm">කළමනාකරණය</a>
                `}
              </div>
            </td>
          </tr>
        `).join('');

        attachAppointmentActionListeners();
      }
    }
  }

  function attachAppointmentActionListeners() {
    document.querySelectorAll('.action-approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await api.updateAppointmentStatus(id, 'approved');
        showToast(`හමුවීම #${id} අනුමත කරන ලදී!`, 'success');
        location.reload();
      });
    });

    document.querySelectorAll('.action-reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await api.updateAppointmentStatus(id, 'rejected');
        showToast(`හමුවීම #${id} ප්‍රතික්ෂේප විය.`, 'info');
        location.reload();
      });
    });

    document.querySelectorAll('.action-complete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await api.updateAppointmentStatus(id, 'completed');
        showToast(`හමුවීම #${id} සම්පූර්ණ කළ ලෙස සටහන් විය!`, 'success');
        location.reload();
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. ADMIN USER MANAGEMENT (admin/users.html)
     -------------------------------------------------------------------------- */
  const usersTbody = document.getElementById('admin-users-tbody');
  const userSearchInput = document.getElementById('admin-user-search');

  async function renderUsersTable(query = '') {
    if (!usersTbody) return;
    const users = await api.getUsers();
    const clientUsers = users.filter(u => u.role !== 'ROLE_ADMIN');
    const filtered = query
      ? clientUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()) || u.phone.includes(query))
      : clientUsers;

    if (filtered.length === 0) {
      usersTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">පරිශීලකයින් කිසිවෙකු හමු නොවීය.</td></tr>`;
      return;
    }

    usersTbody.innerHTML = filtered.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>
          <span class="status-pill ${u.status === 'active' ? 'completed' : 'rejected'}">
            ● ${u.status === 'active' ? 'සක්‍රියයි' : 'අක්‍රියයි'}
          </span>
        </td>
        <td>${u.joinedDate}</td>
        <td>
          <button class="btn btn-outline-gold btn-sm toggle-user-status-btn" data-id="${u.id}">
            ${u.status === 'active' ? 'අක්‍රිය කරන්න' : 'සක්‍රිය කරන්න'}
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.toggle-user-status-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await api.toggleUserStatus(id);
        showToast('පරිශීලක තත්ත්වය සාර්ථකව වෙනස් කරන ලදී.', 'info');
        renderUsersTable(userSearchInput?.value || '');
      });
    });
  }

  if (usersTbody) {
    await renderUsersTable();
    if (userSearchInput) {
      userSearchInput.addEventListener('input', (e) => {
        renderUsersTable(e.target.value);
      });
    }
  }

  /* --------------------------------------------------------------------------
     3. ADMIN APPOINTMENTS MANAGEMENT (admin/appointments.html)
     -------------------------------------------------------------------------- */
  const adminAllAptsTbody = document.getElementById('admin-all-apts-tbody');
  const adminAptFilter = document.getElementById('admin-apt-filter');

  async function renderAdminAppointments(filter = 'all') {
    if (!adminAllAptsTbody) return;
    const list = await api.getAppointments();
    const filtered = filter === 'all' ? list : list.filter(a => a.status === filter);

    if (filtered.length === 0) {
      adminAllAptsTbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">හමුවීම් කිසිවක් නැත.</td></tr>`;
      return;
    }

    adminAllAptsTbody.innerHTML = filtered.map(apt => `
      <tr>
        <td><strong>#${apt.id}</strong></td>
        <td>${apt.userName}<br><small class="text-muted">${apt.userPhone}</small></td>
        <td>${apt.serviceName}</td>
        <td>${apt.date}</td>
        <td>${apt.time}</td>
        <td>${renderStatusBadge(apt.status)}</td>
        <td>
          <div class="table-actions">
            ${apt.status === 'pending' ? `
              <button class="btn btn-sm btn-gold action-approve-btn" data-id="${apt.id}">අනුමත</button>
              <button class="btn btn-sm btn-glass action-reject-btn" data-id="${apt.id}">ප්‍රතික්ෂේප</button>
            ` : apt.status === 'approved' ? `
              <button class="btn btn-sm btn-gold action-complete-btn" data-id="${apt.id}">සම්පූර්ණයි</button>
              <button class="btn btn-sm btn-glass action-reject-btn" data-id="${apt.id}">අවලංගු</button>
            ` : `
              <span class="text-muted" style="font-size: 0.85rem;">අවසන්</span>
            `}
          </div>
        </td>
      </tr>
    `).join('');

    attachAppointmentActionListeners();
  }

  if (adminAllAptsTbody) {
    await renderAdminAppointments();
    if (adminAptFilter) {
      adminAptFilter.addEventListener('change', (e) => {
        renderAdminAppointments(e.target.value);
      });
    }
  }

  /* --------------------------------------------------------------------------
     4. ADMIN SERVICE MANAGEMENT (admin/services.html)
     -------------------------------------------------------------------------- */
  const adminServicesTbody = document.getElementById('admin-services-tbody');

  async function renderAdminServices() {
    if (!adminServicesTbody) return;
    const services = await api.getServices();

    adminServicesTbody.innerHTML = services.map(s => `
      <tr>
        <td><strong>${s.name}</strong><br><small class="text-muted">${s.tag}</small></td>
        <td style="max-width: 320px; font-size: 0.88rem;">${s.desc}</td>
        <td>
          <span class="status-pill ${s.active ? 'completed' : 'rejected'}">
            ● ${s.active ? 'සක්‍රියයි' : 'අක්‍රියයි'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline-gold btn-sm toggle-service-btn" data-id="${s.id}">
            ${s.active ? 'අක්‍රිය කරන්න' : 'සක්‍රිය කරන්න'}
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.toggle-service-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await api.toggleServiceStatus(id);
        showToast('සේවා තත්ත්වය සාර්ථකව යාවත්කාලීන විය.', 'info');
        renderAdminServices();
      });
    });
  }

  if (adminServicesTbody) {
    await renderAdminServices();
  }

  /* --------------------------------------------------------------------------
     5. ADMIN MESSAGE MANAGEMENT (admin/messages.html)
     -------------------------------------------------------------------------- */
  const messagesTbody = document.getElementById('admin-messages-tbody');

  async function renderAdminMessages() {
    if (!messagesTbody) return;
    const messages = await api.getMessages();

    if (messages.length === 0) {
      messagesTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">පණිවිඩ කිසිවක් ලැබී නැත.</td></tr>`;
      return;
    }

    messagesTbody.innerHTML = messages.map(m => `
      <tr style="${!m.read ? 'background: rgba(212, 175, 55, 0.05);' : ''}">
        <td><strong>${m.name}</strong></td>
        <td>${m.email}<br><small class="text-muted">${m.phone}</small></td>
        <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${m.message}</td>
        <td>${m.date}</td>
        <td>
          <span class="status-pill ${m.read ? 'completed' : 'pending'}">
            ● ${m.read ? 'කියවා ඇත' : 'අලුත්'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline-gold btn-sm view-msg-btn" data-id="${m.id}">කියවන්න</button>
            <button class="btn btn-sm btn-icon danger delete-msg-btn" data-id="${m.id}" title="මකන්න">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.view-msg-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const msgs = await api.getMessages();
        const msg = msgs.find(x => x.id === id);
        if (msg) {
          await api.markMessageRead(id);
          openMessageModal(msg);
          renderAdminMessages();
        }
      });
    });

    document.querySelectorAll('.delete-msg-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('මෙම පණිවිඩය මැකීමට ඔබට විශ්වාසද?')) {
          await api.deleteMessage(id);
          showToast('පණිවිඩය සාර්ථකව මකන ලදී.', 'info');
          renderAdminMessages();
        }
      });
    });
  }

  function openMessageModal(msg) {
    const modal = document.getElementById('message-detail-modal');
    if (!modal) return;
    document.getElementById('modal-msg-name').textContent = msg.name;
    document.getElementById('modal-msg-contact').textContent = `${msg.email} | ${msg.phone}`;
    document.getElementById('modal-msg-date').textContent = msg.date;
    document.getElementById('modal-msg-body').textContent = msg.message;
    modal.classList.add('active');
  }

  if (messagesTbody) {
    await renderAdminMessages();
  }

  // Common modal close triggers
  document.querySelectorAll('.modal-close-trigger').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    });
  });

});
