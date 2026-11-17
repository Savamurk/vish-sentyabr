(() => {
  const currentScript = document.currentScript;
  const scriptSrc = currentScript?.getAttribute('src') || '';
  const themeBase = scriptSrc.includes('/assets/js/')
    ? scriptSrc.slice(0, scriptSrc.indexOf('/assets/js/') + 1)
    : '/themes/vish_video_final/';
  const asset = (path) => `${themeBase}${path.replace(/^\/+/, '')}`;

  const ready = (callback) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
    else callback();
  };

  const setText = (node, text) => {
    if (node) node.textContent = text;
  };

  ready(() => {
    const body = document.body;
    const hasServiceHero = Boolean(document.querySelector('.bgmain.bgpage'));
    const isHome = location.pathname.replace(/\/+$/, '') === '';
    body.classList.toggle('service-redesign-page', hasServiceHero);
    body.classList.toggle('home-redesign-page', !hasServiceHero && isHome);

    const header = document.querySelector('#header, .header');
    if (header && !header.nextElementSibling?.classList.contains('local-header-flow-spacer')) {
      const spacer = document.createElement('div');
      spacer.className = 'local-header-flow-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      header.after(spacer);
    }

    document.addEventListener('click', (event) => {
      const button = event.target.closest('#modalclose');
      if (!button) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      localStorage.setItem('modalClosed', 'true');

      const cookieBanner = document.querySelector('#MyModal');
      if (cookieBanner) {
        cookieBanner.hidden = true;
        cookieBanner.style.display = 'none';
        cookieBanner.setAttribute('aria-hidden', 'true');
      }
    }, true);

    const tuneStaffSlider = () => {
      document.querySelectorAll('.staff__slider').forEach((slider) => {
        const instance = slider.swiper;
        if (!instance) return;
        instance.params.speed = 400;
        if (instance.originalParams) instance.originalParams.speed = 400;
        instance.update();
      });
    };
    requestAnimationFrame(tuneStaffSlider);
    window.setTimeout(tuneStaffSlider, 120);

    const syncHomeFaq = () => {
      const faq = document.querySelector('.home-redesign-page .faq');
      if (!faq) return;

      faq.classList.add('home-faq-redesign', 'service-faq-redesign');
      const rows = faq.querySelectorAll(':scope > .container-lg > .row');
      const grid = rows[rows.length - 1];
      if (!grid) return;

      grid.classList.add('home-faq-grid');
      const columns = grid.querySelectorAll(':scope > [class*="col-"]');
      columns[0]?.classList.add('service-faq-questions');
      columns[1]?.classList.add('service-faq-form');
    };

    const buildStars = () => Array.from({ length: 5 }, () => (
      `<svg class="responses__star" aria-hidden="true"><use xlink:href="${asset('assets/img/sprite.svg#star')}"></use></svg>`
    )).join('');

    const hydrateRatings = (section) => {
      const links = section.querySelector('.responses__links');
      if (!links || links.classList.contains('responses__links--video-reference')) return;

      const logos = section.querySelectorAll('.responses__logo');
      const yaHref = logos[0]?.getAttribute('href') || '#';
      const gisHref = logos[1]?.getAttribute('href') || '#';
      const stars = buildStars();

      links.className = 'responses__links responses__links--video-reference';
      links.innerHTML = `
        <a class="responses__link response-rating" href="${yaHref}" aria-label="Рейтинг на Яндекс Картах">
          <div class="response-rating__label"><img src="${asset('assets/img/yandex.svg')}" alt=""><strong>Яндекс Карты</strong></div>
          <div class="response-rating__body"><span class="response-rating__value">5.0</span><div><div class="responses__stars">${stars}</div><div class="responses__info">Оценка пользователей</div></div></div>
        </a>
        <a class="responses__link response-rating" href="${gisHref}" aria-label="Рейтинг в 2ГИС">
          <div class="response-rating__label"><img src="${asset('assets/img/2gis-logo.svg')}" alt=""><strong>2ГИС</strong></div>
          <div class="response-rating__body"><span class="response-rating__value">5.0</span><div><div class="responses__stars">${stars}</div><div class="responses__info">Оценка пользователей</div></div></div>
        </a>
        <div class="responses__link response-rating">
          <div class="response-rating__label"><img src="${asset('assets/img/mail.svg')}" alt=""><strong>Благодарственных писем</strong></div>
          <div class="response-rating__body"><span class="response-rating__value">85</span><div class="responses__info">благодарственных писем</div></div>
        </div>`;
    };

    const hydrateResponses = () => {
      document.querySelectorAll('.responses').forEach((section) => {
        section.classList.add('responses--service-redesign');
        hydrateRatings(section);

        section.querySelectorAll('.response').forEach((card, index) => {
          if (card.classList.contains('response--video-reference')) return;
          if (body.classList.contains('service-redesign-page') && index >= 4) {
            card.closest('.response__item, [class*="col-"]')?.remove();
            return;
          }

          const name = card.querySelector('.response__name')?.innerHTML || '';
          const date = card.querySelector('.response__date')?.innerHTML || '';
          const text = card.querySelector('.response__text p')?.innerHTML || '';
          const source = card.querySelector('.response__img');
          const imageHref = source?.getAttribute('href') || source?.querySelector('img')?.getAttribute('src') || '';
          const imageAlt = source?.querySelector('img')?.getAttribute('alt') || card.querySelector('.response__name')?.textContent?.trim() || '';

          card.classList.add('response--video-reference');
          card.innerHTML = `
            <div class="response__identity"><div class="response__name">${name}</div><div class="response__date">${date}</div></div>
            <div class="response__text"><p>${text}</p></div>
            ${imageHref ? `<a class="response__source" data-fancybox="responses" href="${imageHref}"><img src="${imageHref}" alt="${imageAlt}"></a>` : ''}`;
        });
      });
    };

    const hydrateVideos = () => {
      const metadata = [
        { duration: '1:16', name: 'Анастасия Малахова', subtitle: 'Опыт сотрудничества', category: 'Гражданское дело', icon: 'ph-scales', poster: 'assets/img/video-previews/june-video-poster-restored-01.png', avatar: 'assets/img/video-previews/june-video-avatar-01.png', video: 'assets/video/testimonial-01.mp4' },
        { duration: '1:09', name: 'Светлана Горбунова', subtitle: 'Как прошёл процесс', category: 'Судебный спор', icon: 'ph-gavel', poster: 'assets/img/video-previews/june-video-poster-restored-02.png', avatar: 'assets/img/video-previews/june-video-avatar-02.png', video: 'assets/video/testimonial-02.mp4' },
        { duration: '1:17', name: 'Симун А.', subtitle: 'Почему рекомендую', category: 'Консультация и сопровождение', icon: 'ph-chat', poster: 'assets/img/video-previews/june-video-poster-restored-03.png', avatar: 'assets/img/video-previews/june-video-avatar-03.png', video: 'assets/video/testimonial-03.mp4' },
      ];

      document.querySelectorAll('.video').forEach((section) => {
        section.classList.add('video--service-redesign');
        const heading = section.querySelector('.heading-title');
        if (heading) heading.innerHTML = 'Видео <span>отзывы</span>';
        if (heading && !section.querySelector('.video__subtitle')) {
          const subtitle = document.createElement('p');
          subtitle.className = 'video__subtitle';
          subtitle.textContent = 'Клиенты коротко рассказывают о своём опыте';
          heading.after(subtitle);
        }

        section.querySelectorAll('.video__item').forEach((card, index) => {
          const meta = metadata[index];
          if (!meta) {
            card.closest('.video__item2, [class*="col-"]')?.remove();
            return;
          }

          const poster = asset(meta.poster);
          const video = asset(meta.video);
          const posterImage = card.querySelector('.video__poster');
          if (posterImage) {
            posterImage.src = poster;
            posterImage.alt = `${meta.name}: ${meta.category}`;
          }

          const wrapper = card.querySelector('.video__wrp');
          if (wrapper && !wrapper.querySelector('.video__duration')) {
            wrapper.insertAdjacentHTML('beforeend', `<span class="video__duration">${meta.duration}</span>`);
          }

          const link = card.querySelector('.play-icon');
          if (link) {
            link.href = video;
            link.dataset.src = video;
            link.dataset.type = 'html5video';
            link.setAttribute('aria-label', `Смотреть видео: ${meta.category}`);
          }

          const title = card.querySelector('.video__title');
          if (title) {
            title.innerHTML = `
              <div class="video-card__person">
                <img src="${asset(meta.avatar)}" alt="${meta.name}">
                <div><strong>${meta.name}</strong><span>${meta.subtitle}</span></div>
              </div>
              <div class="video-card__category"><i class="ph ${meta.icon}" aria-hidden="true"></i><span>${meta.category}</span></div>`;
          }
        });

        const showMore = section.querySelector('.show-more2');
        if (showMore) {
          showMore.hidden = true;
          showMore.style.display = 'none';
        }
      });
    };

    const syncServiceHero = () => {
      const hero = document.querySelector('.service-redesign-page .bgmain.bgpage');
      if (!hero) return;

      setText(hero.querySelector('.bgmain__btn'), 'Получить консультацию');
      const phone = document.querySelector('.header__phone')?.textContent?.replace(/\s+/g, ' ').trim();
      const phoneSlot = hero.querySelector('.bgmain__btn-wrp > p');
      if (phone && phoneSlot) {
        const phoneLink = document.createElement('a');
        phoneLink.className = 'bgmain__phone';
        phoneLink.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
        phoneLink.textContent = phone;
        phoneSlot.replaceWith(phoneLink);
      }

      const subtitle = hero.querySelector('.bgmain__subtitle');
      if (subtitle && !subtitle.textContent.trim()) {
        subtitle.textContent = 'Разберем документы, оценим риски и предложим понятную стратегию защиты.';
      }
    };

    const syncServiceFaq = () => {
      const faq = document.querySelector('.service_faq');
      const host = faq?.closest('.container-lg');
      if (!faq || !host) return;

      document.body.classList.add('service-redesign-page');
      faq.classList.add('service-faq-redesign');
      const rows = faq.querySelectorAll(':scope > .row');
      const grid = rows[rows.length - 1];
      if (grid) {
        grid.classList.add('service-faq-grid', 'home-faq-grid');
        const columns = grid.querySelectorAll(':scope > [class*="col-"]');
        columns[0]?.classList.add('service-faq-questions');
        columns[1]?.classList.add('service-faq-form');
        const formWrapper = columns[1]?.querySelector('.faq__form-wrapper');
        if (formWrapper) {
          const form = formWrapper.querySelector('form');
          setText(formWrapper.querySelector('h4'), 'Нет времени вникать во все тонкости и нюансы? Нет проблем!');

          const hidden = formWrapper.querySelector('input[type="hidden"]');
          if (hidden) {
            hidden.name = 'form_subject';
            hidden.value = 'Заявка формы расчета экономии';
          }

          const fields = [
            { label: 'Как Вас зовут', name: 'Имя', placeholder: 'Введите имя' },
            { label: 'Какой у вас номер телефона?', name: 'Телефон', placeholder: 'Введите телефон' },
            { label: 'Какой у вас адрес электронной почты?', name: 'Email', placeholder: 'Введите email' },
          ];

          form?.querySelectorAll(':scope > label').forEach((label, index) => {
            const field = fields[index];
            if (!field) return;
            setText(label.querySelector('.label-info span:last-child'), field.label);
            const input = label.querySelector('input.faq__input');
            if (input) {
              input.name = field.name;
              input.placeholder = field.placeholder;
            }
          });

          setText(formWrapper.querySelector('button[type="submit"]'), 'Отправить');
          const checkbox = formWrapper.querySelector('.privat-checkbox');
          if (checkbox) {
            checkbox.name = 'Условия согласия';
            checkbox.value = 'Приняты';
          }
          const agreement = formWrapper.querySelector('.checkbox-text');
          if (agreement) {
            agreement.innerHTML = 'Нажимая на кнопку вы даете свое согласие на обработку <a href="/privacy">персональных данных</a>';
          }
        }
      }

      if (host.closest('.service-faq-section')) return;

      const section = document.createElement('section');
      section.className = 'service-faq-section';
      host.classList.add('service-faq-shell');
      host.parentNode.insertBefore(section, host);
      section.append(host);
    };

    syncHomeFaq();
    syncServiceHero();
    syncServiceFaq();
    hydrateResponses();
    hydrateVideos();

    document.querySelectorAll('.service-faq-redesign .accordion, .home-faq-redesign .accordion').forEach((accordion, index) => {
      const control = accordion.querySelector('.accordion__control');
      const content = accordion.querySelector('.accordion__content');
      if (!control || !content) return;
      const open = accordion.classList.contains('open');
      if (!content.id) content.id = `redesign-faq-panel-${index + 1}`;
      control.type = 'button';
      control.setAttribute('aria-controls', content.id);
      control.setAttribute('aria-expanded', open ? 'true' : 'false');
      content.setAttribute('aria-hidden', open ? 'false' : 'true');
    });

    const warmedVideos = new Map();
    const warmVideo = (link) => {
      const source = link.getAttribute('data-src') || link.getAttribute('href');
      if (!source || warmedVideos.has(source)) return;
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = source;
      video.load();
      warmedVideos.set(source, video);
    };
    document.querySelectorAll('.video--service-redesign .play-icon').forEach((link) => {
      link.addEventListener('pointerenter', () => warmVideo(link), { once: true, passive: true });
      link.addEventListener('focus', () => warmVideo(link), { once: true });
    });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('#mobile-menu a[href$="#team"], #mobile-menu a[href*="/#team"]');
      if (!link) return;

      const target = document.querySelector('#team');
      if (!target || location.pathname.replace(/\/+$/, '') !== '') return;

      event.preventDefault();
      const menu = window.jQuery ? window.jQuery('#mobile-menu').data('mmenu') : null;
      if (menu && typeof menu.close === 'function') menu.close();
      document.documentElement.classList.remove('mm-opening', 'mm-blocking', 'mm-opened');
      document.body.classList.remove('mm-opening', 'mm-blocking', 'mm-opened');
      document.querySelector('.toggle-mnu')?.classList.remove('on');
      document.querySelector('#mm-blocker')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      window.setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }, true);

    // Case cards are initialized by the theme partial itself. Keeping that
    // handler single prevents a double toggle on the "Развернуть" button.
  });
})();
