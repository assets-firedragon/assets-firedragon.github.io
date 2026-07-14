# MEMORY

프로젝트 상태와 가드레일을 관리하는 메모리 문서다. 이 파일은 현재 프로젝트의 기준선이며, 구현보다 먼저 읽어야 하는 작업 메모로 사용한다.

## Goal

- GitHub Pages용 프로페셔널 웹사이트 완성
- 반응형 데스크톱 및 모바일 지원
- Games 탭 구현
- 키보드와 모바일 터치로 조작 가능한 지렁이 게임 구현
- GitHub Pages 최초 배포
- Step 1의 `[게임 추가 기능:]` 반영

## Required Deliverables

- 프로젝트 루트의 `index.html`
- `styles.css`
- `script.js`
- 필요한 경우 별도 `game.js`
- 필요한 이미지 및 정적 assets
- `AORR.md`
- `MEMORY.md`

## Current Scope

- 정적 HTML, CSS, JavaScript
- 프로페셔널 웹사이트 콘텐츠
- 반응형 레이아웃
- Games 탭
- 지렁이 게임
- GitHub Pages 배포

## Out of Scope

- 백엔드 서버
- 데이터베이스
- 로그인 및 회원가입
- 결제
- 사용자 개인정보 수집
- 별도 승인 없는 외부 API
- 별도 승인 없는 프레임워크 전환

## Current State

- 현재 상태: Games 섹션에 playable snake game 1차 구현 반영 완료
- 완료한 루프: 저장소 구조 확인, `AORR.md` 작성, Verifier 중심 TDD 루프 설계, 메모리 파일 작성, 기본 HTML 구조 초안 반영, Games 게임 UI/로직 1차 반영
- 다음 루프: 모바일 제스처와 세부 UX 조정, 필요 시 게임 난이도/시각 보강
- 현재 Retry 횟수: 0
- 현재 오류 fingerprint: 없음
- Blocker: 없음
- 마지막 정상 상태: Games 섹션의 canvas, 버튼, 점수, 키보드 입력 연결이 정상 로드되는 상태

## Guardrails

- 기존 개인 콘텐츠 임의 삭제 금지
- 확인되지 않은 경력이나 프로젝트 정보 생성 금지
- 테스트 삭제 또는 완화 금지
- 토큰 출력 금지
- 토큰을 HTML, CSS, JavaScript에 저장 금지
- 토큰을 Git에 커밋 금지
- `github_token.txt` 커밋 금지
- `env_settings.txt` 커밋 금지
- 백엔드 기능 추가 금지
- 대규모 리팩토링 금지
- 테스트를 통과시키기 위한 기능 제거 금지

## Acceptance Criteria

- 루트 `index.html` 존재
- 로컬 정적 서버에서 정상 로드
- CSS와 JavaScript 정상 로드
- 콘솔 오류 없음
- 모바일 및 데스크톱에서 레이아웃 정상
- Games 탭 정상 이동
- 지렁이 게임 정상 실행
- 키보드 조작 정상
- 모바일 터치 조작 정상
- 점수 및 재시작 정상
- GitHub Pages에서 HTTP 200 응답
- 배포된 사이트에서도 동일 기능 정상

## Retry Policy

- 하나의 오류당 최대 3회
- 동일 오류 fingerprint 2회 반복 시 중지
- 한 번의 Retry에서 하나의 원인만 수정
- Retry마다 동일 Verifier 재실행

## HITL Conditions

- 개인 프로필 내용 불명확
- 기존 콘텐츠 삭제 필요
- 요구사항 충돌
- GitHub 저장소 권한 부족
- GitHub Pages 설정 변경 필요
- 외부 서비스 추가 필요
- Retry 한계 도달

## Tool Policy

- Codex는 작업 제어, 파일 수정, 테스트 실행 담당
- 가능하면 Codex를 독립 Verifier로 사용
- 실제 사용한 Codex 실행 경로 또는 세션 기준을 기록
- 토큰 값은 어떠한 실행 기록에도 남기지 않음

## Execution Log Template

```text
Loop ID:
시작 시각:
목표:
시작 상태:
가설:
Act:
변경 파일:
Verifier:
테스트 결과:
exit code:
오류 fingerprint:
Retry 횟수:
종료 상태:
다음 작업:
사람 확인 필요 항목:
```

## Notes

- 현재 저장소에는 아직 `index.html`, `styles.css`, `script.js`가 보이지 않는다.
- 현재 환경에는 Codex 검증용 CLI 세션, `node`, `python`이 있다. [사람 확인 필요]
- `python3`는 확인되지 않았으므로 로컬 서버는 `python -m http.server` 계열을 우선 고려한다.
- `github_token.txt`와 `env_settings.txt`는 민감 정보 경로이므로 출력, 저장, 커밋 대상이 아니다.
