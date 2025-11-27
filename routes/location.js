const express = require('express');
const ClassLoc = require('../models/location');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/coordinates', async (req, res, next) => {
  try {
    // 1. 프론트엔드에서 건물명만 추출하여 보낸 'location'을 받습니다.
    const { location } = req.query; 

    if (!location || location.trim() === '') {
      // 400: 잘못된 요청 (비어있는 건물명)
      return res.status(400).json({ message: '건물 이름 쿼리 파라미터가 필요합니다.' });
    }

    // 2. BuildingCoordinates 테이블에서 해당 건물 이름을 찾아 좌표 조회
    // ⚠️ BuildingCoordinates는 사용자가 좌표를 저장한 실제 DB 모델명이어야 합니다.
    const coordinateResult = await ClassLoc.findOne({
      where: {
        // 프론트엔드에서 이미 강의실 번호가 제거된 순수한 건물명만 넘어왔다고 가정
        location: location 
      },
      attributes: ['first', 'second'],
      raw: true
    });

    if (!coordinateResult) {
      // 404: DB에 해당 건물명이 존재하지 않음
      return res.status(404).json({ message: `건물 "${location}"의 좌표를 찾을 수 없습니다.` });
    }

    // 3. 좌표 반환
    res.json(coordinateResult); // 예: { latitude: 35.xxx, longitude: 129.xxx }

  } catch (err) {
    console.error(err);
    next(err); // 500 Internal Server Error 발생 시 다음 미들웨어로 넘김
  }
});

module.exports = router;