

function buildRedirectParams(){
    $("#vpc_OrderInfo").val($("#merchant_reference").val());
    $("#vpc_ReceiptNo").val($("#reference").val());
    $("#vpc_TransactionNo").val($("#merchant_reference").val());

    var href = $("#redirect_url").val() + "?";
        $('div#response-params input').each(function(index, obj){;
        href = href + $(this).attr("name") + "=" + $(this).val() + "&";
    });

    //Remove the last &
    href = href.substring(0, href.length-1);

    return href;
}

function triggerRedirect() {
    setTimeout(function () {
        location.href = buildRedirectParams();
    }, 6000);
}

function commonSuccessResponse(response) {
    var message;
    $("div#action-button div button").prop("disabled", false);
    if(response.data.status === "failed"){
        notificationMessage(response, "error");
    }else if(response.data.status === "timeout"){
        if(!response.data.message){
            message = "Request timeout, service not available";
            notificationError(message, "success");
            $("#vpc_Message").val(message);
            $("#vpc_Status").val(4); //Invalid params sent from webconnect
            triggerRedirect();
        }
    }else if(response.data.status === "pending"){
        if(!response.data.message){
            message = "Charge attempted, but pending";
            notificationError(message, "success");

            $("#vpc_Message").val(message);
            $("#vpc_Status").val(1); //Invalid params sent from webconnect

            triggerRedirect();
        }
    }else if(response.data.status === "success"){
        hideAll();
        showMainContainer();
        showSuccessSection();

        $("#vpc_Message").val(response.message);
        $("#vpc_Status").val(0);

        triggerRedirect();

    }else if(response.data.status === "send_otp"){
        hideAll();
        showMainContainer();
        onlyOTP();
        $("#next-webservice-url").val("send_otp");
    }else if(response.data.status === "send_phone"){
        hideAll();
        showMainContainer();
        onlyPhone();
        $("#next-webservice-url").val("send_phone");
    }else if(response.data.status === "send_pin"){
        hideAll();
        showMainContainer();
        onlyPin();
        $("#next-webservice-url").val("send_pin");
    }else if(response.data.status === "open_url"){
        message = "Charge attempted, with status open_url";
        notificationError(message, "warning");

        $("#vpc_Message").val(message);
        $("#vpc_Status").val(3); //Charge attempted, with status open_url

        triggerRedirect();
    } else {
        notificationMessage(response, "error");

        $("#vpc_Message").val(response.message);
        $("#vpc_Status").val(5); //Invalid params sent from webconnect

        triggerRedirect();
    }
}

function enabledButton() {
    $("div#action-button button").prop("disabled", false);
}

function disabledButton() {
    $("div#action-button button").prop("disabled", true);
}

$(function () {

    disabledButton();

    setInterval(function () {

        switch (getNextUrl()){
            case "send_otp":
                var otp = $("input[name='otp']").val();

                if(otp.length === 6){
                    enabledButton();
                }else {
                    disabledButton();
                }
                break;
            case "send_pin":
                var pin = "";
                $('input.input-pin').each(function(index, obj){
                    pin = pin + $(this).val();
                });

                if(pin.trim().length === 4){
                    enabledButton();
                }else {
                    disabledButton();
                }
                break;
            case "send_phone":
                var phone  = $("input[name='phone']").val();
                if(phone.trim().length >= 11 ){
                    enabledButton();
                }else {
                    disabledButton();
                }
                break;
            case "send_birthday":
        }
    }, 200);
});

$(function () {
    function onProcessPaymentSuccess(response) {
        if(response.data) {
            if (response.data.reference) {
                $("#reference").val(response.data.reference);
            }
            var amount = $("#amount").val();
            var amountInNaira = amount/100;
            $("#amountLabel").html(formatCurrency(amountInNaira));
            commonSuccessResponse(response);
        }else {
            notificationMessage(response, "error");
        }
    }

    var requestData = {
        "email": $("#email").val(),
        "amount":$("#amount").val(),
        "merchant_reference":$("#merchant_reference").val(),
        "card":{
            "cvv":$("#cvv").val(),
            "number":$("#number").val(),
            "expiry_month":$("#expiry_month").val(),
            "expiry_year":$("#expiry_year").val()
        },
        "metadata":null
    };

    RestService.showLoader = true;
    RestService.executeCreate("/initiate", requestData, onProcessPaymentSuccess);
});

$(function () {
    var form = $('#form-wrapper-id');
    form.submit(function (e) {
        e.preventDefault();
        function onSuccess(response) {
            if(response.data) {
                commonSuccessResponse(response);
            }else {
                notificationMessage(response, "error");
            }
        }

        RestService.action = ".btn-submit";

        var nextUrl = getNextUrl();

        var url = "";

        var request = {"reference" : $("#reference").val()};

        switch (nextUrl){
            case "send_otp":
                request["otp"] = $("input[name='otp']").val();
                url = "/send-otp";
                break;
            case "send_pin":
                var pin = "";
                $('input.input-pin').each(function(index, obj){
                    pin = pin + $(this).val();
                });
                request["pin"] = pin;
                url = "/send-pin";
                break;
            case "send_phone":
                request["phone"] = $("input[name='phone']").val();
                url = "/send-phone";
                break;
            case "send_birthday":
                request["birthday"] = $("input[name='birthday']").val();
                url = "/send-birthday";
                break;
        }

        $("input[name='otp']").val('');
        $("div input.input-pin").val('');

        RestService.executeCreate(url, request, onSuccess);
    });
});

function getNextUrl() {
    return $("#next-webservice-url").val();
}

function hide(array) {
    $.each(array, function(index, value) {
        $(value).css({"display":"none"});
    });
}

function hideAll() {
    hide(['.step']);
}

function show(array) {
    $.each(array, function(index, value) {
        $(value).css({"display":"block"});
    });
}

function showPin() {
    show(["#pin"]);
}

function showPhone() {
    show(["#phone"]);
}

function showOTP() {
    show(["#otp"]);
}

function showMainContainer() {
    show(["#main-container"]);
}

function showActionButton() {
    show(["#action-button"]);
}

function showSuccessSection() {
    show(["#success-section", "#redirect-section"]);
}

function onlyOTP() {
    showOTP();
    showActionButton();
}

function onlyPhone() {
    showPhone();
    showActionButton();
}

function onlyPin() {
    showPin();
    showActionButton();
}

function cancel() {
    $("#vpc_Message").val("Cancelled by user");
    $("#vpc_Status").val(6); //Cancelled
    triggerRedirect();
}