const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');

const { sequelize } = require('./models');
const indexRouter = require('./routes');       // index.js 라우터
const usersRouter = require('./routes/users'); // users.js 라우터
const timesRouter = require('./routes/times'); // times.js 라우터

const app = express();
app.set('port', process.env.PORT || 3001);
app.set('view engine', 'html');

nunjucks.configure('views', {
  express: app,
  watch: true,
});

// ✅ DB 연결 및 모델 동기화
sequelize.sync({ alter: true }) // 모델 변경 시 자동 반영
  .then(() => console.log('✅ 데이터베이스 연결 성공'))
  .catch(err => console.error('❌ DB 연결 오류:', err));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/times', timesRouter);

// ✅ 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 루트 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'sequelize.html'));
});


app.get('/timetable/search', (req, res) => {
  const { name } = req.query;
  // DB에서 name이 포함된 시간표 검색
  const result = timetableDB.filter(t => t.교과목명.includes(name));
  res.json(result);
});

// ================== 라우터 등록 ==================
// router 객체를 정확히 export/import 해야 합니다!
// usersRouter, indexRouter, timesRouter 모두 module.exports = router 형태여야 함
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/times', timesRouter);

// ================== 404 에러 처리 ==================
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// ================== 에러 핸들러 ==================
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// ================== 서버 시작 ==================
app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});