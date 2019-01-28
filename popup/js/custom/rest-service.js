
var RestService = {
    
    baseUrl: function(){
        var fullPath = window.location.href;
        var urlArray = fullPath.split("/");
        return urlArray[0] + "//" + urlArray[2];
    },
    
    hasError:false,
    showLoader:false,
    showSmallLoader:false,
    requestExtra:{},
    json:{},
    headers:{
        "Authorization": "",
        "Api-Key": "",
        "gateway": $("#gateway").val()
    },
    controllerUrl:"",
    requestData:{},
    action:"",
    modal:"",
    type:"POST",
    controllerPathPrefix: "",
    
    error: function (data, msg, xhr) {
        var errors = data.responseJSON;
        var firstKey = Object.keys(errors)[0];
        alertNoty("error", errors[firstKey]);
        RestService.reEnableButton(); 
    },   
    
    hideModal: function(ele) {
        $(ele).css("display", "none");
    },
    
    queryPost:function(url, requestData, success, error) {
        $.ajax({
            url: url,
            type: this.type,
            data: JSON.stringify(requestData),
            contentType: "application/json",
            headers: this.headers,
            cache: false,
            dataType: "json",
            success: success,
            error: !error || !jQuery.isFunction(error) ? this.error : error
        });
    },
    
    queryGet:function(url, requestData, success, error) {
        $.ajax({
            url: url,
            type: this.type,
            data: requestData,
            headers: this.headers,
            success: success,
            error: !error || !jQuery.isFunction(error) ? this.error : error
        });
    },
    
    reEnableButton: function(){
        if(RestService.action){
            if($(RestService.action).hasClass("disabledbutton")){
                $(RestService.action).removeClass("disabledbutton");
                $(RestService.action).html(RestService.content);
                RestService.content = "";
            }else {
                $(RestService.action).prop("disabled", false);
                $(RestService.action).html(RestService.initialContent);
            }
            if(RestService.showSmallLoader === true){
                RestService.showSmallLoader = false;
            }
        }
    },
    
    disableButton: function(){
        if(this.action){
            if($(RestService.action).hasClass("disabledbutton")){
                //TODO
            }else {                
                RestService.initialContent = $(RestService.action).html();
                if(RestService.showSmallLoader === true){
                    $(RestService.action).html("<span class='fa fa-spinner fa-spin'></span>");
                }else{
                    $(RestService.action).html("<span class='fa fa-spinner fa-spin'></span> Processing<span class=\"dots\"></span>");
                }                
                $(RestService.action).prop("disabled", true);
            }
        }
    },
    
    showCenterLoadingGif: function () {
        $(".loading-indicator").css("display", "block");
    },

    hideCenterLoadingGif: function () {
        $(".loading-indicator").css("display", "none");
    },
    
    execute:function (controllerUrl, selector, onSuccessCallback, onErrorCallback) {      
        if(!controllerUrl){console.log("controllerUrl cannot be null"); return;}
        if(!onSuccessCallback){console.log("onSuccessCallback cannot be null"); return;}
        if(!jQuery.isFunction(onSuccessCallback)){console.log("onSuccessCallback must be a function"); return;}
        if(onErrorCallback && !jQuery.isFunction(onErrorCallback)){console.log("onErrorCallback must be a function"); return;}
       
        /**
         * This allow for selector/payload to be passed, or inject request param
         */
        if(typeof selector === 'object'){
            this.requestData = selector;
        }else if (selector === ""){
            this.requestData = {};
        } else {
            this.requestData = this.getRequestData(selector);
        }

        if(this.hasError){
            return;
        }

        var request = this.requestData;
        
        if(this.showLoader) {
            RestService.showCenterLoadingGif();
        }
        
        RestService.disableButton();

        var onSuccess = function(response) {
            if(RestService.showLoader) {
                RestService.hideCenterLoadingGif();
                RestService.showLoader = false;
            }

            RestService.reEnableButton();

            if(RestService.modal){                
                hideCustomModal(RestService.modal);
            }

            RestService.modal = "";
            RestService.action = "";
            RestService.initialContent = "";

            RestService.controllerUrl = "";
            RestService.requestExtra = {};
            
            if( jQuery.isFunction(onSuccessCallback) ){
                onSuccessCallback(response);
            }else {
                console.log("onSuccessCallback not a valid function");
            }            
        };
        
        if(this.type === "GET"){
            this.queryGet(RestService.baseUrl() + this.controllerPathPrefix + controllerUrl, request, onSuccess, onErrorCallback);
        }else {
            this.queryPost(RestService.baseUrl() + this.controllerPathPrefix + controllerUrl, request, onSuccess, onErrorCallback);
        }
    },
    
    executeGet:function (controllerUrl, selector, onSuccessCallback, OnError) {
        this.type = "GET";
        this.execute(controllerUrl, selector, onSuccessCallback, OnError);
    },

    executeCreate:function (controllerUrl, selector, onSuccessCallback, OnError) {
        this.type = "POST";
        this.execute(controllerUrl, selector, onSuccessCallback, OnError);
    },

    executeUpdate:function (controllerUrl, selector, onSuccessCallback, OnError) {
        this.type = "PUT";
        this.execute(controllerUrl, selector, onSuccessCallback, OnError);
    },

    executeDelete:function (controllerUrl, selector, onSuccessCallback, OnError) {
        this.type = "DELETE";
        this.execute(controllerUrl, selector, onSuccessCallback, OnError);
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
            
            if($(this).attr("type") === "checkbox"){
                if($(this).prop('checked')){
                    var size = $(selector).find("input[name='" + $(this).attr("name") + "']").size();
                    if(size > 1){
                        if(typeof requestData[$(this).attr("name")] === "undefined"){                            
                            requestData[ "" + $(this).attr("name") + ""] = new Array();
                        }
                        requestData[$(this).attr("name")].push($(this).val());
                    }else{
                        requestData[ $(this).attr("name") ] = $(this).val();
                    }
                }
            }else if($(this).attr("type") === "radio"){
                if($(this).is(':checked')){
                    requestData[ $(this).attr("name") ] = $(this).val();
                }
            }else{
                requestData[ $(this).attr("name") ] = $(this).val();
            }
        });
        return requestData;
    }
};