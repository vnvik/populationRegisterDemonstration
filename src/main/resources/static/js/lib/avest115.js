/*
 * AVEST CryptMail X Web Plugin Javascript Wrapper 1.1.5
 *
 * Copyright 2005-2014 AVEST plc.
 * @author Alexey Dymov <smoke@avest.org>
*/
(function (window, undefined) {
    // our AvCMX object instance
    var instance,
        avcmxInstance,
        windowExists = typeof window === "object" && typeof window.document === "object",
        // object names for inheritance (e.g. Message extends avcmxobject)
        objects = ("Blob Parameters Connection Message Certificates AttributeCertificates " +
            "Certificate AttributeCertificate CRL Requests Request Scep Extension Attribute CertificateStatus NameAttribute Sign SignAttribute").split(" "),
        // messages names for inheritance (e.g. RawMessage extends Message)
        messages = "RawMessage SignedMessage EncryptedMessage".split(" ");

    function extend(target, other) {
        target = target || {};
        for (var prop in other) {
            if (typeof other[prop] === 'object') {
                target[prop] = extend(target[prop], other[prop]);
            } else {
                target[prop] = other[prop];
            }
        }
        return target;
    }

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    /**
     * @class AvCMXError
     * РЎРѕР·РґР°РµС‚ РѕР±СЉРµРєС‚ РёСЃРєР»СЋС‡РµРЅРёСЏ
     * @extends Error
     */

    /**
     * @method constructor
     * @param {Number} nativeCode - РѕСЂРёРіРёРЅР°Р»СЊРЅС‹Р№ РЅР°С‚РёРІРЅС‹Р№ РєРѕРґ РѕС€РёР±РєРё
     */
    function AvCMXError(nativeCode) {
        /**
         * @property {Number}
         * РїСЂРµРѕР±СЂР°Р·РѕРІР°РЅРЅС‹Р№ (РґРѕРєСѓРјРµРЅС‚РёСЂРѕРІР°РЅРЅС‹Р№) РєРѕРґ РѕС€РёР±РєРё
         */
        this.code = AvCMXError.fromNativeCode(nativeCode);
        /**
         * @property {String}
         * С‚РµРєСЃС‚ РѕС€РёР±РєРё
         */
        this.message = instance.GetErrorInformation(nativeCode, 0);
    }

    /**
     * @method lastError
     * Р’РѕР·РІСЂР°С‰Р°РµС‚ РїСЂРµРѕР±СЂР°Р·РѕРІР°РЅРЅС‹Р№ (РґРѕРєСѓРјРµРЅС‚РёСЂРѕРІР°РЅРЅС‹Р№) РєРѕРґ РїРѕСЃР»РµРґРЅРµР№ РїСЂРѕРёР·РѕС€РµРґС€РµР№ РѕС€РёР±РєРё
     * @return {Number}
     * @static
     */
    AvCMXError.lastError = function () {
        if (instance === undefined) {
            return 0;
        }
        var lastError = parseInt(instance.GetLastError());
        return AvCMXError.fromNativeCode(lastError);
    }

    /**
     * @method fromNativeCode
     * РџСЂРµРѕР±СЂР°Р·СѓРµС‚ Рє РґРѕРєСѓРјРµРЅС‚РёСЂРѕРІР°РЅРЅРѕРјСѓ РІРёРґСѓ РїРµСЂРµРґР°РЅРЅС‹Р№ РЅР°С‚РёРІРЅС‹Р№ РєРѕРґ РѕС€РёР±РєРё
     * @param {Number} nativeCode - РЅР°С‚РёРІРЅС‹Р№ РєРѕРґ РѕС€РёР±РєРё
     * @return {Number}
     * @static
     */
    AvCMXError.fromNativeCode = function (nativeCode) {
        if (avcmx.oldActiveX && (((nativeCode >> 16) & 0x1FFF) == 0x014E)) {
            return avcmx.constants.AVCMR_BASE + (nativeCode & 0xFFFF);
        } else {
            return nativeCode;
        }
    }

    /**
     * @method lastErrorIs
     * РџСЂРѕРІРµСЂСЏРµС‚ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓРµС‚ Р»Рё РїСЂРµРѕР±СЂР°Р·РѕРІР°РЅРЅС‹Р№ (РґРѕРєСѓРјРµРЅС‚РёСЂРѕРІР°РЅРЅС‹Р№) РєРѕРґ РїРѕСЃР»РµРґРЅРµР№ РїСЂРѕРёР·РѕС€РµРґС€РµР№ РѕС€РёР±РєРё РїРµСЂРµРґР°РЅРЅРѕРјСѓ
     * @param {Number} error - РєРѕРґ РѕС€РёР±РєРё РґР»СЏ РїСЂРѕРІРµСЂРєРё
     * @return {Boolean}
     * @static
     */
    AvCMXError.lastErrorIs = function (error) {
        return error == AvCMXError.lastError();
    }

    AvCMXError.prototype = new Error();

    // all objects inherit this
    /**
     * @class avcmxobject
     * РђР±СЃС‚СЂР°РєС‚РЅС‹Р№ РѕР±СЉРµРєС‚-РѕР±РµСЂС‚РєР°
     * @abstract
     * @typevar T
     */

    /**
     * @method constructor
     * @param {T} obj - РЅР°С‚РёРІРЅС‹Р№ РѕР±СЉРµРєС‚
     * @private
     */
    function avcmxobject(obj) {
        /**
         * @property {T}
         * РЅР°С‚РёРІРЅС‹Р№ РѕР±СЉРµРєС‚
         * @protected
         */
        this.object = obj;
    }
    avcmxobject.prototype = extend(avcmxobject.prototype, {
        _name: "",

        object: null,

        init: function () {

        },

        /**
         * Р’РѕР·РІСЂР°С‰Р°РµС‚ РЅР°С‚РёРІРЅС‹Р№ РѕР±СЉРµРєС‚
         * @return {T}
         */
        get: function () {
            return this.object;
        },

        stringify: function () {
            var isRoot = this.constructor == avcmx;
            var name = "AvCMX" + (isRoot ? "" : ("." + this._name));
            return "[wrapper " + (avcmx.oldActiveX ||
            /* Browsers allow custom toString for <object> but IE9+ doesnt */ isRoot ? name: this.object.toString()) + "]";
        },

        // helps not to wrap the same native object twice
        factory: function (obj, helper) {
            return this.object === obj ? this : avcmx(obj, helper);
        },

        makeAsync: function (fn) {
            var self = this;
            return function () {
                var wrappedArgs = [];
                var errorCode = arguments[0];
                if (errorCode) {
                    wrappedArgs.push(new AvCMXError(errorCode));
                } else {
                    wrappedArgs.push(undefined);
                }
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        wrappedArgs.push(avcmx(arguments[i]));
                    }
                }
                return fn.apply(self, wrappedArgs);
            };
        }
    });

    // Browsers can extend toString, but IE < 9 cannot
    avcmxobject.prototype.toString = avcmxobject.prototype.stringify;

    avcmx.prototype = new avcmxobject();
    avcmx.prototype.constructor = avcmx;
    // global factory function
    /*
     * РЎРѕР·РґР°РµС‚ РіР»Р°РІРЅС‹Р№ РѕР±СЉРµРєС‚ AvCMX
     * @name avcmx
     * @function
     * @return {avcmx}
     */

    /**
     * @class avcmx
     * РљРѕСЂРЅРµРІРѕР№ РѕР±СЉРµРєС‚
     * @extends avcmxobject.<native.AvCMX>
     * @singleton
     */

    /*
     * РћР±РµСЂС‚РєР° РґР»СЏ РЅР°С‚РёРІРЅС‹С… РѕР±СЉРµРєС‚РѕРІ.
     * @name avcmx
     * @function
     * @param {mixed} obj - РЅР°С‚РёРІРЅС‹Р№ РѕР±СЉРµРєС‚
     * @param {string} [helper] - РїРѕРјРѕС‰РЅРёРє (РґР»СЏ AvCMCOM)
     * @return {avcmxobject}
     */

    /**
     * @method constructor
     * @private
     */
    function avcmx(obj, helper) {
        if (obj !== undefined) {
            if (avcmx.oldActiveX) {
                if (obj.toString && obj.toString().indexOf("IAvCM") == 0) {
                    return new avcmx[obj.toString().substring(5)](obj);
                } else {
                    var detector = {
                        "Blob": "SetAsBase64",
                        "Parameters": "AddParameterWithSpec",
                        "Connection": "CreateMessage",
                        "SignedMessage": "SignsCount",
                        "EncryptedMessage": "Decrypt",
                        "RawMessage": "AppendContent",
                        "Scep": "TransactionId",
                        "Certificates": "QueryCertificates",
                        "Certificate": "GetSubjectNameAttributeByOid",
                        "AttributeCertificate": "HolderCertificate",
                        "CRL": "GetAttribute",
                        "Requests": "QueryRequests",
                        "Request": "MSCACompatible",
                        "Extension": "Critical",
                        "CertificateStatus": "RevocationTime",
                        "Sign": "GetAuthorizedAttributeByOid"/*,
                        "NameAttribute": "xxx",
                        "Attribute": "xxx",
                        "AttributeCertificates": "+",
                        "SignAttribute": "xxx"*/
                    };
                    for (var type in detector) {
                        if (detector[type] in obj) {
                            return new avcmx[type](obj);
                        }
                    }
                    if (helper !== undefined) {
                        return new avcmx[helper](obj);
                    }
                }
            } else {
                if (obj.toString && obj.toString().indexOf("AvCMX.") == 0) {
                    return new avcmx[obj.toString().substring(6)](obj);
                } else {
                    // XXX: return the original object if we cannot wrap it
                    return obj;
                }
            }
        }
        if (avcmxInstance === undefined) {
            avcmxInstance = new avcmx.prototype.init();
        }
        return avcmxInstance;
    }

    // define construtors
    for (var i = 0; i < objects.length; i++) {
        avcmx[objects[i]] = function (obj) {
            avcmxobject.call(this, obj);
        }
        avcmx[objects[i]].prototype = new avcmxobject();
        avcmx[objects[i]].prototype.constructor = avcmx[objects[i]];
        avcmx[objects[i]].prototype._name = objects[i];
    }
    for (var i = 0; i < messages.length; i++) {
        avcmx[messages[i]] = function (obj) {
            avcmx.Message.call(this, obj);
        }
        avcmx[messages[i]].prototype = new avcmx.Message();
        avcmx[messages[i]].prototype.constructor = avcmx[messages[i]];
        avcmx[messages[i]].prototype._name = messages[i];
    }

    avcmx.prototype = extend(avcmx.prototype, {
        init: function () {
            if (!instance) {
                if (windowExists) {
                    instance = document.getElementById("oavcmx");
                }
                if (!instance) {
                    if (avcmx.oldActiveX) {
                        instance = new ActiveXObject("AvCryptMailCOMSystem.AvCryptMailSystem");
                    } else {
                        try {
                            instance = new ActiveXObject("AVEST.AvCMXWebP");
                        } catch (e) {
                            if (e.name == "Error" || e.name == "TypeError") {
                                try {
                                    instance = new ActiveXObject("AvCryptMailCOMSystem.AvCryptMailSystem");
                                    avcmx.oldActiveX = true;
                                } catch (e) { }
                            }
                        }
                    }
                }
            }
            if (!instance) {
                throw new Error('AvCMX document object element not found. Did you forget to add <object id="oavcmx" type="application/x-avcmx-web-plugin" width="0" height="0"></object> to your page?');
            }
            this.object = instance;
            return this;
        },

        /**
         * Р’РѕР·РІСЂР°С‰Р°РµС‚ С‚РµРєСѓС‰СѓСЋ РІРµСЂСЃРёСЋ РєРѕРјРїРѕРЅРµРЅС‚Р°.
         *
         * РџСЂРёРјРµСЂ:
         *
         *     avcmx().version()
         *
         * @return {String}
         */
        version: function () {
            return instance.Version;
        },

        /**
         * РЎРѕР·РґР°РµС‚ РѕР±СЉРµРєС‚ РґР°РЅРЅС‹С….
         *
         * РџСЂРёРјРµСЂ:
         *
         *     avcmx().blob();
         *
         * @param {Number} [flags=0] Р¤Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Blob}
         */
        blob: function (flags) {
            flags = flags || 0;
            return this.factory(instance.CreateBlob(flags));
        },

        /**
         * РЎРѕР·РґР°РµС‚ РѕР±СЉРµРєС‚ РїР°СЂР°РјРµС‚СЂРѕРІ.
         *
         * РџСЂРёРјРµСЂ:
         *
         *     avcmx().params();
         *
         * @param {Number} [flags=0] Р¤Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Parameters}
         */
        params: function (flags) {
            flags = flags || 0;
            return this.factory(instance.CreateParameters(flags));
        },

        /**
         * РЎРѕР·РґР°РµС‚ РєРѕРЅС‚РµРєСЃС‚ Р°РІС‚РѕСЂРёР·Р°С†РёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx#connectionAsync}</b>
         *
         * РђРІС‚РѕСЂРёР·Р°С†РёСЏ СЃ РІС‹РІРѕРґРѕРј РґРёР°Р»РѕРіР° РІС‹Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚Р°:
         *
         *     avcmx().connection();
         *
         * РЎРѕР·РґР°РЅРёРµ СЃРѕРµРґРёРЅРµРЅРёСЏ Р±РµР· Р°РІС‚РѕСЂРёР·Р°С†РёРё:
         *
         *     avcmx().connection(AVCMF_NO_AUTH);
         *
         * РђРІС‚РѕСЂРёР·Р°С†РёСЏ СЃ РїРµСЂРµРґР°С‡РµР№ РїР°СЂР°РјРµС‚СЂР° РїР°СЂРѕР»СЏ Рє РєРѕРЅС‚РµР№РЅРµСЂСѓ:
         *
         *     avcmx().connection(avcmx().params().add(AVCM_PASSWORD, "12345678"));
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РїР°СЂР°РјРµС‚СЂС‹:
         *
         * - <b>AVCM_DB_CONNECTSTR</b> вЂ“ СЃС‚СЂРѕРєР° ADO ConnectString РґР»СЏ СЃРѕРµРґРёРЅРµРЅРёСЏ СЃ Р±Р°Р·РѕР№.
         * - <b>AVCM_PUB_KEY_ID</b> вЂ“ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°
         * РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ, С‡СЊРёРј Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР° Р°РІС‚РѕСЂРёР·Р°С†РёСЏ. Р•СЃР»Рё СЌС‚РѕС‚
         * РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ СЃРёСЃС‚РµРјР° РІС‹РґР°СЃС‚ РѕРєРЅРѕ СЃРѕ СЃРїРёСЃРєРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
         * РґР»СЏ РІС‹Р±РѕСЂР° С‚РѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°, РїСЂРё РїРѕРјРѕС‰Рё РєРѕС‚РѕСЂРѕРіРѕ Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР°
         * Р°РІС‚РѕСЂРёР·Р°С†РёСЏ.
         * - <b>AVCM_COMMON_NAME</b> вЂ“ Р°С‚СЂРёР±СѓС‚ CommonName СЃСѓР±СЉРµРєС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°
         * РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ, С‡СЊРёРј Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР° Р°РІС‚РѕСЂРёР·Р°С†РёСЏ. Р•СЃР»Рё СЌС‚РѕС‚
         * РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ СЃРёСЃС‚РµРјР° РІС‹РґР°СЃС‚ РѕРєРЅРѕ СЃРѕ СЃРїРёСЃРєРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
         * РґР»СЏ РІС‹Р±РѕСЂР° С‚РѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°, РїСЂРё РїРѕРјРѕС‰Рё РєРѕС‚РѕСЂРѕРіРѕ Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР°
         * Р°РІС‚РѕСЂРёР·Р°С†РёСЏ.
         * - <b>AVCM_PASSWORD</b> вЂ“ РїР°СЂРѕР»СЊ РґРѕСЃС‚СѓРїР° Рє РєРѕРЅС‚РµР№РЅРµСЂСѓ Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№. Р•СЃР»Рё РІ
         * РїРµСЂСЃРѕРЅР°Р»СЊРЅРѕРј СЃРїСЂР°РІРѕС‡РЅРёРєРµ С‚РѕР»СЊРєРѕ РѕРґРёРЅ СЃРµСЂС‚РёС„РёРєР°С‚, С‚Рѕ СЃРёСЃС‚РµРјР° РїСЂРѕРёР·РІРµРґРµС‚
         * РїРѕРїС‹С‚РєСѓ Р°РІС‚РѕСЂРёР·Р°С†РёРё СЃ СЌС‚РёРј СЃРµСЂС‚С„РёРєР°С‚РѕРј, РЅРµ РѕС‚РѕР±СЂР°Р¶Р°СЏ РѕРєРЅРѕ РІС‹Р±РѕСЂР° Р»РёС‡РЅРѕРіРѕ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * - <b>AVCM_MSG_INI</b> вЂ“ СЃРѕРґРµСЂР¶РёРјРѕРµ РєРѕРЅС„РёРіСѓСЂР°С†РёРѕРЅРЅРѕРіРѕ С„Р°Р№Р»Р° AvCmMsg.ini. Р”Р°РЅРЅС‹Р№
         * РїР°СЂР°РјРµС‚СЂ РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓС‚РѕС‡РЅРµРЅРёСЏ РЅРµРєРѕС‚РѕСЂС‹С… РѕРїС†РёР№ РєРѕРЅС„РёРіСѓСЂР°С†РёРё, РЅР°РїСЂРёРјРµСЂ,
         * С‚РёРї РєСЂРёРїС‚РѕРїСЂРѕРІР°Р№РґРµСЂР° РёР»Рё Р°РіР»РѕСЂРёС‚РјС‹ Р­Р¦Рџ.
         *
         * РќР° РґР°РЅРЅС‹Р№ РїРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_NO_AUTH</b> вЂ“ РїРѕРґРєР»СЋС‡РµРЅРёРµ Р±РµР· Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ.
         * РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ СЃРµСЃСЃРёРё Р±РµР· РѕС‚РєСЂС‹С‚РёСЏ РєРѕРЅС‚РµР№РЅРµСЂР° Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№ Рё РїРѕРёСЃРєР° Р»РёС‡РЅРѕРіРѕ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р°. РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ С‚Р°РєРѕР№ СЃРµСЃСЃРёРё РґР»СЏ РѕРїРµСЂР°С†РёР№, С‚СЂРµР±СѓСЋС‰РёС… РЅР°Р»РёС‡РёСЏ
         * Р»РёС‡РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° Рё РєРѕРЅС‚РµР№РЅРµСЂР° Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№, РЅРµРІРѕР·РјРѕР¶РЅРѕ
         * - <b>AVCMF_FORCE_TOKEN_CONTROL</b> вЂ“ РєРѕРЅС‚СЂРѕР»СЊ РЅР°Р»РёС‡РёСЏ РІСЃС‚Р°РІР»РµРЅРЅРѕРіРѕ
         * РЅРѕСЃРёС‚РµР»СЏ СЃ Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј
         * - <b>AVCMF_DENY_TOKEN_CONTROL</b> вЂ“ Р·Р°РїСЂРµС‚ РєРѕРЅС‚СЂРѕР»СЏ РЅР°Р»РёС‡РёСЏ РІСЃС‚Р°РІР»РµРЅРЅРѕРіРѕ
         * РЅРѕСЃРёС‚РµР»СЏ СЃ Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј
         * - <b>AVCMF_IGNORE_CRL_ABSENCE</b> вЂ“ РёРіРЅРѕСЂРёСЂРѕРІР°С‚СЊ РѕС‚СЃСѓС‚СЃС‚РІРёРµ РЎРћРЎ.
         *
         * Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ РѕС€РёР±РѕРє:
         *
         * - <b>AVCMR_SUCCESS</b> вЂ“ СѓСЃРїРµС€РЅРѕРµ РїРѕРґРєР»СЋС‡РµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
         * - <b>AVCMR_CONTAINER_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅ РєРѕРЅС‚РµР№РЅРµСЂ СЃ Р»РёС‡РЅС‹РјРё РєР»СЋС‡Р°РјРё РЅР° РЅРѕСЃРёС‚РµР»Рµ
         * - <b>AVCMR_DEVICE_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅ РЅРѕСЃРёС‚РµР»СЊ
         * - <b>AVCMR_BAD_PASSWORD</b> вЂ“ РїР°СЂРѕР»СЊ РЅРµРІРµСЂРµРЅ
         * - <b>AVCMR_NO_DB_PARAMS</b> вЂ“ РЅРµ СѓРєР°Р·Р°РЅС‹ РїР°СЂР°РјРµС‚СЂС‹ РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
         * - <b>AVCMR_DB_NOT_FOUND</b> вЂ“ РЅРµРІРѕР·РјРѕР¶РЅРѕ РїРѕРґРєР»СЋС‡РёС‚СЃСЏ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
         * - <b>AVCMR_CERT_STORE_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅРѕ РёР»Рё РїСѓСЃС‚Рѕ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         * - <b>AVCMR_CERT_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅ Р»РёС‡РЅС‹Р№ СЃРµСЂС‚РёС„РёРєР°С‚
         * - <b>AVCMR_BAD_FLAGS</b> вЂ“ С„СѓРЅРєС†РёРё РїРµСЂРµРґР°РЅС‹ РЅРµРІРµСЂРЅС‹Рµ С„Р»Р°РіРё
         * - <b>AVCMR_BAD_PARAM</b> вЂ“ РїР°СЂР°РјРµС‚СЂ С„СѓРЅРєС†РёРё РЅРµРІРµСЂРµРЅ
         * - <b>AVCMR_TOKEN_NOT_FOUND</b> вЂ“ РЅРѕСЃРёС‚РµР»СЊ СЃ Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј РЅРµ СѓСЃС‚Р°РЅРѕРІР»РµРЅ
         *
         * @param {avcmx.Parameters} [params] РїР°СЂР°РјРµС‚СЂС‹ РёРґРµРЅС‚РёС„РёРєР°С†РёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ Рё РїР°СЂР°РјРµС‚СЂС‹ РїРѕРґРєР»СЋС‡РµРЅРёСЏ.
         * @param {Number} [flags=0] С„Р»Р°РіРё, СЂРµР¶РёРјС‹ РїРѕРґРєР»СЋС‡РµРЅРёСЏ.
         * @return {avcmx.Connection}
         * @deprecated 1.1.1 Р—Р°РјРµРЅРµРЅ РЅР° {@link avcmx#connectionAsync}
         */
        connection: function (params, flags) {
            if (flags === undefined) flags = (typeof params === "number" ? params : 0);
            params = (!params || (params === flags)) ? instance.CreateParameters(0) : params.get();
            return this.factory(instance.CreateConnection(params, flags));
        },

        /**
         * РЎРѕР·РґР°РµС‚ РєРѕРЅС‚РµРєСЃС‚ Р°РІС‚РѕСЂРёР·Р°С†РёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ.
         *
         * РђРІС‚РѕСЂРёР·Р°С†РёСЏ СЃ РІС‹РІРѕРґРѕРј РґРёР°Р»РѕРіР° РІС‹Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚Р°:
         *
         *     avcmx().connectionAsync(function (e, conn) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј conn
         *     );
         *
         * РЎРѕР·РґР°РЅРёРµ СЃРѕРµРґРёРЅРµРЅРёСЏ Р±РµР· Р°РІС‚РѕСЂРёР·Р°С†РёРё:
         *
         *     avcmx().connectionAsync(AVCMF_NO_AUTH, function (e, conn) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј conn
         *     );
         *
         * РђРІС‚РѕСЂРёР·Р°С†РёСЏ СЃ РїРµСЂРµРґР°С‡РµР№ РїР°СЂР°РјРµС‚СЂР° РїР°СЂРѕР»СЏ Рє РєРѕРЅС‚РµР№РЅРµСЂСѓ:
         *
         *     avcmx().connectionAsync(avcmx().params().add(AVCM_PASSWORD, "12345678"), function (e, conn) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј conn
         *     );
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РїР°СЂР°РјРµС‚СЂС‹:
         *
         * - <b>AVCM_DB_CONNECTSTR</b> вЂ“ СЃС‚СЂРѕРєР° ADO ConnectString РґР»СЏ СЃРѕРµРґРёРЅРµРЅРёСЏ СЃ Р±Р°Р·РѕР№.
         * - <b>AVCM_PUB_KEY_ID</b> вЂ“ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°
         * РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ, С‡СЊРёРј Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР° Р°РІС‚РѕСЂРёР·Р°С†РёСЏ. Р•СЃР»Рё СЌС‚РѕС‚
         * РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ СЃРёСЃС‚РµРјР° РІС‹РґР°СЃС‚ РѕРєРЅРѕ СЃРѕ СЃРїРёСЃРєРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
         * РґР»СЏ РІС‹Р±РѕСЂР° С‚РѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°, РїСЂРё РїРѕРјРѕС‰Рё РєРѕС‚РѕСЂРѕРіРѕ Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР°
         * Р°РІС‚РѕСЂРёР·Р°С†РёСЏ.
         * - <b>AVCM_COMMON_NAME</b> вЂ“ Р°С‚СЂРёР±СѓС‚ CommonName СЃСѓР±СЉРµРєС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°
         * РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ, С‡СЊРёРј Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР° Р°РІС‚РѕСЂРёР·Р°С†РёСЏ. Р•СЃР»Рё СЌС‚РѕС‚
         * РїР°СЂР°РјРµС‚СЂ РЅРµ СѓРєР°Р·Р°РЅ, С‚Рѕ СЃРёСЃС‚РµРјР° РІС‹РґР°СЃС‚ РѕРєРЅРѕ СЃРѕ СЃРїРёСЃРєРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
         * РґР»СЏ РІС‹Р±РѕСЂР° С‚РѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°, РїСЂРё РїРѕРјРѕС‰Рё РєРѕС‚РѕСЂРѕРіРѕ Р±СѓРґРµС‚ РїСЂРѕРёР·РІРµРґРµРЅР°
         * Р°РІС‚РѕСЂРёР·Р°С†РёСЏ.
         * - <b>AVCM_PASSWORD</b> вЂ“ РїР°СЂРѕР»СЊ РґРѕСЃС‚СѓРїР° Рє РєРѕРЅС‚РµР№РЅРµСЂСѓ Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№. Р•СЃР»Рё РІ
         * РїРµСЂСЃРѕРЅР°Р»СЊРЅРѕРј СЃРїСЂР°РІРѕС‡РЅРёРєРµ С‚РѕР»СЊРєРѕ РѕРґРёРЅ СЃРµСЂС‚РёС„РёРєР°С‚, С‚Рѕ СЃРёСЃС‚РµРјР° РїСЂРѕРёР·РІРµРґРµС‚
         * РїРѕРїС‹С‚РєСѓ Р°РІС‚РѕСЂРёР·Р°С†РёРё СЃ СЌС‚РёРј СЃРµСЂС‚С„РёРєР°С‚РѕРј, РЅРµ РѕС‚РѕР±СЂР°Р¶Р°СЏ РѕРєРЅРѕ РІС‹Р±РѕСЂР° Р»РёС‡РЅРѕРіРѕ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * - <b>AVCM_MSG_INI</b> вЂ“ СЃРѕРґРµСЂР¶РёРјРѕРµ РєРѕРЅС„РёРіСѓСЂР°С†РёРѕРЅРЅРѕРіРѕ С„Р°Р№Р»Р° AvCmMsg.ini. Р”Р°РЅРЅС‹Р№
         * РїР°СЂР°РјРµС‚СЂ РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓС‚РѕС‡РЅРµРЅРёСЏ РЅРµРєРѕС‚РѕСЂС‹С… РѕРїС†РёР№ РєРѕРЅС„РёРіСѓСЂР°С†РёРё, РЅР°РїСЂРёРјРµСЂ,
         * С‚РёРї РєСЂРёРїС‚РѕРїСЂРѕРІР°Р№РґРµСЂР° РёР»Рё Р°РіР»РѕСЂРёС‚РјС‹ Р­Р¦Рџ.
         *
         * РќР° РґР°РЅРЅС‹Р№ РїРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_NO_AUTH</b> вЂ“ РїРѕРґРєР»СЋС‡РµРЅРёРµ Р±РµР· Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ.
         * РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ СЃРµСЃСЃРёРё Р±РµР· РѕС‚РєСЂС‹С‚РёСЏ РєРѕРЅС‚РµР№РЅРµСЂР° Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№ Рё РїРѕРёСЃРєР° Р»РёС‡РЅРѕРіРѕ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р°. РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ С‚Р°РєРѕР№ СЃРµСЃСЃРёРё РґР»СЏ РѕРїРµСЂР°С†РёР№, С‚СЂРµР±СѓСЋС‰РёС… РЅР°Р»РёС‡РёСЏ
         * Р»РёС‡РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° Рё РєРѕРЅС‚РµР№РЅРµСЂР° Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№, РЅРµРІРѕР·РјРѕР¶РЅРѕ
         * - <b>AVCMF_FORCE_TOKEN_CONTROL</b> вЂ“ РєРѕРЅС‚СЂРѕР»СЊ РЅР°Р»РёС‡РёСЏ РІСЃС‚Р°РІР»РµРЅРЅРѕРіРѕ
         * РЅРѕСЃРёС‚РµР»СЏ СЃ Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј
         * - <b>AVCMF_DENY_TOKEN_CONTROL</b> вЂ“ Р·Р°РїСЂРµС‚ РєРѕРЅС‚СЂРѕР»СЏ РЅР°Р»РёС‡РёСЏ РІСЃС‚Р°РІР»РµРЅРЅРѕРіРѕ
         * РЅРѕСЃРёС‚РµР»СЏ СЃ Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј
         * - <b>AVCMF_IGNORE_CRL_ABSENCE</b> вЂ“ РёРіРЅРѕСЂРёСЂРѕРІР°С‚СЊ РѕС‚СЃСѓС‚СЃС‚РІРёРµ РЎРћРЎ.
         *
         * Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ РѕС€РёР±РѕРє:
         *
         * - <b>AVCMR_SUCCESS</b> вЂ“ СѓСЃРїРµС€РЅРѕРµ РїРѕРґРєР»СЋС‡РµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
         * - <b>AVCMR_CONTAINER_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅ РєРѕРЅС‚РµР№РЅРµСЂ СЃ Р»РёС‡РЅС‹РјРё РєР»СЋС‡Р°РјРё РЅР° РЅРѕСЃРёС‚РµР»Рµ
         * - <b>AVCMR_DEVICE_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅ РЅРѕСЃРёС‚РµР»СЊ
         * - <b>AVCMR_BAD_PASSWORD</b> вЂ“ РїР°СЂРѕР»СЊ РЅРµРІРµСЂРµРЅ
         * - <b>AVCMR_NO_DB_PARAMS</b> вЂ“ РЅРµ СѓРєР°Р·Р°РЅС‹ РїР°СЂР°РјРµС‚СЂС‹ РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
         * - <b>AVCMR_DB_NOT_FOUND</b> вЂ“ РЅРµРІРѕР·РјРѕР¶РЅРѕ РїРѕРґРєР»СЋС‡РёС‚СЃСЏ Рє Р±Р°Р·Рµ РґР°РЅРЅС‹С…
         * - <b>AVCMR_CERT_STORE_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅРѕ РёР»Рё РїСѓСЃС‚Рѕ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         * - <b>AVCMR_CERT_NOT_FOUND</b> вЂ“ РЅРµ РЅР°Р№РґРµРЅ Р»РёС‡РЅС‹Р№ СЃРµСЂС‚РёС„РёРєР°С‚
         * - <b>AVCMR_BAD_FLAGS</b> вЂ“ С„СѓРЅРєС†РёРё РїРµСЂРµРґР°РЅС‹ РЅРµРІРµСЂРЅС‹Рµ С„Р»Р°РіРё
         * - <b>AVCMR_BAD_PARAM</b> вЂ“ РїР°СЂР°РјРµС‚СЂ С„СѓРЅРєС†РёРё РЅРµРІРµСЂРµРЅ
         * - <b>AVCMR_TOKEN_NOT_FOUND</b> вЂ“ РЅРѕСЃРёС‚РµР»СЊ СЃ Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј РЅРµ СѓСЃС‚Р°РЅРѕРІР»РµРЅ
         *
         * @param {avcmx.Parameters} [params] РїР°СЂР°РјРµС‚СЂС‹ РёРґРµРЅС‚РёС„РёРєР°С†РёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ Рё РїР°СЂР°РјРµС‚СЂС‹ РїРѕРґРєР»СЋС‡РµРЅРёСЏ.
         * @param {Number} [flags=0] С„Р»Р°РіРё, СЂРµР¶РёРјС‹ РїРѕРґРєР»СЋС‡РµРЅРёСЏ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕР·РґР°РЅРЅРѕРіРѕ СЃРѕРµРґРёРЅРµРЅРёСЏ РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.Connection} fn.conn РѕР±СЉРµРєС‚ СЃРѕРµРґРёРЅРµРЅРёСЏ, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        connectionAsync: function (params, flags, fn) {
            if (isFunction(fn)) params = params.get();
            else {
                if (isFunction(flags)) {
                    fn = flags;
                    flags = (typeof params === "number" ? params : 0);
                    params = (!params || (params === flags)) ? instance.CreateParameters(0) : params.get();
                } else {
                    fn = params;
                    flags = 0;
                    params = instance.CreateParameters(0);
                }
            }
            this.object.CreateConnectionAsync(params, flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РҐРµС€РёСЂРѕРІР°РЅРёРµ РґР°РЅРЅС‹С… СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј Р·Р°РґР°РЅРЅРѕРіРѕ Р°Р»РіРѕСЂРёС‚РјР°.
         *
         * Р•СЃР»Рё СѓРєР°Р·Р°РЅРЅС‹Р№ Р°Р»РіРѕСЂРёС‚Рј РЅРµРґРѕСЃС‚СѓРїРµРЅ РІ СЃРёСЃС‚РµРјРµ (РЅРµ СѓСЃС‚Р°РЅРѕРІР»РµРЅ РєСЂРёРїС‚РѕРїСЂРѕРІР°Р№РґРµСЂ РїРѕРґРґРµСЂР¶РёРІР°СЋС‰РёР№ РґР°РЅРЅС‹Р№ Р°Р»РіРѕСЂРёС‚Рј)
         * Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅР° РѕС€РёР±РєР° "РЈРєР°Р·Р°РЅ РЅРµРїСЂР°РІРёР»СЊРЅС‹Р№ Р°Р»РіРѕСЂРёС‚Рј."
         *
         * РҐРµС€РёСЂРѕРІР°РЅРёРµ РґР°РЅРЅС‹С… РёСЃРїРѕР»СЊР·СѓСЏ Р°Р»РіРѕСЂРёС‚Рј РЎРўР‘ 34.101.31
         *
         *     avcmx().hash(avcmx().blob().text("abcd"), "1.3.6.1.4.1.12656.1.42").hex()
         *     avcmx().hash(avcmx().blob().text("abcd"), "1.2.112.0.2.0.34.101.31.81").hex()
         *
         * РҐРµС€РёСЂРѕРІР°РЅРёРµ РґР°РЅРЅС‹С… РёСЃРїРѕР»СЊР·СѓСЏ Р°Р»РіРѕСЂРёС‚Рј SHA-1
         *
         *     avcmx().hash(avcmx().blob().text("abcd"), "1.3.14.3.2.26").hex()
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРёСЃРє Р°Р»РіРѕСЂРёС‚РјР° С…РµС€РёСЂРѕРІР°РЅРёСЏ РїСЂРѕРёР·РІРѕРґРёС‚СЃСЏ СЃСЂРµРґРё СЃР»РµРґСѓСЋС‰РёС… С‚РёРїРѕРІ РєСЂРёРїС‚РѕРїСЂРѕРІР°Р№РґРµСЂРѕРІ:
         *
         * - Avest CSP (С‚РёРїС‹ 421, 420)
         * - Avest CSP Bel (С‚РёРїС‹ 423, 422)
         * - Avest CSP Bign (С‚РёРї 424)
         * - РљСЂРёРїС‚РѕРџСЂРѕ (С‚РёРїС‹ 71, 75)
         * - Microsoft Base Cryptographic Provider v1.0 (С‚РёРї 1)
         *
         * @param {avcmx.Blob} blob Р±Р»РѕР± СЃ РґР°РЅРЅС‹РјРё РґР»СЏ С…РµС€РёСЂРѕРІР°РЅРёСЏ.
         * @param {String} oid РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ РѕР±СЉРµРєС‚Р° Р°Р»РіРѕСЂРёС‚РјР° С…РµС€РёСЂРѕРІР°РЅРёСЏ.
         * @param {Number} [flags=0] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Blob}
         */
        hash: function (blob, oid, flags) {
            flags = flags || 0;
            return this.factory(instance.Hash(blob.get(), oid, flags));
        }
    });

    avcmx.prototype.init.prototype = avcmx.prototype;

    /**
     * @class avcmx.Blob
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РґР°РЅРЅС‹РјРё. РСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РґР»СЏ РѕР±РјРµРЅР° Р»СЋР±С‹РјРё РґР°РЅРЅС‹РјРё СЃ РјРµС‚РѕРґР°РјРё РґСЂСѓРіРёС… РѕР±СЉРµРєС‚РѕРІ.
     * РЈ РѕР±СЉРµРєС‚Р° РµСЃС‚СЊ РІРЅСѓС‚СЂРµРЅРЅРµРµ СЃРІРѕР№СЃС‚РІРѕ "СЃРѕРґРµСЂР¶РёРјРѕРµ", РєРѕС‚РѕСЂРѕРµ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РїСЂРё РїРµСЂРµРґР°С‡Рµ РѕР±СЉРµРєС‚Р° РєР°Рє
     * РІС…РѕРґРЅРѕРіРѕ РїР°СЂР°РјРµС‚СЂР° РІ РјРµС‚РѕРґС‹ РѕР±СЉРµРєС‚РѕРІ СЃРёСЃС‚РµРјС‹, Рё РєРѕС‚РѕСЂРѕРµ Р·Р°РїРѕР»РЅСЏРµС‚СЃСЏ РјРµС‚РѕРґР°РјРё
     * СЃРёСЃС‚РµРјС‹ РїСЂРё РїРѕР»СѓС‡РµРЅРёРё РѕР±СЉРµРєС‚Р° РєР°Рє РІС‹С…РѕРґРЅРѕРіРѕ РїР°СЂР°РјРµС‚СЂР°.
     * @extends avcmxobject.<native.AvCMX.Blob>
     */
    avcmx.Blob.prototype = extend(avcmx.Blob.prototype, {
        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ.
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РІ Р±Р»РѕР± РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ Рё РїРѕР»СѓС‡РµРЅРёРµ РІ РІРёРґРµ С‚РµРєСЃС‚Р°
         *
         *      text = avcmx().blob().hex("313233").text(); // text == "123"
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().text("123").hex(); // hex == "313233"
         *
         * @param {String} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Blob|String} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - СЃС‚СЂРѕРєР°
         */
        hex: function (val, flags) {
            if (flags === undefined) flags = (typeof val === "number" ? val : 0);
            if (!val || (val === flags)) {
                return this.object.GetAsHex(flags);
            } else {
                this.object.SetAsHex(val, flags);
                return this;
            }
        },

        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ С‚РµРєСЃС‚РѕРІРѕРј РІРёРґРµ.
         * РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ СЃС‚СЂРѕРєРё РІ Р±Р»РѕР±Рµ С…СЂР°РЅСЏС‚СЃСЏ РІ РІРёРґРµ ASCII. РЎ РїРѕРјРѕС‰СЊСЋ С„Р»Р°РіРѕРІ РґР°РЅРЅРѕР№ С„СѓРЅРєС†РёРё РјРѕР¶РЅРѕ Р·Р°РґР°С‚СЊ
         * РІ РєР°РєРѕРј РІРёРґРµ РїСЂРµРґСЃС‚Р°РІР»РµРЅР° СЃС‚СЂРѕРєР° РІ Р±Р»РѕР±Рµ.
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ Рё РїРѕР»СѓС‡РµРЅРёРµ РІ РІРёРґРµ С‚РµРєСЃС‚Р°
         *
         *      text = avcmx().blob().hex("313233").text(); // text == "123"
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().text("123").hex(); // hex == "313233"
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMXF_ZT_STRING</b> вЂ“ Рє СЃС‚СЂРѕРєРµ Р±СѓРґРµС‚ РґРѕР±Р°РІР»РµРЅ РЅСѓР»РµРІРѕР№ Р±Р°Р№С‚. РђРЅР°Р»РѕРіРёС‡РЅРѕ РІС‹Р·РѕРІСѓ {@link avcmx.Blob#zttext}.
         * Р”Р°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё СѓСЃС‚СЂР°РЅРѕРІРєРµ СЃС‚СЂРѕРєРѕРІС‹С… Р·РЅР°С‡РµРЅРёР№ РґР»СЏ РЅРµРєРѕС‚РѕСЂС‹С… РїР°СЂР°РјРµС‚СЂРѕРІ Р°РІС‚РѕСЂРёР·Р°С†РёРё.
         * Р”Р°РЅРЅС‹Р№ С„Р»Р°Рі РјРѕР¶РЅРѕ РєРѕРјР±РёРЅРёСЂРѕРІР°С‚СЊ СЃ РґСЂСѓРіРёРјРё.
         * - <b>AVCMXF_UCS2_STRING</b> вЂ“ СѓРєР°Р·С‹РІР°РµС‚, С‡С‚Рѕ СЃС‚СЂРѕРєР° Р·Р°РєРѕРґРёСЂРѕРІР°РЅР° РІ UCS2. РђРЅР°Р»РѕРіРёС‡РЅРѕ РІС‹Р·РѕРІСѓ {@link avcmx.Blob#ucs2text}.
         * - <b>AVCMXF_UTF8_STRING</b> вЂ“ СѓРєР°Р·С‹РІР°РµС‚, С‡С‚Рѕ СЃС‚СЂРѕРєР° Р·Р°РєРѕРґРёСЂРѕРІР°РЅР° РІ UTF-8. РђРЅР°Р»РѕРіРёС‡РЅРѕ РІС‹Р·РѕРІСѓ {@link avcmx.Blob#utf8text}.
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().text("Р°Р±РІ").hex(); // hex == "E0E1E2"
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° (СЃ РЅСѓР»РµРІС‹Рј Р±Р°Р№С‚РѕРј) Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().text("Р°Р±РІ", AVCMXF_ZT_STRING).hex(); // hex == "E0E1E200"
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° (РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРЅРёСЏ РІ UCS2) Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().text("Р°Р±РІ", AVCMXF_UCS2_STRING).hex(); // hex == "300431043204"
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° (РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРЅРёСЏ РІ UCS2  РЅСѓР»РµРІС‹РјРё Р±Р°Р№С‚Р°РјРё) Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().text("Р°Р±РІ", AVCMXF_UCS2_STRING | AVCMXF_ZT_STRING).hex(); // hex == "3004310432040000"
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° (РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРЅРёСЏ РІ UTF-8) Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().text("Р°Р±РІ", AVCMXF_UTF8_STRING).hex(); // hex == "D0B0D0B1D0B2"
         *
         * @param {String} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё.
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @return {avcmx.Blob|String} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - СЃС‚СЂРѕРєР°
         */
        text: function (val, flags) {
            if (flags === undefined) flags = (typeof val === "number" ? val : 0);
            if (!val || (val === flags)) {
                return this.object.GetAsText(flags);
            } else {
                this.object.SetAsText(val, flags);
                return this;
            }
        },

        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ С‚РµРєСЃС‚РѕРІРѕРј РІРёРґРµ (СЃ РЅСѓР»РµРІС‹Рј Р±Р°Р№С‚РѕРј).
         * Р’С‹Р·РѕРІ РґР°РЅРЅРѕРіРѕ РјРµС‚РѕРґР° Р°РЅР°Р»РѕРіРёС‡РµРЅ РІС‹Р·РѕРІСѓ {@link avcmx.Blob#text} СЃ С„Р»Р°РіРѕРј AVCMXF_ZT_STRING
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° (СЃ РЅСѓР»РµРІС‹Рј Р±Р°Р№С‚РѕРј) Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().zttext("Р°Р±РІ").hex(); // hex == "E0E1E200"
         *
         * @param {String} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё.
         * @param {Number} [flags] С„Р»Р°РіРё. РЎРј. {@link avcmx.Blob#text}
         * @return {avcmx.Blob|String} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - СЃС‚СЂРѕРєР°
         */
        zttext: function (val, flags) {
            if (flags === undefined) flags = (typeof val === "number" ? val : 0);
            if (!val || (val === flags)) {
                return this.object.GetAsText(flags | avcmx.constants.AVCMXF_ZT_STRING);
            } else {
                this.object.SetAsText(val, flags | avcmx.constants.AVCMXF_ZT_STRING);
                return this;
            }
        },

        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ С‚РµРєСЃС‚РѕРІРѕРј РІРёРґРµ (РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРёСЏ РІ UCS2).
         * Р’С‹Р·РѕРІ РґР°РЅРЅРѕРіРѕ РјРµС‚РѕРґР° Р°РЅР°Р»РѕРіРёС‡РµРЅ РІС‹Р·РѕРІСѓ {@link avcmx.Blob#text} СЃ С„Р»Р°РіРѕРј AVCMXF_UCS2_STRING
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° (РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРЅРёСЏ РІ UCS2) Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().ucs2text("Р°Р±РІ").hex(); // hex == "300431043204"
         *
         * @param {String} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё.
         * @param {Number} [flags] С„Р»Р°РіРё. РЎРј. {@link avcmx.Blob#text}
         * @return {avcmx.Blob|String} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - СЃС‚СЂРѕРєР°
         */
        ucs2text: function (val, flags) {
            if (flags === undefined) flags = (typeof val === "number" ? val : 0);
            if (!val || (val === flags)) {
                return this.object.GetAsText(flags | avcmx.constants.AVCMXF_UCS2_STRING);
            } else {
                this.object.SetAsText(val, flags | avcmx.constants.AVCMXF_UCS2_STRING);
                return this;
            }
        },

        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ С‚РµРєСЃС‚РѕРІРѕРј РІРёРґРµ РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРёСЏ РІ UTF-8.
         * Р’С‹Р·РѕРІ РґР°РЅРЅРѕРіРѕ РјРµС‚РѕРґР° Р°РЅР°Р»РѕРіРёС‡РµРЅ РІС‹Р·РѕРІСѓ {@link avcmx.Blob#text} СЃ С„Р»Р°РіРѕРј AVCMXF_UTF8_STRING
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° (РґР»СЏ РїСЂРµРґСЃС‚Р°РІР»РµРЅРЅРёСЏ РІ UTF-8) Рё РїРѕР»СѓС‡РµРЅРёРµ РІ С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅРѕРј РІРёРґРµ
         *
         *      hex = avcmx().blob().uts8text("Р°Р±РІ").hex(); // hex == "D0B0D0B1D0B2"
         *
         * @param {String} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё.
         * @param {Number} [flags] С„Р»Р°РіРё. РЎРј. {@link avcmx.Blob#text}
         * @return {avcmx.Blob|String} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - СЃС‚СЂРѕРєР°
         */
        utf8text: function (val, flags) {
            if (flags === undefined) flags = (typeof val === "number" ? val : 0);
            if (!val || (val === flags)) {
                return this.object.GetAsText(flags | avcmx.constants.AVCMXF_UTF8_STRING);
            } else {
                this.object.SetAsText(val, flags | avcmx.constants.AVCMXF_UTF8_STRING);
                return this;
            }
        },

        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ РІРёРґРµ С†РµР»РѕРіРѕ С‡РёСЃР»Р°.
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° С‡РёСЃР»Р° РІ Р±Р»РѕР± Рё РїРѕР»СѓС‡РµРЅРёРµ РІ РІРёРґРµ С‡РёСЃР»Р°
         *
         *     avcmx().blob().int(123).int()
         *
         * РќРµ РЅСѓР¶РЅРѕ РїСѓС‚Р°С‚СЊ РїСЂРµРѕР±СЂР°Р·РѕРІР°РЅРёРµ СЃС‚СЂРѕРє Рє С‡РёСЃР»Сѓ Рё СѓСЃС‚Р°РЅРѕРІРєСѓ РІ РІРёРґРµ С‡РёСЃР»Р°.
         * Р•СЃР»Рё РІ Р±Р»РѕР±Рµ С…СЂР°РЅРёС‚СЃСЏ СЃС‚СЂРѕРєР°, С‚Рѕ РїСЂРё РїРѕР»СѓС‡РµРЅРёРё РІ РІРёРґРµ С‡РёСЃР»Р° (РёР»Рё РЅР°РѕР±РѕСЂРѕС‚) РїСЂРѕРёР·РѕР№РґРµС‚ РѕС€РёР±РєР°
         *
         *     avcmx().blob().text("123").int() // AvCMXError: РџР»РѕС…РёРµ РґР°РЅРЅС‹Рµ.
         *
         * @param {Number} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Blob|Number} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - С‡РёСЃР»Рѕ
         */
        int: function (val, flags) {
            flags = flags || 0;
            if (typeof val === "number") {
                this.object.SetAsInteger(val, flags);
                return this;
            } else {
                return parseInt(this.object.GetAsInteger(flags));
            }
        },

        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ Р·Р°РєРѕРґРёСЂРѕРІР°РЅРЅРѕРј РІ Base64 РІРёРґРµ.
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅС‹С… РІ Р±Р»РѕР± РІ РІРёРґРµ С‚РµРєСЃС‚Р° Рё РїРѕР»СѓС‡РµРЅРёРµ РІ Base64
         *
         *      b64 = avcmx().blob().text("123").base64(); // b64 == "MTIz"
         *
         * @param {String} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Blob|String} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - СЃС‚СЂРѕРєР°
         */
        base64: function (val, flags) {
            if (flags === undefined) flags = (typeof val === "number" ? val : 0);
            if (!val || (val === flags)) {
                return this.object.GetAsBase64(flags);
            } else {
                this.object.SetAsBase64(val, flags);
                return this;
            }
        },

        /**
         * РЈСЃС‚Р°РЅРѕРІРєР° Рё РїРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… Р±Р»РѕР±Р° РІ РІРёРґРµ РґР°С‚С‹ Рё РІСЂРµРјРµРЅРё.
         *
         * РЈСЃС‚Р°РЅРѕРІРєР° С‚РµРєСѓС‰РµР№ РґР°С‚С‹ РІ Р±Р»РѕР± Рё РїРѕР»СѓС‡РµРЅРёРµ РІ РІРёРґРµ РґР°С‚С‹ Рё РІСЂРµРјРµРЅРё
         *
         *     avcmx().blob().datetime(new Date()).datetime()
         *
         * @param {Date} [val] РґР°РЅРЅС‹Рµ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Blob|Date} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ Р±Р»РѕР±Р°, РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - РґР°С‚Р° Рё РІСЂРµРјСЏ
         */
        datetime: function (val, flags) {
            if (flags === undefined) flags = (typeof val === "number" ? val : 0);
            if (!val || (val === flags)) {
                return new Date(this.object.GetAsDateTimeSec(flags) * 1000);
            } else {
                this.object.SetAsDateTimeSec(val / 1000, flags);
                return this;
            }
        },

        /**
         * РџРѕР»СѓС‡РµРЅРёРµ СЂР°Р·РјРµСЂР° РґР°РЅРЅС‹С… Р±Р»РѕР±Р°.
         * @return {Number}
         */
        length: function () {
            return parseInt(this.object.Length);
        }
    });

    /**
     * @class avcmx.Parameters
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РїР°СЂР°РјРµС‚СЂР°РјРё Рё РѕРїС†РёСЏРјРё.
     * @extends avcmxobject.<native.AvCMX.Parameters>
     */
    avcmx.Parameters.prototype = extend(avcmx.Parameters.prototype, {
        /**
         * Р”РѕР±Р°РІР»РµРЅРёРµ РїР°СЂР°РјРµС‚СЂР°.
         * РќРµРєРѕС‚РѕСЂС‹Рµ РјРµС‚РѕРґС‹ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РїР°СЂР°РјРµС‚СЂР°РјРё С‚СЂРµР±СѓСЋС‚ РЅР°Р»РёС‡РёСЏ СЃРїРµС†РёС„РёРєР°С‚РѕСЂР°.
         *
         * РЎРѕР·РґР°РЅРёРµ СЃРїРёСЃРєР° СЃ РґРІСѓРјСЏ РїР°СЂР°РјРµС‚СЂР°РјРё
         *
         *     avcmx().params()
         *       .add(3, avcmx().blob().text("123"))
         *       .add(10, avcmx().blob().text("abc"))
         *
         * РЎРѕР·РґР°РЅРёРµ СЃРїРёСЃРєР° СЃ РѕРґРЅРёРј РїР°СЂР°РјРµС‚СЂРѕРј Рё СЃРїРµС†РёС„РёРєР°С‚РѕСЂРѕРј
         *
         *     avcmx().params().add(1, avcmx().blob().text("123"), avcmx().blob().text("123"))
         *
         * @param {Number} id РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ РїР°СЂР°РјРµС‚СЂР°
         * @param {avcmx.Blob} blob Р·РЅР°С‡РµРЅРёРµ РїР°СЂР°РјРµС‚СЂР°
         * @param {avcmx.Blob} [spec] СЃРїРµС†РёС„РёРєР°С‚РѕСЂ
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        add: function (id, blob, spec, flags) {
            if (flags === undefined) flags = (typeof spec === "number" ? spec : 0);
            if (!spec || (spec === flags)) {
                this.object.AddParameter(id, blob.get(), flags);
                return this;
            } else {
                this.object.AddParameterWithSpec(id, blob.get(), spec.get(), flags);
                return this;
            }
        },

        /**
         * Р’РѕР·РІСЂР°С‰Р°РµС‚ РєРѕР»РёС‡РµСЃС‚РІРѕ РїР°СЂР°РјРµС‚СЂРѕРІ
         * @return {Number}
         */
        length: function () {
            return parseInt(this.object.Count);
        }
    });

    /**
     * @class avcmx.Connection
     * РЎРµСЃСЃРёСЏ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃРѕ СЃРїСЂР°РІРѕС‡РЅРёРєРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё СЃРѕРѕР±С‰РµРЅРёСЏРјРё
     * @extends avcmxobject.<native.AvCMX.Connection>
     */
    avcmx.Connection.prototype = extend(avcmx.Connection.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ (РѕС‚РєСЂС‹С‚РёСЏ) СЃРѕРѕР±С‰РµРЅРёСЏ РґР»СЏ РґР°Р»СЊРЅРµР№С€РµР№ РѕР±СЂР°Р±РѕС‚РєРё.
         *
         * Р’ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё С„РѕСЂРјР°С‚Р° РѕС‚ РїРµСЂРµРґР°РЅРЅС‹С… РґР°РЅРЅС‹С… РІ СЂРµР·СѓР»СЊС‚Р°С‚Рµ Р±СѓРґРµС‚ СЃРѕР·РґР°РЅ РѕР±СЉРµРєС‚ РѕРґРЅРѕРіРѕ РёР· С‚РёРїРѕРІ:
         *
         * - "СЃС‹СЂРѕРµ" СЃРѕРѕР±С‰РµРЅРёРµ (Raw) {@link avcmx.RawMessage}
         * - РїРѕРґРїРёСЃР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ (Signed) {@link avcmx.SignedMessage}
         * - Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ (Encrypted) {@link avcmx.EncryptedMessage}
         *
         * Р’ СЃР»СѓС‡Р°Рµ РѕС‚РєСЂС‹С‚РёСЏ "СЃС‹СЂРѕРіРѕ" (Raw, РЅРµ PKCS#7) СЃРѕРѕР±С‰РµРЅРёСЏ РІРѕР·РјРѕР¶РЅР° РїРµСЂРµРґР°С‡Р° Р»РёС€СЊ
         * С‡Р°СЃС‚Рё РґР°РЅРЅС‹С…, Р»РёР±Рѕ РІРѕРѕР±С‰Рµ РїСѓСЃС‚РѕРіРѕ (Р±РµР· РґР°РЅРЅС‹С…) РѕР±СЉРµРєС‚Р° {@link avcmx.Blob}. Р’ РїРѕСЃР»РµРґРЅРµРј
         * СЃР»СѓС‡Р°Рµ РіР°СЂР°РЅС‚РёСЂРѕРІР°РЅРЅРѕ Р±СѓРґРµС‚ СЃРѕР·РґР°РЅ РѕР±СЉРµРєС‚ "СЃС‹СЂРѕРіРѕ" СЃРѕРѕР±С‰РµРЅРёСЏ С‚РёРїР° {@link avcmx.RawMessage}.
         * Р”Р»СЏ РґР°Р»СЊРЅРµР№С€РµР№ СѓСЃС‚Р°РЅРѕРІРєРё СЃРѕРґРµСЂР¶РёРјРѕРіРѕ РјРѕР¶РЅРѕ РІРѕСЃРїРѕР»СЊР·РѕРІР°С‚СЊСЃСЏ РјРµС‚РѕРґРѕРј {@link avcmx.RawMessage#content}.
         * РќР°РїСЂРёРјРµСЂ:
         *
         *     conn = ... // create connection
         *     msg = conn.message(); // msg instanceof avcmx.RawMessage == true
         *
         * РЎРѕР·РґР°РЅРёРµ РїСЂРѕСЃС‚РѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         *     conn = ... // create connection
         *     conn.message(avcmx().blob().text("123"));
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_OPEN_FOR_SIGN</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РґР»СЏ РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё РїРѕР±Р»РѕС‡РЅРѕРіРѕ РґРѕР±Р°РІР»РµРЅРёСЏ РґР°РЅРЅС‹С… Рє
         * СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ РІ СЂРµР¶РёРјРµ РїРѕРґРїРёСЃР°РЅРёСЏ СЃ РїРѕРјРѕС‰СЊСЋ С„СѓРЅРєС†РёР№ {@link avcmx.Message#update} Рё {@link avcmx.Message#final}.
         * Р¤Р»Р°Рі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ СЃРѕРІРјРµСЃС‚РЅРѕ СЃ С„Р»Р°РіРѕРј <b>AVCMF_DETACHED</b>.
         * - <b>AVCMF_OPEN_FOR_VERIFYSIGN</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РґР»СЏ РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё РїРѕР±Р»РѕС‡РЅРѕРіРѕ РґРѕР±Р°РІР»РµРЅРёСЏ РґР°РЅРЅС‹С… Рє
         * СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ РІ СЂРµР¶РёРјРµ РїСЂРѕРІРµСЂРєРё РїРѕРґРїРёСЃРё СЃ РїРѕРјРѕС‰СЊСЋ С„СѓРЅРєС†РёР№ {@link avcmx.Message#update}, {@link avcmx.Message#final} Рё {@link avcmx.SignedMessage#verify}.
         * Р¤Р»Р°Рі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ СЃРѕРІРјРµСЃС‚РЅРѕ СЃ С„Р»Р°РіРѕРј <b>AVCMF_DETACHED</b>.
         *
         * @param {avcmx.Blob} [blob] РґР°РЅРЅС‹Рµ СЃРѕРѕР±С‰РµРЅРёСЏ
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @return {avcmx.Message}
         */
        message: function (blob, flags) {
            if (flags === undefined) flags = (typeof blob === "number" ? blob : 0);
            blob = (!blob || (blob === flags)) ? instance.CreateBlob(0) : blob.get();
            return this.factory(this.object.CreateMessage(blob, flags));
        },

        /**
         * РЎРѕР·РґР°РЅРёРµ (СЂР°Р·Р±РѕСЂ) СЃРµСЂС‚РёС„РёРєР°С‚Р° РёР· Р±Р»РѕР±Р°.
         *
         * РџСЂРё РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРё Р±РµР· РїР°СЂР°РјРµС‚СЂРѕРІ РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±СЉРµРєС‚ С‚РµРєСѓС‰РµРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° СЃРµСЃСЃРёРё (Р°РЅР°Р»РѕРіРёС‡РЅРѕ РІС‹Р·РѕРІСѓ {@link avcmx.Connection#ownCert}).
         *
         * Р Р°Р·Р±РѕСЂ СЃРµСЂС‚РёС„РёРєР°С‚Р° Р·Р°РіСЂСѓР¶РµРЅРЅРѕРіРѕ РёР· С„Р°Р№Р»Р° c:\1.cer
         *
         *     conn = ... // create connection
         *     blob = ... // get certificate contents
         *     conn.cert(blob);
         *
         * РџРѕР»СѓС‡РµРЅРёРµ С‚РµРєСѓС‰РµРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° СЃРµСЃСЃРёРё
         *
         *     conn = ... // create connection
         *     conn.cert();
         *
         * @param {avcmx.Blob} [blob] РґР°РЅРЅС‹Рµ cРµСЂС‚РёС„РёРєР°С‚Р°
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Certificate}
         */
        cert: function (blob, flags) {
            if (flags === undefined) flags = (typeof blob === "number" ? blob : 0);
            blob = (!blob || (blob === flags)) ? null : blob.get();
            if (blob) {
                return this.factory(this.object.CreateCertificate(blob, flags));
            } else {
                return this.ownCert();
            }
        },

        /**
         * РЎРѕР·РґР°РЅРёРµ (СЂР°Р·Р±РѕСЂ) СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РёР· Р±Р»РѕР±Р°.
         *
         * Р Р°Р·Р±РѕСЂ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Р·Р°РіСЂСѓР¶РµРЅРЅРѕРіРѕ РёР· С„Р°Р№Р»Р° c:\1.crl
         *
         *     conn = ... // create connection
         *     blob = ... // get crl contents
         *     conn.crl(blob);
         *
         * @param {avcmx.Blob} blob РґР°РЅРЅС‹Рµ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.CRL}
         */
        crl: function (blob, flags) {
            flags = flags || 0;
            return this.factory(this.object.CreateCRL(blob.get(), flags));
        },

        /**
         * РЎРѕР·РґР°РЅРёРµ РєРѕРЅС‚РµРєСЃС‚Р° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ РїРѕ РїСЂРѕС‚РѕРєРѕР»Сѓ SCEP (Simple Certificate Enrollment Protocol)
         * РґР»СЏ РґР°Р»СЊРЅРµР№С€РµР№ РѕС‚РїСЂР°РІРєРё Р·Р°РїСЂРѕСЃРѕРІ РЅР° СЃРµСЂС‚РёС„РёРєР°С‚С‹.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РїСЂРё РІС‹Р·РѕРІРµ РѕС‚РїСЂР°РІР»СЏРµС‚ Р·Р°РїСЂРѕСЃ РЅР° СЃРµСЂРІРµСЂ Рё РѕР¶РёРґР°РµС‚ РѕС‚РІРµС‚Р°, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Connection#scepAsync}</b>
         *
         * РЎРѕР·РґР°РЅРёРµ РєРѕРЅС‚РµРєСЃС‚Р° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ
         *
         *     conn = ... // create connection
         *     conn.scep("http://localhost:8080/AvScep/avpkiclient")
         *
         * РЎРѕР·РґР°РЅРёРµ РєРѕРЅС‚РµРєСЃС‚Р° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ РІ РѕС„С„Р»Р°Р№РЅ СЂРµР¶РёРјРµ
         *
         *     conn = ... // create connection
         *     conn.scep("http://localhost:8080/AvScep/avpkiclient", AVCMF_SCEP_OFFLINE)
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_SCEP_OFFLINE</b> вЂ“ СЂР°Р±РѕС‚Р° РїРѕ РѕС‚РїСЂР°РІРєРµ Р·Р°РїСЂРѕСЃРѕРІ РЅРµРїРѕСЃСЂРµРґСЃС‚РІРµРЅРЅРѕ РЅР° СЃРµСЂРІРµСЂ SCEP Р»РѕР¶РёС‚СЃСЏ РЅР° РїСЂРёР»РѕР¶РµРЅРёРµ
         *
         * @param {String} url Р°РґСЂРµСЃ SCEP СЃРµСЂРІРµСЂР°
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @return {avcmx.Scep}
         * @deprecated 1.1.1 Р—Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Connection#scepAsync}
         */
        scep: function (url, flags) {
            flags = flags || 0;
            return this.factory(this.object.CreateScep(url, flags));
        },

        /**
         * РЎРѕР·РґР°РЅРёРµ РєРѕРЅС‚РµРєСЃС‚Р° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ РїРѕ РїСЂРѕС‚РѕРєРѕР»Сѓ SCEP (Simple Certificate Enrollment Protocol)
         * РґР»СЏ РґР°Р»СЊРЅРµР№С€РµР№ РѕС‚РїСЂР°РІРєРё Р·Р°РїСЂРѕСЃРѕРІ РЅР° СЃРµСЂС‚РёС„РёРєР°С‚С‹.
         *
         * РЎРѕР·РґР°РЅРёРµ РєРѕРЅС‚РµРєСЃС‚Р° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ
         *
         *     conn = ... // create connection
         *     conn.scepAsync("http://localhost:8080/AvScep/avpkiclient", function (e, scep) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј scep
         *     })
         *
         * РЎРѕР·РґР°РЅРёРµ РєРѕРЅС‚РµРєСЃС‚Р° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ РІ РѕС„С„Р»Р°Р№РЅ СЂРµР¶РёРјРµ
         *
         *     conn = ... // create connection
         *     conn.scepAsync("http://localhost:8080/AvScep/avpkiclient", AVCMF_SCEP_OFFLINE, function (e, scep) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј scep
         *     });
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_SCEP_OFFLINE</b> вЂ“ СЂР°Р±РѕС‚Р° РїРѕ РѕС‚РїСЂР°РІРєРµ Р·Р°РїСЂРѕСЃРѕРІ РЅРµРїРѕСЃСЂРµРґСЃС‚РІРµРЅРЅРѕ РЅР° СЃРµСЂРІРµСЂ SCEP Р»РѕР¶РёС‚СЃСЏ РЅР° РїСЂРёР»РѕР¶РµРЅРёРµ
         *
         * @param {String} url Р°РґСЂРµСЃ SCEP СЃРµСЂРІРµСЂР°
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕР·РґР°РЅРЅРѕРіРѕ РєРѕРЅС‚РµРєСЃС‚Р° РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.Scep} fn.scep РѕР±СЉРµРєС‚ СЃРѕРµРґРёРЅРµРЅРёСЏ, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        scepAsync: function (url, flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.CreateScepAsync(url, flags, this.makeAsync(fn));
            return this;
        },

        /**
         * Р’РѕР·РІСЂР°С‰Р°РµС‚ С‚РµРєСѓС‰РёР№ СЃРµСЂС‚РёС„РёРєР°С‚ СЃРµСЃСЃРёРё Р»РёР±Рѕ РѕС€РёР±РєСѓ РµСЃР»Рё Р°РІС‚РѕСЂРёР·Р°С†РёСЏ РїСЂРѕРёР·РІРµРґРµРЅР° СЃ С„Р»Р°РіРѕРј <b>AVCMF_NO_AUTH</b>
         * @return {avcmx.Certificate}
         * @since 1.1.1
         */
        ownCert: function () {
            return this.factory(this.object.OwnCertificate);
        },

        flush: function (flags) {
            flags = flags || 0;
            this.object.Flush(flags);
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕР±СЉРµРєС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїСѓС‚РµРј РїРµСЂРµР±РѕСЂР° Рё РѕС‚Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ СЃРїСЂР°РІРѕС‡РЅРёРєРµ,
         * СѓРґРѕРІР»РµС‚РІРѕСЂСЏСЋС‰РёС… РѕРїСЂРµРґРµР»РµРЅРЅС‹Рј СѓСЃР»РѕРІРёСЏРј. РЈСЃР»РѕРІРёСЏ РґР»СЏ РїРѕРёСЃРєР° РїРµСЂРµРґР°СЋС‚СЃСЏ С‡РµСЂРµР· РѕР±СЉРµРєС‚ РїР°СЂР°РјРµС‚СЂРѕРІ.
         * РџСЂРё СЌС‚РѕРј СЃР»РµРґСѓРµС‚ РѕС‚РјРµС‚РёС‚СЊ, С‡С‚Рѕ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РїРµСЂРµР±РѕСЂ РѕСЃСѓС‰РµСЃС‚РІР»СЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ СЃСЂРµРґРё РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ,
         * С‚Рѕ РµСЃС‚СЊ РґР»СЏ РєР°Р¶РґРѕРіРѕ РЅР°Р№РґРµРЅРЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїСЂРѕР·РІРѕРґРёС‚СЃСЏ РїРѕР»РЅР°СЏ РїСЂРѕРІРµСЂРєР° РµРіРѕ РєРѕСЂСЂРµРєС‚РЅРѕСЃС‚Рё.
         * РџСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РјРѕР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹ Р±РµР· РїСЂРѕРІРµСЂРєРё РєРѕСЂСЂРµРєС‚РЅРѕСЃС‚Рё, РґР»СЏ СЌС‚РѕРіРѕ РЅСѓР¶РЅРѕ СѓРєР°Р·Р°С‚СЊ С„Р»Р°Рі <b>AVCMF_ALL_CERT</b>.
         *
         * РџРѕРёСЃРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Сѓ РєРѕС‚РѕСЂС‹С… РґР°С‚Р° РёР·РґР°РЅРёСЏ РІС…РѕРґРёС‚ РІ РїСЂРѕРјРµР¶СѓС‚РѕРє РѕС‚ -10 РґРѕ +10 СЃРµРєСѓРЅРґ РѕС‚ С‚РµРєСѓС‰РµР№
         *
         *     conn = ... // create connection
         *     currentDate = new Date();
         *     conn.selectCerts(avcmx().params()
         *         .add(AVCM_NOT_BEFORE, avcmx().blob().datetime(new Date(currentDate.getTime() - 10 * 1000)), avcmx().blob().int(AVCM_D_GREATER))
         *         .add(AVCM_NOT_BEFORE, avcmx().blob().datetime(new Date(currentDate.getTime() + 10 * 1000)), avcmx().blob().int(AVCM_D_LESS)), AVCMF_ALL_CERT)
         *
         * РџРѕРёСЃРє СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂСѓ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°
         *
         *     conn = ... // create connection
         *     pubKeyId = "00112233445566778899AABBCCDDEEFF00112233";
         *     conn.selectCerts(avcmx().params().add(AVCM_PUB_KEY_ID, avcmx().blob().zttext(pubKeyId)), AVCMF_ALL_CERT);
         *
         * РџРѕРёСЃРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕ РїРѕР»РЅРѕР№ СЃС‚СЂРѕРєРµ РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ
         *
         *     conn = ... // create connection
         *     issuerName = "CN=РџРЈР¦, OU=РџРЈР¦, O=РџРЈР¦, STREET=РџРЈР¦, L=РџРЈР¦, ST=РџРЈР¦, C=BY";
         *     conn.selectCerts(avcmx().params().add(AVCM_ISSUER_AS_STRING, avcmx().blob().zttext(issuerName)), AVCMF_ALL_CERT);
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР°:
         *
         * - <b>AVCM_PURPOSE</b> вЂ“ СѓРєР°Р·С‹РІР°РµС‚ РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРёРµ РёСЃРєРѕРјС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         * Р—РЅР°С‡РµРЅРёРµ СѓРєР°Р·С‹РІР°РµРјРѕРµ <b>Value</b> С‚РёРїР° Number:
         *     - <b>AVCM_P_SIGN</b> вЂ“ РїРѕРёСЃРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅС‹С… РґР»СЏ РїРѕРґРїРёСЃРё.
         *     - <b>AVCM_P_CRYPT</b> вЂ“ РїРѕРёСЃРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅС‹С… РґР»СЏ Р·Р°С€РёС„СЂРѕРІР°РЅРёСЏ.
         * - <b>AVCM_EXT_KEY_USAGE_OID</b> вЂ“ РѕС‚Р±РѕСЂ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕ РЅР°Р»РёС‡РёСЋ РІ РµРіРѕ СЃРїРёСЃРєРµ
         * РѕРіСЂР°РЅРёС‡РµРЅРёР№ РїСЂРёРјРµРЅРµРЅРёСЏ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° Р·Р°РґР°РЅРЅРѕРіРѕ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РѕР±СЉРµРєС‚Р°
         * (OID) РІ РІРёРґРµ СЃС‚СЂРѕРєРё ASCIIZ.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° Р·РЅР°С‡РµРЅРёСЏ С‚СЂРµР±СѓРµРјРѕРіРѕ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ РїСЂРёРјРµРЅРµРЅРёСЏ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°
         * - <b>AVCM_TYPE</b> вЂ“ СѓРєР°Р·С‹РІР°РµС‚ С‚РёРї РёСЃРєРѕРјРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°
         * Р—РЅР°С‡РµРЅРёРµ СѓРєР°Р·С‹РІР°РµРјРѕРµ <b>Value</b> С‚РёРїР° Number:
         *     - <b>AVCM_TYPE_MY</b> вЂ“ РїРµСЂРµР±РѕСЂ С‚РѕР»СЊРєРѕ Р»РёС‡РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, С‚Рѕ РµСЃС‚СЊ
         *     СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Р»РёС‡РЅС‹Рµ РєР»СЋС‡Рё РєРѕС‚РѕСЂС‹С… РёРјРµРµС‚ С‚РµРєСѓС‰РёР№ Р°СѓС‚РµРЅС‚РёС„РёС†РёСЂРѕРІР°РЅРЅС‹Р№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ.
         *     - <b>AVCM_TYPE_ROOT</b> вЂ“ РїРµСЂРµР±РѕСЂ С‚РѕР»СЊРєРѕ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РґРѕРІРµСЂРµРЅРЅС‹С… С†РµРЅС‚СЂРѕРІ СЃРµСЂС‚РёС„РёРєР°С†РёРё.
         * - <b>AVCM_SERIAL_AS_STRING</b> вЂ“ РїРѕРёСЃРє РїРѕ СЃРµСЂРёР№РЅРѕРјСѓ РЅРѕРјРµСЂСѓ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃРµСЂРёР№РЅС‹Р№ РЅРѕРјРµСЂ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІРёРґР° ASCIIZ
         * - <b>AVCM_ISSUER_AS_STRING</b> вЂ“ РїРѕРёСЃРє РїРѕ РїРѕР»РЅРѕРјСѓ РёРјРµРЅРё (X.509 Name) РёР·РґР°С‚РµР»СЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РІРёРґРµ СЃС‚СЂРѕРєРё.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ
         * - <b>AVCM_ISSUER_ATTR</b> вЂ“ РїРѕРёСЃРє РїРѕ Р°С‚СЂРёР±СѓС‚Сѓ РёРјРµРЅРё (X.509 Name) РёР·РґР°С‚РµР»СЏ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РІРёРґРµ СЃС‚СЂРѕРєРё. РџСЂРё СЌС‚РѕРј РЅРµРѕР±С…РѕРґРёРјР° РїРµСЂРµРґР°С‡Р° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ РѕР±СЉРµРєС‚Р° (РїРѕР»Рµ <b>Spec</b>).
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b>: СЃС‚СЂРѕРєР° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ РѕР±СЉРµРєС‚Р° (OID).
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ.
         * - <b>AVCM_NOT_BEFORE</b> вЂ“ РїРѕРёСЃРє РїРѕ РґР°С‚Рµ/РІСЂРµРјРµРЅРё РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b> СѓРєР°Р·С‹РІР°РµС‚ РЅР° СѓСЃР»РѕРІРёРµ (Number), РїСЂРёРјРµРЅСЏРµРјРѕРµ РїСЂРё РїРѕРёСЃРєРµ.
         * Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ:
         *     - <b>AVCM_D_GREATER</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ РёСЃРєРѕРјРѕРіРѕ
         *     СЃРµСЂС‚РёС„РёРєР°С‚Р° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         *     - <b>AVCM_D_LESS</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ РёСЃРєРѕРјРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°
         *     РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РјРµРЅСЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: РґР°С‚Р° Рё РІСЂРµРјСЏ. РџСЂРё СЌС‚РѕРј РґР°С‚Р° Рё РІСЂРµРјСЏ РґРѕР¶РЅС‹ Р±С‹С‚СЊ СѓРєР°Р·Р°РЅС‹ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С‡Р°СЃРѕРІРѕРіРѕ РїРѕСЏСЃР°.
         * - <b>AVCM_NOT_AFTER</b> вЂ“ РїРѕРёСЃРє РїРѕ РґР°С‚Рµ/РІСЂРµРјРµРЅРёРё РѕРєРѕРЅС‡Р°РЅРёСЏ РґРµР№СЃС‚РІРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b> СѓРєР°Р·С‹РІР°РµС‚ РЅР° СѓСЃР»РѕРІРёРµ (Number), РїСЂРёРјРµРЅСЏРµРјРѕРµ РїСЂРё РїРѕРёСЃРєРµ.
         * Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ:
         *     - <b>AVCM_D_GREATER</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РґРµР№СЃС‚РІРёСЏ РёСЃРєРѕРјРѕРіРѕ
         *     СЃРµСЂС‚РёС„РёРєР°С‚Р° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         *     - <b>AVCM_D_LESS</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РёСЃРєРѕРјРѕРіРѕ
         *     СЃРµСЂС‚РёС„РёРєР°С‚Р° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РјРµРЅСЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: РґР°С‚Р° Рё РІСЂРµРјСЏ. РџСЂРё СЌС‚РѕРј РґР°С‚Р° Рё РІСЂРµРјСЏ РґРѕР¶РЅС‹ Р±С‹С‚СЊ СѓРєР°Р·Р°РЅС‹ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С‡Р°СЃРѕРІРѕРіРѕ РїРѕСЏСЃР°.
         * - <b>AVCM_KEY_NOT_BEFORE</b> вЂ“ РїРѕРёСЃРє РїРѕ РґР°С‚Рµ/РІСЂРµРјРµРЅРё РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р°.
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b> СѓРєР°Р·С‹РІР°РµС‚ РЅР° СѓСЃР»РѕРІРёРµ (Number), РїСЂРёРјРµРЅСЏРµРјРѕРµ РїСЂРё РїРѕРёСЃРєРµ.
         * Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ:
         *     - <b>AVCM_D_GREATER</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ РёСЃРєРѕРјРѕРіРѕ Р»РёС‡РЅРѕРіРѕ
         *     РєР»СЋС‡Р° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         *     - <b>AVCM_D_LESS</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ РёСЃРєРѕРјРѕРіРѕ Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р°
         *     РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РјРµРЅСЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: РґР°С‚Р° Рё РІСЂРµРјСЏ. РџСЂРё СЌС‚РѕРј РґР°С‚Р° Рё РІСЂРµРјСЏ РґРѕР¶РЅС‹ Р±С‹С‚СЊ СѓРєР°Р·Р°РЅС‹ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С‡Р°СЃРѕРІРѕРіРѕ РїРѕСЏСЃР°.
         * - <b>AVCM_KEY_NOT_AFTER</b> вЂ“ РїРѕРёСЃРє РїРѕ РґР°С‚Рµ/РІСЂРµРјРµРЅРёРё РѕРєРѕРЅС‡Р°РЅРёСЏ РґРµР№СЃС‚РІРёСЏ Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р°.
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b> СѓРєР°Р·С‹РІР°РµС‚ РЅР° СѓСЃР»РѕРІРёРµ (Number), РїСЂРёРјРµРЅСЏРµРјРѕРµ РїСЂРё РїРѕРёСЃРєРµ.
         * Р’РѕР·РјРѕР¶РЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ:
         *     - <b>AVCM_D_GREATER</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РґРµР№СЃС‚РІРёСЏ РёСЃРєРѕРјРѕРіРѕ
         *     Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         *     - <b>AVCM_D_LESS</b> вЂ“ РґР°С‚Р° Рё РІСЂРµРјСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РёСЃРєРѕРјРѕРіРѕ Р»РёС‡РЅРѕРіРѕ
         *     РєР»СЋС‡Р° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РјРµРЅСЊС€Рµ РёР»Рё СЂР°РІРЅР° СѓРєР°Р·Р°РЅРЅРѕР№ РґР°С‚Рµ Рё РІСЂРµРјРµРЅРё.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: РґР°С‚Р° Рё РІСЂРµРјСЏ. РџСЂРё СЌС‚РѕРј РґР°С‚Р° Рё РІСЂРµРјСЏ РґРѕР¶РЅС‹ Р±С‹С‚СЊ СѓРєР°Р·Р°РЅС‹ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С‡Р°СЃРѕРІРѕРіРѕ РїРѕСЏСЃР°.
         * - <b>AVCM_SUBJECT_AS_STRING</b> вЂ“ РїРѕРёСЃРє РїРѕ РїРѕР»РЅРѕРјСѓ РёРјРµРЅРё (X.509 Name) РІР»Р°РґРµР»СЊС†Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РІРёРґРµ СЃС‚СЂРѕРєРё.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ
         * - <b>AVCM_SUBJECT_ATTR</b> вЂ“ РїРѕРёСЃРє РїРѕ Р°С‚СЂРёР±СѓС‚Сѓ РёРјРµРЅРё (X.509 Name) РІР»Р°РґРµР»СЊС†Р°
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РІРёРґРµ СЃС‚СЂРѕРєРё. РџСЂРё СЌС‚РѕРј РЅРµРѕР±С…РѕРґРёРјР° РїРµСЂРµРґР°С‡Р° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ РѕР±СЉРµРєС‚Р° (РїРѕР»Рµ <b>Spec</b>).
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b>: СЃС‚СЂРѕРєР° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ РѕР±СЉРµРєС‚Р° (OID).
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° Р°С‚СЂРёР±СѓС‚Р° РІР»Р°РґРµР»СЊС†Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * - <b>AVCM_PUB_KEY_ID</b> вЂ“ РїРѕРёСЃРє РїРѕ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂСѓ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РІРёРґРµ СЃС‚СЂРѕРєРё С€РµСЃС‚РЅР°РґС†Р°С‚РёСЂРёС‡РЅС‹С… С†РёС„СЂ.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°.
         * - <b>AVCM_PUB_KEY</b> вЂ“ РїРѕРёСЃРє РїРѕ РѕС‚РєСЂС‹С‚РѕРјСѓ РєР»СЋС‡Сѓ СЃРµСЂС‚РёС„РёРєР°С‚Р°
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b>: СЂР°Р·РјРµСЂ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р° РІ Р±Р°Р№С‚Р°С… (Number).
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: РѕС‚РєСЂС‹С‚С‹Р№ РєР»СЋС‡ (РІ РІРёРґРµ РїРѕСЃР»РµРґРѕРІР°С‚РµР»СЊРЅРѕСЃС‚Рё Р±Р°Р№С‚).
         * - <b>AVCM_SUBJ_ALT_NAME_ATTR</b> вЂ“ РїРѕРёСЃРє РїРѕ Р°С‚СЂРёР±СѓС‚Сѓ Р°Р»СЊС‚РµСЂРЅР°С‚РёРІРЅРѕРіРѕ РёРјРµРЅРё
         * (X.509 AltName) РІР»Р°РґРµР»СЊС†Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РІРёРґРµ СЃС‚СЂРѕРєРё. РџСЂРё СЌС‚РѕРј РЅРµРѕР±С…РѕРґРёРјР°
         * РїРµСЂРµРґР°С‡Р° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ РѕР±СЉРµРєС‚Р° (РїРѕР»Рµ <b>Spec</b>).
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b>: СЃС‚СЂРѕРєР° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р° (OID).
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° Р°С‚СЂРёР±СѓС‚Р° Р°Р»СЊС‚РµСЂРЅР°С‚РёРІРЅРѕРіРѕ РёРјРµРЅРё РІР»Р°РґРµР»СЊС†Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * - <b>AVCM_EXT_AS_STRING</b> вЂ“ РїРѕРёСЃРє РїРѕ РґРѕРїРѕР»РЅРµРЅРёСЋ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РІРёРґРµ СЃС‚СЂРѕРєРё
         * ASCIIZ. РџСЂРё СЌС‚РѕРј РЅРµРѕР±С…РѕРґРёРјР° РїРµСЂРµРґР°С‡Р° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ РѕР±СЉРµРєС‚Р° (РїРѕР»Рµ <b>Spec</b>).
         * Р—РЅР°С‡РµРЅРёРµ <b>Spec</b>: СЃС‚СЂРѕРєР° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РёСЃРєРѕРјРѕРіРѕ РґРѕРїРѕР»РЅРµРЅРёСЏ (OID).
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° Р·РЅР°С‡РµРЅРёСЏ РёСЃРєРѕРјРѕРіРѕ РґРѕРїРѕР»РЅРµРЅРёСЏ.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_ALL_CERT</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРµСЂРµР±РѕСЂР° РЅРµ
         * С‚РѕР»СЊРєРѕ РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р° РІСЃРµС… РёРјРµСЋС‰РёС…СЃСЏ РІ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * @param {avcmx.Parameters} [params] РїР°СЂР°РјРµС‚СЂС‹ РѕС‚Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         * @param {Number} [flags] С„Р»Р°РіРё
         * @return {avcmx.Certificates}
         */
        selectCerts: function (params, flags) {
            if (flags === undefined) flags = (typeof params === "number" ? params : 0);
            params = (!params || (params === flags)) ? instance.CreateParameters(0) : params.get();
            return this.factory(this.object.SelectCertificates(params, flags), "Certificates");
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕР±СЉРµРєС‚Р° СЃРїРёСЃРєР° Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїСѓС‚РµРј РїРµСЂРµР±РѕСЂР° Рё РѕС‚Р±РѕСЂР°
         * Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ СЃРїСЂР°РІРѕС‡РЅРёРєРµ, СѓРґРѕРІР»РµС‚РІРѕСЂСЏСЋС‰РёС… РѕРїСЂРµРґРµР»РµРЅРЅС‹Рј СѓСЃР»РѕРІРёСЏРј Рё РїСЂРёРЅР°РґР»РµР¶Р°С‰РёС…
         * Р·Р°РґР°РЅРЅРѕРјСѓ СЃРµСЂС‚РёС„РёРєР°С‚Сѓ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°. РЈСЃР»РѕРІРёСЏ РґР»СЏ РїРѕРёСЃРєР° РїРµСЂРµРґР°СЋС‚СЃСЏ С‡РµСЂРµР· РѕР±СЉРµРєС‚ РїР°СЂР°РјРµС‚СЂРѕРІ.
         * РџСЂРё СЌС‚РѕРј СЃР»РµРґСѓРµС‚ РѕС‚РјРµС‚РёС‚СЊ, С‡С‚Рѕ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РїРµСЂРµР±РѕСЂ РѕСЃСѓС‰РµСЃС‚РІР»СЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ СЃСЂРµРґРё
         * РєРѕСЂСЂРµРєС‚РЅС‹С… Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, С‚Рѕ РµСЃС‚СЊ РґР»СЏ РєР°Р¶РґРѕРіРѕ РЅР°Р№РґРµРЅРЅРѕРіРѕ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° РїСЂРѕР·РІРѕРґРёС‚СЃСЏ РїРѕР»РЅР°СЏ РїСЂРѕРІРµСЂРєР° РµРіРѕ РєРѕСЂСЂРµРєС‚РЅРѕСЃС‚Рё. РџСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РјРѕР¶РЅРѕ
         * РїРѕР»СѓС‡РёС‚СЊ Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹ Р±РµР· РїСЂРѕРІРµСЂРєРё РєРѕСЂСЂРµРєС‚РЅРѕСЃС‚Рё, РґР»СЏ СЌС‚РѕРіРѕ РЅСѓР¶РЅРѕ СѓРєР°Р·Р°С‚СЊ С„Р»Р°Рі <b>AVCMF_ALL_CERT</b>
         *
         * РџРѕРёСЃРє Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° СЃРµСЃСЃРёРё:
         *
         *     conn = ... // create connection
         *     conn.selectAttrCerts(conn.ownCert());

         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_ALL_CERT</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРµСЂРµР±РѕСЂР° РЅРµ
         * С‚РѕР»СЊРєРѕ РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р° РІСЃРµС… РёРјРµСЋС‰РёС…СЃСЏ РІ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * @param {avcmx.Certificate} holder СЃРµСЂС‚РёС„РёРєР°С‚ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°, РґР»СЏ РєРѕС‚РѕСЂРѕРіРѕ Р±СѓРґРµС‚ РїСЂРѕРёР·РІРѕРґРёС‚СЊСЃСЏ РїРѕРёСЃРє Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         * @param {avcmx.Parameters} [params] РїР°СЂР°РјРµС‚СЂС‹ РѕС‚Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… РєСЂРёС‚РµСЂРёРµРІ.
         * @param {Number} [flags] С„Р»Р°РіРё
         * @return {avcmx.AttributeCertificates}
         */
        selectAttrCerts: function (holder, params, flags) {
            if (flags === undefined) flags = (typeof params === "number" ? params : 0);
            params = (!params || (params === flags)) ? instance.CreateParameters(0) : params.get();
            return this.factory(this.object.SelectAttributeCertificates(holder.get(), params, flags), "AttributeCertificates");
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕР±СЉРµРєС‚Р° СЃРїРёСЃРєР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїСѓС‚РµРј РІРєР»СЋС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ,
         * РІС‹Р±СЂР°РЅРЅС‹С… РїРѕР»СЊР·РѕРІР°С‚РµР»РµРј С‡РµСЂРµР· РґРёР°Р»РѕРі РІС‹Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Connection#selectCertsDlgAsync}</b>
         *
         * РџСЂРёРјРµСЂ:
         *
         *     conn = ... // create connection
         *     conn.selectCertsDlg("Р’С‹Р±РѕСЂ СЃРµСЂС‚РёС„РёС‚РєР°С‚Р°", "Р’С‹Р±РµСЂРёС‚Рµ СЃРµСЂС‚РёС„РёРєР°С‚");
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_ALL_CERT</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРµСЂРµР±РѕСЂР° РЅРµ
         * С‚РѕР»СЊРєРѕ РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р° РІСЃРµС… РёРјРµСЋС‰РёС…СЃСЏ РІ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         * - <b>AVCMF_ALL_CERT</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРѕРєР°Р·Р° РЅРµ С‚РѕР»СЊРєРѕ
         * РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р° РІСЃРµС… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, РёРјРµСЋС‰РёС…СЃСЏ РІ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * @param {String} caption РЅР°Р·РІР°РЅРёРµ РѕРєРЅР° РІС‹Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ. Р’ СЃР»СѓС‡Р°Рµ РїРµСЂРµРґР°С‡Рё
         * РїСѓСЃС‚РѕР№ СЃС‚СЂРѕРєРё Р±СѓРґРµС‚ РїРѕРєР°Р·Р°РЅРѕ РЅР°Р·РІР°РЅРёРµ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ.
         * @param {String} label СЃС‚СЂРѕРєР° РїРµСЂРµРґ СЃРїРёСЃРєРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРј. Р’ СЃР»СѓС‡Р°Рµ РїРµСЂРµРґР°С‡Рё
         * РїСѓСЃС‚РѕР№ СЃС‚СЂРѕРєРё Р±СѓРґРµС‚ РїРѕРєР°Р·Р°РЅР° СЃС‚СЂРѕРєР° РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ.
         * @param {Number} [flags] С„Р»Р°РіРё
         * @return {avcmx.Certificates}
         * @deprecated 1.1.1 Р—Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Connection#selectCertsDlgAsync}
         */
        selectCertsDlg: function (caption, label, flags) {
            flags = flags || 0;
            return this.factory(this.object.SelectCertificatesDialog(caption, label, flags), "Certificates");
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕР±СЉРµРєС‚Р° СЃРїРёСЃРєР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїСѓС‚РµРј РІРєР»СЋС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ,
         * РІС‹Р±СЂР°РЅРЅС‹С… РїРѕР»СЊР·РѕРІР°С‚РµР»РµРј С‡РµСЂРµР· РґРёР°Р»РѕРі РІС‹Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * РџСЂРёРјРµСЂ:
         *
         *     conn = ... // create connection
         *     conn.selectCertsDlgAsync("Р’С‹Р±РѕСЂ СЃРµСЂС‚РёС„РёС‚РєР°С‚Р°", "Р’С‹Р±РµСЂРёС‚Рµ СЃРµСЂС‚РёС„РёРєР°С‚", function (e, certs) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј certs
         *     });
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_ALL_CERT</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРµСЂРµР±РѕСЂР° РЅРµ
         * С‚РѕР»СЊРєРѕ РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р° РІСЃРµС… РёРјРµСЋС‰РёС…СЃСЏ РІ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         * - <b>AVCMF_ALL_CERT</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРѕРєР°Р·Р° РЅРµ С‚РѕР»СЊРєРѕ
         * РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р° РІСЃРµС… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, РёРјРµСЋС‰РёС…СЃСЏ РІ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * @param {String} caption РЅР°Р·РІР°РЅРёРµ РѕРєРЅР° РІС‹Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ. Р’ СЃР»СѓС‡Р°Рµ РїРµСЂРµРґР°С‡Рё
         * РїСѓСЃС‚РѕР№ СЃС‚СЂРѕРєРё Р±СѓРґРµС‚ РїРѕРєР°Р·Р°РЅРѕ РЅР°Р·РІР°РЅРёРµ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ.
         * @param {String} label СЃС‚СЂРѕРєР° РїРµСЂРµРґ СЃРїРёСЃРєРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРј. Р’ СЃР»СѓС‡Р°Рµ РїРµСЂРµРґР°С‡Рё
         * РїСѓСЃС‚РѕР№ СЃС‚СЂРѕРєРё Р±СѓРґРµС‚ РїРѕРєР°Р·Р°РЅР° СЃС‚СЂРѕРєР° РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ.
         * @param {Number} [flags] С„Р»Р°РіРё
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕР·РґР°РЅРЅРѕРіРѕ РєРѕРЅС‚РµРєСЃС‚Р° РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.Certificates} fn.certs РЅР°Р№РґРµРЅРЅС‹Рµ СЃРµСЂС‚РёС„РёРєР°С‚С‹, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        selectCertsDlgAsync: function (caption, label, flags, fn) {
            if (!isFunction(fn)) {
                fn = flags;
                flags = 0;
            }
            this.object.SelectCertificatesDialogAsync(caption, label, flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РЎРћРЎ РёР· СЃРїСЂР°РІРѕС‡РЅРёРєР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ
         *
         * РџРѕРёСЃРє РЎРћРЎ РїРѕ РїРѕР»РЅРѕР№ СЃС‚СЂРѕРєРµ РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ
         *
         *     conn = ... // create connection
         *     issuerName = "CN=РџРЈР¦, OU=РџРЈР¦, O=РџРЈР¦, STREET=РџРЈР¦, L=РџРЈР¦, ST=РџРЈР¦, C=BY";
         *     conn.getCRL(avcmx().params().add(AVCM_CRL_ISSUER_SUBJECT, avcmx().blob().zttext(issuerName)));
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РїР°СЂР°РјРµС‚СЂС‹ РїРѕРёСЃРєР°:
         *
         * - <b>AVCM_CRL_ISSUER_SUBJECT</b> вЂ“ РїРѕРёСЃРє РїРѕ РїРѕР»РЅРѕРјСѓ РёРјРµРЅРё (X.509 Name)
         * РёР·РґР°С‚РµР»СЏ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ РІРёРґРµ СЃС‚СЂРѕРєРё.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ.
         *
         * @param {avcmx.Parameters} params РїР°СЂР°РјРµС‚СЂС‹ РїРѕРёСЃРєР° РЎРћРЎ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.CRL}
         */
        getCRL: function (params, flags) {
            flags = flags || 0;
            return this.factory(this.object.GetCRL(params.get(), flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ РёР· СЃРїСЂР°РІРѕС‡РЅРёРєР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ.
         *
         * РџРѕРёСЃРє Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ РїРѕ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂСѓ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°
         *
         *     conn = ... // create connection
         *     pubKeyId = "00112233445566778899AABBCCDDEEFF00112233";
         *     conn.getReq(avcmx().params().add(AVCM_PUB_KEY_ID, avcmx().blob().zttext(pubKeyId)));
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РїР°СЂР°РјРµС‚СЂС‹ РїРѕРёСЃРєР°:
         *
         * - <b>AVCM_PUB_KEY_ID</b> вЂ“ РїРѕРёСЃРє РїРѕ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂСѓ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р° Р·Р°РїСЂРѕСЃР° РЅР°
         * СЃРµСЂС‚РёС„РёРєР°С‚ РІ РІРёРґРµ СЃС‚СЂРѕРєРё РІ HEX-С„РѕСЂРјР°С‚Рµ.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°
         *
         * @param {avcmx.Parameters} params РїР°СЂР°РјРµС‚СЂС‹ РїРѕРёСЃРєР° Р·Р°РїСЂРѕСЃР°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Request}
         */
        getReq: function (params, flags) {
            flags = flags || 0;
            return this.factory(this.object.GetRequest(params.get(), flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РёРјРїРѕСЂС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р° РёР»Рё Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° РёР· Р±Р»РѕРєР° РґР°РЅРЅС‹С… РІ СЃРїСЂР°РІРѕС‡РЅРёРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ.
         *
         * @param {avcmx.Blob} blob СЃРµСЂС‚РёС„РёРєР°С‚ РІ DER-РєРѕРґРёСЂРѕРІРєРµ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Certificate|avcmx.AttributeCertificate}
         */
        importCert: function (blob, flags) {
            flags = flags || 0;
            return this.factory(this.object.ImportCertificate(blob.get(), flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РёРјРїРѕСЂС‚Р° РЎРћРЎ РёР· Р±Р»РѕРєР° РґР°РЅРЅС‹С… РІ СЃРїСЂР°РІРѕС‡РЅРёРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ
         *
         * @param {avcmx.Blob} blob РЎРћРЎ РІ DER-РєРѕРґРёСЂРѕРІРєРµ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.CRL}
         */
        importCRL: function (blob, issuerCheck, flags) {
            if (flags === undefined) flags = (typeof issuerCheck === "number" ? issuerCheck : 0);
            if (!issuerCheck || issuerCheck === flags) issuerCheck = "";
            return this.factory(this.object.ImportCRL(blob.get(), issuerCheck, flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РёРјРїРѕСЂС‚Р° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ РёР· Р±Р»РѕРєР° РґР°РЅРЅС‹С… РІ СЃРїСЂР°РІРѕС‡РЅРёРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ
         *
         * @param {avcmx.Blob} blob Р·Р°РїСЂРѕСЃ РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ РІ DER-РєРѕРґРёСЂРѕРІРєРµ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Request}
         */
        importReq: function (blob, flags) {
            flags = flags || 0;
            return this.factory(this.object.ImportRequest(blob.get(), flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РёРјРїРѕСЂС‚Р° С†РµРїРѕС‡РєРё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё СЃРїРёСЃРєРѕРІ РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РёРµ
         * СЃРїСЂР°РІРѕС‡РЅРёРєРё. Р’С‹Р·РѕРІ РґР°РЅРЅРѕРіРѕ РјРµС‚РѕРґР° РјРѕР¶РµС‚ РїРѕСЂРѕР¶РґР°С‚СЊ РґРёР°Р»РѕРіРѕРІС‹Рµ РѕРєРЅР° РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ РїРµСЂРµРґР°РЅРЅС‹С… РїР°СЂР°РјРµС‚СЂРѕРІ,
         * РЅР°РїСЂРёРјРµСЂ, РµСЃР»Рё Р·Р°РґР°РЅРѕ РёРјСЏ РєРѕРЅС‚РµР№РЅРµСЂР°, С‚Рѕ Р±СѓРґРµС‚ РїСЂРѕРёРІРµРґРµРЅР° РїРѕРїС‹С‚РєР° РёРјРїРѕСЂС‚Р° РїРµСЂРІРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ
         * С†РµРїРѕС‡РєРµ (РѕР±С‹С‡РЅРѕ РїРµСЂРІС‹Рј РёРґРµС‚ РєРѕРЅРµС‡РЅС‹Р№ СЃРµСЂС‚РёС„РёРєР° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ) РІ Р»РёС‡РЅС‹Р№ СЃРїСЂР°РІРѕС‡РЅРёРє, С‡С‚Рѕ РјРѕР¶РµС‚ РїСЂРёРІРµСЃС‚Рё
         * Рє РїРѕСЏРІР»РµРЅРёСЋ РґРёР°Р»РѕРіР° СЃ РІРІРѕРґРѕРј РїР°СЂРѕР»СЏ, Р° С‚Р°РєР¶Рµ СЃС‚Р°РЅРґР°СЂС‚РЅРѕРіРѕ РґРёР°Р»РѕРіР° Windows РґР»СЏ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РёРјРїРѕСЂС‚Р° РєРѕСЂРЅРµРІРѕРіРѕ
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ СЃРїРёСЃРѕРє РґРѕРІРµСЂРµРЅРЅС‹С… С†РµРЅС‚СЂРѕРІ; РµСЃР»Рё Р¶Рµ РёРјСЏ РєРѕРЅС‚РµР№РЅРµСЂР° РЅРµ Р·Р°РґР°РЅРѕ, С‚Рѕ Р±СѓРґРµС‚ РѕС‚РѕР±СЂР°Р¶РµРЅ РјР°СЃС‚РµСЂ РёРјРїРѕСЂС‚Р°
         * СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ (Р°РЅР°Р»РѕРіРёС‡РЅРѕ РїРµСЂСЃРѕРЅР°Р»СЊРЅРѕРјСѓ РјРµРЅРµРґР¶РµСЂСѓ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ).
         *
         * @param {avcmx.Blob} blob С†РµРїРѕС‡РєР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ DER-РєРѕРґРёСЂРѕРІРєРµ.
         * @param {String} [container] РёРјСЏ РєРѕРЅС‚РµР№РЅРµСЂР° РґР»СЏ РёРјРїРѕСЂС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ Р»РёС‡РЅС‹Р№ СЃРїСЂР°РІРѕС‡РЅРёРє.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         * @since 1.1.0
         */
        importChain: function (blob, container, flags) {
            if (flags === undefined) flags = (typeof container === "number" ? container : 0);
            if (!container || container === flags) container = "";
            this.object.ImportChain(blob.get(), container, flags);
            return this;
        },

        sign: function (blob, oid, flags) {
            flags = flags || 0;
            return this.factory(this.object.SignBlob(blob.get(), oid, flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ СЃ РїРѕРјРѕС‰СЊСЋ РґРёР°Р»РѕРіР°.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Connection#createReqDlgAsync}</b>
         *
         * РЎРѕР·РґР°РЅРёРµ Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ СЃ РїРµСЂРµРґР°С‡РµР№ С€Р°Р±Р»РѕРЅР° Р·Р°РїСЂРѕСЃР° Рё РєР°СЂС‚РѕС‡РєРё РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°
         *
         *     conn = ... // create connection
         *     tpl = ... // receive base64 template
         *     card = ... // receive base64 cards
         *     params = avcmx().params()
         *     blob = avcmx().blob().base64(tpl)
         *     params.add(AVCM_TEMPLATE_DATA, blob.zttext(blob.text()))
         *     blob.base64(cards)
         *     params.add(AVCM_CARDS_DATA, blob.zttext(blob.text()))
         *     conn.createReqDlg(params)
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РїР°СЂР°РјРµС‚СЂС‹ РіРµРЅРµСЂР°С†РёРё:
         *
         * - <b>AVCM_TEMPLATE</b> вЂ“ РїСѓС‚СЊ Рє С„Р°Р№Р»Сѓ С€Р°Р±Р»РѕРЅР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚. Р•СЃР»Рё СѓРєР°Р·Р°РЅ РїСѓС‚СЊ Рє
         * С€Р°Р±Р»РѕРЅСѓ, С‚Рѕ РјР°СЃС‚РµСЂ РЅРµ Р±СѓРґРµС‚ РїСЂРµРґР»Р°РіР°С‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ РІС‹Р±РѕСЂ С€Р°Р±Р»РѕРЅР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° РїСѓС‚Рё Рє С„Р°Р№Р»Сѓ С€Р°Р±Р»РѕРЅР° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * - <b>AVCM_CERT_PROLONGATION</b> вЂ“ СЃРіРµРЅРµСЂРёСЂРѕРІР°С‚СЊ Р·Р°РїСЂРѕСЃ РЅР° РїСЂРѕРґР»РµРЅРёРµ
         * Р»РёС‡РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°, СЃ РїРѕРјРѕС‰СЊСЋ РєРѕС‚РѕСЂРѕРіРѕ Р±С‹Р» РїСЂРѕРёР·РІРµРґРµРЅ РІС…РѕРґ РІ СЃРёСЃС‚РµРјСѓ.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: РїСѓСЃС‚РѕРµ.
         * - <b>AVCM_TEMPLATE_DATA</b> вЂ“ РґР°РЅРЅС‹Рµ С€Р°Р±Р»РѕРЅР° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° СЃ С€Р°Р±Р»РѕРЅРѕРј Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * - <b>AVCM_CARDS_DATA</b> вЂ“ РґР°РЅРЅС‹Рµ С€Р°Р±Р»РѕРЅР° РєР°СЂС‚РѕС‡РєРё РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° СЃ С€РёР±Р»РѕРЅРѕРј РєР°СЂС‚РѕС‡РєРё РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°.
         *
         * @param {avcmx.Parameters} [params] РїР°СЂР°РјРµС‚СЂС‹ РіРµРЅРµСЂР°С†РёРё Р·Р°РїСЂРѕСЃР°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Request}
         * @deprecated 1.1.1 Р—Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Connection#createReqDlgAsync}
         */
        createReqDlg: function (params, flags) {
            if (flags === undefined) flags = (typeof params === "number" ? params : 0);
            params = (!params || (params === flags)) ? instance.CreateParameters(0) : params.get();
            return this.factory(this.object.CreateRequestDialog(params, flags));
        },


        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ СЃ РїРѕРјРѕС‰СЊСЋ РґРёР°Р»РѕРіР°.
         *
         * РЎРѕР·РґР°РЅРёРµ Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ СЃ РїРµСЂРµРґР°С‡РµР№ С€Р°Р±Р»РѕРЅР° Р·Р°РїСЂРѕСЃР° Рё РєР°СЂС‚РѕС‡РєРё РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°
         *
         *     conn = ... // create connection
         *     tpl = ... // receive base64 template
         *     card = ... // receive base64 cards
         *     params = avcmx().params()
         *     blob = avcmx().blob().base64(tpl)
         *     params.add(AVCM_TEMPLATE_DATA, blob.zttext(blob.text()))
         *     blob.base64(cards)
         *     params.add(AVCM_CARDS_DATA, blob.zttext(blob.text()))
         *     conn.createReqDlgAsync(params, function (e, req) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј req
         *     })
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РїР°СЂР°РјРµС‚СЂС‹ РіРµРЅРµСЂР°С†РёРё:
         *
         * - <b>AVCM_TEMPLATE</b> вЂ“ РїСѓС‚СЊ Рє С„Р°Р№Р»Сѓ С€Р°Р±Р»РѕРЅР° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚. Р•СЃР»Рё СѓРєР°Р·Р°РЅ РїСѓС‚СЊ Рє
         * С€Р°Р±Р»РѕРЅСѓ, С‚Рѕ РјР°СЃС‚РµСЂ РЅРµ Р±СѓРґРµС‚ РїСЂРµРґР»Р°РіР°С‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ РІС‹Р±РѕСЂ С€Р°Р±Р»РѕРЅР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° РїСѓС‚Рё Рє С„Р°Р№Р»Сѓ С€Р°Р±Р»РѕРЅР° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * - <b>AVCM_CERT_PROLONGATION</b> вЂ“ СЃРіРµРЅРµСЂРёСЂРѕРІР°С‚СЊ Р·Р°РїСЂРѕСЃ РЅР° РїСЂРѕРґР»РµРЅРёРµ
         * Р»РёС‡РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°, СЃ РїРѕРјРѕС‰СЊСЋ РєРѕС‚РѕСЂРѕРіРѕ Р±С‹Р» РїСЂРѕРёР·РІРµРґРµРЅ РІС…РѕРґ РІ СЃРёСЃС‚РµРјСѓ.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: РїСѓСЃС‚РѕРµ.
         * - <b>AVCM_TEMPLATE_DATA</b> вЂ“ РґР°РЅРЅС‹Рµ С€Р°Р±Р»РѕРЅР° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° СЃ С€Р°Р±Р»РѕРЅРѕРј Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚.
         * - <b>AVCM_CARDS_DATA</b> вЂ“ РґР°РЅРЅС‹Рµ С€Р°Р±Р»РѕРЅР° РєР°СЂС‚РѕС‡РєРё РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°.
         * Р—РЅР°С‡РµРЅРёРµ <b>Value</b>: СЃС‚СЂРѕРєР° СЃ С€РёР±Р»РѕРЅРѕРј РєР°СЂС‚РѕС‡РєРё РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°.
         *
         * @param {avcmx.Parameters} [params] РїР°СЂР°РјРµС‚СЂС‹ РіРµРЅРµСЂР°С†РёРё Р·Р°РїСЂРѕСЃР°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕР·РґР°РЅРЅРѕРіРѕ РєРѕРЅС‚РµРєСЃС‚Р° РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.Request} fn.req Р·Р°РїСЂРѕСЃ РЅР° СЃРµСЂС‚РёС„РёРєР°С‚, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        createReqDlgAsync: function (params, flags, fn) {
            if (isFunction(fn)) params = params.get();
            else {
                if (isFunction(flags)) {
                    fn = flags;
                    flags = (typeof params === "number" ? params : 0);
                    params = (!params || (params === flags)) ? instance.CreateParameters(0) : params.get();
                } else {
                    fn = params;
                    flags = 0;
                    params = instance.CreateParameters(0);
                }
            }
            this.object.CreateRequestDialogAsync(params, flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕР±СЉРµРєС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїСѓС‚РµРј РїРµСЂРµР±РѕСЂР° Рё РѕС‚Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ СЃРїСЂР°РІРѕС‡РЅРёРєРµ,
         * СѓРґРѕРІР»РµС‚РІРѕСЂСЏСЋС‰РёС… РѕРїСЂРµРґРµР»РµРЅРЅС‹Рј СѓСЃР»РѕРІРёСЏРј. РЈСЃР»РѕРІРёСЏ РґР»СЏ РїРѕРёСЃРєР° РїРµСЂРµРґР°СЋС‚СЃСЏ С‡РµСЂРµР· СЃС‚СЂРѕРєСѓ Р·Р°РїСЂРѕСЃР° (AvCryptSQL).
         * РџСЂРё СЌС‚РѕРј СЃР»РµРґСѓРµС‚ РѕС‚РјРµС‚РёС‚СЊ, С‡С‚Рѕ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РїРµСЂРµР±РѕСЂ РѕСЃСѓС‰РµСЃС‚РІР»СЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ СЃСЂРµРґРё РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ,
         * С‚Рѕ РµСЃС‚СЊ РґР»СЏ РєР°Р¶РґРѕРіРѕ РЅР°Р№РґРµРЅРЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїСЂРѕР·РІРѕРґРёС‚СЃСЏ РїРѕР»РЅР°СЏ РїСЂРѕРІРµСЂРєР° РµРіРѕ РєРѕСЂСЂРµРєС‚РЅРѕСЃС‚Рё.
         * РџСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РјРѕР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹ Р±РµР· РїСЂРѕРІРµСЂРєРё РєРѕСЂСЂРµРєС‚РЅРѕСЃС‚Рё, РґР»СЏ СЌС‚РѕРіРѕ РЅСѓР¶РЅРѕ СѓРєР°Р·Р°С‚СЊ С„Р»Р°Рі <b>AVCMF_ALL_CERT</b>.
         * Р•СЃР»Рё СЃС‚СЂРѕРєР° Р·Р°РїСЂРѕСЃР° РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚, С‚Рѕ Р±СѓРґСѓС‚ РІС‹Р±СЂР°РЅС‹ РІСЃРµ СЃРµСЂС‚РёС„РёРєР°С‚С‹.
         *
         * РџРѕРёСЃРє СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂСѓ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°
         *
         *     conn = ... // create connection
         *     conn.queryCerts("KeyId='00112233445566778899AABBCCDDEEFF00112233'", AVCMF_ALL_CERT);
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_ALL_CERT</b> вЂ“ РґР°РЅРЅС‹Р№ С„Р»Р°Рі РЅРµРѕР±С…РѕРґРёРјРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё РїРµСЂРµР±РѕСЂР° РЅРµ
         * С‚РѕР»СЊРєРѕ РєРѕСЂСЂРµРєС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р° РІСЃРµС… РёРјРµСЋС‰РёС…СЃСЏ РІ С…СЂР°РЅРёР»РёС‰Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * @param {String} [csql] СЃС‚СЂРѕРєР° Р·Р°РїСЂРѕСЃР° (AvCryptSQL)
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @return {avcmx.Certificates}
         * @since 1.1.1
         */
        queryCerts: function (csql, flags) {
            if (flags === undefined) flags = (typeof csql === "number" ? csql : 0);
            csql = (!csql || (csql === flags)) ? "" : csql;
            return this.factory(this.object.QueryCertificates(csql, flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕР±СЉРµРєС‚Р° Р·Р°РїСЂРѕСЃРѕРІ РїСѓС‚РµРј РїРµСЂРµР±РѕСЂР° Рё РѕС‚Р±РѕСЂР° Р·Р°РїСЂРѕСЃРѕРІ РІ СЃРїСЂР°РІРѕС‡РЅРёРєРµ,
         * СѓРґРѕРІР»РµС‚РІРѕСЂСЏСЋС‰РёС… РѕРїСЂРµРґРµР»РµРЅРЅС‹Рј СѓСЃР»РѕРІРёСЏРј. РЈСЃР»РѕРІРёСЏ РґР»СЏ РїРѕРёСЃРєР° РїРµСЂРµРґР°СЋС‚СЃСЏ С‡РµСЂРµР· СЃС‚СЂРѕРєСѓ Р·Р°РїСЂРѕСЃР° (AvCryptSQL).
         * Р•СЃР»Рё СЃС‚СЂРѕРєР° Р·Р°РїСЂРѕСЃР° РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚, С‚Рѕ Р±СѓРґСѓС‚ РІС‹Р±СЂР°РЅС‹ РІСЃРµ Р·Р°РїСЂРѕСЃС‹.
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РёРјРµСЋС‰РёС…СЃСЏ РІ СЃРїСЂР°РІРѕС‡РЅРёРєРµ Р·Р°РїСЂРѕСЃРѕРІ
         *
         *     conn = ... // create connection
         *     conn.queryReqs();
         *
         * РџРѕРёСЃРє Р·Р°РїСЂРѕСЃР° РїРѕ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂСѓ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р°
         *
         *     conn = ... // create connection
         *     conn.queryReqs("KeyId='00112233445566778899AABBCCDDEEFF00112233'");
         *
         * @param {String} [csql] СЃС‚СЂРѕРєР° Р·Р°РїСЂРѕСЃР° (AvCryptSQL)
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Requests}
         * @since 1.1.1
         */
        queryReqs: function (csql, flags) {
            if (flags === undefined) flags = (typeof csql === "number" ? csql : 0);
            csql = (!csql || (csql === flags)) ? "" : csql;
            return this.factory(this.object.QueryRequests(csql, flags));
        }
    });

    /**
     * @class avcmx.Message
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РєСЂРёРїС‚РѕРіСЂР°С„РёС‡РµСЃРєРёРјРё С„СѓРЅРєС†РёСЏРјРё. РЈ РЅРёС… РµСЃС‚СЊ РЅРµРєРѕС‚РѕСЂС‹Рµ РѕР±С‰РёРµ РјРµС‚РѕРґС‹
     * @typevar T
     * @extends avcmxobject.<native.AvCMX.Message>
     */
    avcmx.Message.prototype = extend(avcmx.Message.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕРґРїРёСЃР°РЅРёСЏ СЃРѕРѕР±С‰РµРЅРёСЏ. РџСЂРё СЌС‚РѕРј СЃРѕР·РґР°СђС‚СЃСЏ РїРѕРґРїРёСЃР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ РІ С„РѕСЂРјР°С‚Рµ
         * PKCS#7 SignedData, РїРѕРґРїРёСЃС‹РІР°РµС‚СЃСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРј, РЅР° РєРѕС‚РѕСЂРѕРј Р±С‹Р»Р° РѕС‚РєСЂС‹С‚Р° СЃРµСЃСЃРёСЏ,
         * (РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ С„Р»Р°РіР°) РІ СЃРѕРґРµСЂР¶РёРјРѕРµ РїРѕРјРµС‰Р°РµС‚СЃСЏ Blob С‚РµРєСѓС‰РµРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ, Рё РІ РїРѕР»Рµ
         * ContentType СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ С‚РёРї, СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РёР№ С‚РµРєСѓС‰РµРјСѓ СЃРѕРѕР±С‰РµРЅРёСЋ (РґР»СЏ Raw вЂ“ Data;
         * Signed вЂ“ SignedData; Encrypted вЂ“ EnvelopedData).
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Message#signAsync}</b>
         *
         * РЎРѕР·РґР°РЅРёРµ РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ (attached)
         *
         *     conn = ... // create connection
         *     conn.message(avcmx().blob().text("123")).sign()
         *
         * РЎРѕР·РґР°РЅРёРµ РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ (detached) СЃ СЃРµСЂС‚РёС„РёРєР°С‚РѕРј РїРѕРґРїРёСЃР°РЅС‚Р°
         *
         *     conn = ... // create connection
         *     conn.message(avcmx().blob().text("123")).sign(AVCMF_DETACHED | AVCMF_ADD_SIGN_CERT)
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_DETACHED</b> вЂ“ РїРѕРґРїРёСЃР°РЅРЅРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ РЅРµ Р±СѓРґРµС‚ РІРєР»СЋС‡РµРЅРѕ РІ СЃРѕРѕР±С‰РµРЅРёРµ.
         * Р’ С‚Р°РєРѕРј СЃР»СѓС‡Р°Рµ РїСЂРё РїСЂРѕРІРµСЂРєРµ СЃРѕРѕР±С‰РµРЅРёСЏ РЅРµРѕР±С…РѕРґРёРјРѕ Р±СѓРґРµС‚ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ СѓСЃС‚Р°РЅРѕРІРёС‚СЊ
         * СЃРѕРґРµСЂР¶РёРјРѕРµ РјРµС‚РѕРґРѕРј SetContent.
         * - <b>AVCMF_ADD_ALL_CERT</b> вЂ“ РІ РІС‹С…РѕРґРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ Р±СѓРґСѓС‚ РІРєР»СЋС‡РµРЅС‹ РІСЃРµ РЅРµРѕР±С…РѕРґРёРјС‹Рµ СЃРµСЂС‚РёС„РёРєР°С‚С‹ Рё РЎРћРЎ.
         * - <b>AVCMF_ADD_SIGN_CERT</b> вЂ“ РІ РІС‹С…РѕРґРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ Р±СѓРґРµС‚ РІРєР»СЋС‡РµРЅ С‚РѕР»СЊРєРѕ СЃРµСЂС‚РёС„РёРєР°С‚ РїРѕРґРїРёСЃР°РІС€РµРіРѕ.
         * - <b>AVCMF_REPEAT_AUTHENTICATION</b> вЂ“ РїРµСЂРµРґ РІС‹СЂР°Р±РѕС‚РєРѕР№ Р­Р¦Рџ СЃРёСЃС‚РµРјР° РїРѕС‚СЂРµР±СѓРµС‚ РїРѕРІС‚РѕСЂРЅРѕРіРѕ РІРІРѕРґР°
         * РїР°СЂРѕР»СЏ Рє РєРѕРЅС‚РµР№РЅРµСЂСѓ Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№, РїСЂРѕРІРµСЂРёС‚ РЅР°Р»РёС‡РёРµ РєРѕРЅС‚РµР№РЅРµСЂР° РЅР° РІСЃС‚Р°РІР»РµРЅРЅРѕРј РЅРѕСЃРёС‚РµР»Рµ Рё
         * СѓР±РµРґРёС‚СЃСЏ РІ РїСЂР°РІРёР»СЊРЅРѕСЃС‚Рё РІРІРµРґРµРЅРЅРѕРіРѕ РїР°СЂРѕР»СЏ.
         *
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @return {avcmx.SignedMessage}
         * @deprecated 1.1.1 Р·Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Message#signAsync}
         */
        sign: function (flags) {
            flags = flags || 0;
            return this.factory(this.object.Sign(flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕРґРїРёСЃР°РЅРёСЏ СЃРѕРѕР±С‰РµРЅРёСЏ. РџСЂРё СЌС‚РѕРј СЃРѕР·РґР°СђС‚СЃСЏ РїРѕРґРїРёСЃР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ РІ С„РѕСЂРјР°С‚Рµ
         * PKCS#7 SignedData, РїРѕРґРїРёСЃС‹РІР°РµС‚СЃСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРј, РЅР° РєРѕС‚РѕСЂРѕРј Р±С‹Р»Р° РѕС‚РєСЂС‹С‚Р° СЃРµСЃСЃРёСЏ,
         * (РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ С„Р»Р°РіР°) РІ СЃРѕРґРµСЂР¶РёРјРѕРµ РїРѕРјРµС‰Р°РµС‚СЃСЏ Blob С‚РµРєСѓС‰РµРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ, Рё РІ РїРѕР»Рµ
         * ContentType СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ С‚РёРї, СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РёР№ С‚РµРєСѓС‰РµРјСѓ СЃРѕРѕР±С‰РµРЅРёСЋ (РґР»СЏ Raw вЂ“ Data;
         * Signed вЂ“ SignedData; Encrypted вЂ“ EnvelopedData).
         *
         * РЎРѕР·РґР°РЅРёРµ РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ (attached)
         *
         *     conn = ... // create connection
         *     conn.message(avcmx().blob().text("123")).signAsync(function (e, signed) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј signed
         *     })
         *
         * РЎРѕР·РґР°РЅРёРµ РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ (detached) СЃ СЃРµСЂС‚РёС„РёРєР°С‚РѕРј РїРѕРґРїРёСЃР°РЅС‚Р°
         *
         *     conn = ... // create connection
         *     conn.message(avcmx().blob().text("123")).signAsync(AVCMF_DETACHED | AVCMF_ADD_SIGN_CERT, function (e, signed) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј signed
         *     })
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_DETACHED</b> вЂ“ РїРѕРґРїРёСЃР°РЅРЅРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ РЅРµ Р±СѓРґРµС‚ РІРєР»СЋС‡РµРЅРѕ РІ СЃРѕРѕР±С‰РµРЅРёРµ.
         * Р’ С‚Р°РєРѕРј СЃР»СѓС‡Р°Рµ РїСЂРё РїСЂРѕРІРµСЂРєРµ СЃРѕРѕР±С‰РµРЅРёСЏ РЅРµРѕР±С…РѕРґРёРјРѕ Р±СѓРґРµС‚ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ СѓСЃС‚Р°РЅРѕРІРёС‚СЊ
         * СЃРѕРґРµСЂР¶РёРјРѕРµ РјРµС‚РѕРґРѕРј SetContent.
         * - <b>AVCMF_ADD_ALL_CERT</b> вЂ“ РІ РІС‹С…РѕРґРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ Р±СѓРґСѓС‚ РІРєР»СЋС‡РµРЅС‹ РІСЃРµ РЅРµРѕР±С…РѕРґРёРјС‹Рµ СЃРµСЂС‚РёС„РёРєР°С‚С‹ Рё РЎРћРЎ.
         * - <b>AVCMF_ADD_SIGN_CERT</b> вЂ“ РІ РІС‹С…РѕРґРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ Р±СѓРґРµС‚ РІРєР»СЋС‡РµРЅ С‚РѕР»СЊРєРѕ СЃРµСЂС‚РёС„РёРєР°С‚ РїРѕРґРїРёСЃР°РІС€РµРіРѕ.
         * - <b>AVCMF_REPEAT_AUTHENTICATION</b> вЂ“ РїРµСЂРµРґ РІС‹СЂР°Р±РѕС‚РєРѕР№ Р­Р¦Рџ СЃРёСЃС‚РµРјР° РїРѕС‚СЂРµР±СѓРµС‚ РїРѕРІС‚РѕСЂРЅРѕРіРѕ РІРІРѕРґР°
         * РїР°СЂРѕР»СЏ Рє РєРѕРЅС‚РµР№РЅРµСЂСѓ Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№, РїСЂРѕРІРµСЂРёС‚ РЅР°Р»РёС‡РёРµ РєРѕРЅС‚РµР№РЅРµСЂР° РЅР° РІСЃС‚Р°РІР»РµРЅРЅРѕРј РЅРѕСЃРёС‚РµР»Рµ Рё
         * СѓР±РµРґРёС‚СЃСЏ РІ РїСЂР°РІРёР»СЊРЅРѕСЃС‚Рё РІРІРµРґРµРЅРЅРѕРіРѕ РїР°СЂРѕР»СЏ.
         *
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕРѕР±С‰РµРЅРёСЏ РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.SignedMessage} fn.signed РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        signAsync: function (flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.SignAsync(flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ Р·Р°С€РёС„СЂРѕРІР°РЅРёСЏ СЃРѕРѕР±С‰РµРЅРёСЏ. РџСЂРё СЌС‚РѕРј СЃРѕР·РґР°СђС‚СЃСЏ РїРѕРґРїРёСЃР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ РІ С„РѕСЂРјР°С‚Рµ
         * PKCS#7 EncryptedData, Рё РІ РЅРµРіРѕ РїРѕРјРµС‰Р°РµС‚СЃСЏ РІ РєР°С‡РµСЃС‚РІРµ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ Blob С‚РµРєСѓС‰РµРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ,
         * Р·Р°С€РёС„СЂРѕРІР°РЅРЅС‹Р№ РЅР° РІСЃРµ СЃРµСЂС‚РёС„РёРєР°С‚С‹, РЅР°С…РѕРґСЏС‰РёРµСЃСЏ РІ РїРµСЂРµРґР°РЅРЅРѕРј РѕР±СЉРµРєС‚Рµ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ. Р’ РїРѕР»Рµ
         * ContentType СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ С‚РёРї, СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РёР№ С‚РµРєСѓС‰РµРјСѓ СЃРѕРѕР±С‰РµРЅРёСЋ (РґР»СЏ Raw вЂ“ Data; Signed вЂ“ SignedData;
         * Encrypted вЂ“ EnvelopedData).
         *
         * Р—Р°С€РёС„СЂРѕРІР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         *     conn = ... // create connection
         *     certs = ... // select certificates
         *     conn.message(avcmx().blob().text("123")).encrypt(certs)
         *
         * @param {avcmx.Certificates} certs РјРЅРѕР¶РµСЃС‚РІРѕ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕР»СѓС‡Р°С‚РµР»РµР№. РЎРѕРѕР±С‰РµРЅРёРµ Р±СѓРґРµС‚ Р·Р°С€РёС„СЂРѕРІР°РЅРѕ
         * РЅР° РІСЃРµ СЃРµСЂС‚РёС„РёРєР°С‚С‹, РєРѕС‚РѕСЂС‹Рµ РїСЂРёСЃСѓС‚СЃС‚РІСѓСЋС‚ РІ РґР°РЅРЅРѕРј РѕР±СЉРµРєС‚Рµ; РїРѕСЌС‚РѕРјСѓ РІ СЃР»СѓС‡Р°Рµ РЅР°С…РѕР¶РґРµРЅРёСЏ С‚Р°Рј С…РѕС‚СЏ Р±С‹
         * РѕРґРЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°, РЅРµ РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅРЅРѕРіРѕ РґР»СЏ Р·Р°С€РёС„СЂРѕРІР°РЅРёСЏ, РїСЂРѕРёР·РѕР№РґСђС‚ РѕС€РёР±РєР°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.EncryptedMessage}
         */
        encrypt: function (certs, flags) {
            flags = flags || 0;
            var tmp = this.object.Encrypt(certs.get(), flags);
            if (avcmx.oldActiveX && !tmp) {
                return this;
            } else {
                return this.factory(tmp);
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРѕРѕР±С‰РµРЅРёСЏ РІ СЌРєСЃРїРѕСЂС‚РёСЂСѓРµРјРѕРј РІРёРґРµ. Р’ СЃР»СѓС‡Р°Рµ РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ Рё Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ,
         * РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ DER Р·Р°РєРѕРґРёСЂРѕРІР°РЅРЅС‹Р№ PKCS#7; РІ СЃР»СѓС‡Р°Рµ В«СЃС‹СЂРѕРіРѕВ» СЃРѕРѕР±С‰РµРЅРёСЏ РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РµРіРѕ СЃРѕРґРµСЂР¶РёРјРѕРµ.
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Blob);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° Рє РѕС‚РєСЂС‹С‚РѕРјСѓ РґР»СЏ РїРѕРґРїРёСЃР°РЅРёСЏ СЃРѕРѕР±С‰РµРЅРёСЋ.
         *
         * @param {avcmx.AttributeCertificate} acert РґРѕР±Р°РІР»СЏРµРјС‹Р№ Р°С‚СЂРёР±СѓС‚РЅС‹Р№ СЃРµСЂС‚РёС„РёРєР°С‚.
         * @chainable
         * @since 1.1.4
         */
        attrCert: function (acert) {
            this.object.AttributeCertificate = acert.get();
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё СЏРІР»СЏРµС‚СЃСЏ Р»Рё РґР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ "СЃС‹СЂС‹Рј"
         * @return {Boolean}
         */
        isRaw: function () {
            return this.object.IsRaw();
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё СЏРІР»СЏРµС‚СЃСЏ Р»Рё РґР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ РїРѕРґРїРёСЃР°РЅРЅС‹Рј
         * @return {Boolean}
         */
        isSigned: function () {
            return this.object.IsSigned();
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё СЏРІР»СЏРµС‚СЃСЏ Р»Рё РґР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ Р·Р°С€РёС„СЂРѕРІР°РЅРЅС‹Рј
         * @return {Boolean}
         */
        isEncrypted: function () {
            return this.object.IsEncrypted();
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ Р±Р»РѕРєРѕРІ РґР°РЅРЅС‹С… Рє СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ. Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ С‚РѕР»СЊРєРѕ
         * РґР»СЏ СЃРѕРѕР±С‰РµРЅРёР№ СЃРѕР·РґР°РЅРЅС‹С… СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С„Р»Р°РіРѕРІ <b>AVCMF_OPEN_FOR_SIGN</b>, <b>AVCMF_OPEN_FOR_VERIFYSIGN</b>,
         * <b>AVCMF_OPEN_FOR_ENCRYPT</b>, <b>AVCMF_OPEN_FOR_DECRYPT</b> СЃ РїРѕРјРѕС‰СЊСЋ РјРµС‚РѕРґР° {@link avcmx.Connection#message}.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ detached СЃРѕРѕР±С‰РµРЅРёСЏРјРё (СЃРѕР·РґР°РЅРЅС‹Рµ СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С„Р»Р°РіР°
         * AVCMF_DETACHED) Рё РЅРµ РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±СЂР°Р±РѕС‚Р°РЅРЅС‹С… РґР°РЅРЅС‹С…. РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ РјРµС‚РѕРґР° РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ Р·Р°С€РёС„СЂРѕРІР°РЅРЅС‹РјРё СЃРѕРѕР±С‰РµРЅРёСЏРјРё
         * Р±РѕР»СЊС€РѕРіРѕ СЂР°Р·РјРµСЂР° РЅРµ СЂРµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ. РџСЂРё РІС‹Р·РѕРІРµ Р·Р°РІРµСЂС€Р°СЋС‰РёС… РјРµС‚РѕРґРѕРІ {@link avcmx.Message#final} РёР»Рё
         * {@link avcmx.Message#finalAsync} Сѓ СЃРѕРѕР±С‰РµРЅРёСЏ, РґР°РЅРЅС‹Рµ РєРѕС‚РѕСЂРѕРјСѓ РїРµСЂРµРґР°РІР°Р»РёСЃСЊ СЃ РїРѕРјРѕС‰СЊСЋ РґР°РЅРЅРѕРіРѕ РјРµС‚РѕРґР°, Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅРѕ
         * С†РµР»РѕРµ РїРѕРґРїРёСЃР°РЅРЅРѕРµ РёР»Рё Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ. Р”Р»СЏ РѕР±СЂР°Р±РѕС‚РєРё Р±Р»РѕРєРѕРІ РґР°РЅРЅС‹С… РІ Р»СЋР±РѕРј СЂРµР¶РёРјРµ Рё РїРѕР»СѓС‡РµРЅРёСЏ СЂРµР·СѓР»СЊС‚Р°С‚Р°
         * СЂРµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Message#updateAsync}</b>.
         *
         * @param {avcmx.Blob} blob РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        update: function (blob, flags) {
            flags = flags || 0;
            this.object.Update(blob.get(), flags);
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ Р±Р»РѕРєРѕРІ РґР°РЅРЅС‹С… Рє СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ Рё РѕР±СЂР°Р±РѕС‚РєРё СЂРµР·СѓР»СЊС‚Р°С‚Р°. Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚
         * Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ С‚РѕР»СЊРєРѕ РґР»СЏ СЃРѕРѕР±С‰РµРЅРёР№ СЃРѕР·РґР°РЅРЅС‹С… СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С„Р»Р°РіРѕРІ <b>AVCMF_OPEN_FOR_SIGN</b>,
         * <b>AVCMF_OPEN_FOR_VERIFYSIGN</b>, <b>AVCMF_OPEN_FOR_ENCRYPT</b>, <b>AVCMF_OPEN_FOR_DECRYPT</b> СЃ РїРѕРјРѕС‰СЊСЋ
         * РјРµС‚РѕРґР° {@link avcmx.Connection#message}.
         *
         * @param {avcmx.Blob} blob РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РІС‹С…РѕРґРЅС‹С… РґР°РЅРЅС‹С… РёР»Рё РѕС€РёР±РєРё.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.Blob} fn.blob РѕР±СЉРµРєС‚ РІС‹С…РѕРґРЅС‹С… РґР°РЅРЅС‹С…, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.3
         */
        updateAsync: function (blob, flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.UpdateAsync(blob.get(), flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ Р·Р°РІРµСЂС€Р°СЋС‰РµРіРѕ Р±Р»РѕРєР° РґР°РЅРЅС‹С… Рє СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ РґР»СЏ РїРѕСЃР»РµРґСѓСЋС‰РµРіРѕ РїРѕРґРїРёСЃР°РЅРёСЏ
         * РёР»Рё РїСЂРѕРІРµСЂРєРё РїРѕРґРїРёСЃРё. Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ С‚РѕР»СЊРєРѕ РґР»СЏ СЃРѕРѕР±С‰РµРЅРёР№ СЃРѕР·РґР°РЅРЅС‹С… СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С„Р»Р°РіРѕРІ
         * (<b>AVCMF_OPEN_FOR_SIGN</b> | <b>AVCMF_DETACHED</b>) РёР»Рё (<b>AVCMF_OPEN_FOR_VERIFYSIGN</b> | <b>AVCMF_DETACHED</b>)
         * СЃ РїРѕРјРѕС‰СЊСЋ РјРµС‚РѕРґР° {@link avcmx.Connection#message}.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Message#finalAsync}</b>
         *
         * РџРѕРґРїРёСЃР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ СЃРѕСЃС‚РѕСЏС‰РµРіРѕ РёР· РґРІСѓС… Р±Р»РѕРєРѕРІ
         *
         *     conn = ... // create connection
         *     msg = conn.message(AVCMF_OPEN_FOR_SIGN | AVCMF_DETACHED)
         *     signed = msg.update(avcmx().blob().text("123"))
         *         .final(avcmx().blob().text("321"))
         *     // signed instanceof avcmx.SignedMessage == true
         *
         * РџСЂРѕРІРµСЂРєР° РїРѕРґРїРёСЃРё РїРѕРґ СЃРѕРѕР±С‰РµРЅРёРµРј СЃРѕСЃС‚РѕСЏС‰РµРіРѕ РёР· РґРІСѓС… Р±Р»РѕРєРѕРІ
         *
         *     conn = ... // create connection
         *     signedData = ... // create signed data blob
         *     signed = conn.message(signedData, AVCMF_OPEN_FOR_VERIFYSIGN | AVCMF_DETACHED)
         *     valid = signed.update(avcmx().blob().text("123"))
         *         .final(avcmx().blob().text("321")).verify()
         *
         * @param {avcmx.Blob} blob РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.SignedMessage|avcmx.EncryptedMessage}
         * @deprecated 1.1.1 Р·Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Message#finalAsync}
         */
        final: function (blob, flags) {
            flags = flags || 0;
            var tmp = this.object.Final(blob.get(), flags);
            if (avcmx.oldActiveX && !tmp) {
                return this;
            } else {
                return this.factory(tmp);
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ Р·Р°РІРµСЂС€Р°СЋС‰РµРіРѕ Р±Р»РѕРєР° РґР°РЅРЅС‹С… Рє СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ Рё РѕР±СЂР°Р±РѕС‚РєРё СЂРµР·СѓР»СЊС‚Р°С‚Р°. Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚
         * Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ С‚РѕР»СЊРєРѕ РґР»СЏ СЃРѕРѕР±С‰РµРЅРёР№ СЃРѕР·РґР°РЅРЅС‹С… СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С„Р»Р°РіРѕРІ <b>AVCMF_OPEN_FOR_SIGN</b>,
         * <b>AVCMF_OPEN_FOR_VERIFYSIGN</b>, <b>AVCMF_OPEN_FOR_ENCRYPT</b>, <b>AVCMF_OPEN_FOR_DECRYPT</b> СЃ РїРѕРјРѕС‰СЊСЋ
         * РјРµС‚РѕРґР° {@link avcmx.Connection#message}.
         *
         * РўРёРї СЂРµР·СѓР»СЊС‚Р°С‚Р° РјРѕР¶РµС‚ РѕС‚Р»РёС‡Р°С‚СЊСЃСЏ РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ РёСЃРїРѕР»СЊР·РѕРІР°РЅРЅРѕРіРѕ РјРµС‚РѕРґР° РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ Р±Р»РѕРєРѕРІ:
         *
         * - РїСЂРё РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРё РјРµС‚РѕРґР° {@link avcmx.Message#update} СЂРµР·СѓР»СЊС‚Р°С‚РѕРј Р±СѓРґРµС‚ РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ
         * - РїСЂРё РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРё РјРµС‚РѕРґР° {@link avcmx.Message#updateAsync} СЂРµР·СѓР»СЊС‚Р°С‚РѕРј Р±СѓРґРµС‚ РѕР±СЉРµРєС‚ Р·Р°РІРµСЂС€Р°СЋС‰РµРіРѕ Р±Р»РѕРєР° РѕР±СЂР°Р±РѕС‚Р°РЅРЅС‹С… РґР°РЅРЅС‹С…
         *
         * РџРѕРґРїРёСЃР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ СЃРѕСЃС‚РѕСЏС‰РµРіРѕ РёР· РґРІСѓС… Р±Р»РѕРєРѕРІ (detached)
         *
         *     conn = ... // create connection
         *     msg = conn.message(AVCMF_OPEN_FOR_SIGN | AVCMF_DETACHED)
         *     msg.update(avcmx().blob().text("123"))
         *         .finalAsync(avcmx().blob().text("321"), function (e, msg) {
         *             if (e) { alert(e.message); return; }
         *             // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј msg - РїРѕРґРїРёСЃР°РЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ
         *         })
         *
         * РџРѕРґРїРёСЃР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ СЃРѕСЃС‚РѕСЏС‰РµРіРѕ РёР· РґРІСѓС… Р±Р»РѕРєРѕРІ (attached)
         *
         *     conn = ... // create connection
         *     msg = conn.message(AVCMF_OPEN_FOR_SIGN)
         *     msg.updateAsync(avcmx().blob().text("123"), function (e, blob) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј blob - РїРµСЂРІС‹Р№ Р±Р»РѕРє РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ
         *     }).finalAsync(avcmx().blob().text("321"), function (e, blob) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј blob - Р·Р°РІРµСЂС€Р°СЋС‰РёР№ Р±Р»РѕРє РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ
         *     })
         *
         * @param {avcmx.Blob} blob РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕРѕР±С‰РµРЅРёСЏ РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.SignedMessage|avcmx.EncryptedMessage|avcmx.Blob} fn.msgOrBlob РѕР±СЉРµРєС‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        finalAsync: function (blob, flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.FinalAsync(blob.get(), flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ СѓСЃС‚Р°РЅРѕРІРєРё С…РµС€Р° РѕС‚ СЃРѕРѕР±С‰РµРЅРёСЏ, Р° РЅРµ РґР°РЅРЅС‹С… С†РµР»РёРєРѕРј, РґР»СЏ РїРѕСЃР»РµРґСѓСЋС‰РµРіРѕ РїРѕРґРїРёСЃР°РЅРёСЏ РёР»Рё РїСЂРѕРІРµСЂРєРё РїРѕРґРїРёСЃРё.
         * Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ С‚РѕР»СЊРєРѕ РґР»СЏ СЃРѕРѕР±С‰РµРЅРёР№ СЃРѕР·РґР°РЅРЅС‹С… СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С„Р»Р°РіРѕРІ
         * (<b>AVCMF_OPEN_FOR_SIGN</b> | <b>AVCMF_DETACHED</b>) РёР»Рё (<b>AVCMF_OPEN_FOR_VERIFYSIGN</b> | <b>AVCMF_DETACHED</b>)
         * СЃ РїРѕРјРѕС‰СЊСЋ РјРµС‚РѕРґР° {@link avcmx.Connection#message}.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Message#finalHashAsync}</b>
         *
         * РџРѕРґРїРёСЃР°РЅРёРµ С…РµС€Р° РѕС‚ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         *     conn = ... // create connection
         *     hash = "00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF"
         *     msg = conn.message(AVCMF_OPEN_FOR_SIGN | AVCMF_DETACHED)
         *     signed = msg.finalHash(avcmx().blob().hex(hash))
         *     // signed instanceof avcmx.SignedMessage == true
         *
         * РџСЂРѕРІРµСЂРєР° РїРѕРґРїРёСЃРё РїРѕРґ СЃРѕРѕР±С‰РµРЅРёРµРј РѕС‚ С…РµС€Р°
         *
         *     conn = ... // create connection
         *     signedData = ... // create signed data blob
         *     hash = "00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF"
         *     signed = conn.message(signedData, AVCMF_OPEN_FOR_VERIFYSIGN | AVCMF_DETACHED)
         *     valid = signed.finalHash(avcmx().blob().hex(hash)).verify()
         *
         * @param {avcmx.Blob} blob С…РµС€ РѕС‚ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @return {avcmx.SignedMessage}
         * @deprecated 1.1.1 Р·Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Message#finalHashAsync}
         */
        finalHash: function (blob) {
            var tmp = this.object.FinalHashed(blob.get());
            if (avcmx.oldActiveX && !tmp) {
                return this;
            } else {
                return this.factory(tmp);
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ СѓСЃС‚Р°РЅРѕРІРєРё С…РµС€Р° РѕС‚ СЃРѕРѕР±С‰РµРЅРёСЏ, Р° РЅРµ РґР°РЅРЅС‹С… С†РµР»РёРєРѕРј, РґР»СЏ РїРѕСЃР»РµРґСѓСЋС‰РµРіРѕ РїРѕРґРїРёСЃР°РЅРёСЏ РёР»Рё РїСЂРѕРІРµСЂРєРё РїРѕРґРїРёСЃРё.
         * Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ Р±С‹С‚СЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅ С‚РѕР»СЊРєРѕ РґР»СЏ СЃРѕРѕР±С‰РµРЅРёР№ СЃРѕР·РґР°РЅРЅС‹С… СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј С„Р»Р°РіРѕРІ
         * (<b>AVCMF_OPEN_FOR_SIGN</b> | <b>AVCMF_DETACHED</b>) РёР»Рё (<b>AVCMF_OPEN_FOR_VERIFYSIGN</b> | <b>AVCMF_DETACHED</b>)
         * СЃ РїРѕРјРѕС‰СЊСЋ РјРµС‚РѕРґР° {@link avcmx.Connection#message}.
         *
         * РџРѕРґРїРёСЃР°РЅРёРµ С…РµС€Р° РѕС‚ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         *     conn = ... // create connection
         *     hash = "00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF"
         *     msg = conn.message(AVCMF_OPEN_FOR_SIGN | AVCMF_DETACHED)
         *     msg.finalHashAsync(avcmx().blob().hex(hash), function (e, signed) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј signed
         *     })
         *
         * @param {avcmx.Blob} blob С…РµС€ РѕС‚ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕРѕР±С‰РµРЅРёСЏ РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.SignedMessage} fn.signed РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        finalHashAsync: function (blob, fn) {
            this.object.FinalHashedAsync(blob.get(), this.makeAsync(fn));
            return this;
        }
    });

    /**
     * @class avcmx.RawMessage
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РґР°РЅРЅС‹РјРё РЅРµ РІ С„РѕСЂРјР°С‚Рµ PKCS#7; РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕРґРїРёСЃР°РЅРёСЏ РёР»Рё Р·Р°С€РёС„СЂРѕРІР°РЅРёСЏ,
     * РёР»Рё РїРѕСЃР»Рµ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ
     * @extends avcmx.Message.<native.AvCMX.RawMessage>
     */
    avcmx.RawMessage.prototype = extend(avcmx.RawMessage.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё Рё РїРѕР»СѓС‡РµРЅРёСЏ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ. РћРЅРѕ С‚Р°РєР¶Рµ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ РїСЂРё
         * СЃРѕР·РґР°РЅРёРё СЃРѕРѕР±С‰РµРЅРёСЏ РјРµС‚РѕРґРѕРј {@link avcmx.Connection#message} (РїР°СЂР°РјРµС‚СЂ blob)
         *
         * @param {avcmx.Blob} blob РЅРѕРІРѕРµ РёР»Рё РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @return {avcmx.Blob|avcmx.RawMessage} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ, РїСЂРё
         * РїРѕР»СѓС‡РµРЅРёРё - РѕР±СЉРµРєС‚ Р±Р»РѕР±.
         */
        content: function (blob) {
            if (blob) {
                this.object.Content = blob.get();
                return this;
            } else {
                return this.factory(this.object.Content);
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ РґР°РЅРЅС‹С… Рє СѓР¶Рµ СѓСЃС‚Р°РЅРѕРІР»РµРЅРЅРѕРјСѓ СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         * @param {avcmx.Blob} blob РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        append: function (blob, flags) {
            flags = flags || 0;
            this.object.AppendContent(blob.get(), flags);
            return this;
        }
    });

    /**
     * @class avcmx.SignedMessage
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РґР°РЅРЅС‹РјРё РІ С„РѕСЂРјР°С‚Рµ PKCS#7 SignedData; РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїСЂРѕРІРµСЂРєРё РїРѕРґРїРёСЃРё РїРѕРґ
     * С‚РµРєСЃС‚РѕРј, РёР»Рё РґР»СЏ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
     * @extends avcmx.Message.<native.AvCMX.SignedMessage>
     */
    avcmx.SignedMessage.prototype = extend(avcmx.SignedMessage.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё Рё РїРѕР»СѓС‡РµРЅРёСЏ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ. РћРЅРѕ С‚Р°РєР¶Рµ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ РїСЂРё
         * СЃРѕР·РґР°РЅРёРё СЃРѕРѕР±С‰РµРЅРёСЏ РјРµС‚РѕРґРѕРј {@link avcmx.Connection#message} (РїР°СЂР°РјРµС‚СЂ blob)
         *
         * @param {avcmx.Blob} blob РЅРѕРІРѕРµ РёР»Рё РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @return {avcmx.Blob|avcmx.SignedMessage} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РґР°РЅРЅС‹С… РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ, РїСЂРё
         * РїРѕР»СѓС‡РµРЅРёРё - РѕР±СЉРµРєС‚ Р±Р»РѕР±.
         */
        content: function (blob) {
            if (blob) {
                this.object.Content = blob.get();
                return this;
            } else {
                return this.factory(this.object.Content);
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ РґР°РЅРЅС‹С… Рє СѓР¶Рµ СѓСЃС‚Р°РЅРѕРІР»РµРЅРЅРѕРјСѓ СЃРѕРґРµСЂР¶РёРјРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         * @param {avcmx.Blob} blob РґРѕР±Р°РІР»СЏРµРјРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        append: function (blob, flags) {
            flags = flags || 0;
            this.object.AppendContent(blob.get(), flags);
            return this;
        },

        /**
         * Р’РѕР·РІСЂР°С‰Р°РµС‚ РєРѕР»РёС‡РµСЃС‚РІРѕ РїРѕРґРїРёСЃРµР№ РІ РїРѕРґРїРёСЃР°РЅРЅРѕРј СЃРѕРѕР±С‰РµРЅРёРё.
         * @return {Number}
         */
        signsCount: function () {
            return parseInt(this.object.SignsCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ РїРѕРґРїРёСЃРё Рє РїРѕРґРїРёСЃР°РЅРЅРѕРјСѓ СЃРѕРѕР±С‰РµРЅРёСЋ. РџСЂРё СЌС‚РѕРј СѓСЃС‚Р°РЅРѕРІР»РµРЅРЅРѕРµ СЃРѕРґРµСЂР¶РёРјРѕРµ
         * РїРѕРґРїРёСЃС‹РІР°РµС‚СЃСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРј, РЅР° РєРѕС‚РѕСЂРѕРј Р±С‹Р» РїСЂРѕРёР·РІРµРґСђРЅ РІС…РѕРґ РІ СЃРµСЃСЃРёСЋ, Рё РїРѕР»СѓС‡РµРЅРЅР°СЏ
         * Р­Р¦Рџ РґРѕР±Р°РІР»СЏРµС‚СЃСЏ Рє СЃРѕРѕР±С‰РµРЅРёСЋ.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_ADD_ALL_CERT</b> вЂ“ РІ РІС‹С…РѕРґРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ Р±СѓРґСѓС‚ РІРєР»СЋС‡РµРЅС‹ РІСЃРµ РЅРµРѕР±С…РѕРґРёРјС‹Рµ СЃРµСЂС‚РёС„РёРєР°С‚С‹ Рё РЎРћРЎ.
         * - <b>AVCMF_ADD_SIGN_CERT</b> вЂ“ РІ РІС‹С…РѕРґРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ Р±СѓРґРµС‚ РІРєР»СЋС‡РµРЅ С‚РѕР»СЊРєРѕ СЃРµСЂС‚РёС„РёРєР°С‚ РїРѕРґРїРёСЃР°РІС€РµРіРѕ.
         * - <b>AVCMF_REPEAT_AUTHENTICATION</b> вЂ“ РїРµСЂРµРґ РІС‹СЂР°Р±РѕС‚РєРѕР№ Р­Р¦Рџ СЃРёСЃС‚РµРјР° РїРѕС‚СЂРµР±СѓРµС‚ РїРѕРІС‚РѕСЂРЅРѕРіРѕ РІРІРѕРґР° РїР°СЂРѕР»СЏ
         * Рє РєРѕРЅС‚РµР№РЅРµСЂСѓ Р»РёС‡РЅС‹С… РєР»СЋС‡РµР№, РїСЂРѕРІРµСЂРёС‚ РЅР°Р»РёС‡РёРµ РєРѕРЅС‚РµР№РЅРµСЂР° РЅР° РІСЃС‚Р°РІР»РµРЅРЅРѕРј РЅРѕСЃРёС‚РµР»Рµ Рё СѓР±РµРґРёС‚СЃСЏ РІ РїСЂР°РІРёР»СЊРЅРѕСЃС‚Рё РІРІРµРґРµРЅРЅРѕРіРѕ РїР°СЂРѕР»СЏ.
         *
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @chainable
         */
        coSign: function (flags) {
            flags = flags || 0;
            this.object.AddSign(flags);
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё РІСЃРµС… РїРѕРґРїРёСЃРµР№ РІ РїРѕРґРїРёСЃР°РЅРЅРѕРј СЃРѕРѕР±С‰РµРЅРёРё. РџСЂРё СЌС‚РѕРј РїСЂРѕРІРµСЂСЏСЋС‚СЃСЏ РІСЃРµ РїРѕРґРїРёСЃРё,
         * РєРѕС‚РѕСЂС‹Рµ РїСЂРёСЃСѓС‚СЃС‚РІСѓСЋС‚ РІ СЃРѕРѕР±С‰РµРЅРёРё. РњРµС‚РѕРґ Р·Р°РІРµСЂС€РёС‚СЃСЏ СѓСЃРїРµС€РЅРѕ С‚РѕР»СЊРєРѕ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РІСЃРµ РїРѕРґРїРёСЃРё
         * РјРѕР¶РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ, Рё РѕРЅРё РІРµСЂРЅС‹.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_VERIFY_ON_SIGN_DATE</b> вЂ“ РїСЂРѕРІРµСЂСЏС‚СЊ Р­Р¦Рџ РЅР° РґР°С‚Сѓ РІС‹СЂР°Р±РѕС‚РєРё СЌР»РµРєС‚СЂРѕРЅРЅРѕР№ РїРѕРґРїРёСЃРё, Р° РЅРµ РЅР° С‚РµРєСѓС‰СѓСЋ РґР°С‚Сѓ.
         * <b>Р’РЅРёРјР°РЅРёРµ! РљРѕРЅС‚СЂРѕР»СЊ РїРѕРґР»РёРЅРЅРѕСЃС‚Рё РґР°С‚С‹ РІС‹СЂР°Р±РѕС‚РєРё Р­Р¦Рџ РІ СЌР»РµРєС‚СЂРѕРЅРЅРѕРј СЃРѕРѕР±С‰РµРЅРёРё РґРѕР»Р¶РµРЅ РѕР±РµСЃРїРµС‡РёРІР°С‚СЊСЃСЏ РёРЅС‹РјРё СЃСЂРµРґСЃС‚РІР°РјРё.</b>
         * - <b>AVCMF_NO_CERT_VERIFY</b> вЂ“ РЅРµ РїСЂРѕРІРµСЂСЏС‚СЊ РґРѕРІРµСЂРёРµ Рє СЃРµСЂС‚РёС„РёРєР°С‚Сѓ РїРѕРґРїРёСЃР°РІС€РµРіРѕ. РџСЂРё СѓРєР°Р·Р°РЅРёРё СЌС‚РѕРіРѕ С„Р»Р°РіР° РЅРµ
         * Р±СѓРґРµС‚ РїСЂРѕРёР·РІРѕРґРёС‚СЃСЏ РїСЂРѕРІРµСЂРєР° С†РµРїРѕС‡РєРё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РґРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РєРѕСЂРЅРµРІРѕРіРѕ Р¦РЎ. РўР°РєР¶Рµ РЅРµ Р±СѓРґРµС‚ РїСЂРѕРёР·РІРѕРґРёС‚СЃСЏ РїРѕРёСЃРє
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РЎРћРЎ С†РµРЅС‚СЂР° СЃРµСЂС‚РёС„РёРєР°С†РёРё.
         * <b>Р’РЅРёРјР°РЅРёРµ! Р¦РµР»РѕСЃС‚РЅРѕСЃС‚СЊ СЃРїСЂР°РІРѕС‡РЅРёРєРѕРІ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїСЂРё РїСЂРѕРІРµСЂРєРµ Р­Р¦Рџ СЃ СѓРєР°Р·Р°РЅРЅС‹Рј С„Р»Р°РіРѕРј AVCMF_NO_CERT_VERIFY РґРѕР»Р¶РЅР°
         * РєРѕРЅС‚СЂРѕР»РёСЂРѕРІР°С‚СЊСЃСЏ РёРЅС‹РјРё СЃСЂРµРґСЃС‚РІР°РјРё.</b>
         *
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @return {Boolean}
         */
        verify: function (flags) {
            flags = flags || 0;
            try {
                this.object.Verify(flags);
                return true;
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_SIGN_INVALID)) {
                    return false;
                } else {
                    throw e;
                }
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РѕР±СЉРµРєС‚РѕРІ РѕС‚РґРµР»СЊРЅС‹С… РїРѕРґРїРёСЃРµР№ СЃРѕРѕР±С‰РµРЅРёСЏ РґР»СЏ РїРѕСЃР»РµРґСѓСЋС‰РµР№ РѕР±СЂР°Р±РѕС‚РєРё (РЅР°РїСЂРёРјРµСЂ,
         * РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕРґРїРёСЃР°РІС€РёС…, Р»РёР±Рѕ РїСЂРѕРІРµСЂРєРё РѕС‚РґРµР»СЊРЅС‹С… РїРѕРґРїРёСЃРµР№). РРЅРґРµРєСЃРёСЂСѓРµС‚СЃСЏ С†РµР»С‹Рј С‡РёСЃР»РѕРј РѕС‚ 0 РґРѕ
         * {@link avcmx.SignedMessage#signsCount} вЂ“ 1.
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕР№ РїРѕРґРїРёСЃРё
         *
         *      signedData = ... // create signed data blob
         *      signed = conn.message(signedData)
         *     signed.signs(0)
         *     signed.signs()[0]
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РїРѕРґРїРёСЃРµР№ РїРѕ РёРЅРґРµРєСЃСѓ
         *
         *      signedData = ... // create signed data blob
         *      signed = conn.message(signedData)
         *     for (var i = 0; i < signed.signsCount(); i++) {
         *         signed.signs(i)
         *     }
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… РїРѕРґРїРёСЃРµР№ Рё РїРµСЂРµР±РѕСЂ
         *
         *      signedData = ... // create signed data blob
         *      signed = conn.message(signedData)
         *      signs = signed.signs()
         *     for (var i = 0; i < signs.length; i++) {
         *         signs[i]
         *     }
         *
         * @param {Number} [index] РЅРѕРјРµСЂ РїРѕРґРїРёСЃРё, РєРѕС‚РѕСЂСѓСЋ РЅСѓР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ (РѕС‚ 0).
         * @return {avcmx.Sign|avcmx.Sign[]} РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±СЉРµРєС‚ РїРѕРґРїРёСЃРё РµСЃР»Рё РїРµСЂРµРґР°РЅ РёРЅРґРµРєСЃ, РёРЅР°С‡Рµ - СЃРїРёСЃРѕРє РІСЃРµС… РїРѕРґРїРёСЃРµР№
         */
        signs: function (index) {
            if (index === undefined) {
                if (this.signsCache === undefined) {
                    this.signsCache = [];
                    for (var i = 0; i < this.object.SignsCount; i++) {
                        this.signsCache.push(this.factory(this.object.Signs(i)));
                    }
                }
                return this.signsCache;
            } else {
                return this.signsCache ? this.signsCache[index] : this.factory(this.object.Signs(index));
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ РёР· РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ РІ СЃРїСЂР°РІРѕС‡РЅРёРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё
         * РЎРћРЎ. Р’ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ С„Р»Р°РіРѕРІ, РІРѕР·РјРѕР¶РµРЅ РёРЅС‚РµСЂР°РєС‚РёРІРЅС‹Р№ РёРјРїРѕСЂС‚ (СЃ РІС‹РІРѕРґРѕРј РґРёР°Р»РѕРіР° РІС‹Р±РѕСЂР° РёРјРїРѕСЂС‚РёСЂСѓРµРјС‹С…
         * СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ; РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ), Р»РёР±Рѕ Р±РµР·СѓСЃР»РѕРІРЅС‹Р№.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_IMPORT_ALL_CERTS</b> вЂ“ РёРјРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ РІСЃРµ СЃРµСЂС‚РёС„РёРєР°С‚С‹ Рё РЎРћРЎ Р±РµР· РІС‹РІРѕРґР° РґРёР°Р»РѕРіРѕРІРѕРіРѕ РѕРєРЅР°.
         * - <b>AVCMF_IMPORT_CRL</b> вЂ“ РёРјРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ РІСЃРµ РЅРµРѕР±С…РѕРґРёРјС‹Рµ РЎРћРЎ Р±РµР· РІС‹РІРѕРґР° РґРёР°Р»РѕРіРѕРІРѕРіРѕ РѕРєРЅР°.
         *
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @chainable
         */
        importCerts: function (flags) {
            flags = flags || 0;
            this.object.Import(flags);
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РѕР±СЉРµРєС‚Р° РІР»РѕР¶РµРЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ (РїРѕРґРїРёСЃР°РЅРЅРѕРіРѕ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ). Р’ СЃР»СѓС‡Р°Рµ РѕС‚СЃСѓС‚СЃС‚РІРёСЏ
         * СЃРѕРґРµСЂР¶РёРјРѕРіРѕ (РЅР°РїСЂРёРјРµСЂ, РїСЂРё РѕС‚РґРµР»СђРЅРЅРѕР№ (detached) РїРѕРґРїРёСЃРё), РїРѕР»СѓС‡РµРЅРёРµ Р·РЅР°С‡РµРЅРёСЏ СЃРІРѕР№СЃС‚РІР° РІС‹Р·РѕРІРµС‚ РѕС€РёР±РєСѓ.
         * @return {avcmx.RawMessage|avcmx.SignedMessage|avcmx.EncryptedMessage}
         */
        inner: function () {
            return this.factory(this.object.InnerMessage);
        }
    });

    /**
     * @class avcmx.EncryptedMessage
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РґР°РЅРЅС‹РјРё РІ С„РѕСЂРјР°С‚Рµ PKCS#7 EncryptedData; РЅР°РїСЂРёРјРµСЂ, РґР»СЏ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ РґР°РЅРЅС‹С….
     * @extends avcmx.Message.<native.AvCMX.EncryptedMessage>
     */
    avcmx.EncryptedMessage.prototype = extend(avcmx.EncryptedMessage.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ. РЎРѕРѕР±С‰РµРЅРёРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ СѓСЃРїРµС€РЅРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРѕ
         * С‚РѕР»СЊРєРѕ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РѕРЅРѕ Р·Р°С€РёС„СЂРѕРІР°РЅРѕ РІ С‚РѕРј С‡РёСЃР»Рµ Рё РЅР° С‚РѕС‚ СЃРµСЂС‚РёС„РёРєР°С‚, РєРѕС‚РѕСЂС‹Рј Р±С‹Р» РїСЂРѕРёР·РІРµРґСђРЅ РІС…РѕРґ РІ СЃРµСЃСЃРёСЋ.
         * Р’ СЃР»СѓС‡Р°Рµ СѓСЃРїРµС€РЅРѕРіРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅ РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РµРіРѕ С‚РёРїР°.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Message#decryptAsync}</b>
         *
         * Р Р°СЃС€РёС„СЂРѕРІР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         *     conn = ... // create connection
         *     encryptedData = ... // create encrypted data blob
         *     conn.message(encryptedData).decrypt()
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.RawMessage|avcmx.SignedMessage|avcmx.EncryptedMessage}
         * @deprecated 1.1.1 Р·Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Message#decryptAsync}
         */
        decrypt: function (flags) {
            flags = flags || 0;
            return this.factory(this.object.Decrypt(flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ. РЎРѕРѕР±С‰РµРЅРёРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ СѓСЃРїРµС€РЅРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРѕ
         * С‚РѕР»СЊРєРѕ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РѕРЅРѕ Р·Р°С€РёС„СЂРѕРІР°РЅРѕ РІ С‚РѕРј С‡РёСЃР»Рµ Рё РЅР° С‚РѕС‚ СЃРµСЂС‚РёС„РёРєР°С‚, РєРѕС‚РѕСЂС‹Рј Р±С‹Р» РїСЂРѕРёР·РІРµРґСђРЅ РІС…РѕРґ РІ СЃРµСЃСЃРёСЋ.
         * Р’ СЃР»СѓС‡Р°Рµ СѓСЃРїРµС€РЅРѕРіРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅ РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РµРіРѕ С‚РёРїР°.
         *
         * Р Р°СЃС€РёС„СЂРѕРІР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ
         *
         *     conn = ... // create connection
         *     encryptedData = ... // create encrypted data blob
         *     conn.message(encryptedData).decryptAsync(function (e, msg) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј msg
         *     })
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЃРѕРѕР±С‰РµРЅРёСЏ РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.RawMessage|avcmx.SignedMessage|avcmx.EncryptedMessage} fn.msg РѕР±СЉРµРєС‚ СЃРѕРѕР±С‰РµРЅРёСЏ, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        decryptAsync: function (flags) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.DecryptAsync(flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ Рё СѓРїСЂРѕС‰СђРЅРЅРѕРіРѕ РїРѕР»СѓС‡РµРЅРёСЏ СЂР°СЃС€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ.
         * РЎРѕРѕР±С‰РµРЅРёРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ СѓСЃРїРµС€РЅРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРѕ С‚РѕР»СЊРєРѕ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РѕРЅРѕ Р·Р°С€РёС„СЂРѕРІР°РЅРѕ РІ С‚РѕРј С‡РёСЃР»Рµ Рё РЅР° С‚РѕС‚
         * СЃРµСЂС‚РёС„РёРєР°С‚, РєРѕС‚РѕСЂС‹Рј Р±С‹Р» РїСЂРѕРёР·РІРµРґСђРЅ РІС…РѕРґ РІ СЃРµСЃСЃРёСЋ. Р’ СЃР»СѓС‡Р°Рµ СѓСЃРїРµС€РЅРѕРіРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅРѕ Р·РЅР°С‡РµРЅРёРµ СЃРІРѕР№СЃС‚РІР° Blob
         * СЂР°СЃС€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ РІР»РѕР¶РµРЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Message#contentAsync}</b>
         *
         * Р Р°СЃС€РёС„СЂРѕРІР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ Рё РїРѕР»СѓС‡РµРЅРёРµ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ
         *
         *     conn = ... // create connection
         *     encryptedData = ... // create encrypted data blob
         *     conn.message(encryptedData).content()
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Blob}
         * @deprecated 1.1.1 Р·Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Message#contentAsync}
         */
        content: function (flags) {
            flags = flags || 0;
            return this.factory(this.object.DecryptAndGetContent(flags));
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ Рё СѓРїСЂРѕС‰СђРЅРЅРѕРіРѕ РїРѕР»СѓС‡РµРЅРёСЏ СЂР°СЃС€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ.
         * РЎРѕРѕР±С‰РµРЅРёРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ СѓСЃРїРµС€РЅРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРѕ С‚РѕР»СЊРєРѕ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РѕРЅРѕ Р·Р°С€РёС„СЂРѕРІР°РЅРѕ РІ С‚РѕРј С‡РёСЃР»Рµ Рё РЅР° С‚РѕС‚
         * СЃРµСЂС‚РёС„РёРєР°С‚, РєРѕС‚РѕСЂС‹Рј Р±С‹Р» РїСЂРѕРёР·РІРµРґСђРЅ РІС…РѕРґ РІ СЃРµСЃСЃРёСЋ. Р’ СЃР»СѓС‡Р°Рµ СѓСЃРїРµС€РЅРѕРіРѕ СЂР°СЃС€РёС„СЂРѕРІР°РЅРёСЏ Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅРѕ Р·РЅР°С‡РµРЅРёРµ СЃРІРѕР№СЃС‚РІР° Blob
         * СЂР°СЃС€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ РІР»РѕР¶РµРЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ.
         *
         * Р Р°СЃС€РёС„СЂРѕРІР°РЅРёРµ СЃРѕРѕР±С‰РµРЅРёСЏ Рё РїРѕР»СѓС‡РµРЅРёРµ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ
         *
         *     conn = ... // create connection
         *     encryptedData = ... // create encrypted data blob
         *     conn.message(encryptedData).contentAsync(function (e, blob) {
         *         if (e) { alert(e.message); return; }
         *         // РѕР±СЂР°Р±Р°С‚С‹РІР°РµРј blob
         *     })
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РґР°РЅРЅС‹С… СЃРѕРѕР±С‰РµРЅРёСЏ РёР»Рё РѕС€РёР±РєРё СЃРѕР·РґР°РЅРёСЏ.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {avcmx.Blob} fn.blob РѕР±СЉРµРєС‚ РґР°РЅРЅС‹С… СЃРѕРѕР±С‰РµРЅРёСЏ, Р»РёР±Рѕ undefined РІ СЃР»СѓС‡Р°Рµ РѕС€РёР±РєРё.
         * @chainable
         * @since 1.1.1
         */
        contentAsync: function (flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.DecryptAndGetContentAsync(flags, this.makeAsync(fn));
            return this;
        }
    });

    /**
     * @class avcmx.Sign
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РѕС‚РґРµР»СЊРЅС‹РјРё РїРѕРґРїРёСЃСЏРјРё РІ РїРѕРґРїРёСЃР°РЅРЅС‹С… СЃРѕРѕР±С‰РµРЅРёСЏС… PKCS#7 SignedMessage. РќР°РїСЂРёРјРµСЂ,
     * РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РґР°РЅРЅС‹С… РїРѕРґРїРёСЃРё, Р»РёР±Рѕ РґР»СЏ РµСђ РїСЂРѕРІРµСЂРєРё.
     * @extends avcmxobject.<native.AvCMX.Sign>
     */
    avcmx.Sign.prototype = extend(avcmx.Sign.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё РѕС‚РґРµР»СЊРЅРѕР№ РїРѕРґРїРёСЃРё.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ С„Р»Р°РіРё:
         *
         * - <b>AVCMF_VERIFY_ON_SIGN_DATE</b> вЂ“ РїСЂРѕРІРµСЂСЏС‚СЊ Р­Р¦Рџ РЅР° РґР°С‚Сѓ РІС‹СЂР°Р±РѕС‚РєРё СЌР»РµРєС‚СЂРѕРЅРЅРѕР№ РїРѕРґРїРёСЃРё, Р° РЅРµ РЅР° С‚РµРєСѓС‰СѓСЋ РґР°С‚Сѓ.
         * <b>Р’РЅРёРјР°РЅРёРµ! РљРѕРЅС‚СЂРѕР»СЊ РїРѕРґР»РёРЅРЅРѕСЃС‚Рё РґР°С‚С‹ РІС‹СЂР°Р±РѕС‚РєРё Р­Р¦Рџ РІ СЌР»РµРєС‚СЂРѕРЅРЅРѕРј СЃРѕРѕР±С‰РµРЅРёРё РґРѕР»Р¶РµРЅ РѕР±РµСЃРїРµС‡РёРІР°С‚СЊСЃСЏ РёРЅС‹РјРё СЃСЂРµРґСЃС‚РІР°РјРё.</b>
         * - <b>AVCMF_NO_CERT_VERIFY</b> вЂ“ РЅРµ РїСЂРѕРІРµСЂСЏС‚СЊ РґРѕРІРµСЂРёРµ Рє СЃРµСЂС‚РёС„РёРєР°С‚Сѓ РїРѕРґРїРёСЃР°РІС€РµРіРѕ. РџСЂРё СѓРєР°Р·Р°РЅРёРё СЌС‚РѕРіРѕ С„Р»Р°РіР° РЅРµ
         * Р±СѓРґРµС‚ РїСЂРѕРёР·РІРѕРґРёС‚СЃСЏ РїСЂРѕРІРµСЂРєР° С†РµРїРѕС‡РєРё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РґРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РєРѕСЂРЅРµРІРѕРіРѕ Р¦РЎ. РўР°РєР¶Рµ РЅРµ Р±СѓРґРµС‚ РїСЂРѕРёР·РІРѕРґРёС‚СЃСЏ РїРѕРёСЃРє
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ РЎРћРЎ С†РµРЅС‚СЂР° СЃРµСЂС‚РёС„РёРєР°С†РёРё.
         * <b>Р’РЅРёРјР°РЅРёРµ! Р¦РµР»РѕСЃС‚РЅРѕСЃС‚СЊ СЃРїСЂР°РІРѕС‡РЅРёРєРѕРІ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїСЂРё РїСЂРѕРІРµСЂРєРµ Р­Р¦Рџ СЃ СѓРєР°Р·Р°РЅРЅС‹Рј С„Р»Р°РіРѕРј AVCMF_NO_CERT_VERIFY РґРѕР»Р¶РЅР°
         * РєРѕРЅС‚СЂРѕР»РёСЂРѕРІР°С‚СЊСЃСЏ РёРЅС‹РјРё СЃСЂРµРґСЃС‚РІР°РјРё.</b>
         *
         * @param {Number} [flags] С„Р»Р°РіРё.
         * @return {Boolean}
         */
        verify: function (flags) {
            flags = flags || 0;
            try {
                this.object.Verify(flags);
                return true;
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_SIGN_INVALID)) {
                    return false;
                } else {
                    throw e;
                }
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РѕРєРЅР° РёРЅС„РѕСЂРјР°С†РёРё Рѕ РїРѕРґРїРёСЃРё.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РїСЂРё РІС‹Р·РѕРІРµ Р±РµР· РїР°СЂР°РјРµС‚СЂРѕРІ РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РѕС‚РѕР±СЂР°Р¶Р°РµС‚ РґРёР°Р»РѕРі, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р§С‚РѕР±С‹ СЌС‚РѕРіРѕ РЅРµ РїСЂРѕРёР·РѕС€Р»Рѕ РЅРµРѕР±С…РѕРґРёРјРѕ РїРµСЂРµРґР°С‚СЊ РІ РїР°СЂР°РјРµС‚СЂС‹ С„СѓРЅРєС†РёСЋ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РѕС€РёР±РєРё.</b>
         *
         * РџСЂРёРјРµСЂ:
         *
         *      signed = ... // create signed message
         *     signed.signs(0).show(function (e) {
         *         if (e) { alert(e.message); return; }
         *     })
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} [fn] С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РѕС€РёР±РєРё.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @chainable
         */
        show: function (flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            } else if (fn === undefined) {
                flags = (typeof flags === "number" ? flags : 0);
            }
            if (fn === undefined) {
                this.object.Show(flags);
            } else {
                this.object.ShowAsync(flags, this.makeAsync(fn));
            }
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РѕР±СЉРµРєС‚Р° РІРµСЂСЃРёРё РїРѕРґРїРёСЃРё.
         * @return {Number}
         */
        version: function () {
            return parseInt(this.object.Version);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РґРІРѕРёС‡РЅРѕР№ Р­Р¦Рџ (EncryptedDigest).
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Sign);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°Р»РіРѕСЂРёС‚РјР° С…СЌС€РёСЂРѕРІР°РЅРёСЏ.
         * @return {String}
         */
        hashAlg: function () {
            return this.object.HashAlgOid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°Р»РіРѕСЂРёС‚РјР° РїСЂРѕРІРµСЂРєРё Р­Р¦Рџ.
         * @return {String}
         */
        signAlg: function () {
            return this.object.SignAlgOid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РІСЂРµРјРµРЅРё СЃРѕР·РґР°РЅРёСЏ РїРѕРґРїРёСЃРё.
         * @return {Date}
         */
        datetime: function () {
            return new Date(this.object.SignDateTimeSec * 1000);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕРґРїРёСЃР°РЅС‚Р°.
         * @return {avcmx.Certificate}
         */
        cert: function () {
            return this.factory(this.object.SignerCertificate);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕРґРїРёСЃР°РЅС‚Р° РёР· СЃРѕРѕР±С‰РµРЅРёСЏ.
         * @return {avcmx.AttributeCertificates}
         * @since 1.1.4
         */
        attrCerts: function () {
            return this.factory(this.object.SignerAttributeCertificates, "AttributeCertificates");
        },

        /**
         *  РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° Р°РІС‚РѕСЂРёР·РѕРІР°РЅРЅС‹С… Р°С‚СЂРёР±СѓС‚РѕРІ.
         *  @return {Number}
         */
        authCount: function () {
            return parseInt(this.object.AuthorizedAttributesCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°РІС‚РѕСЂРёР·РѕРІР°РЅРЅРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р° РїРѕ РёРЅРґРµРєСЃСѓ РёР»Рё РїРѕ OID.
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°
         *
         *      signed = ... // create signed message
         *     signed.signs(0).authAttr(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° СЃ OID 1.1.1.1
         *
         *      signed = ... // create signed message
         *     signed.signs(0).authAttr("1.1.1.1")
         *
         * @param {String|Number} oidOrIndex OID Р°С‚СЂРёР±СѓС‚Р° Р»РёР±Рѕ РёРЅРґРµРєСЃ
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.SignAttribute}
         */
        authAttr: function (oidOrIndex, flags) {
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetAuthorizedAttributeByOid(oidOrIndex, flags), "SignAttribute");
            } else {
                return this.factory(this.object.GetAuthorizedAttributeByIndex(oidOrIndex, flags), "SignAttribute");
            }
        },

        /**
         *  РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° РЅРµР°РІС‚РѕСЂРёР·РѕРІР°РЅРЅС‹С… Р°С‚СЂРёР±СѓС‚РѕРІ.
         *  @return {Number}
         */
        unauthCount: function () {
            return parseInt(this.object.UnauthorizedAttributesCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РЅРµР°РІС‚РѕСЂРёР·РѕРІР°РЅРЅРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р° РїРѕ РёРЅРґРµРєСЃСѓ РёР»Рё РїРѕ OID.
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°
         *
         *      signed = ... // create signed message
         *     signed.signs(0).unauthAttr(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° СЃ OID 1.1.1.1
         *
         *      signed = ... // create signed message
         *     signed.signs(0).unauthAttr("1.1.1.1")
         *
         * @param {String|Number} oidOrIndex OID Р°С‚СЂРёР±СѓС‚Р° Р»РёР±Рѕ РёРЅРґРµРєСЃ
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.SignAttribute}
         */
        unauthAttr: function (oidOrIndex, flags) {
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetUnauthorizedAttributeByOid(oidOrIndex, flags), "SignAttribute");
            } else {
                return this.factory(this.object.GetUnauthorizedAttributeByIndex(oidOrIndex, flags), "SignAttribute");
            }
        }
    });

    /**
     * @class avcmx.SignAttribute
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ Р°С‚СЂРёР±СѓС‚Р°РјРё РїРѕРґРїРёСЃРё, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёС… Р·РЅР°С‡РµРЅРёР№.
     * @extends avcmxobject.<native.AvCMX.SignAttribute>
     */
    avcmx.SignAttribute.prototype = extend(avcmx.SignAttribute.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°С‚СЂРёР±СѓС‚Р° РїРѕРґРїРёСЃРё.
         * @return {String}
         */
        oid: function () {
            return this.object.Oid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·РЅР°С‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° РїРѕРґРїРёСЃРё.
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Value);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·РЅР°С‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° РїРѕРґРїРёСЃРё РІ СЃС‚СЂРѕРєРѕРІРѕРј РІРёРґРµ.
         * @return {String}
         */
        str: function () {
            return this.object.ValueAsString;
        }
    });

    /**
     * @class avcmx.Certificates
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РЅР°Р±РѕСЂРѕРј СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ X.509, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ СЃРѕР·РґР°РЅРёСЏ СЃРїРёСЃРєР° РїРѕР»СѓС‡Р°С‚РµР»РµР№
     * Р·Р°С€РёС„СЂРѕРІР°РЅРЅРѕРіРѕ СЃРѕРѕР±С‰РµРЅРёСЏ.
     * @extends avcmxobject.<native.AvCMX.Certificates>
     */
    avcmx.Certificates.prototype = extend(avcmx.Certificates.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ СЃРїРёСЃРєРµ.
         * @return {Number}
         */
        length: function () {
            return parseInt(this.object.Count);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РѕР±СЉРµРєС‚РѕРІ РѕС‚РґРµР»СЊРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ СЃРїРёСЃРєР° РґР»СЏ РїРѕСЃР»РµРґСѓСЋС‰РµР№ РѕР±СЂР°Р±РѕС‚РєРё
         * (РЅР°РїСЂРёРјРµСЂ, РїРѕР»СѓС‡РµРЅРёСЏ РёС… Р°С‚СЂРёР±СѓС‚РѕРІ). РРЅРґРµРєСЃРёСЂСѓРµС‚СЃСЏ С†РµР»С‹Рј С‡РёСЃР»РѕРј РѕС‚ 0 РґРѕ {@link avcmx.Certificates#length} вЂ“ 1
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°
         *
         *      certs = ... // create certificates
         *     certs.certs(0)
         *     certs.certs()[0]
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕ РёРЅРґРµРєСЃСѓ
         *
         *      certs = ... // create certificates
         *     for (var i = 0; i < certs.length(); i++) {
         *         certs.certs(i)
         *     }
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РїРµСЂРµР±РѕСЂ
         *
         *      certs = ... // create certificates
         *      certs = certs.certs()
         *     for (var i = 0; i < certs.length; i++) {
         *         certs[i]
         *     }
         *
         * @param {Number} [index] РЅРѕРјРµСЂ СЃРµСЂС‚РёС„РёРєР°С‚Р°, РєРѕС‚РѕСЂС‹Р№ РЅСѓР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ (РѕС‚ 0).
         * @return {avcmx.Certificate|avcmx.Certificate[]} РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±СЉРµРєС‚ СЃРµСЂС‚РёС„РёРєР°С‚Р° РµСЃР»Рё РїРµСЂРµРґР°РЅ РёРЅРґРµРєСЃ, РёРЅР°С‡Рµ - СЃРїРёСЃРѕРє РІСЃРµС… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         */
        certs: function (index) {
            if (index === undefined) {
                if (this.certsCache === undefined) {
                    this.certsCache = [];
                    for (var i = 0; i < this.object.Count; i++) {
                        this.certsCache.push(this.factory(this.object.Item(i)));
                    }
                }
                return this.certsCache;
            } else {
                return this.certsCache ? this.certsCache[index] : this.factory(this.object.Item(index));
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ РѕС‚РґРµР»СЊРЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РёР»Рё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, РѕС‚РѕР±СЂР°РЅРЅС‹С… РїРѕ СЃРїРёСЃРєСѓ СѓСЃР»РѕРІРёР№,
         * РІ СЃРїРёСЃРѕРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * @param {avcmx.Certificate|avcmx.Parameters} certOrParams СЃРµСЂС‚РёС„РёРєР°С‚ РёР»Рё РїР°СЂР°РјРµС‚СЂС‹ РѕС‚Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        add: function (certOrParams, flags) {
            flags = flags || 0;
            if (certOrParams.toString().indexOf("[wrapper AvCMX.") == 0) {
                if (certOrParams.toString() == "[wrapper AvCMX.Certificate]") {
                    this.object.AddCertificate(certOrParams.get(), flags);
                } else if (certOrParams.toString() == "[wrapper AvCMX.Parameters]") {
                    this.object.AddCertificates(certOrParams.get(), flags);
                }
            } else {
                // TODO: custom params constructor
            }
            delete this.certsCache;
            return this;
        }
    });

    /**
     * @class avcmx.AttributeCertificates
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РЅР°Р±РѕСЂРѕРј Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
     * @extends avcmxobject.<native.AvCMX.AttributeCertificates>
     */
    avcmx.AttributeCertificates.prototype = extend(avcmx.AttributeCertificates.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Р°С‚СЂРёР±СѓС‚РЅС‹С… РІ СЃРїРёСЃРєРµ.
         * @return {Number}
         */
        length: function () {
            return parseInt(this.object.Count);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РѕР±СЉРµРєС‚РѕРІ РѕС‚РґРµР»СЊРЅС‹С… Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ СЃРїРёСЃРєР° РґР»СЏ РїРѕСЃР»РµРґСѓСЋС‰РµР№ РѕР±СЂР°Р±РѕС‚РєРё
         * (РЅР°РїСЂРёРјРµСЂ, РїРѕР»СѓС‡РµРЅРёСЏ РёС… Р°С‚СЂРёР±СѓС‚РѕРІ). РРЅРґРµРєСЃРёСЂСѓРµС‚СЃСЏ С†РµР»С‹Рј С‡РёСЃР»РѕРј РѕС‚ 0 РґРѕ {@link avcmx.AttributeCertificates#length} вЂ“ 1
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°
         *
         *      certs = ... // create certificates
         *     certs.certs(0)
         *     certs.certs()[0]
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕ РёРЅРґРµРєСЃСѓ
         *
         *      certs = ... // create certificates
         *     for (var i = 0; i < certs.length(); i++) {
         *         certs.certs(i)
         *     }
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РїРµСЂРµР±РѕСЂ
         *
         *      certs = ... // create certificates
         *      signs = certs.certs()
         *     for (var i = 0; i < certs.length; i++) {
         *         certs[i]
         *     }
         *
         * @param {Number} [index] РЅРѕРјРµСЂ СЃРµСЂС‚РёС„РёРєР°С‚Р°, РєРѕС‚РѕСЂС‹Р№ РЅСѓР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ (РѕС‚ 0).
         * @return {avcmx.AttributeCertificate|avcmx.AttributeCertificate[]} РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±СЉРµРєС‚ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РµСЃР»Рё РїРµСЂРµРґР°РЅ РёРЅРґРµРєСЃ, РёРЅР°С‡Рµ - СЃРїРёСЃРѕРє РІСЃРµС… Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         */
        certs: function (index) {
            if (index === undefined) {
                if (this.certsCache === undefined) {
                    this.certsCache = [];
                    for (var i = 0; i < this.object.Count; i++) {
                        this.certsCache.push(this.factory(this.object.Item(i)));
                    }
                }
                return this.certsCache;
            } else {
                return this.certsCache ? this.certsCache[index] : this.factory(this.object.Item(index));
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ РѕС‚РґРµР»СЊРЅРѕРіРѕ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РёР»Рё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, РѕС‚РѕР±СЂР°РЅРЅС‹С… РїРѕ СЃРїРёСЃРєСѓ СѓСЃР»РѕРІРёР№,
         * РІ СЃРїРёСЃРѕРє Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * @param {avcmx.AttributeCertificate|avcmx.Parameters} certOrParams Р°С‚СЂРёР±СѓС‚РЅС‹Р№ СЃРµСЂС‚РёС„РёРєР°С‚ РёР»Рё РїР°СЂР°РјРµС‚СЂС‹ РѕС‚Р±РѕСЂР° Р°С‚СЂРёР±СѓС‚РЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        add: function (certOrParams, flags) {
            flags = flags || 0;
            if (certOrParams.toString().indexOf("[wrapper AvCMX.") == 0) {
                if (certOrParams.toString() == "[wrapper AvCMX.AttributeCertificate]") {
                    this.object.AddCertificate(certOrParams.get(), flags);
                } else if (certOrParams.toString() == "[wrapper AvCMX.Parameters]") {
                    this.object.AddCertificates(certOrParams.get(), flags);
                }
            } else {
                // TODO: custom params constructor
            }
            delete this.certsCache;
            return this;
        }
    });

    /**
     * @class avcmx.Certificate
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ СЃРµСЂС‚РёС„РёРєР°С‚Р°РјРё X.509; РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ
     * СЃРІРѕР№СЃС‚РІ СЃРµСЂС‚РёС„РёРєР°С‚Р°, Р»РёР±Рѕ РґР»СЏ РµРіРѕ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ.
     * @extends avcmxobject.<native.AvCMX.Certificate>
     */
    avcmx.Certificate.prototype = extend(avcmx.Certificate.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РІРµСЂСЃРёРё СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {Number}
         */
        version: function () {
            return parseInt(this.object.Version);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ СЌРєСЃРїРѕСЂС‚РёСЂСѓРµРјРѕРј РІРёРґРµ. Р’РѕР·РІСЂР°С‰Р°РµС‚ DER
         * Р·Р°РєРѕРґРёСЂРѕРІР°РЅРЅС‹Р№ X.509 СЃРµСЂС‚РёС„РёРєР°С‚.
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Blob);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂРёР№РЅРѕРіРѕ РЅРѕРјРµСЂР° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.Blob}
         */
        serial: function () {
            return this.factory(this.object.Serial);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°Р»РіРѕСЂРёС‚РјР° РІС‹СЂР°Р±РѕС‚РєРё Р­Р¦Рџ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {String}
         */
        signAlg: function () {
            return this.object.SignAlgOid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РІСЂРµРјРµРЅРё РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {Date}
         */
        notBefore: function () {
            return new Date(this.object.ValidityNotBeforeSec * 1000);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РІСЂРµРјРµРЅРё РѕРєРѕРЅС‡Р°РЅРёСЏ РґРµР№СЃС‚РІРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {Date}
         */
        notAfter: function () {
            return new Date(this.object.ValidityNotAfterSec * 1000);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РїСѓР±Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.Blob}
         */
        pubKeyId: function () {
            return this.factory(this.object.PublicKeyId);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°Р»РіРѕСЂРёС‚РјР° РїСѓР±Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {String}
         */
        pubKeyAlg: function () {
            return this.object.PublicKeyAlgOid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїСѓР±Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.Blob}
         */
        pubKey: function () {
            return this.factory(this.object.PublicKey);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РєР»СЋС‡Р° РёР·РґР°С‚РµР»СЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {String}
         */
        authKeyId: function () {
            return this.object.AuthorityKeyIdentifier;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РёР·РґР°С‚РµР»СЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.Certificate}
         */
        issuer: function () {
            return this.factory(this.object.IssuerCertificate);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃС‚Р°С‚СѓСЃР° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.CertificateStatus}
         */
        status: function () {
            return this.factory(this.object.Status);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° Р°С‚СЂРёР±СѓС‚РѕРІ РІ РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ.
         * @return {Number}
         */
        issuerNameCount: function () {
            return parseInt(this.object.IssuerNameAttributesCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° Р°С‚СЂРёР±СѓС‚РѕРІ РІ РёРјРµРЅРё СЃСѓР±СЉРµРєС‚Р°.
         * @return {Number}
         */
        subjectNameCount: function () {
            return parseInt(this.object.SubjectNameAttributesCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° РґРѕРїРѕР»РЅРµРЅРёР№ РІ СЃРµСЂС‚РёС„РёРєР°С‚Рµ.
         * @return {Number}
         */
        extCount: function () {
            return parseInt(this.object.ExtensionsCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё РґРѕРІРµСЂРёСЏ Рє СЃРµСЂС‚РёС„РёРєР°С‚Сѓ. РџСЂРё СЌС‚РѕРј РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ РїСЂР°РІРёР»СЊРЅРѕСЃС‚СЊ РїРѕРґРїРёСЃРµР№
         * СЃРµСЂС‚РёС„РёРєР°С‚Р° Рё С†РµРїРѕС‡РєРё РµРіРѕ РёР·РґР°С‚РµР»РµР№ РІРїР»РѕС‚СЊ РґРѕ РёР·РґР°С‚РµР»СЏ, РїРѕРјРµС‰СђРЅРЅРѕРіРѕ РІ СЃРїСЂР°РІРѕС‡РЅРёРє РґРѕРІРµСЂРµРЅРЅС‹С…
         * РёР·РґР°С‚РµР»РµР№ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ. РњРµС‚РѕРґ Р·Р°РІРµСЂС€РёС‚СЃСЏ СѓСЃРїРµС€РЅРѕ С‚РѕР»СЊРєРѕ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РґРѕРІРµСЂРёРµ СЃРµСЂС‚РёС„РёРєР°С‚Сѓ СѓСЃС‚Р°РЅРѕРІР»РµРЅРѕ.
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {Boolean}
         */
        valid: function (flags) {
            flags = flags || 0;
            return this.object.CheckValidity(flags) == 0;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё РєР°РєРѕРіРѕ-Р»РёР±Рѕ СЂР°СЃС€РёСЂРµРЅРЅРѕРіРѕ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         *
         * @param {String} oid OID РЅСѓР¶РЅРѕРіРѕ СЂР°СЃС€РёСЂРµРЅРЅРѕРіРѕ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {Boolean}
         */
        extKeyUsageAllowed: function (oid, flags) {
            flags = flags || 0;
            return this.object.IsExtKeyUsageAllowed(oid, flags);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ СЃРїСЂР°РІРѕС‡РЅРёРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ.
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        importCert: function (flags) {
            flags = flags || 0;
            this.object.Import(flags);
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РѕРєРЅР° РёРЅС„РѕСЂРјР°С†РёРё Рѕ СЃРµСЂС‚РёС„РёРєР°С‚Рµ.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РїСЂРё РІС‹Р·РѕРІРµ Р±РµР· РїР°СЂР°РјРµС‚СЂРѕРІ РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РѕС‚РѕР±СЂР°Р¶Р°РµС‚ РґРёР°Р»РѕРі, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р§С‚РѕР±С‹ СЌС‚РѕРіРѕ РЅРµ РїСЂРѕРёР·РѕС€Р»Рѕ РЅРµРѕР±С…РѕРґРёРјРѕ РїРµСЂРµРґР°С‚СЊ РІ РїР°СЂР°РјРµС‚СЂС‹ С„СѓРЅРєС†РёСЋ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РѕС€РёР±РєРё.</b>
         *
         * РџСЂРёРјРµСЂ:
         *
         *      cert = ... // create certificate
         *     cert.show(function (e) {
         *         if (e) { alert(e.message); return; }
         *     })
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} [fn] С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РѕС€РёР±РєРё.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @chainable
         */
        show: function (flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            } else if (fn === undefined) {
                flags = (typeof flags === "number" ? flags : 0);
            }
            if (fn === undefined) {
                this.object.Show(flags);
            } else {
                this.object.ShowAsync(flags, this.makeAsync(fn));
            }
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РґРѕРїРѕР»РЅРµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РµРіРѕ OID РёР»Рё РЅРѕРјРµСЂСѓ (РѕС‚ 0 РґРѕ {@link avcmx.Certificate#extCount} вЂ“ 1).
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ РґРѕРїРѕР»РЅРµРЅРёСЏ:
         *
         *      cert = ... // create certificate
         *     cert.ext(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РґРѕРїРѕР»РЅРµРЅРёСЏ СЃ OID 1.1.1.1:
         *
         *      cert = ... // create certificate
         *     cert.ext("1.1.1.1")
         *
         * @param {String|Number} oidOrIndex OID РёР»Рё РёРЅРґРµРєСЃ РїРѕР»СѓС‡Р°РµРјРѕРіРѕ РґРѕРїРѕР»РЅРµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Extension}
         */
        ext: function (oidOrIndex, flags) {
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetExtensionByOid(oidOrIndex, flags));
            } else {
                return this.factory(this.object.GetExtensionByIndex(oidOrIndex, flags));
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РµРіРѕ OID РёР»Рё РЅРѕРјРµСЂСѓ.
         * Р•СЃР»Рё РјРµС‚РѕРґ РІС‹Р·РІР°РЅ Р±РµР· РїР°СЂР°РјРµС‚СЂРѕРІ Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅР° РїРѕР»РЅР°СЏ СЃС‚СЂРѕРєР° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРѕР»РЅРѕР№ СЃС‚СЂРѕРєРё РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ:
         *
         *      cert = ... // create certificate
         *     cert.issuerName()
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ:
         *
         *      cert = ... // create certificate
         *     cert.issuerName(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° Common Name РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ:
         *
         *      cert = ... // create certificate
         *     cert.issuerName("2.5.4.3")
         *
         * @param {String|Number} [oidOrIndex] OID РёР»Рё РёРЅРґРµРєСЃ РїРѕР»СѓС‡Р°РµРјРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {String|avcmx.NameAttribute}
         */
        issuerName: function (oidOrIndex, flags) {
            if (oidOrIndex === undefined) return this.object.Issuer;
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetIssuerNameAttributeByOid(oidOrIndex, flags), "NameAttribute");
            } else {
                return this.factory(this.object.GetIssuerNameAttributeByIndex(oidOrIndex, flags), "NameAttribute");
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё СЃСѓР±СЉРµРєС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РµРіРѕ OID РёР»Рё РЅРѕРјРµСЂСѓ.
         * Р•СЃР»Рё РјРµС‚РѕРґ РІС‹Р·РІР°РЅ Р±РµР· РїР°СЂР°РјРµС‚СЂРѕРІ Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅР° РїРѕР»РЅР°СЏ СЃС‚СЂРѕРєР° РёРјРµРЅРё СЃСѓР±СЉРµРєС‚Р° СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРѕР»РЅРѕР№ СЃС‚СЂРѕРєРё РёРјРµРЅРё СЃСѓР±СЉРµРєС‚Р°:
         *
         *      cert = ... // create certificate
         *     cert.subjectName()
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё СЃСѓР±СЉРµРєС‚Р°:
         *
         *      cert = ... // create certificate
         *     cert.subjectName(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° Common Name РёРјРµРЅРё СЃСѓР±СЉРµРєС‚Р°:
         *
         *      cert = ... // create certificate
         *     cert.subjectName("2.5.4.3")
         *
         * @param {String|Number} [oidOrIndex] OID РёР»Рё РёРЅРґРµРєСЃ РїРѕР»СѓС‡Р°РµРјРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {String|avcmx.NameAttribute}
         */
        subjectName: function (oidOrIndex, flags) {
            if (oidOrIndex === undefined) return this.object.Subject;
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetSubjectNameAttributeByOid(oidOrIndex, flags), "NameAttribute");
            } else {
                return this.factory(this.object.GetSubjectNameAttributeByIndex(oidOrIndex, flags), "NameAttribute");
            }
        }
    });

    /**
     * @class avcmx.AttributeCertificate
     * РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ Р°С‚СЂРёР±СѓС‚РЅС‹РјРё СЃРµСЂС‚РёС„РёРєР°С‚Р°РјРё
     * @extends avcmxobject.<native.AvCMX.AttributeCertificate>
     */
    avcmx.AttributeCertificate.prototype = extend(avcmx.AttributeCertificate.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РІРµСЂСЃРёРё Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {Number}
         */
        version: function () {
            return parseInt(this.object.Version);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ СЌРєСЃРїРѕСЂС‚РёСЂСѓРµРјРѕРј РІРёРґРµ. Р’РѕР·РІСЂР°С‰Р°РµС‚ DER
         * Р·Р°РєРѕРґРёСЂРѕРІР°РЅРЅС‹Р№ Р°С‚СЂРёР±СѓС‚РЅС‹Р№ СЃРµСЂС‚РёС„РёРєР°С‚.
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Blob);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂРёР№РЅРѕРіРѕ РЅРѕРјРµСЂР° Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.Blob}
         */
        serial: function () {
            return this.factory(this.object.Serial);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°Р»РіРѕСЂРёС‚РјР° РІС‹СЂР°Р±РѕС‚РєРё Р­Р¦Рџ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {String}
         */
        signAlg: function () {
            return this.object.SignAlgOid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РІСЂРµРјРµРЅРё РЅР°С‡Р°Р»Р° РґРµР№СЃС‚РІРёСЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {Date}
         */
        notBefore: function () {
            return new Date(this.object.ValidityNotBeforeSec * 1000);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РІСЂРµРјРµРЅРё РѕРєРѕРЅС‡Р°РЅРёСЏ РґРµР№СЃС‚РІРёСЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {Date}
         */
        notAfter: function () {
            return new Date(this.object.ValidityNotAfterSec * 1000);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РёР·РґР°С‚РµР»СЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.Certificate}
         */
        issuer: function () {
            return this.factory(this.object.IssuerCertificate);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІР»Р°РґРµР»СЊС†Р° Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.Certificate}
         */
        holder: function () {
            return this.factory(this.object.HolderCertificate);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃС‚Р°С‚СѓСЃР° Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {avcmx.CertificateStatus}
         */
        status: function () {
            return this.factory(this.object.Status);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° Р°С‚СЂРёР±СѓС‚РѕРІ РІ РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ.
         * @return {Number}
         */
        issuerNameCount: function () {
            return parseInt(this.object.IssuerNameAttributesCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° РґРѕРїРѕР»РЅРµРЅРёР№ РІ Р°С‚СЂРёР±СѓС‚РЅРѕРј СЃРµСЂС‚РёС„РёРєР°С‚Рµ.
         * @return {Number}
         */
        extCount: function () {
            return parseInt(this.object.ExtensionsCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° Р°С‚СЂРёР±СѓС‚РѕРІ РІ Р°С‚СЂРёР±СѓС‚РЅРѕРј СЃРµСЂС‚РёС„РёРєР°С‚Рµ.
         * @return {Number}
         */
        attrCount: function () {
            return parseInt(this.object.AttributesCount);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё РґРѕРІРµСЂРёСЏ Рє Р°С‚СЂРёР±СѓС‚РЅРѕРјСѓ СЃРµСЂС‚РёС„РёРєР°С‚Сѓ. РџСЂРё СЌС‚РѕРј РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ РїСЂР°РІРёР»СЊРЅРѕСЃС‚СЊ РїРѕРґРїРёСЃРµР№
         * Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° Рё С†РµРїРѕС‡РєРё РµРіРѕ РёР·РґР°С‚РµР»РµР№ РІРїР»РѕС‚СЊ РґРѕ РёР·РґР°С‚РµР»СЏ, РїРѕРјРµС‰СђРЅРЅРѕРіРѕ РІ СЃРїСЂР°РІРѕС‡РЅРёРє РґРѕРІРµСЂРµРЅРЅС‹С…
         * РёР·РґР°С‚РµР»РµР№ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ. РњРµС‚РѕРґ Р·Р°РІРµСЂС€РёС‚СЃСЏ СѓСЃРїРµС€РЅРѕ С‚РѕР»СЊРєРѕ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РґРѕРІРµСЂРёРµ Р°С‚СЂРёР±СѓС‚РЅРѕРјСѓ СЃРµСЂС‚РёС„РёРєР°С‚Сѓ СѓСЃС‚Р°РЅРѕРІР»РµРЅРѕ.
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {Boolean}
         */
        valid: function (flags) {
            flags = flags || 0;
            return this.object.CheckValidity(flags) == 0;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅРёСЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РІ СЃРїСЂР°РІРѕС‡РЅРёРє СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ Рё РЎРћРЎ.
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        importCert: function (flags) {
            flags = flags || 0;
            this.object.Import(flags);
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ РѕРєРЅР° РёРЅС„РѕСЂРјР°С†РёРё РѕР± Р°С‚СЂРёР±СѓС‚РЅРѕРј СЃРµСЂС‚РёС„РёРєР°С‚Рµ.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РїСЂРё РІС‹Р·РѕРІРµ Р±РµР· РїР°СЂР°РјРµС‚СЂРѕРІ РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РѕС‚РѕР±СЂР°Р¶Р°РµС‚ РґРёР°Р»РѕРі, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р§С‚РѕР±С‹ СЌС‚РѕРіРѕ РЅРµ РїСЂРѕРёР·РѕС€Р»Рѕ РЅРµРѕР±С…РѕРґРёРјРѕ РїРµСЂРµРґР°С‚СЊ РІ РїР°СЂР°РјРµС‚СЂС‹ С„СѓРЅРєС†РёСЋ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РѕС€РёР±РєРё.</b>
         *
         * РџСЂРёРјРµСЂ:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.show(function (e) {
         *         if (e) { alert(e.message); return; }
         *     })
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} [fn] С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РѕС€РёР±РєРё.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @chainable
         */
        show: function (flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            } else if (fn === undefined) {
                flags = (typeof flags === "number" ? flags : 0);
            }
            if (fn === undefined) {
                this.object.Show(flags);
            } else {
                this.object.ShowAsync(flags, this.makeAsync(fn));
            }
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РґРѕРїРѕР»РЅРµРЅРёСЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РµРіРѕ OID РёР»Рё РЅРѕРјРµСЂСѓ (РѕС‚ 0 РґРѕ {@link avcmx.AttributeCertificate#extCount} вЂ“ 1).
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ РґРѕРїРѕР»РЅРµРЅРёСЏ:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.ext(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РґРѕРїРѕР»РЅРµРЅРёСЏ СЃ OID 1.1.1.1:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.ext("1.1.1.1")
         *
         * @param {String|Number} oidOrIndex OID РёР»Рё РёРЅРґРµРєСЃ РїРѕР»СѓС‡Р°РµРјРѕРіРѕ РґРѕРїРѕР»РЅРµРЅРёСЏ.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Extension}
         */
        ext: function (oidOrIndex, flags) {
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetExtensionByOid(oidOrIndex, flags));
            } else {
                return this.factory(this.object.GetExtensionByIndex(oidOrIndex, flags));
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РµРіРѕ OID РёР»Рё РЅРѕРјРµСЂСѓ (РѕС‚ 0 РґРѕ {@link avcmx.AttributeCertificate#attrCount} вЂ“ 1).
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.attr(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° СЃ OID 1.1.1.1:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.attr("1.1.1.1")
         *
         * @param {String|Number} oidOrIndex OID РёР»Рё РёРЅРґРµРєСЃ РїРѕР»СѓС‡Р°РµРјРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {avcmx.Attribute}
         */
        attr: function (oidOrIndex, flags) {
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetAttributeByOid(oidOrIndex, flags), "Attribute");
            } else {
                return this.factory(this.object.GetAttributeByIndex(oidOrIndex, flags), "Attribute");
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р° РїРѕ РµРіРѕ OID РёР»Рё РЅРѕРјРµСЂСѓ.
         * Р•СЃР»Рё РјРµС‚РѕРґ РІС‹Р·РІР°РЅ Р±РµР· РїР°СЂР°РјРµС‚СЂРѕРІ Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅР° РїРѕР»РЅР°СЏ СЃС‚СЂРѕРєР° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ Р°С‚СЂРёР±СѓС‚РЅРѕРіРѕ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРѕР»РЅРѕР№ СЃС‚СЂРѕРєРё РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.issuerName()
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.issuerName(0)
         *
         * РџРѕР»СѓС‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° Common Name РёРјРµРЅРё РёР·РґР°С‚РµР»СЏ:
         *
         *      attrcert = ... // create attribute certificate
         *     attrcert.issuerName("2.5.4.3")
         *
         * @param {String|Number} [oidOrIndex] OID РёР»Рё РёРЅРґРµРєСЃ РїРѕР»СѓС‡Р°РµРјРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°.
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {String|avcmx.NameAttribute}
         */
        issuerName: function (oidOrIndex, flags) {
            if (oidOrIndex === undefined) return this.object.Issuer;
            flags = flags || 0;
            if (typeof oidOrIndex === "string" && oidOrIndex.indexOf(".") > 0) {
                return this.factory(this.object.GetIssuerNameAttributeByOid(oidOrIndex, flags), "NameAttribute");
            } else {
                return this.factory(this.object.GetIssuerNameAttributeByIndex(oidOrIndex, flags), "NameAttribute");
            }
        }
    });

    /**
     * @class avcmx.CertificateStatus
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃРѕ СЃС‚Р°С‚СѓСЃРѕРј СЃРµСЂС‚РёС„РёРєР°С‚Р°, РЅР°РїСЂРёРјРµСЂ, РїСЂРёС‡РёРЅРѕР№ РµРіРѕ РѕС‚Р·С‹РІР°.
     * @extends avcmxobject.<native.AvCMX.CertificateStatus>
     */
    avcmx.CertificateStatus.prototype = extend(avcmx.CertificateStatus.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїСЂРёР·РЅР°РєР° РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕСЃС‚Рё СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * @return {Boolean}
         */
        trusted: function () {
            return this.object.IsTrusted;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РґР°С‚С‹ РѕС‚Р·С‹РІР° СЃРµСЂС‚РёС„РёРєР°С‚Р°. Р•СЃР»Рё СЃРµСЂС‚РёС„РёРєР°С‚ РЅРµ РѕС‚РѕР·РІР°РЅ, Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅРѕ <b>null</b>.
         * @return {Date|null}
         */
        revTime: function () {
            try{
                return new Date(this.object.RevocationTimeSec * 1000);
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_BAD_HANDLE)) {
                    return null;
                } else {
                    throw e;
                }
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїСЂРёС‡РёРЅС‹ РѕС‚Р·С‹РІР° СЃРµСЂС‚РёС„РёРєР°С‚Р°. Р•СЃР»Рё СЃРµСЂС‚РёС„РёРєР°С‚ РЅРµ РѕС‚РѕР·РІР°РЅ, Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅРѕ <b>null</b>.
         * Р’ СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РїСЂРёС‡РёРЅР° РѕС‚Р·С‹РІР° СЃРµСЂС‚РёС„РёРєР°С‚Р° РЅРµ СѓРєР°Р·Р°РЅР°, РІ РєР°С‡РµСЃС‚РІРµ РїСЂРёС‡РёРЅС‹ РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ 0 (unspecified).
         * @return {Number|null}
         */
        revReason: function () {
            try {
                return parseInt(this.object.RevocationReason);
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_BAD_HANDLE)) {
                    return null;
                } else {
                    throw e;
                }
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїСЂРёС‡РёРЅС‹ РЅРµРґРѕРІРµСЂРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Сѓ. Р•СЃР»Рё СЃРµСЂС‚РёС„РёРєР°С‚ РЅРµ РѕС‚РѕР·РІР°РЅ, Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅРѕ <b>null</b>.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РїСЂРёС‡РёРЅС‹ РЅРµРґРѕРІРµСЂРёСЏ СЃРµСЂС‚РёС„РёРєР°С‚Сѓ:
         *
         * - <b>AVCM_CSR_REVOKED</b> вЂ“ СЃРµСЂС‚РёС„РёРєР°С‚ РѕС‚РѕР·РІР°РЅ.
         * - <b>AVCM_CSR_UNKNOWN</b> вЂ“ РїСЂРёС‡РёРЅР° РЅРµРґРѕРІРµСЂРёСЏ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ СѓСЃС‚Р°РЅРѕРІР»РµРЅР°
         *
         * @return {Number|null}
         */
        untrustReason: function () {
            try {
                return parseInt(this.object.UntrustReason);
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_BAD_HANDLE)) {
                    return null;
                } else {
                    throw e;
                }
            }
        }
    });

    /**
     * @class avcmx.CRL
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РЎРћРЎ X.509, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРІРѕР№СЃС‚РІ РЎРћРЎ.
     * @extends avcmxobject.<native.AvCMX.CRL>
     */
    avcmx.CRL.prototype = extend(avcmx.CRL.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РЎРћРЎ РІ СЌРєСЃРїРѕСЂС‚РёСЂСѓРµРјРѕРј РІРёРґРµ. РЎРІРѕР№СЃС‚РІРѕ РІРѕР·РІСЂР°С‰Р°РµС‚ DER Р·Р°РєРѕРґРёСЂРѕРІР°РЅРЅС‹Р№ X.509 РЎРћРЎ.
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Blob);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚РѕРІ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂС‹ Р°С‚СЂРёР±СѓС‚РѕРІ (РІ СЃРєРѕР±РєР°С… СѓРєР°Р·Р°РЅ С‚РёРї РґР°РЅРЅС‹С… РІ Р±Р»РѕР±Рµ):
         *
         * - <b>AVCM_VERSION</b> вЂ“ РІРµСЂСЃРёСЏ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ (С‡РёСЃР»Рѕ).
         * - <b>AVCM_ISSUER_AS_STRING</b> вЂ“ РёРјСЏ (X.509 Name) РёР·РґР°С‚РµР»СЏ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РІ РІРёРґРµ СЃС‚СЂРѕРєРё,
         * РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё СЌС‚Рѕ РїРѕР»Рµ РЎРћРЎ РјРѕР¶РЅРѕ РїСЂРµРґСЃС‚Р°РІРёС‚СЊ РІ РІРёРґРµ СЃС‚СЂРѕРєРё. Р•СЃР»Рё Р°С‚СЂРёР±СѓС‚ РЅРµРІРѕР·РјРѕР¶РЅРѕ РїСЂРµРґСЃС‚Р°РІРёС‚СЊ РІ РІРёРґРµ
         * СЃС‚СЂРѕРєРё ASCIIZ, Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅР° РѕС€РёР±РєР° <b>AVCMR_BAD_FORMAT</b> (СЃС‚СЂРѕРєР° СЃ РЅСѓР»РµРІС‹Рј Р±Р°Р№С‚РѕРј РІ РєРѕРЅС†Рµ).
         * - <b>AVCM_THIS_UPDATE</b> вЂ“ РґР°С‚Р°/РІСЂРµРјСЏ РёР·РґР°РЅРёСЏ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ (РґР°С‚Р°).
         * - <b>AVCM_NEXT_UPDATE</b> вЂ“ РґР°С‚Р°/РІСЂРµРјСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ РґРµР№СЃС‚РІРёСЏ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ (РґР°С‚Р°).
         * - <b>AVCM_PUB_KEY_ID</b> вЂ“ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ РѕС‚РєСЂС‹С‚РѕРіРѕ РєР»СЋС‡Р° СЃРµСЂС‚РёС„РёРєР°С‚Р° РёР·РґР°С‚РµР»СЏ РЎРћРЎ (СЃС‚СЂРѕРєР° СЃ РЅСѓР»РµРІС‹Рј Р±Р°Р№С‚РѕРј РІ РєРѕРЅС†Рµ).
         * - <b>AVCM_SIGN_ALG_OID</b> вЂ“ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ Р°Р»РіРѕСЂРёС‚РјР° Р­Р¦Рџ (СЃС‚СЂРѕРєР° СЃ РЅСѓР»РµРІС‹Рј Р±Р°Р№С‚РѕРј РІ РєРѕРЅС†Рµ).
         * - <b>AVCM_BLOB</b> вЂ“ DER-РїСЂРµРґСЃС‚Р°РІР»РµРЅРёРµ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ (Р±РёРЅР°СЂРЅС‹Рµ РґР°РЅРЅС‹Рµ). РђРЅР°Р»РѕРіРёС‡РЅРѕ РІС‹Р·РѕРІСѓ {@link avcmx.CRL#val}
         * - <b>AVCM_SHA1_HASH</b> вЂ“ SHA-1 С…СЌС€ РѕС‚ DER-РїСЂРµРґСЃС‚Р°РІР»РµРЅРёРµ СЃРїРёСЃРєР° РѕС‚РѕР·РІР°РЅРЅС‹С… СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ (Р±РёРЅР°СЂРЅС‹Рµ РґР°РЅРЅС‹Рµ).
         *
         * @param {Number} id РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ РїРѕР»СѓС‡Р°РµРјРѕРіРѕ Р°С‚СЂРёР±СѓС‚Р°
         * @return {avcmx.Blob}
         */
        attr: function (id) {
            return this.factory(this.object.GetAttribute(id));
        }
    });

    /**
     * @class avcmx.Requests
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РЅР°Р±РѕСЂРѕРј Р·Р°РїСЂРѕСЃРѕРІ РЅР° СЃРµСЂС‚РёС„РёРєР°С‚С‹.
     * @extends avcmxobject.<native.AvCMX.Requests>
     * @since 1.1.1
     */
    avcmx.Requests.prototype = extend(avcmx.Requests.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєРѕР»РёС‡РµСЃС‚РІР° Р·Р°РїСЂРѕСЃРѕРІ РІ СЃРїРёСЃРєРµ.
         * @return {Number}
         */
        length: function () {
            return parseInt(this.object.Count);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РѕР±СЉРµРєС‚РѕРІ Р·Р°РїСЂРѕСЃРѕРІ СЃРїРёСЃРєР° РґР»СЏ РїРѕСЃР»РµРґСѓСЋС‰РµР№ РѕР±СЂР°Р±РѕС‚РєРё
         * (РЅР°РїСЂРёРјРµСЂ, РїРѕР»СѓС‡РµРЅРёСЏ РёС… Р°С‚СЂРёР±СѓС‚РѕРІ). РРЅРґРµРєСЃРёСЂСѓРµС‚СЃСЏ С†РµР»С‹Рј С‡РёСЃР»РѕРј РѕС‚ 0 РґРѕ {@link avcmx.Requests#length} вЂ“ 1
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РїРµСЂРІРѕРіРѕ Р·Р°РїСЂРѕСЃР°
         *
         *      reqs = ... // create requests
         *     reqs.reqs(0)
         *     reqs.reqs()[0]
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… Р·Р°РїСЂРѕСЃРѕРІ РїРѕ РёРЅРґРµРєСЃСѓ
         *
         *      reqs = ... // create requests
         *     for (var i = 0; i < reqs.length(); i++) {
         *         reqs.reqs(i)
         *     }
         *
         * РџРѕР»СѓС‡РµРЅРёРµ РІСЃРµС… Р·Р°РїСЂРѕСЃРѕРІ Рё РїРµСЂРµР±РѕСЂ
         *
         *      reqs = ... // create requests
         *      reqs = reqs.reqs()
         *     for (var i = 0; i < reqs.length; i++) {
         *         reqs[i]
         *     }
         *
         * @param {Number} [index] РЅРѕРјРµСЂ Р·Р°РїСЂРѕСЃР°, РєРѕС‚РѕСЂС‹Р№ РЅСѓР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ (РѕС‚ 0).
         * @return {avcmx.Request|avcmx.Request[]} РІРѕР·РІСЂР°С‰Р°РµС‚ РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃ РµСЃР»Рё РїРµСЂРµРґР°РЅ РёРЅРґРµРєСЃ, РёРЅР°С‡Рµ - СЃРїРёСЃРѕРє РІСЃРµС… Р·Р°РїСЂРѕСЃРѕРІ
         */
        reqs: function (index) {
            if (index === undefined) {
                if (this.reqsCache === undefined) {
                    this.reqsCache = [];
                    for (var i = 0; i < this.object.Count; i++) {
                        this.reqsCache.push(this.factory(this.object.Item(i)));
                    }
                }
                return this.reqsCache;
            } else {
                return this.reqsCache ? this.reqsCache[index] : this.factory(this.object.Item(index));
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ Р·Р°РїСЂРѕСЃР° РёР»Рё Р·Р°РїСЂРѕСЃРѕРІ, РѕС‚РѕР±СЂР°РЅРЅС‹С… РїРѕ СЃРїРёСЃРєСѓ СѓСЃР»РѕРІРёР№,
         * РІ СЃРїРёСЃРѕРє Р·Р°РїСЂРѕСЃРѕРІ.
         *
         * @param {avcmx.Request|avcmx.Parameters} reqOrParams Р·Р°РїСЂРѕСЃ РёР»Рё РїР°СЂР°РјРµС‚СЂС‹ РѕС‚Р±РѕСЂР° СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         */
        add: function (reqOrParams, flags) {
            flags = flags || 0;
            if (reqOrParams.toString().indexOf("[wrapper AvCMX.") == 0) {
                if (reqOrParams.toString() == "[wrapper AvCMX.Request]") {
                    this.object.AddRequest(reqOrParams.get(), flags);
                } else if (reqOrParams.toString() == "[wrapper AvCMX.Parameters]") {
                    // not implemented
                    this.object.AddRequests(reqOrParams.get(), flags);
                }
            } else {
                // TODO: custom params constructor
            }
            delete this.reqsCache;
            return this;
        }
    });

    /**
     * @class avcmx.Request
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ Р·Р°РїСЂРѕСЃРѕРј PKCS#10, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРІРѕР№СЃС‚РІ Р·Р°РїСЂРѕСЃР°.
     * @extends avcmxobject.<native.AvCMX.Request>
     */
    avcmx.Request.prototype = extend(avcmx.Request.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°РїСЂРѕСЃР° РІ СЌРєСЃРїРѕСЂС‚РёСЂСѓРµРјРѕРј РІРёРґРµ. Р’РѕР·РІСЂР°С‰Р°РµС‚ DER Р·Р°РєРѕРґРёСЂРѕРІР°РЅРЅС‹Р№ PKCS#10 Р·Р°РїСЂРѕСЃ.
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Blob);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° РїСѓР±Р»РёС‡РЅРѕРіРѕ РєР»СЋС‡Р° Р·Р°РїСЂРѕСЃР°.
         * @return {avcmx.Blob}
         */
        pubKeyId: function () {
            return this.factory(this.object.PublicKeyId);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё Р·Р°РїСЂРѕСЃР° СЃ Р¦РµРЅС‚СЂРѕРј РЎРµСЂС‚РёС„РёРєР°С‚РѕРІ Microsoft.
         * @return {Boolean}
         */
        mscaCompatible: function () {
            return this.object.MSCACompatible;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёРјРµРЅРё РєРѕРЅС‚РµР№РЅРµСЂР° СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РµРіРѕ РґР°РЅРЅРѕРјСѓ Р·Р°РїСЂРѕСЃСѓ.
         * @return {String|null}
         */
        container: function () {
            try {
                return this.object.ContainerName;
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_NOT_FOUND)) {
                    return null;
                } else {
                    throw e;
                }
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°РґСЂРµСЃР° SCEP СЃРµСЂРІРµСЂР°, РЅР° РєРѕС‚РѕСЂС‹Р№ Р±С‹Р» РѕС‚РїСЂР°РІР»РµРЅ РґР°РЅРЅС‹Р№ Р·Р°РїСЂРѕСЃ.
         * @return {String|null}
         */
        scepUrl: function () {
            try {
                return this.object.SCEPURL;
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_NOT_FOUND)) {
                    return null;
                } else {
                    throw e;
                }
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃС‚Р°С‚СѓСЃР° Р·Р°РїСЂРѕСЃР°.
         *
         * РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ СЃР»РµРґСѓСЋС‰РёРµ СЃС‚Р°С‚СѓСЃС‹:
         *
         * - <b>AVCM_REQUEST_STATE_INBOX</b> вЂ“ РІРѕ РІС…РѕРґРЅРѕР№ РѕС‡РµСЂРµРґРё.
         * - <b>AVCM_REQUEST_STATE_PROCESSED</b> вЂ“ РѕР±СЂР°Р±РѕС‚Р°РЅ.
         * - <b>AVCM_REQUEST_STATE_REJECTED</b> вЂ“ РѕС‚РєР°Р·Р°РЅРѕ РІ РІС‹РґР°С‡Рµ СЃРµСЂС‚РёС„РёРєР°С‚Р°.
         * - <b>AVCM_REQUEST_STATE_MANUALPROCESSING</b> вЂ“ РїРµСЂРµРІРµРґРµРЅ РІ СЂСѓС‡РЅСѓСЋ РѕР±СЂР°Р±РѕС‚РєСѓ.
         * - <b>AVCM_REQUEST_STATE_SIGN_WAIT</b> вЂ“ РѕР¶РёРґР°РЅРёРµ РІС‚РѕСЂРѕР№ РїРѕРґРїРёСЃРё.
         * - <b>AVCM_REQUEST_STATE_PENDING</b> вЂ“ РѕР¶РёРґР°РЅРёРµ РѕР±СЂР°Р±РѕС‚РєРё СЃРµСЂРІРµСЂРѕРј SCEP.
         *
         * @return {Number}
         */
        state: function () {
            return this.object.State;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РґР°С‚С‹ РіРµРЅРµСЂР°С†РёРё Р·Р°РїСЂРѕСЃР°.
         * @return {Date|null}
         */
        datetime: function () {
            try {
                return new Date(this.object.SignDateTimeSec * 1000);
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_NOT_FOUND)) {
                    return null;
                } else {
                    throw e;
                }
            }
        }
    });

    /**
     * @class avcmx.Extension
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РґРѕРїРѕР»РЅРµРЅРёСЏРјРё СЃРµСЂС‚РёС„РёР°С‚РѕРІ, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёС… Р·РЅР°С‡РµРЅРёР№.
     * @extends avcmxobject.<native.AvCMX.Extension>
     */
    avcmx.Extension.prototype = extend(avcmx.Extension.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID РґРѕРїРѕР»РЅРµРЅРёСЏ.
         * @return {String}
         */
        oid: function () {
            return this.object.Oid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅРЅРѕРіРѕ РЅР°Р·РІР°РЅРёСЏ OID РґРѕРїРѕР»РЅРµРЅРёСЏ. Р•СЃР»Рё OID РЅРµ
         * Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ РІ СЃРёСЃС‚РµРјРµ, Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅР° РѕС€РёР±РєР°.
         * @return {String}
         */
        oidName: function () {
            return this.object.OidName;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїСЂРѕРІРµСЂРєРё С„Р»Р°РіР° РєСЂРёС‚РёС‡РЅРѕСЃС‚Рё РґРѕРїРѕР»РЅРµРЅРёСЏ.
         * @return {Boolean}
         */
        crit: function () {
            return this.object.Critical;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїРѕР»РЅРѕРіРѕ Р·РЅР°С‡РµРЅРёСЏ (blob) РґРѕРїРѕР»РЅРµРЅРёСЏ. Р’РѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РїРѕР»РЅС‹Р№ Р±Р»РѕРє РґР°РЅРЅС‹С…,
         * СЏРІР»СЏСЋС‰РёР№СЃСЏ Р·РЅР°С‡РµРЅРёРµРј РґРѕРїРѕР»РЅРµРЅРёСЏ, РІ С‚.С‡. СЃ ASN.1 РєРѕРґРѕРј С‚РёРїР° СЃРѕРґРµСЂР¶Р°С‰РёС…СЃСЏ РґР°РЅРЅС‹С….
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Value);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·РЅР°С‡РµРЅРёСЏ РґРѕРїРѕР»РЅРµРЅРёСЏ РІ СЃС‚СЂРѕРєРѕРІРѕРј РІРёРґРµ.
         * @return {String|null}
         */
        str: function () {
            try {
                return this.object.ValueAsString;
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_BAD_FORMAT)) {
                    return null;
                } else {
                    throw e;
                }
            }
        }
    });

    /**
     * @class avcmx.Attribute
     * РїСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ Р°С‚СЂРёР±СѓС‚Р°РјРё, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёС… Р·РЅР°С‡РµРЅРёР№
     * @extends avcmxobject.<native.AvCMX.Attribute>
     */
    avcmx.Attribute.prototype = extend(avcmx.Attribute.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°С‚СЂРёР±СѓС‚Р°
         * @return {String}
         */
        oid: function () {
            return this.object.Oid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅРЅРѕРіРѕ РЅР°Р·РІР°РЅРёСЏ OID Р°С‚СЂРёР±СѓС‚Р°. Р•СЃР»Рё OID РЅРµ
         * Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ РІ СЃРёСЃС‚РµРјРµ, Р±СѓРґРµС‚ РІРѕР·РІСЂР°С‰РµРЅР° РѕС€РёР±РєР°.
         * @return {String}
         */
        oidName: function () {
            return this.object.OidName;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїРѕР»РЅРѕРіРѕ Р·РЅР°С‡РµРЅРёСЏ (blob) Р°С‚СЂРёР±СѓС‚Р°.
         * Р’РѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РїРѕР»РЅС‹Р№ Р±Р»РѕРє РґР°РЅРЅС‹С…, СЏРІР»СЏСЋС‰РёР№СЃСЏ Р·РЅР°С‡РµРЅРёРµРј Р°С‚СЂРёР±СѓС‚Р°, РІ С‚.С‡. СЃ ASN.1 РєРѕРґРѕРј С‚РёРїР° СЃРѕРґРµСЂР¶Р°С‰РёС…СЃСЏ РґР°РЅРЅС‹С…
         * @return {avcmx.Blob}
         */
        val: function () {
            return this.factory(this.object.Value);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·РЅР°С‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° РІ С‚РµС… СЃР»СѓС‡Р°СЏС…, РІ РєРѕС‚РѕСЂС‹С… РѕРЅРѕ СЏРІР»СЏРµС‚СЃСЏ СЃС‚СЂРѕРєРѕР№.
         * Р•СЃР»Рё Р·РЅР°С‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° РїСЂРµРґСЃС‚Р°РІР»СЏРµС‚ РёР· СЃРµР±СЏ С‚РѕР»СЊРєРѕ СЃС‚СЂРѕРєСѓ, С‚Рѕ СЌС‚Рѕ СЃРІРѕР№СЃС‚РІРѕ РІРµСЂРЅСђС‚ СЃРѕРґРµСЂР¶РёРјРѕРµ
         * СЌС‚РѕР№ СЃС‚СЂРѕРєРё (Р±РµР· ASN.1 РєРѕРґРѕРІ С‚РёРїР° Рё РґР»РёРЅС‹ СЃС‚СЂРѕРєРё). Р’ РїСЂРѕС‚РёРІРЅРѕРј СЃР»СѓС‡Р°Рµ РѕРЅРѕ РІРµСЂРЅСђС‚ <b>null</b>
         * @return {String|null}
         */
        str: function () {
            try {
                return this.object.ValueAsString;
            } catch (e) {
                if (AvCMXError.lastErrorIs(avcmx.constants.AVCMR_BAD_FORMAT)) {
                    return null;
                } else {
                    throw e;
                }
            }
        }
    });

    /**
     * @class avcmx.NameAttribute
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ Р°С‚СЂРёР±СѓС‚Р°РјРё РёРјСђРЅ СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ, Р·Р°РїСЂРѕСЃРѕРІ, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РёС… Р·РЅР°С‡РµРЅРёР№.
     * @extends avcmxobject.<native.AvCMX.NameAttribute>
     */
    avcmx.NameAttribute.prototype = extend(avcmx.NameAttribute.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ OID Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё
         * @return {String}
         */
        oid: function () {
            return this.object.Oid;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃС‚СЂРѕРєРѕРІРѕРіРѕ Р·РЅР°С‡РµРЅРёСЏ Р°С‚СЂРёР±СѓС‚Р° РёРјРµРЅРё.
         * @return {String}
         */
        val: function () {
            return this.object.Value;
        }
    });

    /**
     * @class avcmx.Scep
     * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РїСЂРѕС‚РѕРєРѕР»РѕРј SCEP, РЅР°РїСЂРёРјРµСЂ, РґР»СЏ РѕС‚РїСЂР°РІРєРё Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ РЅР° СЃРµСЂРІРµСЂ РґР»СЏ
     * РѕР±СЂР°Р±РѕС‚РєРё Рё РїРѕР»СѓС‡РµРЅРёСЏ С†РµРїРѕС‡РєРё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ.
     *
     * РџРѕСЃР»РµРґРѕРІР°С‚РµР»СЊРЅРѕСЃС‚СЊ РІС‹Р·РѕРІРѕРІ
     *
     * - СЃРѕР·РґР°РЅРёРµ {@link avcmx.Connection#scep}
     * - СѓСЃС‚Р°РЅРѕРІРєР° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ {@link avcmx.Scep#req} Рё РёРјРµРЅРё РєРѕРЅС‚РµР№РЅРµСЂР° {@link avcmx.Scep#container}
     * - РїРѕРґРіРѕС‚РѕРІРєР° Рє РѕС‚РїСЂР°РІРєРµ {@link avcmx.Scep#prepareAsync}
     * - РѕС‚РїСЂР°РІРєР° Р·Р°РїСЂРѕСЃР° Рё РїРѕР»СѓС‡РµРЅРёРµ РѕС‚РІРµС‚Р° {@link avcmx.Scep#enrollAsync}
     * - РїРѕР»СѓС‡РµРЅРёРµ С†РµРїРѕС‡РєРё СЃ РЅРѕРІС‹Рј СЃРµСЂС‚РёС„РёРєР°С‚РѕРј {@link avcmx.Scep#resp}
     *
     * РџРѕСЃР»РµРґРѕРІР°С‚РµР»СЊРЅРѕСЃС‚СЊ РІС‹Р·РѕРІРѕРІ (offline)
     *
     * - СЃРѕР·РґР°РЅРёРµ {@link avcmx.Connection#scep} СЃ С„Р»Р°РіРѕРј <b>AVCMF_SCEP_OFFLINE</b>
     * - СѓСЃС‚Р°РЅРѕРІРєР° Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ {@link avcmx.Scep#req} Рё РёРјРµРЅРё РєРѕРЅС‚РµР№РЅРµСЂР° {@link avcmx.Scep#container}
     * - РїРѕР»СѓС‡РµРЅРёРµ С†РµРїРѕС‡РєРё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РѕС‚ СЃРµСЂРІРµСЂР° Рё СѓСЃС‚Р°РЅРѕРІРєР° {@link avcmx.Scep#caCert}
     * - РїРѕРґРіРѕС‚РѕРІРєР° Рє РѕС‚РїСЂР°РІРєРµ {@link avcmx.Scep#prepareAsync}
     * - РїРѕР»СѓС‡РµРЅРёРµ Р·Р°РїСЂРѕСЃР° {@link avcmx.Scep#pkiOperation} Рё РѕС‚РїСЂР°РІРєР° РЅР° СЃРµСЂРІРµСЂ
     * - РїРѕР»СѓС‡РµРЅРёРµ РѕС‚РІРµС‚Р° РѕС‚ СЃРµСЂРІРµСЂР° Рё СѓСЃС‚Р°РЅРѕРІРєР° {@link avcmx.Scep#pkiOperation}
     * - СЂР°Р·Р±РѕСЂ РѕС‚РІРµС‚Р° {@link avcmx.Scep#enrollAsync}
     * - РїРѕР»СѓС‡РµРЅРёРµ С†РµРїРѕС‡РєРё СЃ РЅРѕРІС‹Рј СЃРµСЂС‚РёС„РёРєР°С‚РѕРј {@link avcmx.Scep#resp}
     *
     * @extends avcmxobject.<native.AvCMX.Scep>
     */
    avcmx.Scep.prototype = extend(avcmx.Scep.prototype, {
        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё СЃРѕРґРµСЂР¶РёРјРѕРіРѕ Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂС‚РёС„РёРєР°С‚ РґР»СЏ РѕС‚РїСЂР°РІРєРё РЅР° СЃРµСЂРІРµСЂ SCEP.
         * РЈСЃС‚Р°РЅРѕРІРєР° РґР°РЅРЅРѕРіРѕ СЃРІРѕР№СЃС‚РІР° РЅРµ РѕР±СЏР·Р°С‚РµР»СЊРЅР°, РµСЃР»Рё СЃ РґР°РЅРЅРѕРіРѕ РџРљ СЂР°РЅРµРµ СѓР¶Рµ Р±С‹Р» РїРѕСЃР»Р°РЅ Р·Р°РїСЂРѕСЃ РЅР° СЃРµСЂРІРµСЂ,
         * С‚Рѕ РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ СЃРІРѕР№СЃС‚РІРѕ {@link avcmx.Scep#transId}.
         *
         * @param {avcmx.Blob} blob Р·Р°РїСЂРѕСЃ РІ DER-РєРѕРґРёСЂРѕРІРєРµ.
         * @chainable
         */
        req: function (blob) {
            if (blob) {
                this.object.Request = blob.get();
                return this;
            } else {
                return this.factory(this.object.Request);
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РѕС‚РІРµС‚Р° РѕС‚ СЃРµСЂРІРµСЂР° SCEP. Р•СЃР»Рё СЃРµСЂС‚РёС„РёРєР°С‚ РЅРµ Р±С‹Р» РІС‹РґР°РЅ, РїСЂРѕРёР·РѕР№РґРµС‚ РѕС€РёР±РєР°.
         * @return {avcmx.Blob}
         */
        resp: function () {
            return this.factory(this.object.Response);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё Рё РїРѕР»СѓС‡РµРЅРёСЏ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂР° С‚СЂР°РЅР·Р°РєС†РёРё. РџРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅРѕРіРѕ СЃРІРѕР№СЃС‚РІР° СЃС‚Р°РЅРѕРІРёС‚СЃСЏ
         * РІРѕР·РјРѕР¶РЅС‹Рј С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ РІС‹Р·РѕРІР° РјРµС‚РѕРґР° {@link avcmx.Scep#enroll} {@link avcmx.Scep#enrollAsync}.
         *
         * @param {String} [val] РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ С‚СЂР°РЅР·Р°РєС†РёРё.
         * @return {String|avcmx.Scep} РїСЂРё РїРѕР»СѓС‡РµРЅРёРё РІРѕР·РІСЂР°С‰Р°РµС‚ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ С‚СЂР°РЅР·Р°РєС†РёРё, Р° РїСЂРё СѓСЃС‚Р°РЅРѕРєРµ - С‚РµРєСѓС‰РёР№ РѕР±СЉРµРєС‚.
         */
        transId: function (val) {
            if (val) {
                this.object.TransactionId = val;
                return this;
            } else {
                return this.object.TransactionId;
            }
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё РёРјРµРЅРё РєРѕРЅС‚РµР№РЅРµСЂР° РґР»СЏ СЃРІСЏР·Рё СЃ Р»РёС‡РЅС‹Рј РєР»СЋС‡РѕРј.
         *
         * @param {String} val РёРјСЏ РєРѕРЅС‚РµР№РЅРµСЂР°
         * @chainable
         */
        container: function (val) {
            this.object.ContainerName = val;
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РѕС‚РїСЂР°РІРєРё Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂРІРµСЂ, РїРѕР»СѓС‡РµРЅРёСЏ Рё СЂР°Р·Р±РѕСЂР° РѕС‚РІРµС‚Р°.
         * Р•СЃР»Рё РІ РІС‹РґР°С‡Рµ СЃРµСЂС‚РёС„РёРєР°С‚Р° РѕС‚РєР°Р·Р°РЅРѕ, С‚Рѕ Р±СѓРґРµС‚ СЃРіРµРЅРµСЂРёСЂРѕРІР°РЅР° РѕС€РёР±РєР° <b>AVCMR_SCEP_ERROR</b>.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РѕС‚РїСЂР°РІР»СЏРµС‚ Р·Р°РїСЂРѕСЃ РЅР° СЃРµСЂРІРµСЂ Рё РѕР¶РёРґР°РµС‚ РѕС‚РІРµС‚Р°, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Scep#enrollAsync}</b>
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @return {Boolean} true РµСЃР»Рё СЃРµСЂС‚РёС„РёРєР°С‚ РІС‹РґР°РЅ, false РµСЃР»Рё Р·Р°РїСЂРѕСЃ РІ РѕР¶РёРґР°РЅРёРё РѕР±СЂР°Р±РѕС‚РєРё.
         * @deprecated 1.1.1 Р—Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Scep#enrollAsync}
         */
        enroll: function (flags) {
            flags = flags || 0;
            return this.object.Enroll(flags);
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РѕС‚РїСЂР°РІРєРё Р·Р°РїСЂРѕСЃР° РЅР° СЃРµСЂРІРµСЂ, РїРѕР»СѓС‡РµРЅРёСЏ Рё СЂР°Р·Р±РѕСЂР° РѕС‚РІРµС‚Р°.
         * Р•СЃР»Рё РІ РІС‹РґР°С‡Рµ СЃРµСЂС‚РёС„РёРєР°С‚Р° РѕС‚РєР°Р·Р°РЅРѕ, С‚Рѕ Р±СѓРґРµС‚ СЃРіРµРЅРµСЂРёСЂРѕРІР°РЅР° РѕС€РёР±РєР° <b>AVCMR_SCEP_ERROR</b>.
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЂРµР·СѓР»СЊС‚Р°С‚Р° РёР»Рё РѕС€РёР±РєРё.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @param {Boolean} fn.res true РµСЃР»Рё СЃРµСЂС‚РёС„РёРєР°С‚ РІС‹РґР°РЅ, false РµСЃР»Рё Р·Р°РїСЂРѕСЃ РІ РѕР¶РёРґР°РЅРёРё РѕР±СЂР°Р±РѕС‚РєРё.
         * @chainable
         * @since 1.1.1
         */
        enrollAsync: function (flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.EnrollAsync(flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕРґРіРѕС‚РѕРІРєРё Р·Р°РїСЂРѕСЃР° РґР»СЏ РѕС‚РїСЂР°РІРєРё РЅР° СЃРµСЂРІРµСЂ SCEP.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РґР°РЅРЅС‹Р№ РјРµС‚РѕРґ РјРѕР¶РµС‚ РѕС‚РѕР±СЂР°Р¶Р°С‚СЊ РґРёР°Р»РѕРіРё, С‡С‚Рѕ "РїРѕРґРІРµСЃРёС‚" РѕРєРЅРѕ Р±СЂР°СѓР·РµСЂР° Рё
         * РѕРЅРѕ Р±СѓРґРµС‚ РЅРµРґРѕСЃС‚СѓРїРЅРѕ. Р РµРєРѕРјРµРЅРґСѓРµС‚СЃСЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ Р°СЃРёРЅС…СЂРѕРЅРЅС‹Р№ Р°РЅР°Р»РѕРі {@link avcmx.Scep#prepareAsync}</b>
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @chainable
         * @deprecated 1.1.1 Р—Р°РјРµРЅРµРЅ РЅР° {@link avcmx.Scep#prepareAsync}
         */
        prepare: function (flags) {
            flags = flags || 0;
            this.object.Prepare(flags);
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ РїРѕРґРіРѕС‚РѕРІРєРё Р·Р°РїСЂРѕСЃР° РґР»СЏ РѕС‚РїСЂР°РІРєРё РЅР° СЃРµСЂРІРµСЂ SCEP.
         *
         * @param {Number} [flags] С„Р»Р°РіРё. РќР° РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ РЅРµС‚ РїРѕРґРґРµСЂР¶РёРІР°РµРјС‹С… С„Р»Р°РіРѕРІ.
         * @param {Function} fn С„СѓРЅРєС†РёСЏ РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё СЂРµР·СѓР»СЊС‚Р°С‚Р° РёР»Рё РѕС€РёР±РєРё.
         * @param {AvCMXError} fn.e РѕР±СЉРµРєС‚ РѕС€РёР±РєРё, Р»РёР±Рѕ undefined РїСЂРё СѓСЃРїРµС€РЅРѕРј РІС‹РїРѕР»РЅРµРЅРёРё.
         * @chainable
         * @since 1.1.1
         */
        prepareAsync: function (flags, fn) {
            if (isFunction(flags)) {
                fn = flags;
                flags = 0;
            }
            this.object.PrepareAsync(flags, this.makeAsync(fn));
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё С†РµРїРѕС‡РєРё СЃРµСЂС‚РёС„РёРєР°С‚РѕРІ РїРѕР»СѓС‡РµРЅРЅРѕР№ РѕС‚ СЃРµСЂРІРµСЂР° SCEP. Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РЅРµРѕР±С…РѕРґРёРјРѕ РІС‹Р·С‹РІР°С‚СЊ
         * РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РїСЂРё СЃРѕР·РґР°РЅРёРё РєРѕРЅС‚РµРєСЃС‚Р° Р±С‹Р» РёСЃРїРѕР»СЊР·РѕРІР°РЅ С„Р»Р°Рі <b>AVCMF_SCEP_OFFLINE</b>.
         *
         * @param {avcmx.Blob} blob СЃРµСЂС‚РёС„РёРєР°С‚С‹ РІ РєРѕРґРёСЂРѕРІРєРµ DER.
         * @chainable
         */
        caCert: function (blob) {
            this.object.CACert = blob.get();
            return this;
        },

        /**
         * РџСЂРµРґРЅР°Р·РЅР°С‡РµРЅ РґР»СЏ СѓСЃС‚Р°РЅРѕРІРєРё РѕС‚РІРµС‚Р° РїРѕР»СѓС‡РµРЅРЅРѕРіРѕ РѕС‚ СЃРµСЂРІРµСЂР° SCEP РёР»Рё РїРѕР»СѓС‡РµРЅРёСЏ Р·Р°РїСЂРѕСЃР° РґР»СЏ РѕС‚РїСЂР°РІРєРё РЅР° СЃРµСЂРІРµСЂ.
         * Р”Р°РЅРЅС‹Р№ РјРµС‚РѕРґ РЅРµРѕР±С…РѕРґРёРјРѕ РІС‹Р·С‹РІР°С‚СЊ РІ С‚РѕРј СЃР»СѓС‡Р°Рµ, РµСЃР»Рё РїСЂРё СЃРѕР·РґР°РЅРёРё РєРѕРЅС‚РµРєСЃС‚Р° Р±С‹Р» РёСЃРїРѕР»СЊР·РѕРІР°РЅ С„Р»Р°Рі <b>AVCMF_SCEP_OFFLINE</b>.
         *
         * <b>РџСЂРёРјРµС‡Р°РЅРёРµ: РїСЂРё РїРѕР»СѓС‡РµРЅРёРё РґР°РЅРЅС‹Рµ РІ Р±Р»РѕР±Рµ Р±СѓРґСѓС‚ Р·Р°РєРѕРґРёСЂРѕРІР°РЅС‹ РІ Base64, С‚.Рµ. РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ РЅРµРѕР±С…РѕРґРёРјРѕ
         * РІРѕСЃРїРѕР»СЊР·РѕРІР°С‚СЊСЃСЏ РјРµС‚РѕРґРѕРј {@link avcmx.Blob#text}.</b>
         *
         * @param {avcmx.Blob} [val] РѕС‚РІРµС‚ РѕС‚ СЃРµСЂРІРµСЂР° РІ РєРѕРґРёСЂРѕРІРєРµ DER
         * @return {avcmx.Blob|avcmx.Scep} РїСЂРё СѓСЃС‚Р°РЅРѕРІРєРµ РІРѕР·РІСЂР°С‰Р°РµС‚ С‚РµРєСѓС‰РёР№ РѕР±СЉРµРєС‚, Р° РїСЂРё РїРѕР»СѓС‡РµРЅРёРё - Р·Р°РїСЂРѕСЃ РґР»СЏ РѕС‚РїСЂР°РІРєРё РЅР° СЃРµСЂРІРµСЂ.
         */
        pkiOperation: function (val) {
            if (val) {
                this.object.PKIOperation = val.get();
                return this;
            } else {
                return this.factory(this.object.PKIOperation);
            }
        }
    });

    // list of all constants (see AvCryptMail.h and AvCryptMailBase.h)
    avcmx.constants = {
        // Params
        AVCM_ATTRIBUTE_CERTS: 0x323,
        AVCM_MY_CERT: 0x8,
        AVCM_CHILDREN_COUNT: 0x9,
        AVCM_FORMAT: 0xA,
        AVCM_MF_RAW_DATA: 0x103,
        AVCM_MF_NONE: 0x104,
        AVCM_MF_SIGNED_DATA: 0x105,
        AVCM_MF_ENVELOPED_DATA: 0x106,
        AVCM_SIGN_COUNT: 0x107,
        AVCM_INNER_FORMAT: 0x108,
        AVCM_SUBJECT_ATTR_COUNT: 0x1,
        AVCM_ISSUER_ATTR_COUNT: 0x2,
        AVCM_SUBJECT_ATTR_OID: 0x1033,
        AVCM_ISSUER_ATTR_OID: 0x1034,
        AVCM_EXT_BLOB: 0x5,
        AVCM_ATTR_BLOB: 0x325,
        AVCM_AUTH_OID: 0x1040,
        AVCM_UNAUTH_OID: 0x1041,
        AVCM_AUTH_BLOB: 0x8,
        AVCM_UNAUTH_BLOB: 0x9,
        AVCM_VERSION: 0xB,
        AVCM_HASH_ALG_OID: 0x1010,
        AVCM_SIGN_ALG_OID: 0x1011,
        AVCM_SIGN: 0x12,
        AVCM_SIGN_DATE_TIME: 0x13,
        AVCM_AUTH_COUNT: 0x14,
        AVCM_UNAUTH_COUNT: 0x15,
        AVCM_AUTH_AS_STRING: 0x1016,
        AVCM_UNAUTH_AS_STRING: 0x1017,
        AVCM_VALID: 0x2C,
        AVCM_BLOB: 0x2D,
        AVCM_MSCA_COMPATIBLE: 0x30,
        AVCM_PUB_KEY_ALG_OID: 0x101E,
        AVCM_EXT_COUNT: 0x21,
        AVCM_EXT_OID: 0x1022,
        AVCM_EXT_OID_NAME: 0x1026,
        AVCM_EXT_CRITICAL: 0x23,
        AVCM_EXT_KEY_USAGE_COUNT: 0x28,
        AVCM_EXT_KEY_USAGE_NAME: 0x1028,
        AVCM_ATTR_COUNT: 0x324,
        AVCM_ATTR_OID: 0x1042,
        AVCM_ATTR_OID_NAME: 0x1044,
        AVCM_SHORT_STRING: 0x1,
        AVCM_DESCRIPTION: 0x2,
        AVCM_ERROR_CODE: 0x3,
        AVCM_RESULT_HANDLE: 0x2,
        AVCM_CERTIFICATE: 0x1,
        AVCM_CRL: 0x2,
        AVCM_PKCS10_REQUEST: 0x4,
        AVCM_PKCS7_REQUEST: 0x5,
        AVCM_PKCS7_CHAIN: 0x8,
        AVCM_STORES: 0xC9,
        AVCM_THIS_UPDATE: 0x1A,
        AVCM_NEXT_UPDATE: 0x1B,
        AVCM_SHA1_HASH: 0x2E,
        AVCM_CERT_SHA1_COMPAT: 0x1039,
        AVCM_CS_REVOCATION_TIME: 0x301,
        AVCM_CS_REVOCATION_REASON: 0x302,
        AVCM_CS_UNTRUST_REASON: 0x303,
        AVCM_CHECK_MODE: 0x401,
        AVCM_CM_OFFLINE: 0x402,
        AVCM_CM_ONLINE: 0x403,
        AVCM_RESPONDER_URL: 0x404,
        AVCM_CRL_DISTRIBUTION_POINTS: 0x1035,
        AVCM_IMPORT_PATH: 0x1036,
        AVCM_EXPORT_PATH: 0x1037,
        AVCM_OPERATION_REPORT: 0x1038,
        AVCM_CERT_PROLONGATION: 0x405,
        AVCM_ANY_FILE: 0x406,
        AVCM_OCSP_STATUS: 0x311,
        AVCM_OCSP_THIS_UPDATE: 0x312,
        AVCM_OCSP_NEXT_UPDATE: 0x313,
        AVCM_OCSP_REV_TIME: 0x314,
        AVCM_OCSP_REV_REASON_AS_DWORD: 0x315,
        AVCM_OCSP_RESPONSE_CERT: 0x316,
        AVCM_OCSP_SIGN_RESPONSE_COUNT: 0x321,
        AVCM_OCSP_SIGN_RESPONSE_BYNUM: 0x322,
        AVCM_CONST_BASE: 0xDA370100,
        AVCM_OCSP_STATUS_GOOD: 0x1 + 0xDA370100,
        AVCM_OCSP_STATUS_REVOKED: 0x2 + 0xDA370100,
        AVCM_OCSP_STATUS_UNKNOWN: 0x3 + 0xDA370100,
        AVCM_OCSP_STATUS_BAD: 0x4 + 0xDA370100,
        AVCM_CONTAINERCOUNT: 0x326,
        AVCM_SCEP_REQUEST: 0x327,
        AVCM_SCEP_PKCS_REQ: 0x328,
        AVCM_CONTAINERNAME: 0x1045,
        AVCM_SCEP_TRANSACTIONID: 0x1046,
        AVCM_MSG_INI: 0x1047,
        AVCM_DB_TYPE: 0x1,
        AVCM_DBT_MS_REGISTRY: 0x100,
        AVCM_DBT_ORACLE: 0x101,
        AVCM_DBT_SYBASE: 0x102,
        AVCM_DBT_FILE: 0x103,
        AVCM_DBT_ARCHIVE_FILE: 0x104,
        AVCM_DBT_ARCHIVE_MEMORY: 0x105,
        AVCM_DBT_E_MEMORY: 0x107,
        AVCM_SLOTID: 0x10A,
        AVCM_DB_HANDLE: 0x2,
        AVCM_DB_DSN: 0x3,
        AVCM_DB_UID: 0x4,
        AVCM_DB_PWD: 0x5,
        AVCM_DB_MS_NAME: 0x6,
        AVCM_DB_MS_ROOT_NAME: 0x7,
        AVCM_DB_CONNECTSTR: 0x4,
        AVCM_DB_FILE_PATH: 0x3,
        AVCM_DB_ARCHIVE_FILE_PATH: 0x3,
        AVCM_DB_ARCHIVE_PTR: 0x6,
        AVCM_DB_ARCHIVE_SIZE: 0x7,
        AVCM_PASSWORD: 0x1030,
        AVCM_COMMON_NAME: 0x1031,
        AVCM_ISSUER_AS_STRING: 0x100D,
        AVCM_SERIAL_AS_STRING: 0x100E,
        AVCM_PUB_KEY_ID: 0x100F,
        AVCM_SERIAL_AS_INTEGER: 0x18,
        AVCM_NOT_BEFORE: 0x1A,
        AVCM_NOT_AFTER: 0x1B,
        AVCM_KEY_NOT_BEFORE: 0x2A,
        AVCM_KEY_NOT_AFTER: 0x2B,
        AVCM_D_GREATER: 0x110,
        AVCM_D_LESS: 0x111,
        AVCM_SUBJECT_AS_STRING: 0x101C,
        AVCM_SUBJECT_ATTR: 0x101D,
        AVCM_PUB_KEY: 0x1F,
        AVCM_SUBJ_ALT_NAME_ATTR: 0x1020,
        AVCM_EXT_AS_STRING: 0x1024,
        AVCM_ATTR_AS_STRING: 0x1043,
        AVCM_PURPOSE: 0x25,
        AVCM_P_SIGN: 0x01,
        AVCM_P_CRYPT: 0x02,
        AVCM_P_NON_REPUDIABLE: 0x04,
        AVCM_TYPE: 0x26,
        AVCM_TYPE_MY: 0x10E,
        AVCM_TYPE_ROOT: 0x10F,
        AVCM_ISSUER_ATTR: 0x1032,
        AVCM_EXT_KEY_USAGE_OID: 0x1027,
        AVCM_CERT_ISSUERS_CHAIN: 0x1029,
        AVCM_PUB_KEY_ALG_PARAMS: 0x31,
        AVCM_CRL_ISSUER_SUBJECT: 0x1,
        AVCM_CRL_ISSUER_CERT: 0x2,
        AVCM_TEMPLATE: 0x2F,
        AVCM_TEMPLATE_DATA: 0x331,
        AVCM_CARDS_DATA: 0x332,
        AVCM_SCEP_CACERT: 0x333,
        AVCM_SCEP_PKIOPERATION: 0x334,
        AVCM_SCEP_PKCS_REQ_PREPARE: 0x335,
        AVCM_SCEP_PKCS_REQ_ENROLL: 0x336,
        AVCM_REQUEST_STATE: 0x337,
        AVCM_SCEP_GET_CERT_INITIAL: 0x329,
        AVCM_SCEP_LOGIN: 0x330,
        AVCM_SCEP_URL: 0x1048,
        AVCM_CSR_BASE: 0x077B1000,
        AVCM_CSR_REVOKED: 0x01 + 0x077B1000,
        AVCM_CSR_UNKNOWN: 0x02 + 0x077B1000,
        AVCM_REQUEST_STATE_INBOX: 0x1,
        AVCM_REQUEST_STATE_PROCESSED: 0x2,
        AVCM_REQUEST_STATE_REJECTED: 0x3,
        AVCM_REQUEST_STATE_MANUALPROCESSING: 0x4,
        AVCM_REQUEST_STATE_SIGN_WAIT: 0x5,
        AVCM_REQUEST_STATE_PENDING: 0x6,
        AVCM_POLICYINFO_COUNT: 0x338,
        AVCM_POLICYINFO_OID: 0x1049,
        AVCM_VIEW_SIGN_ATTR: 0x339,
        AVCM_LDAP_PATH: 0x1050,
        AVCM_BASE_SERIAL_AS_STRING: 0x1051,
        AVCM_BASE_ISSUER_AS_STRING: 0x1052,
        // Flags
        AVCMF_CHECK_FILES_INTEGRITY: 0x4,
        AVCMF_IN_RAW_DATA: 0x100,
        AVCMF_IN_PKCS7: 0x200,
        AVCMF_MESSAGE: 0x1000,
        AVCMF_OUT_PKCS7: 0x2000,
        AVCMF_ATTR_BY_NUM: 0x400000,
        AVCMF_ATTR_BY_OID: 0x800000,
        AVCMF_NEXT: 0x40,
        AVCMF_START: 0x80,
        AVCMF_ALLOC: 0x1000000,
        AVCMF_APPEND: 0x4000000,
        AVCMF_RETURN_HANDLE_IF_EXISTS: 0x1,
        AVCMF_NO_OUTPUT: 0x200000,
        AVCMF_IMPORT: 0x10,
        AVCMF_SELECT_MY_CERT: 0x2,
        AVCMF_THREAD_ERROR: 0x08,
        AVCMF_NO_CRL_VERIFY: 0x20,
        AVCMF_ALL_CERT: 0x8000,
        AVCMF_ADD_ALL_CERT: 0x80000,
        AVCMF_ADD_SIGN_CERT: 0x100000,
        AVCMF_ADD: 0x40000,
        AVCMF_DETACHED: 0x2000000,
        AVCMF_STARTUP: 0x1,
        AVCMF_SHUTDOWN: 0x2,
        AVCMF_NO_AUTH: 0x4,
        AVCMF_FORCE_TOKEN_CONTROL: 0x10000,
        AVCMF_DENY_TOKEN_CONTROL: 0x20000,
        AVCMF_IGNORE_CRL_ABSENCE: 0x1,
        AVCMF_IGNORE_CRL_EXPIRE: 0x8,
        AVCMF_REQUEST_RESULT: 0x1,
        AVCMF_ONLY_ENCR_CERTS: 0x400,
        AVCMF_REPEAT_AUTHENTICATION: 0x800,
        AVCMF_IMPORT_ALL_CERTS: 0x80000,
        AVCMF_IMPORT_CRL: 0x40000,
        AVCMF_NO_CERT_VERIFY: 0x8000000,
        AVCMF_VERIFY_ON_SIGN_DATE: 0x1,
        AVCMF_IGNORE_BAD_CERTS: 0x20,
        AVCMF_ALLOW_TO_SELECT_FILE: 0x8,
        AVCMF_RAW_SIGN: 0x40000,
        AVCMF_UPDATE_HASHVALUE: 0x40000000,
        AVCMF_UPDATE_FINAL: 0x80000000,
        AVCMF_OPEN_FOR_SIGN: 0x1000,
        AVCMF_OPEN_FOR_VERIFYSIGN: 0x2000,
        AVCMF_OPEN_FOR_ENCRYPT: 0x4000,
        AVCMF_OPEN_FOR_DECRYPT: 0x8000,
        AVCMF_UNICODE: 0x10000000,
        AVCMF_SCEP_OFFLINE: 0x1,
        // AVCMX flags
        AVCMXF_ZT_STRING: 1,
        AVCMXF_UCS2_STRING: 2,
        AVCMXF_UTF8_STRING: 4,
        // Return codes
        AVCMR_SUCCESS: 0,
        AVCMR_BASE: 0xE82A0100,
        AVCMR_ALLOC_ERROR: 0x01 + 0xE82A0100,
        AVCMR_BAD_ATTR: 0x02 + 0xE82A0100,
        AVCMR_BAD_FORMAT: 0x03 + 0xE82A0100,
        AVCMR_BAD_HANDLE: 0x04 + 0xE82A0100,
        AVCMR_BAD_HC: 0x05 + 0xE82A0100,
        AVCMR_BAD_HCERT: 0x06 + 0xE82A0100,
        AVCMR_BAD_HENUM: 0x07 + 0xE82A0100,
        AVCMR_BAD_HMSG: 0x08 + 0xE82A0100,
        AVCMR_BAD_HSIGN: 0x09 + 0xE82A0100,
        AVCMR_BAD_NUMBER: 0x0A + 0xE82A0100,
        AVCMR_BAD_PASSWORD: 0x0B + 0xE82A0100,
        AVCMR_BUFFER_TOO_SMALL: 0x0C + 0xE82A0100,
        AVCMR_CERT_NOT_FOUND: 0x0D + 0xE82A0100,
        AVCMR_CERT_CA_INVALID: 0x0E + 0xE82A0100,
        AVCMR_CERT_CA_NOT_FOUND: 0x0F + 0xE82A0100,
        AVCMR_CERT_NOT_FOR_CRYPT: 0x11 + 0xE82A0100,
        AVCMR_CERT_NOT_FOR_SIGN: 0x12 + 0xE82A0100,
        AVCMR_CERT_SIGN_INVALID: 0x13 + 0xE82A0100,
        AVCMR_CERT_STORE_NOT_FOUND: 0x14 + 0xE82A0100,
        AVCMR_CONTAINER_NOT_FOUND: 0x15 + 0xE82A0100,
        AVCMR_CRL_INVALID: 0x16 + 0xE82A0100,
        AVCMR_CRL_NOT_FOUND: 0x17 + 0xE82A0100,
        AVCMR_DB_NOT_FOUND: 0x18 + 0xE82A0100,
        AVCMR_DEVICE_NOT_FOUND: 0x19 + 0xE82A0100,
        AVCMR_BUSY: 0x1A + 0xE82A0100,
        AVCMR_NO_DB_PARAMS: 0x1B + 0xE82A0100,
        AVCMR_NO_INPUT: 0x1C + 0xE82A0100,
        AVCMR_NO_SIGN: 0x1D + 0xE82A0100,
        AVCMR_ALREADY_INITIALIZED: 0x1E + 0xE82A0100,
        AVCMR_NOT_INITIALIZED: 0x1F + 0xE82A0100,
        AVCMR_BAD_DATE: 0x20 + 0xE82A0100,
        AVCMR_BAD_FLAGS: 0x21 + 0xE82A0100,
        AVCMR_BAD_THREAD: 0x22 + 0xE82A0100,
        AVCMR_DATE_NOT_VALID: 0x23 + 0xE82A0100,
        AVCMR_INTERNAL_ERROR: 0x24 + 0xE82A0100,
        AVCMR_NOT_FOUND: 0x25 + 0xE82A0100,
        AVCMR_NOT_IMPLEMENTED: 0x26 + 0xE82A0100,
        AVCMR_SIGN_INVALID: 0x27 + 0xE82A0100,
        AVCMR_USER_NO_AUTH: 0x28 + 0xE82A0100,
        AVCMR_BAD_PARAM: 0x29 + 0xE82A0100,
        AVCMR_BAD_FORMED_SIGN: 0x2A + 0xE82A0100,
        AVCMR_AVCSP_INIT_FAILED: 0x2B + 0xE82A0100,
        AVCMR_REGISTRY_ERROR: 0x2C + 0xE82A0100,
        AVCMR_WIN32_ERROR: 0x2D + 0xE82A0100,
        AVCMR_OTHER_RECIPIENT: 0x2E + 0xE82A0100,
        AVCMR_CTL_NOT_FOUND: 0x2F + 0xE82A0100,
        AVCMR_CERT_REVOKED: 0x30 + 0xE82A0100,
        AVCMR_CERT_NOT_TRUSTED: 0x31 + 0xE82A0100,
        AVCMR_CRL_EXPIRED: 0x32 + 0xE82A0100,
        AVCMR_CRL_ISSUER_NOT_FOUND: 0x33 + 0xE82A0100,
        AVCMR_CRL_ISSUER_EXPIRED: 0x34 + 0xE82A0100,
        AVCMR_CERT_STORE_BAD_VERSION: 0x35 + 0xE82A0100,
        AVCMR_MY_STORE_EMPTY: 0x36 + 0xE82A0100,
        AVCMR_USER_CANCEL: 0x37 + 0xE82A0100,
        AVCMR_RA_EXT_KEY_USAGE_NOT_ALLOWED: 0x38 + 0xE82A0100,
        AVCMR_RA_EXT_NOT_ALLOWED: 0x39 + 0xE82A0100,
        AVCMR_TOO_MANY_CERT: 0x3A + 0xE82A0100,
        AVCMR_PARAM_SPEC_NOT_FOUND: 0x40 + 0xE82A0100,
        AVCMR_CERT_NOT_RA: 0x41 + 0xE82A0100,
        AVCMR_ALREADY_EXISTS: 0x42 + 0xE82A0100,
        AVCMR_UNKNOWN_ERROR_CODE: 0x43 + 0xE82A0100,
        AVCMR_BAD_CRL_ISSUER: 0x44 + 0xE82A0100,
        AVCMR_OLD_CRL: 0x45 + 0xE82A0100,
        AVCMR_BAD_HCRL: 0x46 + 0xE82A0100,
        AVCMR_CERT_TEMPORARY_REVOKED: 0x47 + 0xE82A0100,
        AVCMR_REPEAT_AUTHENTICATION_ERROR: 0x48 + 0xE82A0100,
        AVCMR_DB_AUTHENTICATION_ERROR: 0x49 + 0xE82A0100,
        AVCMR_TOKEN_NOT_FOUND: 0x4A + 0xE82A0100,
        AVCMR_NO_CONTENT: 0x4B + 0xE82A0100,
        AVCMR_CERT_NOT_VALID_YET: 0x4C + 0xE82A0100,
        AVCMR_CERT_ALREADY_EXPIRED: 0x4D + 0xE82A0100,
        AVCMR_INVALID_TOKEN: 0x4E + 0xE82A0100,
        AVCMR_BAD_KEY: 0x4F + 0xE82A0100,
        AVCMR_TOKEN_WRITE_ERROR: 0x50 + 0xE82A0100,
        AVCMR_REQUEST_DENIED: 0x51 + 0xE82A0100,
        AVCMR_BAD_BUFFER_PTR: 0x52 + 0xE82A0100,
        AVCMR_OBJ_LOCKED: 0x53 + 0xE82A0100,
        AVCMR_NO_RECIPIENTS: 0x54 + 0xE82A0100,
        AVCMR_ALG_NOT_SUPPORTED: 0x55 + 0xE82A0100,
        AVCMR_CERT_NOT_REVOKED: 0x56 + 0xE82A0100,
        AVCMR_INTEGRITY_CHECK_FAILED: 0x57 + 0xE82A0100,
        AVCMR_REQUEST_FOR_CA_DENIED: 0x57 + 0xE82A0100,
        AVCMR_REQUEST_FOR_RA_DENIED: 0x58 + 0xE82A0100,
        AVCMR_REQUEST_FOR_REVOKE_DENIED: 0x59 + 0xE82A0100,
        AVCMR_INVALID_BASIC_CONSTRAINTS: 0x5A + 0xE82A0100,
        AVCMR_CRYPTSQL_SYNTAX_ERROR: 0x5B + 0xE82A0100,
        AVCMR_NOT_CONDITION: 0x5C + 0xE82A0100,
        AVCMR_VERIFY_ERROR: 0x5D + 0xE82A0100,
        AVCMR_BAD_DATA: 0x5E + 0xE82A0100,
        AVCMR_ORIGINAL_FILE_FOR_VERIFY_NOT_FOUND: 0x5F + 0xE82A0100,
        AVCMR_CERT_NOT_FOR_SIGN_CERT: 0x60 + 0xE82A0100,
        AVCMR_CERT_NOT_FOR_SIGN_CRL: 0x61 + 0xE82A0100,
        AVCMR_CERT_UNKNOWN_CRITICAL_EXT: 0x62 + 0xE82A0100,
        AVCMR_CRL_UNKNOWN_CRITICAL_EXT: 0x63 + 0xE82A0100,
        AVCMR_INVALID_KEY_USAGE: 0x64 + 0xE82A0100,
        AVCMR_INVALID_RACERT: 0x65 + 0xE82A0100,
        AVCMR_CRLSERVER_ERROR: 0x66 + 0xE82A0100,
        AVCMR_LOADLIBPKCS11_ERROR: 0x67 + 0xE82A0100,
        AVCMR_CRLDP_BAD_PATH: 0x68 + 0xE82A0100,
        AVCMR_RENEW_BAD_ATTR: 0x69 + 0xE82A0100,
        AVCMR_POLICY_NOT_FOUND: 0x70 + 0xE82A0100,
        AVCMR_POLICY_NOT_APPLY: 0x71 + 0xE82A0100,
        AVCMR_CERT_NOT_FOR_SIGN_ACERT: 0x72 + 0xE82A0100,
        AVCMR_OCSP_ERROR: 0x73 + 0xE82A0100,
        AVCMR_KEY_ALREADY_EXPIRED: 0x74 + 0xE82A0100,
        AVCMR_PKCS11_TOKEN_NOT_PRESENTERROR: 0x75 + 0xE82A0100,
        AVCMR_PKCS11_ERROR: 0x76 + 0xE82A0100,
        AVCMR_LDAP_ACTION_NOT_FOUND: 0x77 + 0xE82A0100,
        AVCMR_SCEP_PENDING: 0x78 + 0xE82A0100,
        AVCMR_SCEP_ERROR: 0x79 + 0xE82A0100
    }

    if (windowExists) {
        // making avcmx factory function global
        window.avcmx = avcmx;
        window.AvCMXError = AvCMXError;
        // making constants global
        for (var c in avcmx.constants) {
            window[c] = avcmx.constants[c];
        }
    }

    var makeSafe = function (fn) {
        return function () {
            try {
                return fn.apply(this, arguments);
            } catch (e) {
                // we do care only Error error type or any other types (e.g. string) thrown
                if (e instanceof EvalError || e instanceof RangeError ||
                    e instanceof ReferenceError || e instanceof SyntaxError ||
                    e instanceof TypeError || e instanceof URIError) {
                    throw e;
                }
                var lastError = instance.GetLastError();
                if (avcmx.oldActiveX && e.number !== undefined) {
                    throw new AvCMXError(e.number);
                } else if (lastError != 0) {
                    throw new AvCMXError(lastError);
                } else {
                    throw e;
                }
            }
        };
    };

    // wrapping unsafe methods
    var list = ["avcmx"].concat(objects, messages);
    for (var i = 0; i < list.length; i++) {
        var obj = list[i];
        if (obj == "Message") {
            continue;
        }
        var prot = (obj == "avcmx" ? avcmx : avcmx[obj]);
        var tmp = {};
        for (var method in prot.prototype) {
            // skip safe methods
            if (method in avcmxobject.prototype) {
                continue;
            }
            var unsafe = method + "_unsafe";
            tmp[unsafe] = prot.prototype[method];
            tmp[method] = makeSafe(tmp[unsafe]);
            //console.log("wrapping " + obj + "." + method);
        }
        prot.prototype = extend(prot.prototype, tmp);
    }

    list = "blob params version connection hash".split(" ");
    for (var i = 0; i < list.length; i++) {
        avcmx[list[i]] = (function (fn) {
            return function () {
                return fn.apply(avcmx(), arguments);
            };
        })(avcmx.prototype[list[i]]);
    }
})(window);