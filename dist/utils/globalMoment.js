"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDaysToDate = exports.formatDate = exports.getCurrentDate = void 0;
// Get the current date
function getCurrentDate() {
    return new Date();
}
exports.getCurrentDate = getCurrentDate;
// Format a date to a specified format (e.g., "YYYY-MM-DD")
function formatDate(date, format = "YYYY-MM-DD") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return format
        .replace("YYYY", String(year))
        .replace("MM", month)
        .replace("DD", day);
}
exports.formatDate = formatDate;
// Add days to a given date
function addDaysToDate(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}
exports.addDaysToDate = addDaysToDate;
