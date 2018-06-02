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

import * as _ from 'lodash';
import * as HTTP from 'http';
import * as HTTPs from 'https';
import * as IsStream from 'is-stream';
const MergeDeep = require('merge-deep');
const NormalizeHeaderCase = require("header-case-normalizer");
import * as Stream from 'stream';
import * as URL from 'url';
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';

/**
 * A possible value for a HTTP request body.
 */
export type HTTPRequestBody = string | Buffer | NodeJS.ReadableStream;

/**
 * HTTP(s) request options.
 */
export type HTTPRequestOptions = HTTP.RequestOptions | HTTPs.RequestOptions;

/**
 * A result of a HTTP request.
 */
export interface HTTPRequestResult {
    /**
     * The (status) code.
     */
    code: number;
    /**
     * Reads and returns the body (data).
     */
    readBody: () => PromiseLike<Buffer>;
    /**
     * The options of the request.
     */
    request: HTTP.RequestOptions | HTTPs.RequestOptions;
    /**
     * The response context.
     */
    response: HTTP.ClientResponse;
    /**
     * The status (message).
     */
    status: string;
    /**
     * The request URL.
     */
    url: URL.Url;
    /**
     * The HTTP version.
     */
    version: string;
}

/**
 * A possible value for a HTTP request URL.
 */
export type HTTPRequestURL = string | vscode.Uri | URL.Url;

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
export function DELETE(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions) {
    return request('DELETE', url, body, headers, opts);
}

/**
 * Does a HTTP 'GET' request.
 *
 * @param {HTTPRequestURL} url The URL.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
export function GET(url: HTTPRequestURL, headers?: any, opts?: HTTPRequestOptions) {
    return request('GET', url, headers, null, opts);
}

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
export function PATCH(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions) {
    return request('PATCH', url, body, headers, opts);
}

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
export function POST(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions) {
    return request('POST', url, body, headers, opts);
}

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
export function PUT(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions) {
    return request('PUT', url, body, headers, opts);
}

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
export function request(method: string, url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions) {
    method = vscode_helpers.toStringSafe(method).toUpperCase().trim();
    if ('' === method) {
        method = 'GET';
    }

    let reqURL: URL.Url;
    if (_.isNil(url)) {
        url = URL.parse('http://localhost:80/');
    } else {
        if (_.isObject(url)) {
            if (Object.getOwnPropertyNames(url).indexOf('_fsPath') > -1) {
                reqURL = URL.parse(`${ url }`);  // vscode.Uri
            } else {
                reqURL = <URL.Url>url;
            }
        } else {
            reqURL = URL.parse(vscode_helpers.toStringSafe(url));
        }
    }

    return new Promise<HTTPRequestResult>((resolve, reject) => {
        const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);

        try {
            const REQUEST_OPTS: HTTP.RequestOptions | HTTPs.RequestOptions = {
                auth: reqURL.auth,
                headers: {},
                hostname: vscode_helpers.toStringSafe(reqURL.hostname).trim(),
                port: parseInt(
                    vscode_helpers.toStringSafe(reqURL.port).trim()
                ),
                method: method,
                path: reqURL.path,
            };

            const CALLBACK = (response: HTTP.ClientResponse) => {
                let body: false | Buffer = false;

                const RESP: HTTPRequestResult = {
                    code: response.statusCode,
                    readBody: async () => {
                        if (false === body) {
                            body = await vscode_helpers.readAll(response);
                        }

                        return body;
                    },
                    request: REQUEST_OPTS,
                    response: response,
                    status: response.statusMessage,
                    url: reqURL,
                    version: response.httpVersion,
                };

                COMPLETED(null, RESP);
            };

            let requestFactory: (() => HTTP.ClientRequest) | false = false;

            if ('' === REQUEST_OPTS.hostname) {
                REQUEST_OPTS.hostname = 'localhost';
            }

            if (!_.isNil(headers)) {
                for (const H in headers) {
                    const NAME = NormalizeHeaderCase(
                        vscode_helpers.toStringSafe(H).trim()
                    );
                    const VALUE = vscode_helpers.toStringSafe(headers[H]);

                    REQUEST_OPTS.headers[ NAME ] = VALUE;
                }
            }

            const PROTOCOL = vscode_helpers.normalizeString(reqURL.protocol);
            switch (PROTOCOL) {
                case '':
                case ':':
                case 'http:':
                    requestFactory = () => {
                        const HTTP_OPTS = <HTTP.RequestOptions>REQUEST_OPTS;
                        HTTP_OPTS.protocol = 'http:';

                        if (isNaN(<number>HTTP_OPTS.port)) {
                            HTTP_OPTS.port = 80;
                        }

                        return HTTP.request(MergeDeep(HTTP_OPTS, opts),
                                            CALLBACK);
                    };
                    break;

                case 'https:':
                    requestFactory = () => {
                        const HTTPs_OPTS = <HTTPs.RequestOptions>REQUEST_OPTS;
                        HTTPs_OPTS.protocol = 'https:';
                        HTTPs_OPTS.rejectUnauthorized = false;

                        if (isNaN(<number>HTTPs_OPTS.port)) {
                            HTTPs_OPTS.port = 443;
                        }

                        return HTTPs.request(MergeDeep(HTTPs_OPTS, opts),
                                             CALLBACK);
                    };
                    break;
            }

            if (false === requestFactory) {
                throw new Error(`Protocol '${ PROTOCOL }' not supported!`);
            }

            const REQUEST = requestFactory();

            if (!_.isNil(body)) {
                if (IsStream.readable(body)) {
                    body.pipe( REQUEST );
                } else if (Buffer.isBuffer(body)) {
                    REQUEST.write( body );
                } else {
                    REQUEST.write( new Buffer(vscode_helpers.toStringSafe(body), 'utf8') );
                }
            }

            REQUEST.end();
        } catch (e) {
            COMPLETED(e);
        }
    });
}
