/**
 * ============================================================================
 * ඉම්සද ජ්යෝතිර්විද්යා පර්යේෂණ ආයතනය - පරිශීලක පුවරු ස්ක්‍රිප්ටය (js/user.js)
 * User Portal: Session Guard, Appointments, Service Booking, Profile & Notifications
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {

  // Session guard: Check if user is logged in
  let currentUser = api.getCurrentUser();
  if (!currentUser || currentUser.role !== 'ROLE_USER') {
    // For seamless testing, fallback to mock demo user
    currentUser = {
      id: 'usr-1',
      name: 'කසුන් පෙරේරා',
      email: 'user@imsada.lk',
      phone: '0712345678',
      role: 'ROLE_USER',
      status: 'active',
      birthDate: '1992-05-14',
      birthTime: '06:45',
      birthPlace: 'කොළඹ'
    };
    localStorage.setItem(API_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }

  // Populate user profile info in topbar
  const userNameDisplay = document.getElementById('user-display-name');
  const userAvatarInitial = document.getElementById('user-avatar-initial');
  if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
  if (userAvatarInitial) userAvatarInitial.textContent = currentUser.name.charAt(0);

  // Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      api.logout();
      showToast('ගිණුමෙන් ඉවත් විය.', 'info');
      setTimeout(() => {
        window.location.href = '../auth/login.html';
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
    // Close sidebar on click outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Helper: Status to Sinhala tag
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
     1. USER DASHBOARD OVERVIEW (dashboard.html)
     -------------------------------------------------------------------------- */
  const greetingEl = document.getElementById('dashboard-greeting-name');
  if (greetingEl) greetingEl.textContent = currentUser.name;

  const kpiRequestsCount = document.getElementById('kpi-requests-count');
  const kpiAppointmentsCount = document.getElementById('kpi-appointments-count');
  const kpiNotificationsCount = document.getElementById('kpi-notifications-count');
  const recentTableBody = document.getElementById('recent-appointments-tbody');

  if (kpiRequestsCount || recentTableBody) {
    const appointments = await api.getAppointments(currentUser.id);
    const notifications = await api.getNotifications(currentUser.id);

    if (kpiRequestsCount) kpiRequestsCount.textContent = appointments.length;
    if (kpiAppointmentsCount) {
      const activeApts = appointments.filter(a => a.status === 'approved' || a.status === 'pending');
      kpiAppointmentsCount.textContent = activeApts.length;
    }
    if (kpiNotificationsCount) {
      const unreadNotifs = notifications.filter(n => !n.read);
      kpiNotificationsCount.textContent = unreadNotifs.length;
    }

    if (recentTableBody) {
      if (appointments.length === 0) {
        recentTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">තවමත් කිසිදු සේවා ඉල්ලීමක් සිදු කර නොමැත.</td></tr>`;
      } else {
        recentTableBody.innerHTML = appointments.slice(0, 5).map(apt => `
          <tr>
            <td><strong>#${apt.id}</strong></td>
            <td>${apt.serviceName}</td>
            <td>${apt.date} (${apt.time})</td>
            <td>${renderStatusBadge(apt.status)}</td>
            <td>
              <a href="appointments.html" class="btn btn-outline-gold btn-sm">විස්තර</a>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  /* --------------------------------------------------------------------------
     2. USER SERVICES & REQUEST FORM (services.html)
     -------------------------------------------------------------------------- */
  const serviceSelect = document.getElementById('booking-service-select');
  const serviceBookingForm = document.getElementById('service-booking-form');
  const bookingHistoryTbody = document.getElementById('booking-history-tbody');

  async function loadBookingPage() {
    const services = await api.getServices();
    if (serviceSelect) {
      serviceSelect.innerHTML = `<option value="">සේවාව තෝරන්න...</option>` +
        services.filter(s => s.active).map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join('');
    }

    if (bookingHistoryTbody) {
      const userAppointments = await api.getAppointments(currentUser.id);
      if (userAppointments.length === 0) {
        bookingHistoryTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">ඔබගේ සේවා ඉල්ලීම් කිසිවක් නැත.</td></tr>`;
      } else {
        bookingHistoryTbody.innerHTML = userAppointments.map(apt => `
          <tr>
            <td><strong>#${apt.id}</strong></td>
            <td>${apt.serviceName}</td>
            <td>${apt.date} - ${apt.time}</td>
            <td>${renderStatusBadge(apt.status)}</td>
            <td>${apt.createdAt}</td>
          </tr>
        `).join('');
      }
    }
  }

  if (serviceBookingForm) {
    await loadBookingPage();

    serviceBookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
      const serviceId = serviceSelect.value;
      const serviceName = selectedOption.getAttribute('data-name');
      const date = document.getElementById('booking-date').value;
      const time = document.getElementById('booking-time').value;
      const notes = document.getElementById('booking-notes').value;

      if (!serviceId || !date || !time) {
        showToast('කරුණාකර සියලුම අවශ්‍ය තොරතුරු පුරවන්න.', 'error');
        return;
      }

      await api.createAppointment({
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        serviceId: serviceId,
        serviceName: serviceName,
        date: date,
        time: time,
        notes: notes
      });

      showToast('සේවා ඉල්ලීම සාර්ථකව යොමු කරන ලදී!', 'success');
      serviceBookingForm.reset();
      await loadBookingPage();
    });
  }

  /* --------------------------------------------------------------------------
     3. USER APPOINTMENTS LIST (appointments.html)
     -------------------------------------------------------------------------- */
  const appointmentsTbody = document.getElementById('all-appointments-tbody');
  const appointmentFilter = document.getElementById('appointment-status-filter');

  async function renderAppointmentsTable(filter = 'all') {
    if (!appointmentsTbody) return;
    const list = await api.getAppointments(currentUser.id);
    const filtered = filter === 'all' ? list : list.filter(a => a.status === filter);

    if (filtered.length === 0) {
      appointmentsTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">හමුවීම් කිසිවක් හමු නොවීය.</td></tr>`;
      return;
    }

    appointmentsTbody.innerHTML = filtered.map(apt => `
      <tr>
        <td><strong>#${apt.id}</strong></td>
        <td>${apt.serviceName}</td>
        <td>${apt.date}</td>
        <td>${apt.time}</td>
        <td>${renderStatusBadge(apt.status)}</td>
        <td>
          <button class="btn btn-outline-gold btn-sm view-apt-btn" data-id="${apt.id}">විස්තර බලන්න</button>
        </td>
      </tr>
    `).join('');

    // Modal view listener
    document.querySelectorAll('.view-apt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const apt = list.find(x => x.id === id);
        if (apt) {
          openAppointmentModal(apt);
        }
      });
    });
  }

  if (appointmentsTbody) {
    await renderAppointmentsTable();
    if (appointmentFilter) {
      appointmentFilter.addEventListener('change', (e) => {
        renderAppointmentsTable(e.target.value);
      });
    }
  }

  function openAppointmentModal(apt) {
    const modal = document.getElementById('appointment-modal');
    if (!modal) return;
    document.getElementById('modal-apt-id').textContent = apt.id;
    document.getElementById('modal-apt-service').textContent = apt.serviceName;
    document.getElementById('modal-apt-datetime').textContent = `${apt.date} (${apt.time})`;
    document.getElementById('modal-apt-status').innerHTML = renderStatusBadge(apt.status);
    document.getElementById('modal-apt-notes').textContent = apt.notes || 'අමතර සටහන් නැත.';
    modal.classList.add('active');
  }

  // Modal close handlers
  document.querySelectorAll('.modal-close-trigger').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    });
  });

  /* --------------------------------------------------------------------------
     4. USER PROFILE (profile.html)
     -------------------------------------------------------------------------- */
  const profileForm = document.getElementById('user-profile-form');
  if (profileForm) {
    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-birthdate').value = currentUser.birthDate || '';
    document.getElementById('profile-birthtime').value = currentUser.birthTime || '';
    document.getElementById('profile-birthplace').value = currentUser.birthPlace || '';

    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = await api.updateUserProfile(currentUser.id, {
        name: document.getElementById('profile-name').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        birthDate: document.getElementById('profile-birthdate').value,
        birthTime: document.getElementById('profile-birthtime').value,
        birthPlace: document.getElementById('profile-birthplace').value.trim()
      });

      currentUser = updated;
      if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
      showToast('පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!', 'success');
    });
  }

  /* --------------------------------------------------------------------------
     5. NOTIFICATIONS (notifications.html)
     -------------------------------------------------------------------------- */
  const notifListContainer = document.getElementById('notifications-list');
  const markAllReadBtn = document.getElementById('btn-mark-all-read');

  async function renderNotifications() {
    if (!notifListContainer) return;
    const notifications = await api.getNotifications(currentUser.id);

    if (notifications.length === 0) {
      notifListContainer.innerHTML = `<div class="empty-state"><p>දැනුම්දීම් කිසිවක් නැත.</p></div>`;
      return;
    }

    notifListContainer.innerHTML = notifications.map(n => `
      <div class="glass-card panel-card" style="border-left: 4px solid ${n.read ? 'var(--border-subtle)' : 'var(--gold-400)'}; margin-bottom: 14px; padding: 18px 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <h4 style="font-size: 1.05rem; color: ${n.read ? 'var(--text-secondary)' : 'var(--gold-300)'};">${n.title}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${n.date}</span>
        </div>
        <p style="font-size: 0.94rem; color: var(--text-secondary); margin: 0;">${n.message}</p>
      </div>
    `).join('');
  }

  if (notifListContainer) {
    await renderNotifications();
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', async () => {
        await api.markAllNotificationsRead(currentUser.id);
        await renderNotifications();
        showToast('සියලුම දැනුම්දීම් කියවූ ලෙස සලකුණු කරන ලදී.', 'info');
      });
    }
  }

});
