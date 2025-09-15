# 2025 I&T 융합프로젝트 codeplay
# 백엔드

## 브랜치 종류
main: 배포본 <br/>
develop : 배포본 이전본, 총 통합 브랜치 역할<br/>
feature/기능명 : 기능<br/>
ex) feature/login, feature/main<br/>

## 순서
1. 개인이 맡은 기능(feature) 브랜치에서 작업하고,<br/>
2. 해당 기능이 완성 됐으면 develop 브랜치에 올린다.<br/>
3. develop에 모든 기능들이 모이고 문제 없이 정상적으로 작동하면<br/>
4. main 브랜치(배포본)에 올린다.<br/>

## commit 메세지
feat : 새로운 기능 추가<br/>
fix : 기능 수정<br/>
style : 스타일 관련<br/>
refactor : 코드 리펙토링<br/>

## Push 후 Pull Request 하기
1. base(받는 브랜치)와 compare(보내는 브랜치)을 알맞게 설정해준다.<br/>
2. 제목, 내용을 작성해준다. 내용은 성심성의껏, 무엇을 어떻게 변경했는지, 왜 변경했는지 작성해준다.<br/>
3. Option을 설정한다. 리뷰 해줄 사람(Reviewers), PR 승인 권한을 가지는 사람(Assignees)정도 설정하면 된다.<br/>
4. 다 설정 했으면 Create pull request 버튼을 눌러 PR을 생성한다. (3번에 설정한 사람들에게 메일로 알림이 가게 된다.)
