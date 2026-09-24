/**
 * ============================================================================
 * ඉම්සද ජ්යෝතිර්විද්යා පර්යේෂණ ආයතනය - දත්ත හා සේවා ස්ථරය (js/api.js)
 * REST API Client Simulation & LocalStorage Mock Data Provider
 * ----------------------------------------------------------------------------
 * NOTE FOR FUTURE BACKEND INTEGRATION:
 * This file is architected to be swapped directly with real Spring Boot REST API
 * endpoints (e.g. fetch('http://localhost:8080/api/...')).
 * ============================================================================
 */

const API_STORAGE_KEYS = {
  CURRENT_USER: 'imsada_current_user',
  USERS: 'imsada_users_db',
  SERVICES: 'imsada_services_db',
  APPOINTMENTS: 'imsada_appointments_db',
  MESSAGES: 'imsada_messages_db',
  NOTIFICATIONS: 'imsada_notifications_db'
};

// Default Services directly extracted from the Astrological Research Institute notes
const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    name: 'කේන්ද්‍ර සටහන සහ සම්පූර්ණ ජීවිත පලාපල පරීක්ෂාව',
    tag: 'මූලික පරීක්ෂාව',
    desc: 'උපන් වේලාව, දිනය සහ ස්ථානය අනුව නිරයන ක්‍රමයට ලග්නය, නවාංශකය සහ දශා අතුරුදශා ගණනය කර ජීවිතයේ ඉදිරි කාලය පිළිබඳ නිරවුල් විග්‍රහය.',
    active: true,
    points: ['ලග්න හා නවාංශක කේන්ද්‍ර විග්‍රහය', 'මහා දශා සහ අතුරු දශා ගණනය', 'අධ්‍යාපනය, සෞඛ්‍යය සහ ආර්ථික ඉදිරි ගමන']
  },
  {
    id: 'srv-2',
    name: 'විවාහ පොරොන්දම් හා සාර්ථක යුග දිවි ගැළපීම',
    tag: 'විවාහ හා යුග දිවිය',
    desc: 'විසි පොරොන්දම පමණක් නොව, දෙදෙනාගේ චිත්ත ස්වභාවය, ආයුෂ, සෞඛ්‍යය, දරුපල සහ ග්‍රහ ගැළපීම පිළිබඳ විද්‍යාත්මක පර්යේෂණාත්මක නිගමන.',
    active: true,
    points: ['විසි පොරොන්දම් පරීක්ෂාව', 'චන්ද්‍ර, කුජ, ශනි පාප දෘෂ්ටි සංසන්දනය', 'යුග දිවියේ සාමකාමී පැවැත්ම තහවුරු කිරීම']
  },
  {
    id: 'srv-3',
    name: 'ව්‍යාපාරික හා වෘත්තීය දියුණුව සඳහා මගපෙන්වීම',
    tag: 'ව්‍යාපාර හා ධනය',
    desc: 'ඔබගේ කේන්ද්‍රයේ 10 වැන්න සහ 11 වැන්න පාදක කරගනිමින්, වඩාත් ලාභදායී ක්ෂේත්‍ර, හවුල් ව්‍යාපාර සහ ආයෝජන අවස්ථා සඳහා කාල නිර්ණය.',
    active: true,
    points: ['වෘත්තීය සාර්ථකත්වයට සුදුසුම ක්ෂේත්‍ර තේරීම', 'නව ව්‍යාපාර ආරම්භයට සුබ කාල වකවානු', 'මූල්‍යමය හා ආයෝජන අවදානම් අවම කරගැනීම']
  },
  {
    id: 'srv-4',
    name: 'වාස්තු විද්‍යා හා භූමි ශක්ති පරීක්ෂාව',
    tag: 'වාස්තු ශාස්ත්‍රය',
    desc: 'නිවාස, කාර්යාල හා ව්‍යාපාරික ගොඩනැගිලි සැලසුම් පරීක්ෂා කර, ධන ශක්තිය හා පවුලේ සාමය රඳවා ගැනීමට අවශ්‍ය වාස්තු දෝෂ නිවැරදි කිරීම්.',
    active: true,
    points: ['දිශානතිය සහ බ්‍රහ්ම පාද සමතුලිතතාව', 'නිවාස සැලසුම් වාස්තු අනුකූලව සැකසීම', 'කැඩීම් බිඳීම් රහිත ප්‍රායෝගික විසඳුම්']
  },
  {
    id: 'srv-5',
    name: 'සුබ මුහුර්ත හා ජයග්‍රාහී නැකත් නිර්මාණය',
    tag: 'සුබ මුහුර්ත',
    desc: 'විවාහ මංගල්‍ය, මුල්ගල් තැබීම, ගෙවදීම, ව්‍යාපාර ආරම්භය සහ දරුවන්ට අකුරු කියවීම ආදී වැදගත් කටයුතු සඳහා ප්‍රබල සුබ මුහුර්ත සකස් කිරීම.',
    active: true,
    points: ['තිථි, වාර, නැකත්, යෝග, කරණ පංචාංග පිරිසිදුකම', 'ලග්න ශුද්ධිය හා හෝරා ශක්තිය පිහිටුවීම', 'සියලු සුබ කටයුතු සඳහා නිරවුල් නැකත් පත්‍ර']
  },
  {
    id: 'srv-6',
    name: 'ග්‍රහ අපල හා නවාංශක ශාන්තිකර්ම නිර්දේශ',
    tag: 'ශාන්තිකර්ම හා මැණික්',
    desc: 'ඒරාෂ්ටක සහ පාප ග්‍රහ අපල සමනය කිරීම පිණිස සම්ප්‍රදායික ආශිර්වාද ක්‍රම, යන්ත්‍ර මන්ත්‍ර සහ ජන්ම කේන්ද්‍රයට ගැළපෙන ඖෂධීය හා මැණික් උපදෙස්.',
    active: true,
    points: ['ශනි, රාහු, කේතු ඒරාෂ්ටක අපල සමනය', 'කේන්ද්‍රයට ගැළපෙන වාසනාවන්ත මැණික් තේරීම', 'ආධ්‍යාත්මික හා ධාර්මික ප්‍රතිකර්ම මගපෙන්වීම']
  }
];

