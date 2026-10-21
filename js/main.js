// Модальное окно и форма — отдельные БЭМ-блоки.
// id используются для JavaScript, классы — для оформления.
const orderDialog = document.getElementById('order-dialog');
const orderButtons = document.querySelectorAll('.product-card__button[data-product]');
const closeDialogButton = document.getElementById('close-order-dialog');
const selectedProductInput = document.getElementById('selected-product');
const orderForm = document.getElementById('order-form');
const successMessage = document.getElementById('success-message');

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
  if (successMessage) successMessage.hidden = true;
  if (!orderDialog.open) orderDialog.showModal();
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
