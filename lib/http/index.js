"use strict";
/**
 * This file is part of the vscode-helpers distribution.
 * Copyright (c) Marcel Joachim Kloubert.
 *
 * vscode-helpers is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * vscode-helpers is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const HTTP = require("http");
const HTTPs = require("https");
const IsStream = require("is-stream");
const MergeDeep = require('merge-deep');
const NormalizeHeaderCase = require("header-case-normalizer");
const URL = require("url");
const vscode_helpers = require("../index");
/**
 * Does a HTTP 'DELETE' request.
 *
 * @param {HTTPRequestURL} url The URL.
 * @param {HTTPRequestBody} [body] The data of the request body.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
function DELETE(url, body, headers, opts) {
    return request('DELETE', url, body, headers, opts);
}
exports.DELETE = DELETE;
/**
 * Does a HTTP 'GET' request.
 *
 * @param {HTTPRequestURL} url The URL.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
function GET(url, headers, opts) {
    return request('GET', url, null, headers, opts);
}
exports.GET = GET;
/**
 * Does a HTTP 'PATCH' request.
 *
 * @param {HTTPRequestURL} url The URL.
 * @param {HTTPRequestBody} [body] The data of the request body.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
function PATCH(url, body, headers, opts) {
    return request('PATCH', url, body, headers, opts);
}
exports.PATCH = PATCH;
/**
 * Does a HTTP 'POST' request.
 *
 * @param {HTTPRequestURL} url The URL.
 * @param {HTTPRequestBody} [body] The data of the request body.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
function POST(url, body, headers, opts) {
    return request('POST', url, body, headers, opts);
}
exports.POST = POST;
/**
 * Does a HTTP 'PUT' request.
 *
 * @param {HTTPRequestURL} url The URL.
 * @param {HTTPRequestBody} [body] The data of the request body.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
function PUT(url, body, headers, opts) {
    return request('PUT', url, body, headers, opts);
}
exports.PUT = PUT;
/**
 * Does a HTTP request.
 *
 * @param {string} method The method to use.
 * @param {HTTPRequestURL} url The URL.
 * @param {HTTPRequestBody} [body] The data of the request body.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
function request(method, url, body, headers, opts) {
    method = vscode_helpers.toStringSafe(method).toUpperCase().trim();
    if ('' === method) {
        method = 'GET';
    }
    let reqURL;
    if (_.isNil(url)) {
        url = URL.parse('http://localhost:80/');
    }
    else {
        if (_.isObject(url)) {
            if (Object.getOwnPropertyNames(url).indexOf('_fsPath') > -1) {
                reqURL = URL.parse(`${url}`); // vscode.Uri
            }
            else {
                reqURL = url;
            }
        }
        else {
            reqURL = URL.parse(vscode_helpers.toStringSafe(url));
        }
    }
    return new Promise((resolve, reject) => {
        const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);
        try {
            const REQUEST_OPTS = {
                auth: reqURL.auth,
                headers: {},
                hostname: vscode_helpers.toStringSafe(reqURL.hostname).trim(),
                port: parseInt(vscode_helpers.toStringSafe(reqURL.port).trim()),
                method: method,
                path: reqURL.path,
            };
            const CALLBACK = (response) => {
                let body = false;
                const RESP = {
                    code: response.statusCode,
                    readBody: () => __awaiter(this, void 0, void 0, function* () {
                        if (false === body) {
                            body = yield vscode_helpers.readAll(response);
                        }
                        return body;
                    }),
                    request: REQUEST_OPTS,
                    response: response,
                    status: response.statusMessage,
                    url: reqURL,
                    version: response.httpVersion,
                };
                COMPLETED(null, RESP);
            };
            let requestFactory = false;
            if ('' === REQUEST_OPTS.hostname) {
                REQUEST_OPTS.hostname = 'localhost';
            }
            if (!_.isNil(headers)) {
                for (const H in headers) {
                    const NAME = NormalizeHeaderCase(vscode_helpers.toStringSafe(H).trim());
                    const VALUE = vscode_helpers.toStringSafe(headers[H]);
                    REQUEST_OPTS.headers[NAME] = VALUE;
                }
            }
            const PROTOCOL = vscode_helpers.normalizeString(reqURL.protocol);
            switch (PROTOCOL) {
                case '':
                case ':':
                case 'http:':
                    requestFactory = () => {
                        const HTTP_OPTS = REQUEST_OPTS;
                        HTTP_OPTS.protocol = 'http:';
                        if (isNaN(HTTP_OPTS.port)) {
                            HTTP_OPTS.port = 80;
                        }
                        return HTTP.request(MergeDeep(HTTP_OPTS, opts), CALLBACK);
                    };
                    break;
                case 'https:':
                    requestFactory = () => {
                        const HTTPs_OPTS = REQUEST_OPTS;
                        HTTPs_OPTS.protocol = 'https:';
                        HTTPs_OPTS.rejectUnauthorized = false;
                        if (isNaN(HTTPs_OPTS.port)) {
                            HTTPs_OPTS.port = 443;
                        }
                        return HTTPs.request(MergeDeep(HTTPs_OPTS, opts), CALLBACK);
                    };
                    break;
            }
            if (false === requestFactory) {
                throw new Error(`Protocol '${PROTOCOL}' not supported!`);
            }
            const REQUEST = requestFactory();
            if (!_.isNil(body)) {
                if (IsStream.readable(body)) {
                    body.pipe(REQUEST);
                }
                else if (Buffer.isBuffer(body)) {
                    REQUEST.write(body);
                }
                else {
                    REQUEST.write(new Buffer(vscode_helpers.toStringSafe(body), 'utf8'));
                }
            }
            REQUEST.end();
        }
        catch (e) {
            COMPLETED(e);
        }
    });
}
exports.request = request;
//# sourceMappingURL=index.js.map