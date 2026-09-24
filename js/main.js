/**
 * ============================================================================
 * ඉම්සද ජ්යෝතිර්විද්යා පර්යේෂණ ආයතනය - ප්‍රධාන මහජන වෙබ් අඩවි ස්ක්‍රිප්ටය (js/main.js)
 * Clean Vanilla JavaScript: Canvas Particles, Mobile Drawer, Zodiac Wheel, Contact
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. STARRY CANVAS & CONSTELLATION PARTICLES
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('star-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const stars = [];

    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.baseAlpha = Math.random() * 0.7 + 0.3;
        this.alpha = this.baseAlpha;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.color = Math.random() > 0.4 ? '#f5e197' : '#ffffff';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        this.alpha += this.twinkleSpeed;
        if (this.alpha > 1 || this.alpha < 0.2) this.twinkleSpeed = -this.twinkleSpeed;
      }
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) stars.push(new Star());

    function drawConstellations() {
      const maxDistance = 110;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDistance) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = '#d4af37';
            ctx.globalAlpha = (1 - dist / maxDistance) * 0.15;
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
      }
      drawConstellations();
      requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     2. STICKY NAVBAR & SCROLL SPY
     -------------------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleScroll() {
    const scrollY = window.scrollY;
    if (header) {
      if (scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }

    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      if (scrollY > 400) backToTopBtn.classList.add('visible');
      else backToTopBtn.classList.remove('visible');
    }

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}` || link.getAttribute('href')?.endsWith(`#${sectionId}`)) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* --------------------------------------------------------------------------
     3. MOBILE DRAWER NAVIGATION
     -------------------------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const drawerClose = document.getElementById('drawer-close');

  function openMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('active');
    if (menuToggle) menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', () => {
    mobileDrawer.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });

  if (drawerClose) drawerClose.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* --------------------------------------------------------------------------
     4. BACK TO TOP
     -------------------------------------------------------------------------- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     5. SCROLL REVEALS
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(() => entry.target.classList.add('revealed'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  /* --------------------------------------------------------------------------
     6. SPECIAL 12 ZODIAC WHEEL INTERACTIVITY
     -------------------------------------------------------------------------- */
  const zodiacData = [
    {
      name: 'මේෂ රාශිය',
      glyph: '♈',
      element: 'තේජෝ (ගිනි) භූතය',
      ruler: 'කුජ (අඟහරු)',
      nature: 'චර රාශිය',
      direction: 'නැගෙනහිර',
      color: 'රතු සහ තද රෝස',
      desc: 'නායකත්ව ගුණාංග, එඩිතර බව සහ ක්‍රියාශීලී උත්සාහවන්ත බව මේෂ ලග්න හිමියන්ගේ ප්‍රමුඛ ලක්ෂණයයි. ඕනෑම අභියෝගයකට මුහුණදීමේ ආත්ම ශක්තිය ඇති අතර, පර්යේෂණාත්මකව කේන්ද්‍රය පරික්ෂා කිරීමේදී කුජ ග්‍රහයාගේ පිහිටීම අනුව ඉහළ වෘත්තීය සාර්ථකත්වයක් අත්පත් කරගත හැක.'
    },
    {
      name: 'වෘෂභ රාශිය',
      glyph: '♉',
      element: 'පඨවි (පොළොව) භූතය',
      ruler: 'සිකුරු',
      nature: 'තිර රාශිය',
      direction: 'දකුණ',
      color: 'සුදු සහ ලා නිල්',
      desc: 'ඉවසීම, ස්ථිරසාර බව, කලාකාමී අදහස් සහ මූල්‍යමය බුද්ධිය වෘෂභ රාශි හිමියන් තුළින් ප්‍රකට වේ. ආරක්ෂාකාරී හා ස්ථාවර ආයෝජන මෙන්ම ව්‍යාපාරික ජයග්‍රහණ සඳහා සිකුරුගේ බලපෑම ඉතා තීරණාත්මක සාධකයකි.'
    },
    {
      name: 'මිථුන රාශිය',
      glyph: '♊',
      element: 'වායෝ (සුළඟ) භූතය',
      ruler: 'බුධ',
      nature: 'උභය රාශිය',
      direction: 'බස්නාහිර',
      color: 'කොළ සහ කහ',
      desc: 'තීක්ෂ්ණ බුද්ධිය, සන්නිවේදන දක්ෂතාව, ඉක්මන් තීරණ ගැනීමේ හැකියාව සහ බහුශ්‍රැත බව මිථුන ලග්න හිමියන්ට හිමි ස්වභාවික දායාදයකි. අධ්‍යාපනය, ලේඛනය සහ මාධ්‍ය ආශ්‍රිත ක්ෂේත්‍රවල ජයග්‍රහණ පෙන්වයි.'
    },
    {
      name: 'කටක රාශිය',
      glyph: '♋',
      element: 'ආපෝ (ජලය) භූතය',
      ruler: 'සඳු (චන්ද්‍රයා)',
      nature: 'චර රාශිය',
      direction: 'උතුර',
      color: 'මුතු සුදු සහ රිදී',
      desc: 'උසස් මානසික සංවේදී බව, කරුණාවන්ත ගතිය සහ පවුලේ සතුට අගය කිරීම කටක රාශියේ විශේෂ ලක්ෂණයකි. සඳුගේ ගමන් මග අනුව මානසික ඒකාග්‍රතාවය හා ධන යෝග උදාවන අයුරු නිරවුල්ව හඳුනාගත හැක.'
    },
    {
      name: 'සිංහ රාශිය',
      glyph: '♌',
      element: 'තේජෝ (ගිනි) භූතය',
      ruler: 'රවි (සූර්යයා)',
      nature: 'තිර රාශිය',
      direction: 'නැගෙනහිර',
      color: 'රන්වන් සහ තැඹිලි',
      desc: 'රාජකීය ගාම්භීරත්වය, ආත්ම අභිමානය සහ ස්වාධීන චින්තනය සිංහ රාශි හිමියන් තුළින් විදහා දැක්වේ. සමාජයේ කැපී පෙනෙන ප්‍රභූ තනතුරු, ව්‍යවසායකත්වය සහ පරිපාලන නායකත්වය හිමිවේ.'
    },
    {
      name: 'කන්‍යා රාශිය',
      glyph: '♍',
      element: 'පඨවි (පොළොව) භූතය',
      ruler: 'බුධ',
      nature: 'උභය රාශිය',
      direction: 'දකුණ',
      color: 'තද කොළ සහ අළු',
      desc: 'විශ්ලේෂණාත්මක සිතුවිලි, සූක්ෂ්ම විමර්ශන හැකියාව සහ විනයගරුක පැවැත්ම ප්‍රකට කරයි. පර්යේෂණ, ගණකාධිකරණ, තාක්ෂණික හා වෛද්‍ය ක්ෂේත්‍ර සඳහා කන්‍යා ලග්න හිමියන් අතිශය දක්ෂය.'
    },
    {
      name: 'තුලා රාශිය',
      glyph: '♎',
      element: 'වායෝ (සුළඟ) භූතය',
      ruler: 'සිකුරු',
      nature: 'චර රාශිය',
      direction: 'බස්නාහිර',
      color: 'දීප්තිමත් සුදු සහ ලා නිල්',
      desc: 'සාධාරණත්වය, සමබරතාවය, සමාජශීලී බව සහ යුක්තිගරුක ස්වභාවය තුලා ලග්න හිමියන්ගේ විශේෂත්වයයි. නීතිය, රාජ්‍යතාන්ත්‍රික සබඳතා හා සාමකාමී යුග දිවියකට සිකුරුගේ ආශිර්වාදය හිමිවේ.'
    },
    {
      name: 'වෘශ්චික රාශිය',
      glyph: '♏',
      element: 'ආපෝ (ජලය) භූතය',
      ruler: 'කුජ (අඟහරු)',
      nature: 'තිර රාශිය',
      direction: 'උතුර',
      color: 'තද රතු සහ තඹ',
      desc: 'අප්‍රතිහත ධෛර්යය, ගුප්ත ශාස්ත්‍ර කෙරෙහි ලැදියාව සහ දැඩි චිත්ත ශක්තිය ප්‍රකට කරයි. කිසිවෙකුට පහසුවෙන් නොසැලෙන අධිෂ්ඨානයක් ඇති අතර, අභිරහස් හා සංකීර්ණ ගැටලු විසඳීමේ අසමසම හැකියාවක් ඇත.'
    },
    {
      name: 'ධනු රාශිය',
      glyph: '♐',
      element: 'තේජෝ (ගිනි) භූතය',
      ruler: 'ගුරු (බ්‍රහස්පති)',
      nature: 'උභය රාශිය',
      direction: 'නැගෙනහිර',
      color: 'කහ සහ රන්වන්',
      desc: 'ධාර්මික බව, දාර්ශනික චින්තනය, උසස් අධ්‍යාපනය හා සත්‍යගරුක බවින් පරිපූර්ණ වේ. ගුරුගේ මනා පිහිටීම තුළින් ගුරු තනතුරු, ජාත්‍යන්තර ගමන් සහ උසස් සමාජ ගෞරව සම්මාන හිමිවේ.'
    },
    {
      name: 'මකර රාශිය',
      glyph: '♑',
      element: 'පඨවි (පොළොව) භූතය',
      ruler: 'ශනි (සෙනසුරු)',
      nature: 'චර රාශිය',
      direction: 'දකුණ',
      color: 'තද නිල් සහ කළු',
      desc: 'දැඩි කැපවීම, ප්‍රායෝගික ඥානය, ඉවසීම සහ දීර්ඝකාලීන සැලසුම් සහගතභාවය ප්‍රමුඛ වේ. වෙහෙස මහන්සි වී ක්‍රමානුකූලව වැඩ කිරීමෙන් ව්‍යාපාර හා දේපළ ක්ෂේත්‍රවල උසස් ජයග්‍රහණ අත්පත් කරගනී.'
    },
    {
      name: 'කුම්භ රාශිය',
      glyph: '♒',
      element: 'වායෝ (සුළඟ) භූතය',
      ruler: 'ශනි (සෙනසුරු)',
      nature: 'තිර රාශිය',
      direction: 'බස්නාහිර',
      color: 'අහස් නිල් සහ දම්',
      desc: 'මානව හිතවාදී බව, නව්‍ය නිමැවුම් කෙරෙහි ලැදියාව සහ විද්‍යාත්මක ප්‍රවේශය සහිත වේ. සම්ප්‍රදායික රාමුවෙන් ඔබ්බට සිතා සමාජ ප්‍රගතිය සහ තාක්ෂණික ක්ෂේත්‍රයන්හි පෙරගමන්කරුවෝ වෙති.'
    },
    {
      name: 'මීන රාශිය',
      glyph: '♓',
      element: 'ආපෝ (ජලය) භූතය',
      ruler: 'ගුරු (බ්‍රහස්පති)',
      nature: 'උභය රාශිය',
      direction: 'උතුර',
      color: 'කහ සහ මුහුදු නිල්',
      desc: 'ආධ්‍යාත්මික සුවය, පරහිතකාමී බව, මෘදු ගතිපැවතුම් සහ ඉහළ පරිකල්පන ශක්තියක් හිමිවේ. කලාව, සාහිත්‍යය සහ ආධ්‍යාත්මික ජීවිතයේ උසස් තලයකට ළඟාවීමේ භාග්‍යය පවතී.'
    }
  ];

  const zodiacButtons = document.querySelectorAll('.zodiac-btn');
  const zIcon = document.getElementById('zodiac-icon');
  const zTitle = document.getElementById('zodiac-title');
  const zElement = document.getElementById('zodiac-element');
  const zRuler = document.getElementById('zodiac-ruler');
  const zNature = document.getElementById('zodiac-nature');
  const zDirection = document.getElementById('zodiac-direction');
  const zColor = document.getElementById('zodiac-color');
  const zDesc = document.getElementById('zodiac-description');
  const zDetailBox = document.getElementById('zodiac-detail-box');

  if (zodiacButtons.length > 0 && zDetailBox) {
    zodiacButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-zodiac'), 10);
        const data = zodiacData[index];
        if (!data) return;

        zodiacButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        zDetailBox.style.opacity = '0.4';
        zDetailBox.style.transform = 'translateY(6px)';

        setTimeout(() => {
          if (zIcon) zIcon.textContent = data.glyph;
          if (zTitle) zTitle.textContent = data.name;
          if (zElement) zElement.textContent = data.element;
          if (zRuler) zRuler.textContent = data.ruler;
          if (zNature) zNature.textContent = data.nature;
          if (zDirection) zDirection.textContent = data.direction;
          if (zColor) zColor.textContent = data.color;
          if (zDesc) zDesc.textContent = data.desc;

          zDetailBox.style.opacity = '1';
          zDetailBox.style.transform = 'translateY(0)';
        }, 150);
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. CONTACT FORM SUBMISSION TO REST API SIMULATION
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const successBanner = document.getElementById('form-success-banner');

  if (contactForm) {
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');
    const emailInput = document.getElementById('user-email');
    const messageInput = document.getElementById('user-message');

    function validateField(input, condition) {
      const parentGroup = input.closest('.form-group');
      if (!parentGroup) return false;
      if (!condition) {
        parentGroup.classList.add('has-error');
        return false;
      } else {
        parentGroup.classList.remove('has-error');
        return true;
      }
    }

    function isValidPhone(phone) {
      const cleanPhone = phone.replace(/[\s\-]/g, '');
      return /^(?:\+94|0094|0)?7[0-9]{8}$/.test(cleanPhone);
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 2);
      const isPhoneValid = validateField(phoneInput, isValidPhone(phoneInput.value));
      const isEmailValid = validateField(emailInput, isValidEmail(emailInput.value));
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 6);

      if (isNameValid && isPhoneValid && isEmailValid && isMessageValid) {
        // Save to REST API / Mock database so admin can view it
        if (typeof api !== 'undefined' && api.createMessage) {
          await api.createMessage({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            message: messageInput.value.trim()
          });
        }

        if (successBanner) {
          successBanner.style.display = 'flex';
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        showToast('ඔබගේ පණිවිඩය සාර්ථකව යොමු කරන ලදී.', 'success');
        contactForm.reset();

        setTimeout(() => {
          if (successBanner) successBanner.style.display = 'none';
        }, 8000);
      }
    });
  }

});
