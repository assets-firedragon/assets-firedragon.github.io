# MEMORY

프로젝트 상태와 가드레일을 간단히 유지하는 메모 파일입니다.

## Goal

- GitHub Pages에서 실행되는 정적 개인 포트폴리오 완성
- SAEROME KIM의 CV 기반 내용 반영
- Home / About / Experience / Project / Game 페이지 분리
- 데스크톱과 모바일 모두에서 반응형 동작
- Tetris 게임의 조작감 개선
- 최초 GitHub Pages 배포 유지

## Required Deliverables

- 루트의 `index.html`
- `about.html`
- `experience.html`
- `projects.html`
- `game.html`
- `styles.css`
- `script.js`
- `AORR.md`
- `MEMORY.md`
- 필요한 경우 정적 이미지/아이콘

## Current Scope

- 정적 HTML, CSS, JavaScript
- CV 기반 개인 프로필 콘텐츠
- 페이지별 분리 구조
- 반응형 레이아웃
- Tetris 게임
- GitHub Pages 배포

## Out of Scope

- 백엔드 서버
- 데이터베이스
- 로그인/회원가입
- 결제
- 비공개 개인정보 수집
- 별도 승인 없는 외부 API
- 별도 승인 없는 프레임워크 전환

## Current State

- 현재 상태: 최신 CV 기준으로 포트폴리오 페이지와 프로젝트/경력 내용을 다시 정리 중
- 완료한 루프: 저장소 확인, 기본 포트폴리오/게임 구현, Tetris 전환, CV 텍스트 추출, 페이지 분리 작업, CV 최신화 반영, 학력 재반영
- 다음 루프: 페이지별 문구 정합성 검증, 게임 조작감 검증, 로컬/배포 반영 확인
- 현재 Retry 횟수: 0
- 현재 오류 fingerprint: 없음
- Blocker: 없음
- 마지막 정상 상태: Tetris 게임과 정적 페이지가 GitHub Pages에 정상 반영된 상태

## Guardrails

- 확인되지 않은 경력/프로젝트 정보 생성 금지
- 기존 콘텐츠 임의 삭제 금지
- 테스트 삭제 또는 완화 금지
- 토큰 출력 금지
- 토큰을 HTML/CSS/JS에 저장 금지
- 토큰을 Git에 커밋 금지
- `github_token.txt` 커밋 금지
- `env_settings.txt` 커밋 금지
- 백엔드 기능 추가 금지
- 대규모 리팩토링 금지
- 테스트를 통과시키기 위한 기능 제거 금지

## Acceptance Criteria

- 루트 `index.html` 존재
- About / Experience / Project / Game 페이지가 별도 HTML로 존재
- 로컬 정적 서버에서 정상 로드
- CSS/JavaScript 정상 로드
- 콘솔 오류 없음
- 모바일/데스크톱 레이아웃 정상
- Games 페이지 진입 정상
- Tetris 게임 정상 실행
- 키보드 조작 정상
- 모바일 터치/버튼 조작 정상
- 점수 및 재시작 정상
- GitHub Pages에서 HTTP 200 응답

## Retry Policy

- 하나의 오류당 최대 3회
- 동일 오류 fingerprint가 2회 반복되면 중지
- 한 번의 Retry에서는 하나의 원인만 수정
- 수정 후 동일 Verifier 재실행

## HITL Conditions

- 개인 프로필 내용이 불명확한 경우
- 기존 콘텐츠 삭제가 필요한 경우
- 요구사항이 충돌하는 경우
- GitHub 저장소 권한 부족
- GitHub Pages 설정 변경 필요
- 외부 서비스 추가 필요
- Retry 한계 도달

## Tool Policy

- Codex는 작업 제어, 파일 수정, 테스트 실행 담당
- 가능하면 Codex 내부 검증을 우선 사용
- 실제 사용한 모델/검증 도구는 로그에 기록
- 토큰 값은 어떤 실행 기록에도 남기지 않음

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
