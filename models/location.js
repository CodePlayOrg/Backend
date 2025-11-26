const Sequelize = require('sequelize');

class ClassLoc extends Sequelize.Model {
  static initiate(sequelize) {
    ClassLoc.init({
      location: {
        type: Sequelize.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      first: {
        type: Sequelize.STRING(25),
      },
      second: {
        type: Sequelize.STRING(25),
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'ClassLoc',
      tableName: 'location',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
  }
}

module.exports = ClassLoc;