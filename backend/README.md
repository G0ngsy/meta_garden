# Backend (향후 구현)

FastAPI + WebSocket 서버를 추가할 위치입니다. 현재 Python 서버나 의존성은 설치하지 않았습니다.

예정 구조: `app/main.py`, `app/rooms.py`, `app/weather.py`, `requirements.txt`.

서버는 입장·퇴장, 플레이어 이동 동기화, 정원 상태 저장, 서울 날씨 조회를 담당합니다.
날씨 API 키는 서버 환경 변수로 관리합니다. 시간대 기준은 `Asia/Seoul`입니다.
