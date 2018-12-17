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
/// <reference types="node" />
import * as HTTP from 'http';
import * as HTTPs from 'https';
import * as URL from 'url';
import * as vscode from 'vscode';
import * as vscode_helpers from '../index';
/**
 * A possible value for a HTTP request body.
 */
export declare type HTTPRequestBody = string | Buffer | NodeJS.ReadableStream;
/**
 * HTTP(s) request options.
 */
export declare type HTTPRequestOptions = HTTP.RequestOptions | HTTPs.RequestOptions;
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
export declare type HTTPRequestURL = string | vscode.Uri | URL.Url;
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
export declare function DELETE(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions): Promise<vscode_helpers.HTTPRequestResult>;
/**
 * Does a HTTP 'GET' request.
 *
 * @param {HTTPRequestURL} url The URL.
 * @param {any} [headers] A key-value-pair of headers to send.
 * @param {HTTPRequestOptions} [opts] Custom options for the request.
 *
 * @return {Promise<HTTPRequestResult>} The promsie with the HTTP response / result.
 */
export declare function GET(url: HTTPRequestURL, headers?: any, opts?: HTTPRequestOptions): Promise<vscode_helpers.HTTPRequestResult>;
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
export declare function PATCH(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions): Promise<vscode_helpers.HTTPRequestResult>;
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
export declare function POST(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions): Promise<vscode_helpers.HTTPRequestResult>;
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
export declare function PUT(url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions): Promise<vscode_helpers.HTTPRequestResult>;
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
export declare function request(method: string, url: HTTPRequestURL, body?: HTTPRequestBody, headers?: any, opts?: HTTPRequestOptions): Promise<vscode_helpers.HTTPRequestResult>;