// Seed Mock Data in LocalStorage
function initDatabase() {
  if (!localStorage.getItem(API_STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(API_STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
  }

  if (!localStorage.getItem(API_STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: 'usr-1',
        name: 'කසුන් පෙරේරා',
        email: 'user@imsada.lk',
        phone: '0712345678',
        role: 'ROLE_USER',
        status: 'active',
        joinedDate: '2026-09-10',
        birthDate: '1992-05-14',
        birthTime: '06:45',
        birthPlace: 'කොළඹ'
      },
      {
        id: 'usr-2',
        name: 'නිලන්ති වික්‍රමසිංහ',
        email: 'nilanthi@example.com',
        phone: '0779876543',
        role: 'ROLE_USER',
        status: 'active',
        joinedDate: '2026-09-15',
        birthDate: '1988-11-22',
        birthTime: '14:20',
        birthPlace: 'මහනුවර'
      },
      {
        id: 'adm-1',
        name: 'ප්‍රධාන පර්යේෂක (පරිපාලක)',
        email: 'admin@imsada.lk',
        phone: '0701122334',
        role: 'ROLE_ADMIN',
        status: 'active',
        joinedDate: '2026-01-01'
      }
    ];
    localStorage.setItem(API_STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(API_STORAGE_KEYS.APPOINTMENTS)) {
    const defaultAppointments = [
      {
        id: 'apt-101',
        userId: 'usr-1',
        userName: 'කසුන් පෙරේරා',
        userPhone: '0712345678',
        serviceId: 'srv-1',
        serviceName: 'කේන්ද්‍ර සටහන සහ සම්පූර්ණ ජීවිත පලාපල පරීක්ෂාව',
        date: '2026-09-28',
        time: '10:30',
        notes: 'අනාගත ව්‍යාපාරික කටයුතු පිළිබඳ විමසීමට අවශ්‍යයි.',
        status: 'approved', // pending, approved, active, completed, rejected
        createdAt: '2026-09-20'
      },
      {
        id: 'apt-102',
        userId: 'usr-2',
        userName: 'නිලන්ති වික්‍රමසිංහ',
        userPhone: '0779876543',
        serviceId: 'srv-2',
        serviceName: 'විවාහ පොරොන්දම් හා සාර්ථක යුග දිවි ගැළපීම',
        date: '2026-09-30',
        time: '15:00',
        notes: 'දෙදෙනාගේ කේන්ද්‍ර සටහන් සසඳා බැලීම.',
        status: 'pending',
        createdAt: '2026-09-22'
      },
      {
        id: 'apt-103',
        userId: 'usr-1',
        userName: 'කසුන් පෙරේරා',
        userPhone: '0712345678',
        serviceId: 'srv-5',
        serviceName: 'සුබ මුහුර්ත හා ජයග්‍රාහී නැකත් නිර්මාණය',
        date: '2026-09-18',
        time: '09:00',
        notes: 'නව නිවස සඳහා මුල්ගල් තැබීමේ නැකත.',
        status: 'completed',
        createdAt: '2026-09-12'
      }
    ];
    localStorage.setItem(API_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(defaultAppointments));
  }

  if (!localStorage.getItem(API_STORAGE_KEYS.MESSAGES)) {
    const defaultMessages = [
      {
        id: 'msg-1',
        name: 'සුනිල් ජයවර්ධන',
        email: 'sunil@gmail.com',
        phone: '0771239874',
        message: 'ඔබ ආයතනයෙන් මාර්ගගතව (online) කේන්ද්‍ර පරීක්ෂාව සිදුකළ හැකිද?',
        read: false,
        date: '2026-09-21'
      },
      {
        id: 'msg-2',
        name: 'චාන්දනී සමරනායක',
        email: 'chandani@gmail.com',
        phone: '0714561234',
        message: 'වාස්තු පරීක්ෂාව සඳහා නිවසට පැමිණෙන දිනයක් වෙන්කරවා ගැනීමට අවශ්‍යයි.',
        read: true,
        date: '2026-09-19'
      }
    ];
    localStorage.setItem(API_STORAGE_KEYS.MESSAGES, JSON.stringify(defaultMessages));
  }

  if (!localStorage.getItem(API_STORAGE_KEYS.NOTIFICATIONS)) {
    const defaultNotifications = [
      {
        id: 'notif-1',
        userId: 'usr-1',
        title: 'හමුවීම අනුමත විය',
        message: 'ඔබගේ 2026-09-28 දින කේන්ද්‍ර පරීක්ෂාව සඳහා වූ හමුවීම අනුමත කරන ලදී.',
        date: '2026-09-20',
        read: false
      },
      {
        id: 'notif-2',
        userId: 'usr-1',
        title: 'සේවාව සාර්ථකව අවසන් විය',
        message: 'සුබ මුහුර්ත නැකත් පත්‍රය සකස් කර අවසන් කර ඇත.',
        date: '2026-09-18',
        read: true
      }
    ];
    localStorage.setItem(API_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
  }
}

// Initialize immediately
initDatabase();

/**
 * REST API Client Simulation Object
 */
const api = {
  // Helper to simulate network latency
  _delay: (ms = 120) => new Promise(resolve => setTimeout(resolve, ms)),

  // Auth Operations
  async login(email, password, expectedRole = 'ROLE_USER') {
    await this._delay();
    const users = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('මෙම විද්‍යුත් තැපෑල ලියාපදිංචි කර නොමැත.');
    }

    if (user.status !== 'active') {
      throw new Error('ඔබගේ ගිණුම තාවකාලිකව අක්‍රිය කර ඇත. කරුණාකර ආයතනය අමතන්න.');
    }

    if (expectedRole === 'ROLE_ADMIN' && user.role !== 'ROLE_ADMIN') {
      throw new Error('පරිපාලක අවසර නොමැත.');
    }

    // In prototype demonstration, any valid email matching role logs in
    const sessionUser = { ...user };
    localStorage.setItem(API_STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(userData) {
    await this._delay();
    const users = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.USERS) || '[]');
    const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());

    if (exists) {
      throw new Error('මෙම විද්‍යුත් තැපෑල දැනටමත් ලියාපදිංචි කර ඇත.');
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: 'ROLE_USER',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      birthDate: userData.birthDate || '',
      birthTime: userData.birthTime || '',
      birthPlace: userData.birthPlace || ''
    };

    users.push(newUser);
    localStorage.setItem(API_STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(API_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  getCurrentUser() {
    const raw = localStorage.getItem(API_STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  logout() {
    localStorage.removeItem(API_STORAGE_KEYS.CURRENT_USER);
  },

  // Service Operations
  async getServices() {
    await this._delay();
    return JSON.parse(localStorage.getItem(API_STORAGE_KEYS.SERVICES) || '[]');
  },

  async toggleServiceStatus(id) {
    await this._delay();
    const services = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.SERVICES) || '[]');
    const s = services.find(x => x.id === id);
    if (s) {
      s.active = !s.active;
      localStorage.setItem(API_STORAGE_KEYS.SERVICES, JSON.stringify(services));
    }
    return s;
  },

  // Appointment Operations
  async getAppointments(userId = null) {
    await this._delay();
    const all = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.APPOINTMENTS) || '[]');
    if (userId) {
      return all.filter(a => a.userId === userId);
    }
    return all;
  },

  async createAppointment(appointmentData) {
    await this._delay();
    const all = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.APPOINTMENTS) || '[]');
    const newAppointment = {
      id: 'apt-' + Date.now().toString().slice(-4),
      userId: appointmentData.userId,
      userName: appointmentData.userName,
      userPhone: appointmentData.userPhone,
      serviceId: appointmentData.serviceId,
      serviceName: appointmentData.serviceName,
      date: appointmentData.date,
      time: appointmentData.time,
      notes: appointmentData.notes || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    all.unshift(newAppointment);
    localStorage.setItem(API_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));

    // Create user notification
    this.createNotification({
      userId: appointmentData.userId,
      title: 'නව සේවා ඉල්ලීම ලැබිණි',
      message: `${appointmentData.serviceName} සඳහා ඔබගේ ඉල්ලීම පරීක්ෂාවට යොමු කර ඇත.`
    });

    return newAppointment;
  },

  async updateAppointmentStatus(id, newStatus) {
    await this._delay();
    const all = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.APPOINTMENTS) || '[]');
    const apt = all.find(a => a.id === id);
    if (apt) {
      apt.status = newStatus;
      localStorage.setItem(API_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(all));

      // Push notification to user
      const statusSinhala = {
        'approved': 'අනුමත කරන ලදී',
        'active': 'ක්‍රියාත්මක වෙමින් පවතී',
        'completed': 'සාර්ථකව අවසන් කර ඇත',
        'rejected': 'ප්‍රතික්ෂේප විය'
      }[newStatus] || newStatus;

      this.createNotification({
        userId: apt.userId,
        title: 'හමුවීමේ තත්ත්වය යාවත්කාලීන විය',
        message: `${apt.serviceName} සඳහා වූ හමුවීම ${statusSinhala}.`
      });
    }
    return apt;
  },

  // User Management (Admin)
  async getUsers() {
    await this._delay();
    return JSON.parse(localStorage.getItem(API_STORAGE_KEYS.USERS) || '[]');
  },

  async toggleUserStatus(id) {
    await this._delay();
    const users = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === id);
    if (user && user.role !== 'ROLE_ADMIN') {
      user.status = user.status === 'active' ? 'inactive' : 'active';
      localStorage.setItem(API_STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return user;
  },

  async updateUserProfile(userId, profileData) {
    await this._delay();
    const users = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
      Object.assign(user, profileData);
      localStorage.setItem(API_STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(API_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    return user;
  },

  // Messages (Public Contact Form -> Admin)
  async createMessage(msgData) {
    await this._delay();
    const msgs = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.MESSAGES) || '[]');
    const newMsg = {
      id: 'msg-' + Date.now().toString().slice(-4),
      name: msgData.name,
      email: msgData.email,
      phone: msgData.phone,
      message: msgData.message,
      read: false,
      date: new Date().toISOString().split('T')[0]
    };
    msgs.unshift(newMsg);
    localStorage.setItem(API_STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
    return newMsg;
  },

  async getMessages() {
    await this._delay();
    return JSON.parse(localStorage.getItem(API_STORAGE_KEYS.MESSAGES) || '[]');
  },

  async markMessageRead(id) {
    await this._delay();
    const msgs = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.MESSAGES) || '[]');
    const m = msgs.find(x => x.id === id);
    if (m) {
      m.read = true;
      localStorage.setItem(API_STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
    }
    return m;
  },

  async deleteMessage(id) {
    await this._delay();
    let msgs = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.MESSAGES) || '[]');
    msgs = msgs.filter(x => x.id !== id);
    localStorage.setItem(API_STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
    return true;
  },

  // Notifications
  async getNotifications(userId) {
    await this._delay();
    const all = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.NOTIFICATIONS) || '[]');
    return all.filter(n => n.userId === userId);
  },

  async markAllNotificationsRead(userId) {
    await this._delay();
    const all = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.NOTIFICATIONS) || '[]');
    all.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem(API_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    return true;
  },

  createNotification(notifData) {
    const all = JSON.parse(localStorage.getItem(API_STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const newNotif = {
      id: 'notif-' + Date.now().toString().slice(-4),
      userId: notifData.userId,
      title: notifData.title,
      message: notifData.message,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    all.unshift(newNotif);
    localStorage.setItem(API_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  }
};

// Global UI Toast Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
