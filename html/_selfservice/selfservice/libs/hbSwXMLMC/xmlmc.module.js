/**
  XMLMC AngularJS Module for Supportworks 8.x
*/

(function() {

'use strict';

var dependencies = [];
angular.module('hbSwXmlmc', dependencies)
  .factory('XMLMCService', XmlmcService);
  XmlmcService.$inject = ['$http','$q','$window','$rootScope'];
  function XmlmcService($http, $q, $window, $rootScope)
  {

    this.serverUrl = '';
    this.Base64 = {
        A:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        decode:function(H){
            H=H.replace(/\s/g,"");
            if(!(/^[a-z0-9\+\/\s]+\={0,2}$/i.test(H))||H.length%4>0){
                throw new Error("Not a base64-encoded string.");
            }
            var G,E,F,D=0,C=[];
            H=H.replace(/\=/g,"");
            while(D<H.length){
                G=this.A.indexOf(H.charAt(D));
                F=D%4;switch(F){
                    case 1:C.push(String.fromCharCode(E<<2|G>>4));
                        break;
                    case 2:C.push(String.fromCharCode((E&15)<<4|G>>2));
                        break;
                    case 3:C.push(String.fromCharCode((E&3)<<6|G));
                        break;
                }
                E=G;D++;
            }
            return C.join("");
        },
        encode:function(H){
            if(/([^\u0000-\u00ff])/.test(H)){
                throw new Error("Can't base64 encode non-ASCII characters.");
            }
            var E=0,G,F,D,C=[];
            while(E<H.length){
                G=H.charCodeAt(E);
                D=E%3;switch(D){
                    case 0:C.push(this.A.charAt(G>>2));
                        break;
                    case 1:C.push(this.A.charAt((F&3)<<4|(G>>4)));
                        break;
                    case 2:C.push(this.A.charAt((F&15)<<2|(G>>6)));
                        C.push(this.A.charAt(G&63));
                        break;
                }
                F=G;E++;
            }
            if(D===0){
                C.push(this.A.charAt((F&3)<<4));
                C.push("==");
            }
            else{
                if(D===1){
                    C.push(this.A.charAt((F&15)<<2));
                    C.push("=");
                }
            }
            return C.join("");
        }
    };

    var Esp = {
        Transport:Transport,
        XmlWriter:XmlWriter,
        MethodCall:MethodCall,
        MethodCallAjaxImplementation:MethodCallAjaxImplementation,
        Base64: this.Base64
    };

    return Esp;

    function Transport(server, xmlmc, dav)
    {

        this.getServerName = function(){
            return server;
        };
        this.getXmlmc = function(){
            return xmlmc;
        };
        this.getDav = function(){
            return dav;
        };
        this.extendBaseUrl = true;
    }


    /**
     * XmlWriter Class
     */
    function XmlWriter(){
        this.xmlDoc = [];

        this.openElement = function(name){
            this.xmlDoc.push("<"+name+">");
        };
        this.closeElement = function(name){
            this.xmlDoc.push("</"+name+">");
        };
        this.textElement = function(name, value){
            this.xmlDoc.push("<"+name+">");
            this.xmlDoc.push(this.prepareForXml(value));
            this.xmlDoc.push("</"+name+">");
        };
        this.getXmlAsString = function(){
            return this.xmlDoc.join("");
        };
        this.prepareForXml = function(value)
        {
            //-- prepare value for xml
            value +="";
            return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        };
    }


    /**
     * XMLMC Method Call Class
     * @param m_transport - object an instance of Esp.Transport
     * @param ajaxImplementation - function that implement ajax call (
     */
    function MethodCall(m_transport){

        m_transport = m_transport || new Transport(":5015/sw/xmlmc", "xmlmc", "dav");
        this.params = [];
        this.addParam = function(name, value){
            var param = {};
            param.name = name;
            param.value = value;
            var me = this;

            if(name instanceof Esp.XmlWriter){
                this.params.push(name.getXmlAsString());
            }
            else if (angular.isArray(value)) {
                angular.forEach(value, function(val) {
                    me.addParam(name, val);
                });
            }
            else if(value===null || typeof value==="undefined"){
                this.params.push(name);
            }
            else{
                if(value instanceof Esp.XmlWriter){
                    value = value.getXmlAsString();
                }
                var returnParam = {
                    "name" : name,
                    "value" : value
                };
                this.params.push(returnParam);
            }
        };

        this.inputData = [];
        this.addData = function(name, value){
            var param = {};
            param.name = name;
            param.value = value;
            var me = this;

            if(name instanceof Esp.XmlWriter){
                this.inputData.push(name.getXmlAsString());
            }
            else if (angular.isArray(value)) {
                angular.forEach(value, function(val) {
                    me.addParam(name, val);
                });
            }
            else if(value===null || typeof value==="undefined"){
                this.inputData.push(name);
            }
            else{
                if(value instanceof Esp.XmlWriter){
                    value = value.getXmlAsString();
                }
                var returnParam = {
                    "name" : name,
                    "value" : value
                };
                this.inputData.push(returnParam);
            }
        };

        this.encodeBase64 = function(value){
          return Esp.Base64.encode(value);
        };

        this.decodeBase64 = function(value){
          return Esp.Base64.decode(value);
        };

        this.addPasswordParam = function(name, value, parent){
            if(!parent){
              parent = this.params;
            } else {
              parent = parent.value;
            }
            if(value===null || typeof value==="undefined"){
                value = [];
            }
            var val = Esp.Base64.encode(value);
            var param = {
                "name" : name,
                "value" : val
            };
            this.params.push(param);
        };

        /**
         * Returns param object as xml
         */
        this.getParam = function(paramObj){
            var code = [];
            code.push("<"+paramObj.name+">");
            var paramValue = paramObj.value;
            if(typeof paramValue!=="object"){
                if(typeof paramValue==="number" || typeof paramValue==="boolean"){
                    paramValue = paramValue.toString();
                }
                paramValue = paramValue.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                code.push(paramValue);
            } else {
                //var keys = Object.keys(paramValue);
                //var paramObjLength = keys.length;
                for (var k in paramValue) {
                    if (paramValue.hasOwnProperty(k)) {
                       var paramChildObj = {};
                       paramChildObj.name = k;
                       paramChildObj.value = paramValue[k];
                       code.push(this.getParam(paramChildObj));
                    }
                }
            }
            code.push("</"+paramObj.name+">");
            return code.join('');
        };

        this.invoke = function(service, method, handlers){

            var me = this;
            var paramObj = {};
            var param = {};
            var paramsLength = 0;
            var paramIndex = 0;
            var body = [];

            body.push("<methodCall service=\""+service+"\" method=\""+method+"\">");
            if(this.params.length>0){
                body.push("<params>");
                paramsLength = this.params.length;
                for ( paramIndex = 0; paramIndex < paramsLength; paramIndex++) {
                    paramObj = this.params[paramIndex];
                    if(paramObj.name===null || typeof paramObj.name==="undefined"){
                        body.push(paramObj);
                    }
                    else{
                        param = me.getParam(paramObj);
                        body.push(param);
                    }
                }
                body.push("</params>");
            }
            this.params = [];

            if(this.inputData.length>0){
                body.push("<data>");
                paramsLength = this.inputData.length;
                for ( paramIndex = 0; paramIndex < paramsLength; paramIndex++) {
                    paramObj = this.inputData[paramIndex];
                    if(paramObj.name===null || typeof paramObj.name==="undefined"){
                        body.push(paramObj);
                    }
                    else{
                        param = me.getParam(paramObj);
                        body.push(param);
                    }
                }
                body.push("</data>");
            }
            this.inputData = [];
            body.push("</methodCall>");
            body = body.join('');
            return Esp.MethodCallAjaxImplementation(body, handlers);
        };
    }

    /**
     * Ajax implementation
     * This is the default behaviour - can override
     */
    function MethodCallAjaxImplementation(body, handlers)
    {
      var swUrl = this.serverUrl + "/sw/xmlmc/";
      var req = {
        method: 'POST',
        url: swUrl,
        port: 5015,
        headers: {
          "Cache-Control":'no-cache',
          'Accept': 'text/json',
          "Accept-Language":'en-GB',
          "Content-Type":'text/xmlmc; charset=UTF-8'
        },
        data: body
      };
      var a = $http(req)
        .then(function(response){
          //XMLMC responded with data string rather than an object - process accordingly
          if (response.status == "200" && angular.isString(response.data)) {
            //Convert XML string to JSON object, replace data output with this
            var x2js = new X2JS();
            var jsonObj = x2js.xml_str2json(response.data);
            response.data = jsonObj;
          }

          var data = response.data.methodCallResult ? response.data.methodCallResult : response.data;

          if(data["@status"]==="ok" || data["@status"] === true || data._status === "ok") {
            // On success, we return the method call result
            if(data.data) {
              handlers.onSuccess(data.data);
            } else {
              handlers.onSuccess(data.params); //, data
            }
          } else {
            // On error we return the error message and the data object
            if(data.state) {
              handlers.onFailure(data.state.error, data.state);
            } else {
              handlers.onFailure(data,null);
            }
          }
        },function(error) {
          handlers.onFailure(error, null);
        });
      return a;
    }
  }

})();
