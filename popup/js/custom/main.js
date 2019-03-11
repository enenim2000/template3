
$.fn.hasAttr = function(name) {
    return !!this.attr(name);
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var alertNoty = function (type, text) {
    var n = noty({
        text        : text,
        type        : type,
        dismissQueue: true,
        layout      : 'topRight',
        closeWith   : ['click'],
        theme       : 'relax',
        maxVisible  : 10,
        timeout     : 10000,
        animation   : {
            open  : 'animated bounceInRight',
            close : 'animated bounceOutRight',
            easing: 'swing',
            speed : 500
        }
    });
};

var notificationMessage = function (response, type){
    if(response.data){
        alertNoty(type, response.data.message);
    }else {
        alertNoty(type, response.message);
    }
};

var notificationError = function (message, type){
    alertNoty(!type ? "error" : type, message);
};


function isFloatingPointValue(number) {
    var value = number + "";
    var point = ".";
    if(value.indexOf(point) !== -1){
        return true;
    }

    return false;
}

/**
 * Number Formatter
 *
 */
function formatNumber(num) {
    var p = Math.abs(num).toFixed(2).split(".");
    return p[0].split("").reverse().reduce(function(acc, num, i, orig) {
        return  num=="-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
    }, "") /*+ "." + p[1];*/
}

/**
 * Currency Formatter
 *
 */
function formatCurrency(amount) {
    if(typeof amount === "undefined"){
        return "";
    }

    if(isFloatingPointValue(amount)){
        var symbol = "";
        var p = Math.abs(amount).toFixed(2).split(".");

        return symbol + p[0].split("").reverse().reduce(function(acc, amount, i, orig) {
            return  amount == "-" ? acc : amount + (i && !(i % 3) ? "," : "") + acc;
        }, "") + "." + p[1];
    }else {
        return formatNumber(amount);
    }
}

function encode(obj) {
    return Base64.encode(JSON.stringify(obj));
}

function decode(base64Data) {
    return JSON.parse(Base64.decode(base64Data));
}

function hideCustomModal(ele) {
    $(ele).css("display", "none");
    $(ele).closest("div.modal-overlay").css("display", "none");
    reEnableButton();
    $(ele).find('input, textarea, select').each(function () {
        if( $(this).hasClass("select2")){
            $(this).select2('val', '');
        }else {
            if( !($(this).attr('type') === 'checkbox' || $(this).attr('type')  === 'radio')){
                $(this).val('');
            }
        }
    });
}

function reEnableButton() {
    var selectorClass = ".proceed-button";
    if($(selectorClass)){
        $(selectorClass).prop("disabled", false);
        $(selectorClass).html("Proceed");
    }
}

function showCustomModal(ele) {
    $(ele).closest("div.modal-overlay").css("display", "block");
    $(ele).css("display", "block");
}

function split(str){
    return str.replace(/[\s,]+/g, ',').split(',');
}

//$(document).on("click hover focus blur", 'button[data-fn], a.btn-fn[data-fn]', function(e){
$(document).on("click", 'button[data-fn], a.btn-fn[data-fn]', function(e){
    e.preventDefault();
    var target = $(e.target);
    var fn = target.attr('data-fn');
    var type = e.type;
    if(typeof registeredEvents[fn] !== 'undefined'){
        if(typeof registeredEvents[fn][type] !== 'undefined') {
            registeredEvents[fn][type](target,fn);
        }
    }
});

function removeNonDigit(ele) {
    var digitXter = "0123456789";
    var value = $(ele).val();
    if(digitXter.indexOf(value) === -1){
        var newVal = "";
        /**
         * This loop is to preserve initial digits entered before trailing non-digit, which is to be removed
         */
        for (var i = 0; i < value.length; i++) {
            var digit = value.charAt(i);
            if(digitXter.indexOf(digit) !== -1){
                newVal = newVal + digit;
            }else {
                $(ele).val(newVal);
                return;
            }
        }
        $(ele).val(newVal);
    }
}

function validatePhoneNumber(ele) {
    var maxLength = 11;

    var digitXter = "0123456789";
    var value = $(ele).val();
    if(digitXter.indexOf(value) === -1){
        var newVal = "";
        /**
         * This loop is to preserve initial digits entered before trailing non-digit, which is to be removed
         */
        for (var i = 0; i < value.length; i++) {
            var digit = value.charAt(i);
            if(digitXter.indexOf(digit) !== -1){
                if(newVal.length < maxLength){
                    newVal = newVal + digit;
                }
            }else {
                $(ele).val(newVal);
                return;
            }
        }
        $(ele).val(newVal);
    }
}

function setVerticalMargin() {
    var screenHeight = $(document).height();
    var contentHeight = $(".content-wrapper").height();
    var marginHeight = (screenHeight - contentHeight) / 2;
    marginHeight = marginHeight * 0.50;
    $(".content-wrapper").css({"margin-top": marginHeight+"px", "margin-bottom": marginHeight+"px"});
}

$(function(){
    setVerticalMargin();
    var contentWidth = $(".btn-submit").width()/4;
    $("input.input-pin").css({"width": contentWidth+"px"});

    $("#form-wrapper-id").css({"display":"block"});
    $(".content-wrapper").css({"display":"block"});

    $("div#redirect-section div button").prop("disabled", true);
});


// $('.input-pin').on("input", function() {
//     removeNonDigit(this);
// });

$('.input-otp').on("input", function() {
    removeNonDigit(this);
});

$('.input-phone').on("input", function() {
    validatePhoneNumber(this);
});

$('.input-pin').on('input', function() {
    removeNonDigit(this);
    if( $(this).val().length == $(this).attr('maxlength') ){
        $(this).closest('div').next('div').find('input.input-pin').focus();
    }
});

$(function() {
    var $el = $('.dots');
    $el.dotAnimation({
        speed: 500,
        dotElement: '.',
        numDots: 3
    });
    $el.trigger('stopDotAnimation');
    // start again
    $el.trigger('startDotAnimation');
});

$("div.search_tabs div.search_tab").on("click", function(i, e){

    if($(this).hasClass("active")){
        $(this).find('img').each(function (i, img) {
            if($(img).hasAttr("id")){
                $(img).attr("src", "images/" + $(img).attr("id") + "2.png")
            }
        });
    }else {
        $(this).find('img').each(function (i, img) {
            if($(img).hasAttr("id")){
                $(img).attr("src", "images/" + $(img).attr("id") + ".png")
            }
        });
    }

});