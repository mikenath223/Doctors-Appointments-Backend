"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENCY = exports.CONSULTATION_TYPE = exports.APPOINTMENT_STATUS = void 0;
var APPOINTMENT_STATUS;
(function (APPOINTMENT_STATUS) {
    APPOINTMENT_STATUS["upcoming"] = "UPCOMING";
    APPOINTMENT_STATUS["cancelled"] = "CANCELLED";
    APPOINTMENT_STATUS["completed"] = "COMPLETED";
})(APPOINTMENT_STATUS || (exports.APPOINTMENT_STATUS = APPOINTMENT_STATUS = {}));
var CONSULTATION_TYPE;
(function (CONSULTATION_TYPE) {
    CONSULTATION_TYPE["messaging"] = "MESSAGING";
    CONSULTATION_TYPE["voiceCall"] = "VOICE_CALL";
    CONSULTATION_TYPE["videoCall"] = "VIDEO_CALL";
    CONSULTATION_TYPE["inPerson"] = "IN_PERSON";
})(CONSULTATION_TYPE || (exports.CONSULTATION_TYPE = CONSULTATION_TYPE = {}));
var CURRENCY;
(function (CURRENCY) {
    CURRENCY["NGN"] = "NGN";
})(CURRENCY || (exports.CURRENCY = CURRENCY = {}));
