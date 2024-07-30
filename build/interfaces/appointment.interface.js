"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPOINTMENT_TYPE = exports.APPOINTMENT_STATUS = void 0;
var APPOINTMENT_STATUS;
(function (APPOINTMENT_STATUS) {
    APPOINTMENT_STATUS["scheduled"] = "SCHEDULED";
    APPOINTMENT_STATUS["cancelled"] = "CANCELLED";
    APPOINTMENT_STATUS["completed"] = "COMPLETED";
})(APPOINTMENT_STATUS || (exports.APPOINTMENT_STATUS = APPOINTMENT_STATUS = {}));
var APPOINTMENT_TYPE;
(function (APPOINTMENT_TYPE) {
    APPOINTMENT_TYPE["online"] = "ONLINE";
    APPOINTMENT_TYPE["inPerson"] = "IN_PERSON";
})(APPOINTMENT_TYPE || (exports.APPOINTMENT_TYPE = APPOINTMENT_TYPE = {}));
