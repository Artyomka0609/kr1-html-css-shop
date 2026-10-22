// Учитываем высоту закреплённой шапки при переходе по якорным ссылкам.
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  const updateHeaderHeight = () => {
    document.documentElement.style.setProperty(
      '--site-header-height', `${siteHeader.getBoundingClientRect().height}px`
    );
  };

  updateHeaderHeight();
  new ResizeObserver(updateHeaderHeight).observe(siteHeader);
}

// Фильтры работают только на странице каталога; карточки остаются в HTML.
const catalogFilterForm = document.getElementById('catalog-filter-form');

if (catalogFilterForm) {
  const category = document.getElementById('filter-category');
  const priceFrom = document.getElementById('price-from');
  const priceTo = document.getElementById('price-to');
  const availableOnly = document.getElementById('filter-available');
  const cards = Array.from(document.querySelectorAll('#catalog-grid .product-card'));
  const resultCount = document.getElementById('catalog-result-count');
  const emptyMessage = document.getElementById('catalog-empty');

  function filterProducts(reset = false) {
    const selectedCategory = reset ? 'all' : category.value;
    const minPrice = reset || priceFrom.value === '' ? 0 : Number(priceFrom.value);
    const maxPrice = reset || priceTo.value === '' ? Infinity : Number(priceTo.value);
    const inStock = !reset && availableOnly.checked;
    let visibleCount = 0;

    cards.forEach((card) => {
      const price = Number(card.dataset.price);
      const matches = (selectedCategory === 'all' || card.dataset.category === selectedCategory)
        && price >= minPrice && price <= maxPrice
        && (!inStock || card.dataset.available === 'true');
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    resultCount.textContent = `Показано товаров: ${visibleCount} из ${cards.length}`;
    emptyMessage.hidden = visibleCount !== 0;
  }

  catalogFilterForm.addEventListener('input', () => priceTo.setCustomValidity(''));

  catalogFilterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    priceTo.setCustomValidity('');
    if (priceFrom.value !== '' && priceTo.value !== ''
      && Number(priceFrom.value) > Number(priceTo.value)) {
      priceTo.setCustomValidity('Цена «До» должна быть не меньше цены «От».');
    }
    if (!catalogFilterForm.reportValidity()) return;
    filterProducts();
  });

  catalogFilterForm.addEventListener('reset', () => {
    priceTo.setCustomValidity('');
    // Событие reset приходит до сброса значений браузером.
    filterProducts(true);
  });

  filterProducts();
}

// Модальное окно и форма — отдельные БЭМ-блоки.
// id используются для JavaScript, классы — для оформления.
const orderDialog = document.getElementById('order-dialog');
const orderButtons = document.querySelectorAll('.product-card__button[data-product]');
const closeDialogButton = document.getElementById('close-order-dialog');
const selectedProductInput = document.getElementById('selected-product');
const orderForm = document.getElementById('order-form');
const successMessage = document.getElementById('success-message');
const selectedProductName = document.getElementById('order-product-name');

function setFieldError(field, invalid) {
  // Модификатор добавляется вместе с базовым классом поля.
  ['input', 'select', 'textarea'].forEach((type) => {
    const baseClass = `order-form__${type}`;
    if (field.classList.contains(baseClass)) {
      field.classList.toggle(`${baseClass}--error`, invalid);
    }
  });

  if (invalid) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }
}

function openOrderDialog(productName = '') {
  if (!orderDialog || !orderForm) return;

  orderForm.reset();
  Array.from(orderForm.elements).forEach((field) => setFieldError(field, false));

  if (selectedProductInput) selectedProductInput.value = productName;
  if (selectedProductName) {
    selectedProductName.textContent = productName ? `Выбран товар: ${productName}` : '';
    selectedProductName.hidden = !productName;
  }
  if (successMessage) successMessage.hidden = true;
  if (!orderDialog.open) orderDialog.showModal();
  orderDialog.scrollTop = 0;
}

orderButtons.forEach((button) => {
  button.addEventListener('click', () => openOrderDialog(button.dataset.product));
});

if (closeDialogButton && orderDialog) {
  closeDialogButton.addEventListener('click', () => orderDialog.close());
}

// Ссылка со страницы контактов открывает форму на главной странице.
function openOrderFromHash() {
  if (window.location.hash === '#order-dialog') openOrderDialog();
}

window.addEventListener('hashchange', openOrderFromHash);
openOrderFromHash();

if (orderForm) {
  orderForm.addEventListener('input', (event) => {
    const field = event.target;
    if (field.willValidate && field.hasAttribute('aria-invalid')) {
      setFieldError(field, !field.validity.valid);
    }
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = Array.from(orderForm.elements).filter((field) => field.willValidate);
    fields.forEach((field) => setFieldError(field, !field.validity.valid));

    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }

    // Учебная проверка формы: серверная отправка пока не подключена.
    orderForm.reset();
    if (orderDialog) orderDialog.close();
    if (successMessage) {
      successMessage.hidden = false;
      successMessage.scrollIntoView({ block: 'nearest' });
    }
  });
}
