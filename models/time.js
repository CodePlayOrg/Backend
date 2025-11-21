const Sequelize = require('sequelize');

class ClassTime extends Sequelize.Model {
  static initiate(sequelize) {
    ClassTime.init({
      number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      credits: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      grade: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      time: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      department: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      professor: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      language: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'ClassTime',
      tableName: 'timetable',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
  }
}

module.exports = ClassTime;
