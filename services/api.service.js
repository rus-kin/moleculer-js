"use strict";

const ApiGateway = require("moleculer-web");
const { UnAuthorizedError, ERR_NO_TOKEN, ERR_INVALID_TOKEN } = require("../src/errors");
const FormData = require('form-data');
const serveStatic = require('serve-static')

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

module.exports = {
	name: "api",
	mixins: [ApiGateway, serveStatic],

	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		// Exposed port
		port: process.env.PORT || 3000,

		// Exposed IP
		ip: "0.0.0.0",

		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [],

		// // Global CORS settings for all routes
		// cors: {
		// 	// Configures the Access-Control-Allow-Origin CORS header.
		// 	origin: "*",
		// 	// Configures the Access-Control-Allow-Methods CORS header.
		// 	methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
		// 	// Configures the Access-Control-Allow-Headers CORS header.
		// 	allowedHeaders: [],
		// 	// Configures the Access-Control-Expose-Headers CORS header.
		// 	exposedHeaders: [],
		// 	// Configures the Access-Control-Allow-Credentials CORS header.
		// 	credentials: false,
		// 	// Configures the Access-Control-Max-Age CORS header.
		// 	maxAge: 3600
		// },

		routes: [
			{
				path: "/api",

				whitelist: [
					"**"
				],

				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: false,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: false,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: true,

				/**
				 * Before call hook. You can check the request.
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingRequest} req
				 * @param {ServerResponse} res
				 * @param {Object} data
				 *
				onBeforeCall(ctx, route, req, res) {
					// Set request headers to context meta
					ctx.meta.userAgent = req.headers["user-agent"];
				}, */

				/**
				 * After call hook. You can modify the data.
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingRequest} req
				 * @param {ServerResponse} res
				 * @param {Object} data
				onAfterCall(ctx, route, req, res, data) {
					// Async function which return with Promise
					return doSomething(ctx, res, data);
				}, */

				// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
				callingOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB"
					},
					urlencoded: {
						extended: true,
						limit: "1MB"
					}
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: "all", // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true,

				// cors: {
				// 	origin: ["http://localhost:3000", "https://host.docker.internal"],
				// 	methods: ["GET", "OPTIONS", "POST"],
				// 	credentials: true
				// },
			},
			{
				path: "/",
				bodyParsers: {
					json: true,
					urlencoded: true
				},
				autoAliases: true,
				aliases: {
					"GET ws": "api.getWS",
					"POST ws": "api.postWS",
					"POST zndh/armtech_enter.php": "api.postWS",
					"POST armtech_enter.php": "api.postWS",
				},
			},
			{
				path: "/login",
				bodyParsers: {
					json: true,
					urlencoded: true
				},
				autoAliases: true,
				aliases: {
					"POST /": "auth.login",
				},
			},
		],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,


		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public"
		}
	},

	actions: {
		async getWS(ctx) {
			const broker = ctx.broker;
			let ans = '';
			await broker
				.call("http.get", {
					url: "http://host.docker.internal/zndh/armtech_enter.php"
				})
				.then(res => {
					ans = res;
				})
				.catch(error => broker.logger.error(error));

			ctx.meta.$responseHeaders = {
				"Content-Type": "text/html; charset=utf-8"
			};

			return ans.body;
		},
		async postWS(ctx) {
			const broker = ctx.broker;
			let ans = '';
			const body = new FormData();
			for (const key in ctx.params) {
				body.append(key, ctx.params[key]);
			}
			ctx.meta.$responseHeaders = {
				"Content-Type": "text/plain; charset=utf-8"
			};

			await broker
				.call("http.post", {
					url: "http://host.docker.internal/zndh/armtech_enter.php",
					opt: { body: body }
				})
				.then(res => {
					ans = res;
					console.log(ans);
				})
				.catch(error => broker.logger.error(error));

			return ans.body;
		}
	},

	methods: {

		/**
		 * Authenticate the request. It check the `Authorization` token value in the request header.
		 * Check the token value & resolve the user by the token.
		 * The resolved user will be available in `ctx.meta.user`
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		async authenticate(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token") {
					token = req.headers.authorization.split(" ")[1];
				}
			}
			if (!token) {
				return Promise.reject(new UnAuthorizedError(ERR_NO_TOKEN));
			}
			// Verify JWT token
			return ctx.call("auth.resolveToken", { token })
				.then(user => {
					if (!user)
						return Promise.reject(new UnAuthorizedError(ERR_INVALID_TOKEN));

					ctx.meta.user = user;
				});
		},

		/**
		 * Authorize the request. Check that the authenticated user has right to access the resource.
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */

		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token") {
					token = req.headers.authorization.split(" ")[1];
				}
			}
			if (!token) {
				return Promise.reject(new UnAuthorizedError(ERR_NO_TOKEN));
			}
			// Verify JWT token
			return ctx.call("auth.resolveToken", { token })
				.then(user => {
					if (!user)
						return Promise.reject(new UnAuthorizedError(ERR_INVALID_TOKEN));

					ctx.meta.user = user;
				});
		}
	}
};
