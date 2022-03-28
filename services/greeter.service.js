"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "greeter",
	settings: {},
	dependencies: [],
	actions: {
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler() {
				return "Hello Moleculer";
			}
		},
		welcome: {
			rest: "/welcome",
			params: {
				name: "string"
			},
			async handler(ctx) {
				return `Welcome, ${ctx.params.name}`;
			}
		}
	},
	events: {},
	methods: {},
	created() {},
	async started() {},
	async stopped() {}
};
