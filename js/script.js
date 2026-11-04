/*
 * Сайт дисциплины «Управление ИТ-проектами»
 * Общий скрипт для всех страниц.
 *
 * Что делает скрипт:
 *  1. Хранит дерево страниц сайта (структура из отчёта, рисунок 1).
 *  2. Строит шапку с главным меню и «хлебные крошки».
 *  3. Формирует блок переходов: карточки следующих страниц,
 *     кнопки «Назад» и «На главную».
 *  4. Строит карту сайта на главной странице.
 *  5. Делает блоки .spoiler раскрывающимися.
 *  6. Показывает кнопку «Наверх» при прокрутке.
 *
 * Страница сообщает скрипту о себе через атрибуты <body>:
 *   data-page — идентификатор страницы в дереве (см. SITE ниже);
 *   data-root — относительный путь к корню сайта ("" или "../").
 */
(function () {
  'use strict';

  /* ---------- 1. Дерево сайта ---------- */
  var SITE = {
    id: 'home',
    title: 'Главная',
    file: 'index.html',
    desc: 'Начальная страница сайта дисциплины',
    children: [
      {
        id: 'about',
        num: '1',
        title: 'О дисциплине',
        file: 'pages/about.html',
        desc: 'Общая информация о дисциплине, её содержании и результатах обучения.',
        children: [
          {
            id: 'about-general',
            num: '1.1',
            title: 'Общие сведения о дисциплине',
            file: 'pages/about-general.html',
            desc: 'Назначение дисциплины, цель, задачи и место в образовательной программе.'
          },
          {
            id: 'about-content',
            num: '1.2',
            title: 'Содержание и результаты обучения',
            file: 'pages/about-content.html',
            desc: 'Основные направления изучения и результаты, которых нужно достичь.'
          }
        ]
      },
      {
        id: 'theory',
        num: '2',
        title: 'Теоретические основы',
        file: 'pages/theory.html',
        desc: 'Ключевые темы управления ИТ-проектами.',
        children: [
          {
            id: 'theory-planning',
            num: '2.1',
            title: 'Планирование и оценка ИТ-проектов',
            file: 'pages/theory-planning.html',
            desc: 'Составление плана проекта и оценка его параметров.',
            children: [
              {
                id: 'theory-planning-project',
                num: '2.1.1',
                title: 'Планирование проекта',
                file: 'pages/theory-planning-project.html',
                desc: 'План проекта, декомпозиция, расписание, критический путь.',
                children: [
                  {
                    id: 'theory-planning-methods',
                    num: '2.1.1.1',
                    title: 'Методы планирования',
                    file: 'pages/theory-planning-methods.html',
                    desc: 'Сетевые методы TAD и PERT, диаграмма Ганта.'
                  }
                ]
              },
              {
                id: 'theory-planning-estimation',
                num: '2.1.2',
                title: 'Оценка проекта',
                file: 'pages/theory-planning-estimation.html',
                desc: 'Точность оценок, экспертные и расчётные методы оценки.'
              }
            ]
          },
          {
            id: 'theory-risks',
            num: '2.2',
            title: 'Управление рисками и контроль',
            file: 'pages/theory-risks.html',
            desc: 'Выявление и оценка рисков, контроль сроков и бюджета.'
          },
          {
            id: 'theory-quality',
            num: '2.3',
            title: 'Качество и управление командой',
            file: 'pages/theory-quality.html',
            desc: 'Обеспечение качества результата и работа проектной команды.'
          }
        ]
      },
      {
        id: 'materials',
        num: '3',
        title: 'Учебные материалы',
        file: 'pages/materials.html',
        desc: 'Материалы для практической работы и подготовки к зачёту.',
        children: [
          {
            id: 'materials-practice',
            num: '3.1',
            title: 'Практические материалы',
            file: 'pages/materials-practice.html',
            desc: 'Материалы к практическим занятиям (файлы для скачивания).'
          },
          {
            id: 'materials-exam',
            num: '3.2',
            title: 'Материалы для подготовки к зачёту',
            file: 'pages/materials-exam.html',
            desc: 'Вопросы к зачёту и материалы для повторения (файлы для скачивания).'
          }
        ]
      }
    ]
  };

  var SITE_NAME = 'Управление ИТ-проектами';

  /* ---------- Вспомогательные функции ---------- */

  // Индекс страниц по идентификатору + ссылки на родителей
  var index = {};
  (function register(node, parent) {
    node.parent = parent;
    index[node.id] = node;
    (node.children || []).forEach(function (child) {
      register(child, node);
    });
  })(SITE, null);

  var root = '';          // путь к корню сайта, задаётся в init()
  var currentNode = null; // текущая страница

  // Создание элемента: el('a', {href: '...', class: '...'}, 'Текст')
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (name) {
        node.setAttribute(name, attrs[name]);
      });
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  // Полный адрес страницы относительно текущей
  function hrefOf(node) {
    return root + node.file;
  }

  // Название с номером раздела: «2.1. Планирование…»
  function labelOf(node) {
    return node.num ? node.num + '. ' + node.title : node.title;
  }

  // Является ли node самой страницей page или её предком
  function isAncestorOrSelf(node, page) {
    var cur = page;
    while (cur) {
      if (cur === node) {
        return true;
      }
      cur = cur.parent;
    }
    return false;
  }

  // Сообщение об ошибке в начале основного блока
  function showError(message) {
    var main = document.querySelector('main') || document.body;
    var box = el('div', { 'class': 'js-error', role: 'alert' }, message);
    main.insertBefore(box, main.firstChild);
  }

  /* ---------- 2. Шапка и хлебные крошки ---------- */

  function renderHeader() {
    var header = document.getElementById('site-header');
    if (!header) {
      return;
    }
    header.textContent = '';

    var inner = el('div', { 'class': 'header-inner' });

    var title = el('a', { 'class': 'site-title', href: hrefOf(SITE) }, SITE_NAME);
    title.appendChild(el('small', null, 'Учебный сайт дисциплины · РГРТУ, кафедра АСУ'));
    inner.appendChild(title);

    var menu = el('nav', { 'class': 'main-menu', 'aria-label': 'Главное меню' });
    var items = [SITE].concat(SITE.children);
    items.forEach(function (item) {
      var link = el('a', { href: hrefOf(item) }, item.num ? item.title : 'Главная');
      var active = item === SITE
        ? currentNode === SITE
        : currentNode && isAncestorOrSelf(item, currentNode);
      if (active) {
        link.className = 'active';
        link.setAttribute('aria-current', 'page');
      }
      menu.appendChild(link);
    });
    inner.appendChild(menu);

    header.appendChild(inner);
  }

  function renderBreadcrumbs() {
    var box = document.getElementById('breadcrumbs');
    if (!box || !currentNode) {
      return;
    }
    box.textContent = '';

    // Собираем цепочку от текущей страницы к главной
    var chain = [];
    for (var cur = currentNode; cur; cur = cur.parent) {
      chain.unshift(cur);
    }

    chain.forEach(function (node, i) {
      if (i > 0) {
        box.appendChild(el('span', { 'class': 'sep', 'aria-hidden': 'true' }, '›'));
      }
      if (node === currentNode) {
        box.appendChild(el('span', { 'class': 'current' }, labelOf(node)));
      } else {
        box.appendChild(el('a', { href: hrefOf(node) }, labelOf(node)));
      }
    });
  }

  /* ---------- 3. Переходы: следующие страницы, назад, на главную ---------- */

  function renderPageNav() {
    var box = document.getElementById('page-nav');
    if (!box || !currentNode) {
      return;
    }
    box.textContent = '';

    // Карточки следующих страниц
    var children = currentNode.children || [];
    if (children.length) {
      var block = el('section', { 'class': 'next-block' });
      block.appendChild(el('h2', null,
        currentNode === SITE ? 'Разделы сайта' : 'Перейти к подразделам'));

      var cards = el('div', { 'class': 'cards' });
      children.forEach(function (child) {
        var card = el('a', { 'class': 'card', href: hrefOf(child) });
        card.appendChild(el('span', { 'class': 'card-title' }, labelOf(child)));
        card.appendChild(el('span', { 'class': 'card-desc' }, child.desc || ''));
        cards.appendChild(card);
      });
      block.appendChild(cards);
      box.appendChild(block);
    }

    // Кнопки «Назад» и «На главную» (на главной странице не нужны)
    if (currentNode.parent) {
      var actions = el('div', { 'class': 'page-actions' });
      actions.appendChild(el('a', { 'class': 'btn', href: hrefOf(currentNode.parent) },
        '← Назад: ' + (currentNode.parent.num ? currentNode.parent.title : 'Главная')));
      if (currentNode.parent !== SITE) {
        actions.appendChild(el('a', { 'class': 'btn', href: hrefOf(SITE) }, 'На главную'));
      }
      box.appendChild(actions);
    }
  }

  /* ---------- 4. Карта сайта (главная страница) ---------- */

  function buildSitemapList(nodes) {
    var ul = el('ul');
    nodes.forEach(function (node) {
      var li = el('li');
      li.appendChild(el('a', { href: hrefOf(node) }, labelOf(node)));
      if (node.children && node.children.length) {
        li.appendChild(buildSitemapList(node.children));
      }
      ul.appendChild(li);
    });
    return ul;
  }

  function renderSitemap() {
    var box = document.getElementById('sitemap');
    if (!box) {
      return;
    }
    box.textContent = '';
    var list = buildSitemapList(SITE.children);
    list.className = 'sitemap';
    box.appendChild(list);
  }

  /* ---------- 5. Раскрывающиеся блоки ---------- */

  function setSpoiler(spoiler, open) {
    var button = spoiler.querySelector('.spoiler-btn');
    spoiler.classList.toggle('collapsed', !open);
    if (button) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function initSpoilers() {
    var spoilers = document.querySelectorAll('.spoiler');
    if (!spoilers.length) {
      return;
    }

    Array.prototype.forEach.call(spoilers, function (spoiler) {
      var title = spoiler.querySelector('.spoiler-title');
      var body = spoiler.querySelector('.spoiler-body');
      if (!title || !body) {
        return; // неполная разметка — блок остаётся обычным текстом
      }

      // Заголовок превращаем в кнопку (доступна с клавиатуры)
      var button = el('button', { 'class': 'spoiler-btn', type: 'button' }, title.textContent);
      title.textContent = '';
      title.appendChild(button);

      button.addEventListener('click', function () {
        setSpoiler(spoiler, spoiler.classList.contains('collapsed'));
      });

      setSpoiler(spoiler, spoiler.getAttribute('data-open') === 'true');
    });

    // Кнопки «Развернуть все / Свернуть все» — только если блоков несколько
    var holder = document.getElementById('spoiler-tools');
    if (holder && spoilers.length > 1) {
      var expand = el('button', { 'class': 'btn btn-small', type: 'button' }, 'Развернуть все');
      var collapse = el('button', { 'class': 'btn btn-small', type: 'button' }, 'Свернуть все');
      expand.addEventListener('click', function () {
        Array.prototype.forEach.call(spoilers, function (s) { setSpoiler(s, true); });
      });
      collapse.addEventListener('click', function () {
        Array.prototype.forEach.call(spoilers, function (s) { setSpoiler(s, false); });
      });
      holder.appendChild(expand);
      holder.appendChild(document.createTextNode(' '));
      holder.appendChild(collapse);
    }
  }

  /* ---------- 6. Кнопка «Наверх» ---------- */

  function initToTop() {
    var button = el('button', { id: 'to-top', type: 'button', 'aria-label': 'Наверх', title: 'Наверх' }, '↑');
    document.body.appendChild(button);

    function update() {
      var scrolled = window.pageYOffset || document.documentElement.scrollTop;
      button.classList.toggle('visible', scrolled > 300);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update);
    update();
  }

  /* ---------- Запуск ---------- */

  function init() {
    var body = document.body;
    var pageId = body.getAttribute('data-page');
    root = body.getAttribute('data-root') || '';

    // Защита от ошибки в пути: корень должен быть пустым или оканчиваться на «/»
    if (root && root.charAt(root.length - 1) !== '/') {
      root += '/';
    }

    currentNode = index[pageId] || null;

    if (!currentNode) {
      // Неизвестный идентификатор: показываем сообщение и ссылку на главную
      showError('Страница не найдена в структуре сайта. Вернитесь на главную страницу.');
      currentNode = SITE;
      var main = document.querySelector('main');
      if (main) {
        main.appendChild(el('p', null)).appendChild(
          el('a', { 'class': 'btn', href: hrefOf(SITE) }, 'На главную'));
      }
      renderHeader();
      return;
    }

    renderHeader();
    renderBreadcrumbs();
    renderPageNav();
    renderSitemap();
    initSpoilers();
    initToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
