"use strict";

const jwt = require("jsonwebtoken");
const _ = require("lodash");
const {MoleculerError} = require("moleculer").Errors;
const {promisify} = require("util");

const JWT_SECRET = "TOP SECRET!!!";

module.exports = {
	name: "auth",
	actions: {
		login: {
			async handler(ctx) {
				const users = await ctx.broker.call("users.list");
				let user = users.rows.find(u => u.username === ctx.params.username && u.password === ctx.params.password);
				if (user) {
					return this.generateToken(user).then(token => {
						ctx.meta.$responseHeaders = {
							"Authorization": `Token ${token}`
						};
						return {username: user.username, token: `Token ${token}`}
					});
				} else
					return Promise.reject(new MoleculerError("Неверный логин или пароль", 400));
			}
		},
		verifyToken(ctx) {
			return this.verify(ctx.params.token, JWT_SECRET);
		},
		async getUserByID(ctx) {
			const users = await ctx.broker.call("users.list");
			return users.find(u => u.id == ctx.params.id);
		},
		resolveToken: {
			cache: {
				keys: ["token"],
				ttl: 60 * 60 // 1 hour
			},
			params: {
				token: "string"
			},
			async handler(ctx) {
				const users = await ctx.broker.call("users.list");
				return new this.Promise((resolve, reject) => {
					jwt.verify(ctx.params.token, JWT_SECRET, (err, decoded) => {
						if (err) {
							return reject(err);
						}
						resolve(decoded);
					});
				}).then(decoded => {
					if (decoded.id) {
						return users.find(u => u.id == decoded.id);
					}
				});
			}
		},
	},

	created() {
		this.encode = promisify(jwt.sign);
		this.verify = promisify(jwt.verify);
	},

	methods: {
		generateToken(user) {
			return this.encode(_.pick(user, ["id", "role"]), JWT_SECRET);
		}
	}
};
