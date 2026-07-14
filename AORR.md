# AORR 상태 머신 설계

이 문서는 개인 프로페셔널 웹사이트를 GitHub Pages에서 동작하는 정적 사이트로 구현하기 위한 개발 루프를 AORR 관점에서 분해한 설계안이다.

전제:

- 결과물은 별도 백엔드 없이 `HTML`, `CSS`, `JavaScript`만으로 동작해야 한다.
- 최종 파일은 루트 디렉토리에 최소 `index.html`, `styles.css`, `script.js`를 포함해야 한다.
- 게임 코드는 `script.js` 내부 또는 별도 JavaScript 파일로 구현할 수 있다.
- 아직 코드 수정, 테스트, 배포는 수행하지 않는다.
- 개인 콘텐츠, 저장소 설정, 배포 권한, 게임 종류 충돌은 추측하지 않고 `[사람 확인 필요]`로 표시한다.

## 1. Target

| 항목 | 정의 |
|---|---|
| 프로페셔널 웹사이트 개발 목표 | 개인 소개, 경력, 프로젝트, 연락처를 담은 반응형 정적 웹사이트를 만든다. |
| GitHub Pages 배포 목표 | 루트 정적 파일만으로 GitHub Pages에서 안정적으로 호스팅 가능한 상태를 만든다. |
| 입력 자료 | 기존 저장소 파일, 개인 소개/경력/프로젝트 정보, 원하는 시각 스타일, 링크, 이미지 또는 아이콘, GitHub Pages 저장소 설정 정보 [사람 확인 필요]. |
| 필수 페이지와 섹션 | 홈/소개, 경력, 프로젝트, 스킬, 연락처, Games 탭, 게임 플레이 영역, 푸터. |
| Games 탭 요구사항 | 상단 내비게이션에 Games 탭을 추가하고, 탭 전환 시 게임 섹션이 노출되어야 한다. |
| 게임 요구사항 | 현재 대화에는 `지렁이 게임`과 `테트리스 게임`이 모두 등장한다. 우선 구현 대상은 `[사람 확인 필요]`이며, 문서에는 게임 슬롯을 분리해 두고 하나의 게임을 먼저 완성하는 구조로 설계한다. |
| 데스크톱 완료 기준 | 1280px 이상에서 레이아웃이 무너지지 않고, 내비게이션과 콘텐츠, 게임 영역이 정상 동작한다. |
| 모바일 완료 기준 | 360px 이상 폭에서 가독성, 터치 타깃, 게임 조작, 스크롤이 정상이어야 한다. |

## 2. Act

| 항목 | 정의 |
|---|---|
| 한 번의 개발 루프에서 수행할 최소 작업 | 하나의 실패 원인만 수정하고, 그 원인과 직접 관련된 파일만 고친다. 예: HTML 구조 1개, 반응형 1개, 게임 입력 1개. |
| 수정 가능한 파일 범위 | 해당 루프와 직접 연결된 `index.html`, `styles.css`, `script.js`, 필요 시 추가 게임 JS 파일 1개 또는 소수의 정적 자산 파일. |
| 생성할 수 있는 파일 | 루트의 `index.html`, `styles.css`, `script.js`, 선택적 게임 전용 JS 파일, 필요 시 이미지/아이콘/manifest 같은 정적 파일. |
| 실행 가능한 로컬 검증 명령어 | `python -m http.server`, `npx serve`, 또는 프로젝트에 맞는 정적 서버 명령. 파일 존재 확인은 `dir` 또는 `Get-ChildItem`으로 한다. |
| 루프 규칙 | 구현보다 검증 가능한 최소 단위로 쪼개고, 한 번에 하나의 변경만 반영한다. |

## 3. Observe

| 관찰 항목 | 확인 내용 |
|---|---|
| 파일 생성 여부 | 요구 파일이 루트에 존재하는지 확인한다. |
| HTML, CSS, JavaScript 오류 | 브라우저 콘솔 오류, 파서 오류, 잘못된 참조, 미정의 변수, 이벤트 바인딩 실패를 확인한다. |
| 로컬 웹서버 응답 | 페이지가 HTTP로 정상 응답하고 새로고침 및 직접 진입이 가능한지 확인한다. |
| 브라우저 콘솔 오류 | 렌더링 경고와 런타임 에러를 함께 본다. |
| 데스크톱 및 모바일 화면 | 화면 폭별로 레이아웃 붕괴, 넘침, 잘린 콘텐츠, 잘못된 스크롤을 확인한다. |
| 키보드 및 터치 게임 조작 | 키보드 입력, 모바일 터치/스와이프 입력이 의도대로 작동하는지 확인한다. |
| GitHub Pages 호환성 | 절대경로, 서버 전용 코드, 비허용 의존성, 파일 경로 문제, SPA 라우팅 가정이 없는지 확인한다. |

