const express = require('express');
const classTime = require('../models/time');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/search', async (req, res, next) => {
  try {
    const { timename } = req.query;

    if (!timename || timename.trim() === '') {
      return res.status(400).json({ message: 'timename 쿼리 파라미터가 필요합니다.' });
    }

    const result = await classTime.findAll({
      where: {
        name: { [Op.like]: `%${timename}%` }
      },
      raw: true
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
