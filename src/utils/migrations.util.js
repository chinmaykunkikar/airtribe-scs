const { Umzug, SequelizeStorage } = require("umzug");
const sequelize = require("../configs/sequelize.config");

const umzug = new Umzug({
  storage: new SequelizeStorage({ sequelize }),
  storageOptions: {
    sequelize,
  },
  migrations: { glob: "./migrations/*.js" },
  logger: console,
});

module.exports = umzug;