## 4. Reason

| 분류 | 판단 기준 |
|---|---|
| HTML_STRUCTURE | 섹션 누락, 잘못된 중첩, 탭 구조 오류, 잘못된 링크/앵커 구조. |
| CSS_RESPONSIVE | 미디어 쿼리 부재, 오버플로우, 레이아웃 붕괴, 터치 타깃 부족. |
| JAVASCRIPT | 스크립트 로딩 실패, DOM 참조 오류, 이벤트 바인딩 실패, 모듈/경로 문제. |
| GAME_LOGIC | 점수 계산, 충돌 판정, 종료 조건, 생성 규칙, 회전/이동 규칙 오류. |
| GAME_CONTROL | 키보드 입력, 터치 입력, 재시작, 일시정지, 포커스 처리 오류. |
| CONTENT | 이름, 소개, 경력, 프로젝트 문구, 링크, 이미지 등 내용 불명확 또는 누락. |
| TEST | 검증 절차 미비, 재현 불가, 테스트 기준이 불명확, 회귀 확인 실패. |
| ENVIRONMENT | 로컬 서버, 브라우저, 경로, 인코딩, 의존성, 권한 문제. |
| GITHUB_PERMISSION | 저장소 접근, 인증, 푸시 권한, Pages 설정 변경 권한 문제. |
| DEPLOYMENT | GitHub Pages 배포 경로, 정적 호스팅 제약, 캐시, 빌드 산출물 배치 문제. |
| UNKNOWN | 위 분류로도 원인을 특정할 수 없는 경우. |

## 5. Repeat

| 규칙 | 정의 |
|---|---|
| 한 번에 하나의 실패 원인만 수정 | 같은 루프에서 여러 독립 문제를 동시에 고치지 않는다. |
| 관련된 최소 파일만 변경 | 실패 원인과 직접 관련된 파일만 수정한다. |
| 수정 후 동일한 Verifier 재실행 | 같은 검증 수단으로 재검증해 변화가 실제 해결인지 확인한다. |
| 기존에 통과한 기능에 대한 회귀 테스트 실행 | 변경과 무관한 기존 통과 항목을 최소 1개 이상 다시 점검한다. |

## 6. Stop

| 종료 조건 | 의미 |
|---|---|
| 전체 테스트가 통과한 경우 | 설계된 검증 기준이 모두 충족되면 종료한다. |
| 최대 Retry에 도달한 경우 | 반복 수정 한도를 넘으면 중단하고 원인 재분석으로 전환한다. |
| 동일한 오류 fingerprint가 2회 반복된 경우 | 같은 실패가 두 번 반복되면 루프 전략을 바꾼다. |
| 개인정보나 콘텐츠 확인이 필요한 경우 | 이름, 소개, 경력, 프로젝트 등은 사람 확인 전까지 보류한다. |
| GitHub 인증 또는 배포 권한 문제가 발생한 경우 | 권한 문제는 설계상 해결하지 않고 `HITL_REQUIRED`로 전환한다. |

## 7. Human-in-the-loop

| 상황 | 처리 |
|---|---|
| 이름, 소개, 경력, 프로젝트 등 개인 콘텐츠가 불명확한 경우 | `HITL_REQUIRED` |
| 기존 콘텐츠 삭제가 필요한 경우 | `HITL_REQUIRED` |
| 외부 분석 도구나 외부 서비스를 추가해야 하는 경우 | `HITL_REQUIRED` |
| GitHub 저장소 설정을 변경해야 하는 경우 | `HITL_REQUIRED` |
| 요구사항이 충돌하는 경우 | `HITL_REQUIRED` |

## 8. 개발 루프 상태 머신

