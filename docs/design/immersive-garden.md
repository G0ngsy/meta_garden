# 전체 화면 전통 정원

## 승인된 목표

사용자가 승인한 `immersive-garden-reference.png`를 구도 및 분위기 기준으로 사용한다. 화면을 채우는 정원, 캐릭터 뒤의 낮은 3인칭 카메라, 넓은 돌마당과 중앙 정자, 오른쪽 연못·돌다리, 작은 반투명 조작 UI가 핵심이다.

이미지는 목표 콘셉트이며 실제 실행 캡처가 아니다. 현재는 코드로 만든 기하 모델과 생성한 텍스처를 사용하는 첫 개선 버전이다. 콘셉트의 사실적인 수목, 세밀한 건축 장식과 조명 수준까지 구현했다고 간주하지 않는다.

## 구현

- `World.tsx`: 곡선 지붕과 기왓골, 목재 기둥·단청색 보·난간·계단, 연못·아치형 다리, 인스턴스 식생, 산 배경.
- `Player.tsx`: 한복 느낌 캐릭터, 팔/다리 걷기, 카메라 방향 기준 이동, 드래그와 휠 카메라, 장애물 시야 보정.
- `world-layout.ts`: 공간 좌표, 충돌과 바닥 높이. 난간 및 물 영역은 제한하고 다리와 중앙 계단은 통과 가능.
- 전체 화면 HUD와 닫을 수 있는 조작 안내. 설치/오프라인 패널은 작은 상단 영역에 표시.
- 런타임 외부 CDN 모델·글꼴에 의존하지 않으며 텍스처는 PWA 정적 캐시에 포함.

## 생성 자산

두 텍스처 모두 built-in image_gen으로 생성. 나뭇잎은 투명도를 보존해 512px로 축소했다. 목재결과 잔디 노이즈는 코드에서 생성한다.

1. `frontend/public/textures/courtyard-stone.png`
   - Prompt: Seamless tileable game material texture, orthographic straight top down, full square edge to edge. A Korean traditional garden courtyard floor made of irregular medium-sized pale warm gray natural flat flagstones, subtle beige and sage gray variation, thin dark sand joints, lightly worn fine stone grain. Realistic stylized hand crafted PBR albedo quality, no dramatic cracks, no plants, no grass, no leaves, no props, no perspective, no shadows or directional lighting, no border, no text. Even neutral lighting, muted pale tones. 1:1 square texture designed to repeat over a large ground surface.
2. `frontend/public/textures/leaves.png`
   - Prompt: Game foliage sprite texture on truly transparent background. A small natural cluster of four to five delicate pointed maple-like leaves with thin short stems, neutral very pale sage green leaves with subtle leaf veins, softly shaded and mostly evenly lit for tinting in a real time 3D game. Front-facing leaf cluster fills 85 percent of square, isolated with generous transparent gaps between leaf lobes. Clean crisp alpha edges. No pot, no landscape, no text, no border, no ground, no shadow on background. Botanical game texture asset, detailed but legible small. Transparent outside the leaves.

## 품질과 한계

- 건축과 수목은 현재 프로젝트에서 만든 모델이며 전문 제작 GLB 아트 세트는 사용하지 않았다.
- 잎 인스턴싱과 지붕 형상 병합으로 반복 모델의 드로콜을 줄였다. 그래도 실제 휴대폰의 메모리·GPU 검증과 그래픽 품질 단계가 필요하다.
- 연못 표면은 물결 셰이더이며 실제 주변 건축의 평면 반사는 구현하지 않았다.
- 공간에는 아직 멀티플레이·상호작용·계절 변화가 없다.
