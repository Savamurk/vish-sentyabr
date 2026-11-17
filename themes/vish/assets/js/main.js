/*Мега меню*/

$(function () {

    $(".sf-menu").superfish({
        delay: 200,
        speed: "fast",
        cssArrows: false
    })
        .after("<div id='mobile-menu'>").clone().appendTo("#mobile-menu");
    $("#mobile-menu").find("*").attr("style", "");
    $("#mobile-menu").children("ul").removeClass("sf-menu")
        .parent().mmenu({
            extensions: ['widescreen', 'theme-white', 'effect-menu-slide', 'pagedim-black'],
            navbar: {
                title: "Меню"

            }
        });

    $(".toggle-mnu").click(function () {
        $(this).addClass("on");

    });

    var api = $("#mobile-menu").data("mmenu");
    api.bind("closed", function () {
        $(".toggle-mnu").removeClass("on");
    });
});



// Настраиваем формы

const forms = document.querySelectorAll('.form');

const errorLabelObj = {
    color: '#e90707',
    marginTop: '6px',
    fontSize: '14px',
    textAlign: 'left',
};

// Удаляем вставку капчи и работу с recaptcha — больше не нужна

// Момент загрузки страницы: обработчик отклоняет заявки, отправленные слишком быстро.
const FORM_START_TIME = Date.now();

const showFormError = (form, message) => {
    let box = form.querySelector('.form-send-error');
    if (!box) {
        box = document.createElement('div');
        box.className = 'form-send-error';
        box.style.cssText = 'margin-top:10px;color:#b3261e;font-size:14px;line-height:1.4';
        form.appendChild(box);
    }
    box.textContent = message;
};

const clearFormError = (form) => {
    const box = form.querySelector('.form-send-error');
    if (box) { box.textContent = ''; }
};

const sendForm = (form) => {
    if (form.dataset.sending === '1') { return; }
    form.dataset.sending = '1';

    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) { submitButton.disabled = true; }

    clearFormError(form);

    const formData = new FormData(form);
    // Ловушка для ботов и отметка времени: обычная форма их не показывает.
    formData.append('website', '');
    formData.append('_form_elapsed_ms', String(Date.now() - FORM_START_TIME));

    fetch('/mail/mail.php', { method: 'POST', body: formData })
        .then((response) => {
            if (response.status === 200) {
                form.reset();
                window.location = '/thanks';
                return;
            }
            showFormError(form, 'Не удалось отправить заявку. Проверьте телефон и попробуйте ещё раз.');
        })
        .catch(() => {
            showFormError(form, 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.');
        })
        .finally(() => {
            form.dataset.sending = '0';
            if (submitButton) { submitButton.disabled = false; }
        });
}

const formHandler = (event) => {
    sendForm(event.target);
}

// Валидация

if (document.querySelector('#callme-modal')) {
    const formQstValid = new JustValidate('#callme-modal', {
        errorFieldCssClass: 'invalid',
        errorLabelStyle: errorLabelObj,
    });

    formQstValid
        .addField('#callme-modal [type="tel"]', [{
            rule: 'required',
            value: true,
            errorMessage: 'Поле обязательно для заполнения',
        },
        {
            rule: 'minLength',
            value: 15,
            errorMessage: 'Введите телефон в формате 7(***) *** ** **'
        }])
        .onSuccess((event) => {
            formHandler(event);
        });
}

if (document.querySelector('#form1')) {
    const formQstValid = new JustValidate('#form1', {
        errorFieldCssClass: 'invalid',
        errorLabelStyle: errorLabelObj,
    });

    formQstValid
        .addField('#form1 [type="tel"]', [{
            rule: 'required',
            value: true,
            errorMessage: 'Поле обязательно для заполнения',
        },
        {
            rule: 'minLength',
            value: 15,
            errorMessage: 'Введите телефон в формате 7(***) *** ** **'
        }])
        .onSuccess((event) => {
            formHandler(event);
        });
}

if (document.querySelector('#form2')) {
    const formQstValid = new JustValidate('#form2', {
        errorFieldCssClass: 'invalid',
        errorLabelStyle: errorLabelObj,
    });

    formQstValid
        .addField('#form2 [type="tel"]', [{
            rule: 'required',
            value: true,
            errorMessage: 'Поле обязательно для заполнения',
        },
        {
            rule: 'minLength',
            value: 15,
            errorMessage: 'Введите телефон в формате 7(***) *** ** **'
        }])
        .onSuccess((event) => {
            formHandler(event);
        });
}




const maskedPhoneNumbers = () => {
    let phoneNumber = document.querySelectorAll('[type="tel"]');

    if (phoneNumber) {
        phoneNumber.forEach(function (el) {
            el.setAttribute('data-mask', '0 000 000 00 00');
            el.addEventListener('input', function (event) {
                showMask(event);
            });
        });
    }

    function showMask(event) {
        const digitalPattern = /[0-9]/;
        const literalPattern = /[0\*]/;
        let input = event.target;
        let value = input.value;
        let mask = input.dataset.mask;
        let newValue = '';

        try {
            let maskLength = mask.length;
            let valueIndex = 0;
            let maskIndex = 0;

            for (; maskIndex < maskLength;) {
                if (maskIndex >= value.length) {
                    break;
                }

                if (mask[maskIndex] === '0' && value[valueIndex].match(digitalPattern) === null) {
                    break;
                }

                while (mask[maskIndex].match(literalPattern) === null) {
                    if (value[valueIndex] === mask[maskIndex]) {
                        break;
                    }

                    newValue += mask[maskIndex++];
                } //end cycle while

                newValue += value[valueIndex++];
                maskIndex++;
            } //end cycle for

            input.value = newValue;
        } catch (evt) {
            phoneNumber.removeEventListener();
        }
    }
}
maskedPhoneNumbers();

function setMobileScrollbarGap() {
    var gap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty('--rd-scrollbar-gap', gap + 'px');
}

setMobileScrollbarGap();
window.addEventListener('resize', setMobileScrollbarGap);


//фиксируем header при скроле
var element = document.getElementById('header');
window.addEventListener('scroll', function () {
    if (window.scrollY > 151) {
        element.classList.add("menu-fixed");
    } else {
        element.classList.remove("menu-fixed");
    }
});




/*Скрываем скролл у фэнсибокса*/
Fancybox.defaults.hideScrollbar = false;

//корректируем ссылки с телефонов
document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
    let phoneNumber = link.getAttribute('href').replace('tel:', '');
    phoneNumber = phoneNumber.replace(/\D/g, '');  
    link.setAttribute('href', 'tel:' + phoneNumber);

});