| 단계 | 입력 | Act | Observe | 출력 | 테스트 기준 | 다음 상태 |
|---|---|---|---|---|---|---|
| 저장소 및 기존 파일 확인 | 현재 파일 목록, README, 숨김 설정, GitHub Pages 관련 설정 파일 여부 | 루트 구조와 기존 산출물 확인 | 파일 존재 여부, 숨김 파일, Pages 설정 단서 확인 | 작업 기준선 | 저장소 구조와 핵심 제약이 파악됨 | `READY` 또는 `HITL_REQUIRED` |
| 정적 사이트 기본 구조 | 요구 섹션 목록, 루트 파일 요구사항 | `index.html`, `styles.css`, `script.js`의 기본 골격을 설계 | 섹션 앵커, 메타 태그, 스크립트 로딩 구조 확인 | 기본 페이지 뼈대 | 주요 섹션이 HTML 구조상 배치됨 | `ACTING` |
| 프로페셔널 콘텐츠 영역 | 소개, 경력, 프로젝트, 연락처 초안 [사람 확인 필요] | 카드/섹션/타임라인 레이아웃 설계 | 문구 누락, 정보 과밀, 가독성 확인 | 콘텐츠 섹션 초안 | 콘텐츠가 모바일/데스크톱에서 읽히는 수준 | `VERIFYING` |
| 반응형 내비게이션 | 상단 메뉴, 모바일 메뉴 패턴 | 햄버거/탭/앵커 기반 네비게이션 설계 | 작은 화면에서 메뉴 오버플로우, 탭 접근성 확인 | 반응형 내비게이션 구조 | 360px~1280px에서 메뉴가 사용 가능 | `VERIFYING` |
| Games 탭 | 게임 섹션 진입 방식 | Games 탭 노출과 섹션 전환 설계 | 탭 클릭/키보드 포커스/모바일 탭 확인 | 게임 진입점 | 탭에서 게임 섹션으로 자연스럽게 이동 | `VERIFYING` |
| 지렁이 게임 핵심 로직 | 게임판 크기, 이동 규칙, 먹이, 충돌, 점수 | 게임 상태, 렌더링, 루프, 충돌 판정 설계 | 게임 시작/종료, 점수 갱신, 충돌 여부 확인 | 핵심 게임 엔진 | 기본 게임이 실행되고 종료 조건이 작동 | `VERIFYING` |
| 키보드 조작 | 방향키/WSAD/재시작 키 | 입력 매핑과 방향 제한 설계 | 반대 방향 금지, 연속 입력, 포커스 상태 확인 | 키보드 컨트롤 | 의도한 키로만 이동/재시작 가능 | `VERIFYING` |
| 모바일 터치 조작 | 터치/스와이프/버튼 | 터치 제스처 또는 방향 버튼 설계 | 오작동 스와이프, 의도치 않은 스크롤 확인 | 모바일 컨트롤 | 손가락 입력으로 게임 조작 가능 | `VERIFYING` |
| 게임 UI 및 점수 | 점수, 최고 점수, 재시작, 상태 문구 | HUD와 상태 메시지 설계 | 시각적 우선순위, 모바일 가독성 확인 | 게임 UI | 점수와 상태가 명확히 보임 | `VERIFYING` |
| 접근성과 반응형 검증 | 접근성 속성, 포커스, 대비, 뷰포트 | A11y와 반응형 보강 설계 | 키보드 접근, 대비, 화면 축소/확대 확인 | 접근성 개선안 | 핵심 상호작용이 접근 가능 | `PASSED` 또는 `RETRYING` |
| GitHub Pages 호환성 검증 | 정적 파일 구성, 경로, 외부 의존성 | Pages 제약에 맞게 경로/자산 설계 | 로컬 정적 서버와 호환성 점검 | 배포 준비 상태 | 서버 의존성 없이 동작 | `DEPLOY_READY` |
| 배포 | 배포 권한, 저장소 설정, Pages 대상 | 배포 수행 또는 배포 절차 문서화 | 배포 성공 여부, 캐시 반영 확인 | 배포 완료 | 공개 URL 접근 가능 | `DEPLOYED` 또는 `BLOCKED` |

## 9. 권장 루프 순서

1. 저장소 및 기존 파일 확인
2. 정적 사이트 기본 구조
3. 프로페셔널 콘텐츠 영역
4. 반응형 내비게이션
5. Games 탭
6. 지렁이 게임 핵심 로직
7. 키보드 조작
8. 모바일 터치 조작
9. 게임 UI 및 점수
10. 접근성과 반응형 검증
11. GitHub Pages 호환성 검증
12. 배포

## 10. 가장 안전한 첫 번째 루프

