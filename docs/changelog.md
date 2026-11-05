# 작업 기록

## 2026-11-05 — 개발 환경 구축

- 빈 GitHub 저장소를 복제하고 프론트엔드 npm workspace 구성.
- React, Vite, TypeScript, React Three Fiber, Drei 설치.
- 로우폴리 지면과 분수가 있는 3D 환경 미리보기 추가.
- 향후 FastAPI WebSocket 백엔드 위치와 책임 정리.
- 실행 방법 및 단계별 개발 계획 작성.
- 검증: `npm run build` 성공(TypeScript 검사 포함), 설치 당시 취약점 0건.
- 남은 확인: 실제 브라우저 렌더링. 3D 라이브러리를 포함한 번들 크기 경고가 있어 향후 최적화 예정.
