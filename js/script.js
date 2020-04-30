// Ширина и высота окна
var window_width = $(window).width();
var window_height = $(window).height();

$(window).on('resize', function () {
    window_width = $(window).width();
    window_height = $(window).height();
});

// IOS viewport
var vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', vh + 'px');

window.addEventListener('orientationchange', function () {
    setTimeout(function () {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }, 100);
});

$(document).ready(function () {

    // Touch for ios devices
    document.addEventListener("touchstart", function () {
    }, false);

    // Поддержка SVG IE9-IE11
    svg4everybody();

    // Всплывающее окно
    $('[data-fancybox]').fancybox({
        transitionEffect: 'slide',
        transitionDuration: 500,
        parentEl: '.page',
        loop: 'true',
        closeExisting: true,
        autoFocus: false,
        touch: false,
        beforeShow: function (instance, slide) {

            var fullscreen = slide.opts.$orig[0].dataset.fullscreen;

            if (fullscreen != undefined) {
                $('.fancybox-container').addClass('fullscreen');
            }

            $('body').addClass('compensate-for-scrollbar');

        },
        buttons: [
            'close'
        ]
    });

    // Клик по кнопке
    function getBackground(item) {
        var color = item.css("background-color");
        var alpha = parseFloat(color.split(',')[3], 10);
        if ((isNaN(alpha) || alpha >= 0) && color !== 'transparent') {
            return color;
        }
        if (item.is("body")) {
            return false;
        } else {
            return this.getBackground(item.parent());
        }
    };

    function getLuma(color) {
        var rgba = color.substring(4, color.length - 1).split(','),
            r = rgba[0],
            g = rgba[1],
            b = rgba[2],
            luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma;
    };
    $('body').on('click', '.ink-reaction, .btn', function (e) {
        var $this = $(this),
            color = getBackground($this),
            inverse = (getLuma(color) > 183) ? ' inverse' : '',
            ink = $('<div class="ink' + inverse + '"></div>'),
            btnOffset = $this.offset(),
            xPos = e.pageX - btnOffset.left,
            yPos = e.pageY - btnOffset.top;

        ink.css({
            top: yPos,
            left: xPos
        }).appendTo($this);

        window.setTimeout(function () {
            ink.remove();
        }, 1500);
    });

    // Ховер кнопки
    if (window_width > 1200) {
        $('body').on('mousemove', '.btn', function (e) {
            var $this = $(this),
                btnOffset = $this.offset(),
                xPos = parseInt(e.pageX - btnOffset.left),
                yPos = parseInt(e.pageY - btnOffset.top);

            $this.css('--x', xPos + 'px');
            $this.css('--y', yPos + 'px');
        });
    }

    // Полифилл для Swiper (удалить, если ошибка в IE11 будет исправлена)
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // Слайдер
    var $main_banner_slider = $(".main-banner-slider"),
        mainBannerSliderSwiper = {},
        interleaveOffset = -.5;

    var isIE = /*@cc_on!@*/ false || !!document.documentMode,
        isEdge = isIE || !!window.StyleMedia;

    $main_banner_slider.each(function (index) {

        var $this = $(this),
            $slider_next = $this.parent().find('.swiper-button-next'),
            $slider_prev = $this.parent().find('.swiper-button-prev'),
            $pagination = $main_banner_slider.parent().find('.swiper-banner-pagination'),
            loop = false;

        if ($this.find('.swiper-slide').length > 1) {
            loop = true;
        }

        if ($this.length > 0) {

            mainBannerSliderSwiper[index] = new Swiper($this, {
                speed: 1000,
                slidesPerView: 1,
                loop: loop,
                grabCursor: true,
                spaceBetween: 0,
                watchOverflow: true,
                preloadImages: false,
                watchSlidesProgress: true,
                iOSEdgeSwipeDetection: true,
                lazy: {
                    loadPrevNext: true
                },
                navigation: {
                    nextEl: $slider_next,
                    prevEl: $slider_prev,
                },
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                    waitForTransition: true
                },
                on: {
                    init: function () {
                        if (!isEdge) {
                            for (var i = 0; i < this.slides.length; i++) {
                                var slide = this.slides[i];
                                $(slide).css({
                                    transform: 'none'
                                });
                            }
                        }

                        $pagination.addClass('active');
                        $pagination.find('.total').text(this.$wrapperEl[0].childElementCount - this.loopedSlides * 2);
                    },
                    progress: function (progress) {
                        if (!isEdge) {
                            for (var i = 0; i < this.slides.length; i++) {
                                var slide = this.slides[i];
                                var translate, innerTranslate;
                                progress = slide.progress;

                                if (progress > 0) {
                                    translate = progress * this.width;
                                    innerTranslate = translate * interleaveOffset;
                                } else {
                                    innerTranslate = Math.abs(progress * this.width) * interleaveOffset;
                                    translate = 0;
                                }

                                $(slide).css({
                                    transform: 'translate3d(' + translate + 'px,0,0)'
                                });

                                $(slide).find('.bg').css({
                                    transform: 'translate3d(' + innerTranslate + 'px,0,0)'
                                });

                            }
                        }
                    },

                    touchStart: function (event) {
                        if (!isEdge) {
                            for (var i = 0; i < this.slides.length; i++) {
                                $(this.slides[i]).css({
                                    transition: ''
                                });
                            }
                        }
                    },

                    setTransition: function (speed) {
                        if (!isEdge) {
                            for (var i = 0; i < this.slides.length; i++) {
                                $(this.slides[i])
                                    .find('.bg')
                                    .addBack()
                                    .css({
                                        transition: 'opacity 0.5s, visibility 0.5s, transform ' + speed + 'ms'
                                    });
                            }
                        }
                    },

                    slideChangeTransitionStart: function (e) {
                        $pagination.removeClass('active');
                    },

                    slideChangeTransitionEnd: function (e) {
                        $pagination.addClass('active');
                    },

                    sliderMove: function (e) {
                        $pagination.removeClass('active');
                    },

                    transitionStart: function (e) {
                        $pagination.find('.current').text(this.realIndex + 1);
                    },

                    transitionEnd: function (e) {
                        $pagination.addClass('active');
                        $pagination.find('.current').text(this.realIndex + 1);
                    }
                }
            })

        }

    });

    var $programs_slider = $(".programs-slider"),
        programsSliderSwiper = {};

    $programs_slider.each(function (index) {

        var $this = $(this),
            $slider_next = $this.find('.swiper-button-next'),
            $slider_prev = $this.find('.swiper-button-prev');

        if ($this.length > 0) {

            programsSliderSwiper[index] = new Swiper($this, {
                speed: 500,
                slidesPerView: 1,
                loop: true,
                grabCursor: true,
                spaceBetween: 0,
                watchOverflow: true,
                preloadImages: false,
                autoHeight: true,
                spaceBetween: 100,
                lazy: {
                    loadPrevNext: true,
                    loadPrevNextAmount: 2
                },
                navigation: {
                    nextEl: $slider_next,
                    prevEl: $slider_prev,
                },
            })

            programsSliderSwiper[index].on('lazyImageReady', function () {
                programsSliderSwiper[index].updateAutoHeight();
            });

        }

    });

    // Обработчик формы
    $('body').on('focus', 'input, textarea', function () {
        $(this).removeClass('error');
    });
    $('body').on('blur', 'input:not(:checkbox):not(:radio), textarea', function () {

        var $this = $(this),
            $id = $this.attr('type'),
            $val = $this.val();

        if ($val.length > 0 && $val != '+7 (___) ___-____') {
            $this.addClass('filled');
        } else {
            $this.removeClass('filled');
        }

        if ($this.attr('required')) {
            if ($val.length > 2 && $val != '') {
                $this.removeClass('error');
                $this.addClass('not_error');
            } else {
                $this.removeClass('not_error');
                $this.addClass('error');
            }

            switch ($id) {

                // Проверка email
                case 'email':
                    var rv_mail = /.+@.+\..+/i;
                    if ($val != '' && rv_mail.test($val)) {
                        $this.removeClass('error');
                        $this.addClass('not_error');
                    } else {
                        $this.removeClass('not_error');
                        $this.addClass('error');
                    }
                    break;

            }
        }

    });

    $('body').on('change', 'input:checkbox', function () {

        var $this = $(this);

        if ($this.attr('required')) {

            if ($this.prop('checked') == true) {
                $this.addClass('not_error').removeClass('error');
            } else {
                $this.addClass('error').removeClass('not_error');
            }

        }

    });

    // Маски
    $('[data-mask="tel"]').mask("+7 (999) 999-9999", {
        autoclear: false
    });

    $('body').on('blur', '[data-mask]', function () {
        var $this = $(this),
            last = $this.val().slice(-1);

        if ($this.attr('required')) {
            if (last == '_') {
                $this.addClass('error').removeClass('not_error');
            } else {
                $this.removeClass('error').addClass('not_error');
            }
        }
    });

    // Отправка письмо при помощи AJAX
    $('body').on('submit', '.form-ajax', function (e) {

        e.preventDefault();

        var $this = $(this);

        $this.find('input:not(:checkbox):not(:radio), textarea').each(function () {
            if ($(this).attr('required')) {
                $(this).addClass('require');
            }
        });

        $this.find('input:checkbox, input:radio').each(function () {
            if ($(this).attr('required')) {
                $(this).addClass('require');
            }
            if (($(this).prop('checked') == true) && ($(this).attr('required'))) {
                $(this).addClass('not_error').removeClass('error');
            }
        });

        var $count = $this.find('.require').length;

        if ($this.find('.not_error').length >= $count) {

            var btn_name = $this.find('[type="submit"]').attr('name');
            var btn_val = $this.find('[type="submit"]').attr('value');
            var dataForm = $this.serialize() + "&" + btn_name + "=" + btn_val;

            $.ajax({
                url: $this.attr('action'),
                type: 'post',
                context: this,
                data: dataForm,

                beforeSend: function (xhr, textStatus) {
                    $this.find('.form-control, [type="submit"]').not(':hidden').attr('disabled', 'disabled');
                },

                success: function (response) {

                    $this.find('.form-control, [type="submit"]').not(':hidden').removeAttr('disabled');
                    $this.find('input, textarea').not(':hidden').val('').removeClass('error not_error');

                    $this.after(response);
                    $this.hide();
                }
            });

        } else {
            $this.find('input:not(:checkbox):not(:radio), textarea').each(function () {
                if ($(this).hasClass('require') && !$(this).hasClass('not_error')) {
                    $(this).addClass('error');
                }
            });
            $this.find('input:checkbox, input:radio').each(function () {
                if (($(this).prop('checked') != true) && ($(this).attr('required'))) {
                    $(this).addClass('error').removeClass('not_error');
                }
            });
            return false;
        }

    });

    // Табы
    var transitionActive = false;

    $('body').on('click', '.js-tab-open', function (e) {

        e.preventDefault();

        var $this = $(this),
            $parent = $this.parent(),
            tab_connector = $this.closest('[data-tabs]').data('tabs'),
            $tab_item = $('[data-tabs-content="' + tab_connector + '"]'),
            $link = $this.attr('href'),
            height = $($link).outerHeight(),
            height_initial = $tab_item.outerHeight(),
            transitionDuration = 500;

        if ($parent.hasClass('active') || (transitionActive === true)) {
            return false;
        }

        $parent.addClass('active').siblings().removeClass('active');
        $($link).addClass('active').siblings().removeClass('active');
        $tab_item.css({
            'height': height_initial
        });

        setTimeout(function () {
            $tab_item.css({
                'height': height
            });
        }, 20);

        transitionActive = true;

        setTimeout(function () {
            $tab_item.css({
                'height': 'auto'
            });
            transitionActive = false;
        }, transitionDuration);

    });

    // Вопросы-ответы
    $('body').on('click', '.js-open-faq', function () {

        var $this = $(this),
            $parent = $this.closest('.faq-item');

        if (!$parent.hasClass('active')) {
            $parent.addClass('active');
            $parent.find('.hidden').slideDown(300);
        } else {
            $parent.removeClass('active');
            $parent.find('.hidden').slideUp(300);
        }

    });

    // Select
    var $select = $('select');

    $select.chosen({
        width: "100%",
        hide_results_on_select: false,
        no_results_text: 'Нет совпадений с'
    });

    // Открыть меню
    $('body').on('click', '.js-open-menu', function () {

        var $this = $(this),
            $hidden = $('.header-hidden'),
            $body = $('body');

        if (!$this.hasClass('active')) {
            $this.addClass('active');
            $hidden.addClass('visible');
            $body.addClass('no-scroll');
        } else {
            $this.removeClass('active');
            $hidden.removeClass('visible');
            $body.removeClass('no-scroll');
        }

    });

    // Открыть меню в подвале
    $('body').on('click', '.js-open-footer-menu', function () {

        var $this = $(this),
            $parent = $this.closest('.footer-item');

        if (!$parent.hasClass('active')) {
            $parent.addClass('active');
            $parent.find('.hidden-mobile').slideDown(300);
        } else {
            $parent.removeClass('active');
            $parent.find('.hidden-mobile').slideUp(300);
        }

    });

    // Анимация
    AOS.init({
        duration: 1200,
        once: true,
        // offset: 0,
    });

    // Контакты
    $('body').on('click', '.js-open-contacts', function (e) {

        if (window_width < 1200) {
            var $this = $(this),
                $parent = $this.closest('.contacts-item');

            e.preventDefault();

            if (!$parent.hasClass('active')) {
                $parent.addClass('active');
                $parent.find('.hidden').slideDown(300);
            } else {
                $parent.removeClass('active');
                $parent.find('.hidden').slideUp(300);
            }
        } else {
            return false;
        }
    });


    $('body').on('click', '.js-tabs-btn', function (e) {

        var $this = $(this),
            $btns = $('.js-tabs-btn'),
            $rel = $this.attr('rel'),
            $tab = $('#' + $rel),
            $tabs = $('.contacts-tab');

        e.preventDefault();

        if (!$this.hasClass('active')) {
            $btns.removeClass('active');
            $this.addClass('active');
            $tabs.removeClass('active');
            $tab.addClass('active');
        } else {
            return false;
        }
    });

    //Услуги калькулятор
    if ($('.calculator-section').length) {
        var slider1 = document.getElementById('slider1');
        var slider2 = document.getElementById('slider2');
        var slider3 = document.getElementById('slider3');

        var slider1Value = document.getElementById('slider1-span');
        var slider2Value = document.getElementById('slider2-span');
        var slider3Value = document.getElementById('slider3-span');

        noUiSlider.create(slider1, {
            start: 3930000,
            animate: false,
            range: {
                min: 670000,
                max: 50000000
            },
            connect: [true, false],
            format: wNumb({
                decimals: 0,
                thousand: ' ',
                suffix: ' ₽'
            })
        });

        noUiSlider.create(slider2, {
            start: 3029000,
            animate: false,
            range: {
                min: 353000,
                max: 3500000
            },
            connect: [true, false],
            format: wNumb({
                decimals: 0,
                thousand: ' ',
                suffix: ' ₽'
            })
        });

        noUiSlider.create(slider3, {
            start: 10,
            animate: false,
            range: {
                min: 3,
                max: 30
            },
            connect: [true, false],
            format: wNumb({
                decimals: 0,
                thousand: ' ',
                suffix: ' лет'
            })
        });

        slider1.noUiSlider.on('update', function (values, handle) {
            slider1Value.innerHTML = values[handle];
        });

        slider2.noUiSlider.on('update', function (values, handle) {
            slider2Value.innerHTML = values[handle];
        });

        slider3.noUiSlider.on('update', function (values, handle) {
            slider3Value.innerHTML = values[handle];
        });
    }

    //custom input type="file"
    $('#file-upload').change(function () {
        var i = $(this).prev('label').clone();
        var file = $('#file-upload')[0].files[0].name;
        $(this).prev('label').text(file);
    });

    videoImgResize();

});

// video, img size set - страница новости
function videoImgResize() {
    $('.block-video, .block-img').each(function () {
        let widthWrap = $(this).find('img').width(),
            widthThis = $(this).width();

        if ($(this).hasClass('flex-dynamic')) {
            $(this).removeClass('flex-dynamic');
        }

        if (window_width <= 600) {
            widthThis += 30;
        }

        if (widthWrap > widthThis) {
            widthWrap = widthThis;
        }


        $(this).find('.video-wrap, .img-wrap').css({
            'maxWidth': widthWrap + 'px',
            'minWidth': widthWrap + 'px'
        });
        $(this).addClass('flex-dynamic');
    });
}

$(window).on('resize', function () {
    videoImgResize();
});

window.addEventListener('orientationchange', function () {
    videoImgResize();
});