가장 안전한 첫 번째 루프는 `저장소 및 기존 파일 확인`이다.

이유:

- 구현보다 선행되어야 하는 입력 자료와 제약이 드러난다.
- 기존 구조를 건드리지 않고도 진행 가능하다.
- 개인 콘텐츠와 게임 종류의 충돌 여부를 조기에 발견할 수 있다.
- GitHub Pages 설정이나 저장소 권한 문제를 가장 먼저 식별할 수 있다.

## 11. 게임 요구사항 반영 방식

현재 대화에는 `지렁이 게임`과 `테트리스 게임` 요구가 함께 있다. 이 둘은 서로 다른 게임이므로, 본 설계에서는 다음처럼 처리한다.

- `Games` 탭은 공통 진입점으로 둔다.
- 첫 번째 게임은 하나만 우선 구현한다.
- 나머지 게임은 `게임 추가 가능` 슬롯으로 남긴다.
- 어떤 게임을 1순위로 할지는 `[사람 확인 필요]`로 둔다.

## 12. 상태 판정 예시

| 상황 | 상태 |
|---|---|
| 파일 구조가 확인되지 않음 | `READY` |
| HTML 섹션이 아직 없음 | `ACTING` |
| 반응형 메뉴를 수정했지만 검증 전 | `VERIFYING` |
| 동일한 오류가 반복됨 | `RETRYING` |
| 섹션과 콘텐츠가 모두 정상 | `PASSED` |
| 배포 준비는 됐지만 아직 배포 전 | `DEPLOY_READY` |
| 배포 절차 진행 중 | `DEPLOYING` |
| 배포 성공 | `DEPLOYED` |
| GitHub 권한이 막힘 | `BLOCKED` |
| 개인 콘텐츠 확인이 필요함 | `HITL_REQUIRED` |
## Self-Correcting TDD Loop

This section defines a Verifier-first, self-correcting TDD loop for the static GitHub Pages site in this repository.

Confirmed local tools in the current environment:

- `node` exists at `C:\Program Files\nodejs\node.exe`.
- `python` exists at `C:\Python314\python.exe`.
- `python3` is not available in this environment, so any local static server step should prefer `python -m http.server`.

Codex verifier availability policy:

- Do not assume a specific Codex model is available.
- Before using Codex as an independent verifier, resolve the actual model name that the available Codex surface accepts. [사람 확인 필요]
- Record the exact resolved model name used by the verifier run.
- In this design-only stage, do not run the model check yet; record the check as a required step in the loop.

### Verifier Sources

Use only verifier commands and surfaces that are actually available in the environment or directly implied by the installed tools.

Candidate verifier layers:

1. Filesystem and repository inspection with PowerShell.
2. Static text inspection with `rg`, `Get-Content`, and `Get-ChildItem`.
3. Local HTML/CSS/JS runtime checks using a local static server.
4. Browser verification when an interactive browser tool is available in the current session.
5. Codex as an independent verifier for code review and failure classification.

### Verification Policy

The verifier must not invent commands, npm scripts, or frameworks that do not exist in the repository.

Allowed only after discovery:

- A command may be used only if the repository or current environment proves it exists.
- A test script may be used only if it is present in package metadata or already executable from the repository.
- If a tool is missing, classify the failure as `ENVIRONMENT` rather than fabricating a workaround.

### Self-Correcting Loop

Each retry follows the same closed loop:

| Step | Input | Verifier / Act | Observe | Failure fingerprint | Reason | Next state |
|---|---|---|---|---|---|---|
| 1. Discover tools | Current repo files, available binaries, existing scripts | Inspect repository and environment only | Confirm which verifier commands are real | `tool-missing:<name>` | `TEST` or `ENVIRONMENT` | `READY` |
| 2. Baseline static validation | `index.html`, `styles.css`, `script.js`, optional game JS | Run only discovered static checks and parser checks | File presence, syntax, path validity | `html-missing`, `css-link-broken`, `js-link-broken` | `HTML_STRUCTURE` or `JAVASCRIPT` | `VERIFYING` |
| 3. Layout verification | Rendered desktop, tablet, mobile output | Check responsive breakpoints and overflow | Horizontal scroll, broken nav, hidden games UI | `responsive-overflow`, `nav-collapse` | `CSS_RESPONSIVE` | `VERIFYING` |
| 4. Game verification | Snake game state, controls, scores | Exercise game start, pause, restart, input handling | Control works, no duplicate loops, score updates | `game-control-fail`, `game-loop-dup` | `GAME_CONTROL` or `GAME_LOGIC` | `VERIFYING` |
| 5. Browser runtime check | Local static site in browser | Open site, inspect console, reload, navigate tabs | Console errors, null refs, broken anchors | `console-error:<message>`, `null-ref:<selector>` | `JAVASCRIPT`, `HTML_STRUCTURE`, or `GAME_LOGIC` | `VERIFYING` |
| 6. Independent Codex verifier | Current diff and captured logs | Ask Codex to classify the issue and suggest one fix only | Compare with local findings | `codex-review-mismatch` | `TEST` | `VERIFYING` |
| 7. Retry or stop | Failure classification and fingerprints | Apply minimal fix if allowed, otherwise stop | Re-run the same verifier set | repeated fingerprint or max retry | `UNKNOWN` if unresolved | `RETRYING` or `PASSED` |

