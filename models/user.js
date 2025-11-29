const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init({
      name: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      studentId: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      friend_list: {
        type: Sequelize.JSON, // 친구 목록 JSON 배열
        defaultValue: [],
      },
      profileImage: {
        type: Sequelize.STRING(255), // 이미지 경로 저장
        allowNull: true,
        defaultValue: '/images/default.jpg', // 기본 이미지 
      },
      timetable: {
        type: Sequelize.JSON, // 과목 목록을 JSON 배열로 저장
        defaultValue: [],
      },
      // 1. 위도 (소수점이 길기 때문에 DOUBLE 사용)
      latitude: {
        type: Sequelize.DOUBLE, 
        allowNull: true,
      },
      // 2. 경도
      longitude: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      // 3. 내 위치를 볼 수 있게 허용한 친구 ID 목록
      allowed_viewers: {
        type: Sequelize.JSON, 
        defaultValue: [], // 기본값은 빈 배열 (아무에게도 안 보여줌)
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }
}

module.exports = User;
