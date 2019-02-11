
var RestService = {
    CREATE:"create",
    UPDATE:"update",
    TOGGLE:"toggle",
    RESET:"reset",
    DELETE:"delete",
    pageSize:1000000,
    hasError:false,
    showLoader:true,
    requestExtra:{},
    webserviceUrl:"",
    controllerUrl:"",
    requestData:{},
    action:"",
    modal:"",
    type:"POST",
    controllerPathPrefix:"/web-services",
    content:"",

    error:function (response) {
        console.log("Error occurred :: ", response);
    },

    beforeSend:function (request) {
        request.setRequestHeader($("meta[name='_csrf_header']").attr("content"), $("meta[name='_csrf']").attr("content"));
    },

    hasErrors:function (serverResponse) {

        if(serverResponse.status === false || serverResponse.status === "false"){

            if(serverResponse["status_code"] === 401){
                location.href = getUrl("/logout");
            }else if(serverResponse["status_code"] === 1400){
                var obj = serverResponse["validation"];
                /**
                 * Alert the first value of validation object
                 */
                alertNoty("error", obj[Object.keys(obj)[0]]);
            }else {
                var message = "" + serverResponse.message;

                if(!serverResponse.message || message === "undefined" || message.trim() === "" ){
                    alertNoty("error", "Web-service not responding, try again.");
                }else {
                    alertNoty("error", serverResponse.message);
                }
            }

            return true;
        }else {
            return false;
        }
    },

    query:function(controllerUrl, requestData, success, error) {
        $.ajax({
            url: controllerUrl,
            type: this.type,
            data: requestData,
            beforeSend: this.beforeSend,
            success: success,
            error: !error || !jQuery.isFunction(error) ? this.error : error
        });
    },

    buildSimpleRequest:function (data) {
        var simpleRequest = {};
        if(!data){data={};}
        if (data.hasOwnProperty("data")) {
            return data;
        }else {
            simpleRequest = {};
            simpleRequest["data"] = data;
            simpleRequest["paginate"] = !RestService.requestExtra["page_size"] ? "50" : RestService.requestExtra["page_size"];
        }
        return simpleRequest;
    },

    getRequestData:function(selector){
        var requestData = {};
        $(selector).find('input, textarea, select').each(function () {
            if($(this).hasAttr("required")){
                if($(this).hasAttr("multiple")){
                    if( $(this).val() ){
                        RestService.hasError = true;
                        $(this).css("border", "1px solid red");
                        $(this).closest("div.form-group").find(".select2-selection").css("border", "1px solid red");

                    }else {
                        $(this).css("border", "2px solid #E8E8E8");
                        $(this).closest("div.form-group").find(".select2-selection").css("border", "2px solid #E8E8E8");
                        RestService.hasError = false;
                    }
                    $(this).closest("div.form-group").find(".select2-search__field").css("border", "0px solid #E8E8E8");
                }else {
                    if( !$(this).val() || $(this).val() === "" ){
                        RestService.hasError = true;
                        $(this).css("border", "1px solid red");
                        $(this).closest("div.form-group").find(".select2-selection").css("border", "1px solid red");
                    }else {
                        $(this).css("border", "2px solid #E8E8E8");
                        $(this).closest("div.form-group").find(".select2-selection").css("border", "2px solid #E8E8E8");
                        RestService.hasError = false;
                    }
                }
            }
            requestData[ $(this).attr("name") ] = $(this).val();
        });
        return requestData;
    },

    execute:function (webserviceUrl, controllerUrl, selector, onSuccessCallback, onErrorCallback) {
        if(!webserviceUrl){console.log("webserviceUrl cannot be null"); return;}
        if(!controllerUrl){console.log("controllerUrl cannot be null"); return;}
        if(!onSuccessCallback){console.log("onSuccessCallback cannot be null"); return;}
        if(!jQuery.isFunction(onSuccessCallback)){console.log("onSuccessCallback must be a function"); return;}
        if(onErrorCallback && !jQuery.isFunction(onErrorCallback)){console.log("onErrorCallback must be a function"); return;}

        this.webserviceUrl = webserviceUrl;
        this.controllerUrl = controllerUrl;
        /**
         * This allow for selector/payload to be passed, or inject request param
         */
        var filter = "";
        if(typeof selector === 'object'){
            this.requestData = selector;
            if ('filter' in selector){
                filter = selector['filter'];
            }
        }else if (selector === ""){
            this.requestData = {};
        } else {
            this.requestData = this.getRequestData(selector);
        }

        if(this.hasError){
            return;
        }

        var request = { paramString : JSON.stringify(this.buildSimpleRequest(this.requestData)), url : this.webserviceUrl };

        if(filter !== ""){
            request["filter"] = filter;
            filter = "";
        }

        if(this.showLoader) {
            showCenterLoadingGif();
        }

        if(this.action){
            if($(RestService.action).hasClass("disabledbutton")){
                //TODO
            }else {
                this.initialContent = $(this.action).html();
                $(this.action).html("<span class='fa fa-spinner fa-spin'></span> Please wait...");
                $(this.action).prop("disabled", true);
            }
        }

        var onSuccess = function(data) {
            if(RestService.showLoader) {
                hideCenterLoadingGif();
            }else {
                RestService.showLoader = true;
            }

            if(RestService.action){
                if($(RestService.action).hasClass("disabledbutton")){
                    $(RestService.action).removeClass("disabledbutton");
                    $(RestService.action).html(RestService.content);
                    RestService.content = "";
                }else {
                    $(RestService.action).prop("disabled", false);
                    $(RestService.action).html(RestService.initialContent);
                }
            }

            if(RestService.modal){
                $(RestService.modal).hide();
            }

            RestService.modal = "";
            RestService.action = "";
            RestService.initialContent = "";

            RestService.webserviceUrl = "";
            RestService.controllerUrl = "";
            RestService.requestExtra = {};

            var response = JSON.parse(data.feedback);

            if(response.status === false ){
                /**
                 * Unauthorized
                 */
                if(Object.keys(response).length === 1){
                    //location.href = getUrl("/logout");
                }
            }

            if( !RestService.hasErrors(response) ){
                if( jQuery.isFunction(onSuccessCallback) ){
                    onSuccessCallback(response);
                }else {
                    console.log("onSuccessCallback not a valid function");
                }
            }
        };

        this.query(getUrl(controllerUrl), request, onSuccess, onErrorCallback);
    },

    executeGet:function (webserviceUrl, selector, onSuccessCallback, OnError) {
        this.controllerUrl = this.controllerPathPrefix + "/get";
        this.execute(webserviceUrl, this.controllerUrl, selector, onSuccessCallback, OnError);
    },

    executeCreate:function (webserviceUrl, selector, onSuccessCallback, OnError) {
        this.controllerUrl = this.controllerPathPrefix + "/create";
        this.execute(webserviceUrl, this.controllerUrl, selector, onSuccessCallback, OnError);
    },

    executeUpdate:function (webserviceUrl, selector, onSuccessCallback, OnError) {
        this.controllerUrl = this.controllerPathPrefix + "/update";
        this.execute(webserviceUrl, this.controllerUrl, selector, onSuccessCallback, OnError);
    },

    executeDelete:function (webserviceUrl, selector, onSuccessCallback, OnError) {
        this.controllerUrl = this.controllerPathPrefix + "/delete";
        this.execute(webserviceUrl, this.controllerUrl, selector, onSuccessCallback, OnError)
    }
};
