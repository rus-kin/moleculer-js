const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");

module.exports = {
	name: "users",
	mixins: [DbService],
	adapter: new SqlAdapter("postgres://postgres:root@localhost:5432/moleculer"),
	model: {
		name: "user",
		define: {
			id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
			username: {type: Sequelize.STRING, allowNull: false, unique: true},
			password: {type: Sequelize.STRING, allowNull: false},
			email: {type: Sequelize.STRING, allowNull: false, unique: true},
			role: {type: Sequelize.INTEGER}
		}
	}
}
