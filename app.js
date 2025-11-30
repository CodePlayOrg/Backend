const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const { WebSocketServer } = require("ws")

const { sequelize } = require('./models');
const indexRouter = require('./routes');       // index.js 라우터
const usersRouter = require('./routes/users'); // users.js 라우터
const timesRouter = require('./routes/times'); // times.js 라우터
const locationsRouter = require('./routes/location'); // location.js라우터

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
app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use('/times', timesRouter);
app.use('/location', locationsRouter);

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
const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8001 });

console.log("🟢 WebSocket 위치 서버 실행: 8001 포트");

// 모든 친구의 최신 위치 저장
// { username: { lat, lon } }
const locations = {};

wss.on("connection", (ws, request) => {
  console.log("🟢 새로운 WebSocket 연결:", request.socket.remoteAddress);

  // 클라이언트 고유 이름(username)
  ws.username = null;

  // 클라이언트가 구독하는 친구 목록
  ws.subscribedFriends = [];

  // 🔵 클라이언트 메시지 처리
  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (e) {
      console.log("❌ JSON 파싱 실패:", raw.toString());
      return;
    }

    // (1) 접속 알림
    if (msg.type === "join") {
      ws.username = msg.username;
      console.log(`👤 사용자 접속: ${ws.username}`);
      return;
    }

    // (2) 구독 친구 저장
    if (msg.type === "subscribe") {
      ws.subscribedFriends = msg.friends || [];
      console.log(`📌 ${ws.username} 구독 친구:`, ws.subscribedFriends);
      return;
    }

    // (3) 위치 업데이트 처리
    if (msg.type === "location") {
      const { nickname, lat, lon } = msg;
      if (!nickname) return;

      // 최신 위치 저장
      locations[nickname] = { lat, lon };

      // 이 위치를 구독한 클라이언트에게만 전송
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          if (client.subscribedFriends.includes(nickname)) {
            client.send(JSON.stringify({
              type: "location",
              nickname,
              lat,
              lon
            }));
          }
        }
      });

      return;
    }
  });

  ws.on("close", () => {
    console.log(`🔴 WebSocket 연결 종료: ${ws.username}`);
  });
});
