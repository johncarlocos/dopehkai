"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const axios_1 = __importDefault(require("axios"));
exports.API = {
    async POST(url, data, headers) {
        const _headers = headers ?? {};
        var response;
        await axios_1.default.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://bet.hkjc.com',
                'Referer': 'https://bet.hkjc.com/',
                ..._headers
            },
        }).then((res) => {
            response = res;
        }).catch((error) => {
            if (axios_1.default.isCancel(error)) {
                error.status = 408;
                console.log('Request timed out');
            }
            response = error.response || {
                status: error.status || 500,
                data: error.message,
                headers: {},
                config: {},
            };
        });
        return response;
    },
    async GET(url, headers) {
        const _headers = headers ?? {};
        var response;
        await axios_1.default.get(url, {
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                ..._headers
            },
        }).then((res) => {
            response = res;
        }).catch((error) => {
            if (axios_1.default.isCancel(error)) {
                error.status = 408;
                console.log('Request timed out');
            }
            response = error.response || {
                status: error.status || 500,
                data: error.message,
                headers: {},
                config: {},
            };
        });
        return response;
    },
};
exports.default = exports.API;
