const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// ================== 회원 전체 조회 ==================
router.route('/')
  .get(async (req, res, next) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

// ================== 회원가입 ==================
router.post('/register', async (req, res) => {
  try {
    const { name, studentId, username, password, confirmPassword } = req.body;
    if (!name || !studentId || !username || !password || !confirmPassword)
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });

    const exist = await User.findOne({ where: { username } });
    if (exist) return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      studentId, 
      username, 
      password: hashedPassword,
      profileImage: '/images/default.jpg' // 기본 프로필 이미지
    });

    res.status(201).json({ message: '회원가입 성공', user });
  } catch (err) {
    console.error(err); 
    res.status(500).send('서버 오류'); 
  }
});

// ================== 로그인 ==================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ message: '아이디를 찾을 수 없습니다.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });

    const token = jwt.sign({ username: user.username }, 'team2-key', { expiresIn: '1h' });

    res.json({
      message: `${user.name}님 로그인 성공!`,
      user: {
        username: user.username,
        name: user.name,
        studentId: user.studentId,
        profileImage: user.profileImage // 로그인 시 이미지 포함
      },
      token
    });
  } catch (err) { 
    console.error(err); 
    res.status(500).send('서버 오류'); 
  }
});

router.get('/set_name', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
// ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.

    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]
    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });
    const payload = jwt.verify(token, 'team2-key');

    const user = await User.findOne({ where: { username: payload.username } });

    if (!user) return res.status(404).send('사용자를 찾을 수 없습니다.');

    res.json({ message: '별명이 성공적으로 반영되었습니다.', name: user.name });

  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }

});

