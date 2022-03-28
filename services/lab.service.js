"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const Laboratory = require("@moleculer/lab");

module.exports = {
	mixins: [Laboratory.AgentService],
	settings: {
		token: "LAB_TOKEN",
		apiKey: "Q0ZW25G-7AB42W7-KYZWWXA-7YXBVJY"
	}
};
