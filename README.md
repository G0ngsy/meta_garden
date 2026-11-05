# 느긋한 공동 정원

React + Vite + TypeScript + React Three Fiber/Drei로 만드는 웹 공동 정원.

## 실행

Node.js 20.19+ 또는 22.12+ 환경에서 저장소 루트 기준:

```sh
npm install
npm run dev
```

표시된 로컬 주소로 접속합니다. `npm run build`로 TypeScript 검사와 배포 빌드를 실행합니다.

## 구조

- `frontend/`: 3D 화면과 사용자 인터페이스
- `backend/`: 향후 FastAPI WebSocket 서버
- `docs/`: 개발 순서와 기능 명세

현재는 3D 렌더링 환경 확인용 미리보기입니다. 캐릭터 이동과 멀티플레이는 아직 구현하지 않았습니다.