router.post('/update_name', async (req, res) => {
  try {
    // ⭐️ 1. 'Authorization' 헤더에서 전체 토큰 문자열을 가져옵니다.
    const authHeader = req.headers.authorization;
    
    // 2. newName은 req.body에서 newName이 아닌 nickname으로 받아야 합니다.
    //    프론트엔드에서 nickname으로 보냈기 때문입니다.
    const { nickname } = req.body; 

    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    if (!nickname || nickname.trim() === '') // 닉네임 유효성 검사
      return res.status(400).json({ message: '새 별명을 입력해주세요.' });

    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    const payload = jwt.verify(token, 'team2-key');
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    // user.name 대신 user.nickname 또는 user.name을 사용하세요.
    // 프론트엔드에서 nickname으로 보내고 있으므로, 백엔드 모델에 맞춰 업데이트하세요.
    user.name = nickname; // user 모델의 필드명에 맞게 'nickname' 대신 'name' 사용
    await user.save();

    res.json({ message: '별명이 성공적으로 변경되었습니다.', name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// ================== 프로필 이미지 예시 가져오기 ==================
router.get('/example-images', (req, res) => {
  const images = [1,2,3,4,5].map(i => ({
    id: i,
    url: `/images/${i}.jpg`
  }));
  res.json(images);
});

// ================== 내 프로필 이미지 조회 ==================
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    const payload = jwt.verify(token, 'team2-key');
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) return res.status(404).send('사용자를 찾을 수 없습니다.');

    res.json({ profileImage: user.profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

// ================== 프로필 이미지 변경 ==================
router.post('/profile', async (req, res) => {
  try {
    const { imageId } = req.body;
    if (!imageId || imageId < 1 || imageId > 5)
      return res.status(400).json({ error: 'Invalid imageId' });

    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    const payload = jwt.verify(token, 'team2-key');
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    user.profileImage = `/images/${imageId}.jpg`;
    await user.save();

    res.json({ message: '프로필 이미지가 변경되었습니다.', imageUrl: user.profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 친구 추가 (이름 + 학번 필요, 양방향)
router.post('/add_friend', async (req, res) => {
  try {
    const { name, studentId } = req.body;
    const authHeader = req.headers.authorization;
    console.log('받은 데이터 : ', req.body);
    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    const payload = jwt.verify(token, 'team2-key');
    const userA = await User.findOne({ where: { username: payload.username } });
    if (!userA) return res.status(405).send('사용자를 찾을 수 없습니다.');

    const userB = await User.findOne({ where: { name: name, studentId: studentId } });
    if (!userB) return res.status(406).send('해당 이름+학번 사용자를 찾을 수 없습니다.');

    if (userA.username === userB.username) {
      return res.status(400).send('자기 자신은 친구로 추가할 수 없습니다.');
    }

    let friendsA = Array.isArray(userA.friend_list) ? [...userA.friend_list] : [];
    let friendsB = Array.isArray(userB.friend_list) ? [...userB.friend_list] : [];

    if (friendsA.includes(userB.username)) return res.send('이미 친구입니다.');

    friendsA.push(userB.username);
    friendsB.push(userA.username);

    await Promise.all([
      User.update({ friend_list: friendsA }, { where: { username: userA.username } }),
      User.update({ friend_list: friendsB }, { where: { username: userB.username } }),
    ]);

    res.send(`'${userB.name}'님과 친구가 되었습니다!`);
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

// 친구 삭제 (양방향)
router.post('/remove_friend', async (req, res) => {
  try {
    const { username: friendUsername } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    const payload = jwt.verify(token, 'team2-key');
    const userA = await User.findOne({ where: { username: payload.username } });
    const userB = await User.findOne({ where: { username: friendUsername } });
    if (!userA || !userB) return res.status(404).send('사용자를 찾을 수 없습니다.');

    let friendsA = Array.isArray(userA.friend_list) ? [...userA.friend_list] : [];
    let friendsB = Array.isArray(userB.friend_list) ? [...userB.friend_list] : [];

    friendsA = friendsA.filter(u => u !== userB.username);
    friendsB = friendsB.filter(u => u !== userA.username);

    await Promise.all([
      User.update({ friend_list: friendsA }, { where: { username: userA.username } }),
      User.update({ friend_list: friendsB }, { where: { username: userB.username } }),
    ]);

    res.send(`'${userB.name}'님과의 친구 관계를 삭제했습니다.`);
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

// 내 친구 목록 조회
router.get('/my_friend_list_show', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
// ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.

    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]
    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });
    const payload = jwt.verify(token, 'team2-key');
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) return res.status(404).send('사용자를 찾을 수 없습니다.');

    res.json({ my_friend_list_show: user.friend_list || [] });
  } catch (err) { console.error(err); res.status(500).send('서버 오류'); }
});


// ================== 회원별 시간표 관리 ==================
const ClassTime = require('../models/time');
const jwtKey = 'team2-key';

// 내 시간표 조회
router.get('/timetable', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    const payload = jwt.verify(token, 'team2-key');
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    res.json({ timetable: user.timetable || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

function parseCourseTimes(timeStr) {
  const result = [];
  const parts = timeStr.split(/\s+/).filter(Boolean); // ["수", "1A,1B", "화", "2A,2B"]
  for (let i = 0; i < parts.length; i += 2) {
    const day = parts[i]; // 요일
    const times = parts[i + 1]?.split(',').filter(Boolean) || [];
    times.forEach(t => result.push({ day, time: t }));
  }
  return result;
}

router.post('/timetable/add', async (req, res) => {
  try {
    const { number } = req.body;
  const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    if (!number) return res.status(400).json({ message: '강좌번호가 필요합니다.' });

    const payload = jwt.verify(token, jwtKey);
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    const course = await ClassTime.findOne({ where: { number } });
    if (!course) return res.status(404).json({ message: '해당 강좌를 찾을 수 없습니다.' });

    const timetable = Array.isArray(user.timetable) ? [...user.timetable] : [];

    if (timetable.find(c => c.number === number)) {
      return res.status(400).json({ message: '이미 추가된 과목입니다.' });
    }

    const newTimes = parseCourseTimes(course.time);

    for (const existing of timetable) {
      const existingTimes = parseCourseTimes(existing.time);

      const overlap = existingTimes.some(et =>
        newTimes.some(nt => et.day === nt.day && et.time === nt.time)
      );

      if (overlap) {
        return res.status(400).json({
          message: `시간이 겹칩니다! (${existing.name} ↔ ${course.name})`
        });
      }
    }

    timetable.push({
      number: course.number,
      name: course.name,
      time: course.time,
      credits: course.credits,
      professor: course.professor,
      location: course.location,
      department: course.department,
    });

    user.timetable = timetable;
    await user.save();

    res.json({ message: '과목이 시간표에 추가되었습니다.', timetable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 과목 삭제
router.delete('/timetable/:number', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' });
    // ⭐️ 3. "Bearer " 부분을 제거하고 실제 토큰 값만 추출합니다.
    const token = authHeader.split(' ')[1]; // "Bearer [token]" -> [token]

    if (!token) return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });

    const payload = jwt.verify(token, 'team2-key');
    const user = await User.findOne({ where: { username: payload.username } });
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    const number = req.params.number;
    const timetable = Array.isArray(user.timetable) ? [...user.timetable] : [];
    const updated = timetable.filter(c => c.number !== number);

    user.timetable = updated;
    await user.save();

    res.json({ message: '과목이 삭제되었습니다.', timetable: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});


// ================== 현재 수업 상태 조회 ==================
const PERIODS = {
  "1A": { start: "09:00", end: "09:50" },
  "1B": { start: "09:30", end: "10:15" },
  "2A": { start: "10:00", end: "10:50" },
  "2B": { start: "10:30", end: "11:45" },
  "3A": { start: "11:00", end: "11:50" },
  "3B": { start: "11:30", end: "12:15" },
  "4A": { start: "12:00", end: "12:50" },
  "4B": { start: "12:30", end: "13:15" },
  "5A": { start: "13:00", end: "13:50" },
  "5B": { start: "13:30", end: "14:45" },
  "6A": { start: "14:00", end: "14:50" },
  "6B": { start: "14:30", end: "15:15" },
  "7A": { start: "15:00", end: "15:50" },
  "7B": { start: "15:30", end: "16:15" },
  "8A": { start: "16:00", end: "16:50" },
  "8B": { start: "16:30", end: "17:15" },
  "9A": { start: "17:00", end: "17:50" },
  "9B": { start: "17:30", end: "18:15" },
  "10A": { start: "18:00", end: "18:50" },
  "10B": { start: "18:25", end: "19:10" },
  "11A": { start: "18:55", end: "19:40" },
  "11B": { start: "19:20", end: "20:05" },
  "12A": { start: "19:50", end: "20:35" },
  "12B": { start: "20:15", end: "21:00" },
  "13A": { start: "20:45", end: "21:30" },
  "13B": { start: "21:10", end: "21:55" },
  "14A": { start: "21:40", end: "22:25" },
  "14B": { start: "22:05", end: "22:50" },
};

// timetable 내 "월 5B,6A,6B" 같은 문자열을 { day, period } 배열로 변환
function parseCourseTimes(timetableItem) {
  const result = [];
  // 줄바꿈 단위로 split
  const lines = timetableItem.time.split('\n');
  for (const line of lines) {
    const [dayKor, periodsStr] = line.split(' ');
    if (!dayKor || !periodsStr) continue;
    const periods = periodsStr.split(',');
    periods.forEach(period => result.push({ day: dayKor, period }));
  }
  return result;
}

// 요일 한글 -> 숫자
const DAY_MAP = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

// 수업 상태 확인
function checkCurrentClassStatus(timetable) {
  const now = new Date();
  const currentDay = now.getDay(); // 0(일)~6(토)
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const course of timetable) {
    const times = parseCourseTimes(course);
    for (const t of times) {
      const courseDay = DAY_MAP[t.day];
      const periodInfo = PERIODS[t.period];
      if (!periodInfo || courseDay !== currentDay) continue;

      const [sh, sm] = periodInfo.start.split(':').map(Number);
      const [eh, em] = periodInfo.end.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return {
          status: 'active',
          currentClass: course.name,
          period: t.period,
          start: periodInfo.start,
          end: periodInfo.end
        };
      }
    }
  }

  return { status: 'inactive', currentClass: null };
}

// ================== 현재 수업 상태 라우트 ==================
router.get('/user/status/:username', async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const statusInfo = checkCurrentClassStatus(user.timetable || []);

    res.json({
      username: user.username,
      name: user.name,
      status: statusInfo.status,
      currentClass: statusInfo.currentClass,
      period: statusInfo.period,
      start: statusInfo.start,
      end: statusInfo.end
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;