### Required Failure Log Fields

For every failed verifier run, capture:

- 실행 명령어
- exit code
- 실패한 검증 항목
- 핵심 오류 메시지
- 관련 파일과 라인
- 브라우저 콘솔 메시지
- 오류 fingerprint

### Minimum Fix Rule

On each retry:

- Fix exactly one root cause.
- Change only the smallest related file set.
- Do not delete tests or relax the verifier.
- Do not rewrite the entire site.
- Do not switch to a new framework or architecture.

### Retry Policy

- Maximum 3 retries per unique error.
- Stop if the same fingerprint repeats twice.
- Each retry must record the hypothesis, changed files, commands, and result.
- Environment or permission failures must not be solved by code edits.

### Verifier Checklist by Area

#### 1. Basic File Validation

- Root `index.html` exists.
- `index.html` links to CSS and JavaScript with valid relative paths.
- No broken local file paths.
- No case mismatches in filenames or references.
- No absolute local filesystem paths that would fail on GitHub Pages.

#### 2. HTML Validation

- Document has a valid `<!doctype html>` and root structure.
- `title` exists.
- `meta viewport` exists.
- Semantic layout elements exist.
- Navigation links point to real sections.
- Games area exists.
- Images have `alt` text.
- Internal links do not point to missing IDs.

#### 3. CSS Validation

- Layout remains usable on desktop, tablet, and mobile widths.
- No unintended horizontal scroll.
- Navigation remains usable when narrow.
- Games UI remains responsive.

#### 4. JavaScript Validation

- No syntax errors.
- No console errors on page load.
- No null DOM references.
- No duplicate event listeners when reopening Games.
- Load-time code executes safely.

#### 5. Snake Game Validation

- Game starts.
- Game pauses.
- Game restarts.
- Score increases.
- Food appears.
- Wall and self-collision end the game.
- Keyboard arrows or WASD work.
- Mobile button or touch input works.
- Immediate reverse direction is blocked.
- Reopening Games does not create duplicate game loops.

#### 6. Local Runtime Validation

- Local static server can serve the site.
- `index.html` loads over HTTP.
- CSS and JavaScript responses succeed.

#### 7. Browser Validation

Inspect at approximately:

- Mobile: 375px
- Tablet: 768px
- Desktop: 1440px

#### 8. GitHub Pages Compatibility

- Root `index.html` exists.
- Paths are relative.
- No server-only features.
- No local filesystem dependencies.
- No backend API dependencies.

### Suggested Verifier Sequence

1. Repository discovery.
2. File existence and path validation.
3. HTML parse and anchor validation.
4. CSS responsive checks at mobile, tablet, desktop widths.
5. JavaScript parse and runtime checks.
6. Snake game interaction checks.
7. Local HTTP serving checks.
8. Browser console inspection.
9. Codex independent review.
10. GitHub Pages compatibility review.

### Stop Conditions

Stop the loop when any of these happen:

- All checks pass.
- Maximum retries are exhausted.
- The same fingerprint repeats twice.
- Personal content needs human confirmation.
- GitHub authentication or deployment permission blocks progress.

### Required Recording Format

For each retry, record:

- Hypothesis
- Changed files
- Executed commands
- Result
- Fingerprint
- Next action

### GitHub Pages Safety Rule

If a failure is caused by GitHub permission, deployment restriction, or repository configuration that cannot be fixed locally, classify it as `GITHUB_PERMISSION` or `DEPLOYMENT` and stop instead of forcing code changes.
