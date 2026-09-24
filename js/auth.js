/**
 * ============================================================================
 * ඉම්සද ජ්යෝතිර්විද්යා පර්යේෂණ ආයතනය - පිවිසුම් හා ලියාපදිංචි ස්ක්‍රිප්ටය (js/auth.js)
 * Form Validation, Password Visibility, Session Routing & Auth Handling
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // Password visibility toggle setup
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-wrap').querySelector('input');
      if (input) {
        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');
        btn.innerHTML = isPassword
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      }
    });
  });

  // Validation helpers
  function validateGroup(input, isValid) {
    const group = input.closest('.form-group');
    if (!group) return isValid;
    if (isValid) {
      group.classList.remove('has-error');
    } else {
      group.classList.add('has-error');
    }
    return isValid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function isValidPhone(phone) {
    const clean = phone.replace(/[\s\-]/g, '');
    return /^(?:\+94|0094|0)?7[0-9]{8}$/.test(clean);
  }

  /* --------------------------------------------------------------------------
     1. USER LOGIN FORM
     -------------------------------------------------------------------------- */
  const userLoginForm = document.getElementById('user-login-form');
  if (userLoginForm) {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const alertBox = document.getElementById('auth-alert');

    userLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (alertBox) alertBox.style.display = 'none';

      const emailValid = validateGroup(emailInput, isValidEmail(emailInput.value));
      const passValid = validateGroup(passInput, passInput.value.length >= 4);

      if (emailValid && passValid) {
        try {
          const user = await api.login(emailInput.value.trim(), passInput.value, 'ROLE_USER');
          showToast('පිවිසුම සාර්ථකයි! ඔබව මාරු කෙරෙමින් පවතී...', 'success');
          setTimeout(() => {
            window.location.href = '../user/dashboard.html';
          }, 800);
        } catch (err) {
          if (alertBox) {
            alertBox.className = 'auth-alert error';
            alertBox.textContent = err.message || 'පිවිසීම අසාර්ථක විය. කරුණාකර තොරතුරු පරීක්ෂා කරන්න.';
            alertBox.style.display = 'block';
          }
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. ADMIN LOGIN FORM
     -------------------------------------------------------------------------- */
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    const emailInput = document.getElementById('admin-email');
    const passInput = document.getElementById('admin-password');
    const alertBox = document.getElementById('auth-alert');

    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (alertBox) alertBox.style.display = 'none';

      const emailValid = validateGroup(emailInput, isValidEmail(emailInput.value));
      const passValid = validateGroup(passInput, passInput.value.length >= 4);

      if (emailValid && passValid) {
        try {
          await api.login(emailInput.value.trim(), passInput.value, 'ROLE_ADMIN');
          showToast('පරිපාලක පිවිසුම සාර්ථකයි!', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        } catch (err) {
          if (alertBox) {
            alertBox.className = 'auth-alert error';
            alertBox.textContent = err.message || 'පරිපාලක පිවිසුම අසාර්ථක විය.';
            alertBox.style.display = 'block';
          }
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. USER REGISTRATION FORM
     -------------------------------------------------------------------------- */
  const registerForm = document.getElementById('user-register-form');
  if (registerForm) {
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const passInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm-password');
    const alertBox = document.getElementById('auth-alert');

    // Dynamic password strength bar
    const strengthWrap = document.getElementById('password-strength-wrap');
    const strengthBar = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');

    if (passInput && strengthWrap) {
      passInput.addEventListener('input', () => {
        const val = passInput.value;
        if (val.length === 0) {
          strengthWrap.style.display = 'none';
          return;
        }
        strengthWrap.style.display = 'block';

        let strength = 0;
        if (val.length >= 6) strength += 30;
        if (val.length >= 8) strength += 20;
        if (/[A-Z]/.test(val)) strength += 25;
        if (/[0-9!@#$%^&*]/.test(val)) strength += 25;

        strengthBar.style.width = strength + '%';
        if (strength < 50) {
          strengthBar.style.backgroundColor = '#ef4444';
          strengthText.textContent = 'මුරපදය දුර්වලයි';
          strengthText.style.color = '#fca5a5';
        } else if (strength < 75) {
          strengthBar.style.backgroundColor = '#f59e0b';
          strengthText.textContent = 'මුරපදය මධ්‍යමයි';
          strengthText.style.color = '#fcd34d';
        } else {
          strengthBar.style.backgroundColor = '#10b981';
          strengthText.textContent = 'මුරපදය ශක්තිමත්';
          strengthText.style.color = '#6ee7b7';
        }
      });
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (alertBox) alertBox.style.display = 'none';

      const nameValid = validateGroup(nameInput, nameInput.value.trim().length >= 2);
      const emailValid = validateGroup(emailInput, isValidEmail(emailInput.value));
      const phoneValid = validateGroup(phoneInput, isValidPhone(phoneInput.value));
      const passValid = validateGroup(passInput, passInput.value.length >= 6);
      const confirmValid = validateGroup(confirmInput, confirmInput.value === passInput.value && confirmInput.value !== '');

      if (nameValid && emailValid && phoneValid && passValid && confirmValid) {
        try {
          await api.register({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim()
          });

          showToast('ගිණුම සාර්ථකව සාදන ලදී! ඔබව මාරු කෙරෙමින් පවතී...', 'success');
          setTimeout(() => {
            window.location.href = '../user/dashboard.html';
          }, 1000);
        } catch (err) {
          if (alertBox) {
            alertBox.className = 'auth-alert error';
            alertBox.textContent = err.message || 'ගිණුම සෑදීම අසාර්ථක විය.';
            alertBox.style.display = 'block';
          }
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. FORGOT PASSWORD FORM
     -------------------------------------------------------------------------- */
  const forgotForm = document.getElementById('forgot-password-form');
  if (forgotForm) {
    const emailInput = document.getElementById('forgot-email');
    const alertBox = document.getElementById('auth-alert');

    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailValid = validateGroup(emailInput, isValidEmail(emailInput.value));
      if (emailValid) {
        if (alertBox) {
          alertBox.className = 'auth-alert success';
          alertBox.textContent = 'ඔබගේ විද්‍යුත් තැපෑලට මුරපදය නැවත සකස් කිරීමේ උපදෙස් යොමු කරන ලදී (නිරූපණ පණිවිඩයකි).';
          alertBox.style.display = 'block';
        }
        forgotForm.reset();
      }
    });
  }

});
