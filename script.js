/**
 * ============================================================================
 * නිම්සද ජ්යෝතිර්විද්යා පර්යේෂණ ආයතනය - ප්‍රධාන ක්‍රියාකාරී ස්ක්‍රිප්ටය (script.js)
 * Clean, modern, lightweight Vanilla JavaScript (Zero External Dependencies)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. STARRY CANVAS & CONSTELLATION PARTICLES (HERO BACKGROUND)
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('star-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic particle count based on screen size
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const stars = [];

    class Star {
      constructor() {
        this.reset();
      }

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

        // Wrap around boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Twinkle effect
        this.alpha += this.twinkleSpeed;
        if (this.alpha > 1 || this.alpha < 0.2) {
          this.twinkleSpeed = -this.twinkleSpeed;
        }
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

    // Initialize stars
    for (let i = 0; i < particleCount; i++) {
      stars.push(new Star());
    }

    // Connect constellation lines between nearby stars
    function drawConstellations() {
      const maxDistance = 110;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.15;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = '#d4af37';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    let animationFrameId;
    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
      }

      drawConstellations();
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Window resize handler
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     2. STICKY NAVBAR & ACTIVE SCROLL SPY
     -------------------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Header glass transition on scroll
    if (scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top visibility
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Scroll spy: identify current active section
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  /* --------------------------------------------------------------------------
     3. MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const drawerClose = document.getElementById('drawer-close');

  function openMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    mobileBackdrop.classList.add('active');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    mobileBackdrop.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (drawerClose) drawerClose.addEventListener('click', closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);

  // Close mobile drawer when any link is clicked
  document.querySelectorAll('.mobile-nav-link, .mobile-cta-btn').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  /* --------------------------------------------------------------------------
     4. SMOOTH SCROLLING FOR INTERNAL ANCHORS
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  /* --------------------------------------------------------------------------
     5. BACK TO TOP BUTTON
     -------------------------------------------------------------------------- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  /* --------------------------------------------------------------------------
     7. SPECIAL ASTROLOGY FEATURE: 12 ZODIAC WHEEL INTERACTIVITY
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

  zodiacButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-zodiac'), 10);
      const data = zodiacData[index];
      if (!data) return;

      // Update active button state
      zodiacButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Subtle fade animation on the detail card
      if (zDetailBox) {
        zDetailBox.style.opacity = '0.4';
        zDetailBox.style.transform = 'translateY(6px)';

        setTimeout(() => {
          zIcon.textContent = data.glyph;
          zTitle.textContent = data.name;
          zElement.textContent = data.element;
          zRuler.textContent = data.ruler;
          zNature.textContent = data.nature;
          zDirection.textContent = data.direction;
          zColor.textContent = data.color;
          zDesc.textContent = data.desc;

          zDetailBox.style.opacity = '1';
          zDetailBox.style.transform = 'translateY(0)';
        }, 150);
      }
    });
  });

  /* --------------------------------------------------------------------------
     8. CONTACT FORM VALIDATION & INTERACTIVE SUBMISSION
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const successBanner = document.getElementById('form-success-banner');

  if (contactForm) {
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');
    const emailInput = document.getElementById('user-email');
    const serviceSelect = document.getElementById('user-service');
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

    // Sri Lankan phone number validation (07XXXXXXXX or +94XXXXXXXXX)
    function isValidPhone(phone) {
      const cleanPhone = phone.replace(/[\s\-]/g, '');
      const phoneRegex = /^(?:\+94|0094|0)?7[0-9]{8}$/;
      return phoneRegex.test(cleanPhone);
    }

    // Email format validation
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    }

    // Live validation as user types/changes
    nameInput.addEventListener('input', () => {
      validateField(nameInput, nameInput.value.trim().length >= 2);
    });

    phoneInput.addEventListener('input', () => {
      validateField(phoneInput, isValidPhone(phoneInput.value));
    });

    emailInput.addEventListener('input', () => {
      validateField(emailInput, isValidEmail(emailInput.value));
    });

    serviceSelect.addEventListener('change', () => {
      validateField(serviceSelect, serviceSelect.value !== '');
    });

    messageInput.addEventListener('input', () => {
      validateField(messageInput, messageInput.value.trim().length >= 6);
    });

    // Form submission handler
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 2);
      const isPhoneValid = validateField(phoneInput, isValidPhone(phoneInput.value));
      const isEmailValid = validateField(emailInput, isValidEmail(emailInput.value));
      const isServiceValid = validateField(serviceSelect, serviceSelect.value !== '');
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 6);

      const isFormValid = isNameValid && isPhoneValid && isEmailValid && isServiceValid && isMessageValid;

      if (isFormValid) {
        // Show success state
        if (successBanner) {
          successBanner.style.display = 'flex';
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Reset form
        contactForm.reset();

        // Remove error classes if any
        contactForm.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('has-error');
        });

        // Auto-dismiss banner after 8 seconds
        setTimeout(() => {
          if (successBanner) {
            successBanner.style.display = 'none';
          }
        }, 8000);
      } else {
        // Focus on first invalid field
        const firstError = contactForm.querySelector('.form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea');
        if (firstError) {
          firstError.focus();
        }
      }
    });
  }

});
