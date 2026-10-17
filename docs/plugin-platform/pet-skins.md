# DAP 스킨·캐릭터 페르소나 API

구현 대상: 스킨·성격·말투 DAP **1.6.0+**, 캐릭터 이름·자기 지칭 전환 **1.6.1+**. Plugin Platform **0.4.0**, manifest **v2** 유지. `ctx.host.petSkins.apiVersion === 2`로 기능을 확인합니다. 공식 릴리스 저장소: `Project-Undonghae/desk-ai-pet`.

## 플러그인이 사용하는 계약

`plugin.yaml`에 `pet.skin` 권한을 선언합니다. 선택창이 필요하면 `window.palette`도 선언합니다. `min_app_version: "1.6.0"`을 지정하세요. 새 manifest 필드는 필요하지 않습니다.

```ts
const api = ctx.host.petSkins;
const registration = await api.registerSkin(definition);
await registration.apply({ usePersona: true });
await registration.apply({ usePersona: false }); // 외형만 사용
await registration.reset(); // 자신이 현재 적용한 경우 기본 외형·말투 복원
await registration.dispose(); // 자신의 등록·활성 외형 정리
```

| 메서드 | 의미 |
|---|---|
| `registerSkin(definition)` | 검증 후 등록. 아직 적용하지 않음 |
| `registration.id` | `${pluginId}.${definition.id}` |
| `apply({usePersona})` | 외형·말투를 한 번에 전환. 마지막 적용 우선 |
| `reset()` / `dispose()` | 다른 플러그인의 활성 스킨을 지우지 않음 |
| `getActiveSkin()` | 활성 qualified id 또는 `null` |
| `getActivePersona()` | 캐릭터 말투를 쓰는 qualified id 또는 `null` |
| `onDidChange(callback)` | 변경 구독, 구독 해제 함수 반환 |

`activate()`가 반환하는 cleanup에서 등록과 구독을 해제하세요. 호스트도 비활성화·활성화 실패·앱 종료 때 해당 플러그인 소유 자원을 정리합니다. 호스트는 스킨을 영구 저장하지 않습니다. 플러그인은 사용자 적용 선택을 자기 설정에 저장하고 다음 활성화 때 다시 등록할 수 있습니다.

## 스킨 데이터

```ts
interface PetSkinDefinition {
  id: string; displayName: string; schemaVersion: 1;
  spritesheetPath: string;
  cell: { width: number; height: number };
  grid: { columns: number; rows: number };
  animations: Record<string, { row: number; holdsMs: number[] }>;
  look?: { startRow: number; directions: 16; startAngleDegrees: 0; clockwise: true };
  persona?: CharacterPersona;
}
interface CharacterPersona {
  id: string; displayName: string; interpretation: string;
  traits: string[]; speakingStyle: string; contextHint: string;
  examples: { greeting: string; encourage: string; task: string; failed: string };
}
```

`spritesheetPath`는 플러그인 폴더 내부 PNG 상대 경로입니다. URL·절대 경로·상위 경로·외부로 나가는 심볼릭 링크를 거부합니다. PNG 헤더와 실제 디코딩 크기가 `cell × grid`와 같아야 합니다.

| 제한 | 값 |
|---|---|
| 등록 수 | 플러그인당 최대 16 |
| PNG | 최대 8,000,000 bytes, 한 변 4096px, 전체 16,000,000 pixels 이하 |
| grid | 최대 8열 × 11행 |
| 프레임 시간 | 각 20~5000ms, 한 모션 최대 grid 열 수 |
| 정의 JSON | 64KiB 이하, 알 수 없는 필드 거부 |
| persona | skin과 같은 id, traits 1~8개, contextHint·speakingStyle 각각 300자 이하 |

`idle` 모션은 필수입니다. 나머지 모션이 없으면 `idle`로 돌아갑니다. `look` 데이터는 검증하지만 **실제 데스크톱 펫에서는 아직 사용하지 않습니다**. 치이카와 팩의 선택창은 이를 이용해 16방향 시선을 미리 보여줍니다.

| DAP 상태 | 스킨 모션 |
|---|---|
| walk + flip false / true | running-right / running-left |
| working / working_v2 | running |
| thinking / headtilt | review |
| happy / success | waving |
| grabbed | waiting |
| error | failed |
| jumping | jumping |
| 그 외 | idle |

## 앱에 추가한 연결

- `packages/plugins`: 타입 내보내기, `pet.skin` 권한에 따른 per-plugin API 노출.
- `electron/main/plugin-pet-skins.ts`: 입력·경로·PNG 검증, 소유권, 활성 스킨·페르소나, 수명 관리.
- `main.ts` / `app.ts`: 기존 appearance IPC와 펫 엔진에 연결. 스킨 적용 시 130px 일반 펫, 기본 외형 선택 시 기존 설정 복원. 초기 자동 적용도 엔진 크기에 반영.
- `renderer/pet-view.ts`: Canvas로 원본 프레임별 시간 재생. 기존 이동·드래그·래디얼·말풍선 경로 유지. 늦게 도착한 초기 외형 조회가 최신 변경을 덮지 않도록 처리.
- `chat-pipeline.ts`: 사용자 대화와 먼저 거는 대화의 시작에 캐릭터 페르소나 고정. 진행 중인 대화는 유지하고 다음 대화부터 새 선택 반영.
- `headless-cli.ts` / `antigravity-cli.ts`: 일반 대화·스트리밍·도구 사용 대화에 캐릭터 스타일 적용. 구조화 분류·요약·일반 생성 경로에는 적용하지 않음.

캐릭터 페르소나는 임시 이름·정체성·성격·말투 계층입니다. `usePersona: true`이면 `persona.displayName`을 대화창 이름, 스트리밍/기록 재생 화자, AI 자기소개·자기 지칭에 적용합니다. 이전 펫 이름과 종족 표현은 현재 정체성에서 제외합니다. 사용자 이름·사용자에 대한 호칭·기억, 작업 정확성·권한을 우선합니다. 기존 `persona.json`과 기억 저장 형식은 변경하지 않으며, 캐릭터를 부르는 말로 기본 펫 이름을 자동 학습하지 않습니다. 말투 옵션을 끄거나 reset/dispose/플러그인 비활성화 시 기존 이름과 말투가 복원됩니다. 진행 중인 답변의 이름은 대화 시작 시 선택으로 고정하며 다음 대화부터 새 캐릭터를 사용합니다. manifest와 API 버전 변경은 없습니다.

## 11개 캐릭터 팩

치이카와·하치와레·우사기·모몽가·시사·랏코·쿠리만쥬·세이렌·후루혼야·아노코·데카츠요. 각자 9개 모션, 원본 가변 프레임 시간, 성격·말투·예시 대사를 제공합니다. 말투는 서비스용 해석이며, 세이렌·아노코·데카츠요는 창작 초안임을 표시합니다.

원본 PNG 합계 약 25.9MB이며 공개 플러그인 ZIP에는 포함하지 않습니다. [Chiikawa Friends](https://github.com/o-min222/dap-chiikawa-friends)는 코드만 GitHub·DAP 카탈로그로 배포하고, 사용자가 선택창에서 원본 저장소 다운로드를 요청하면 고정 커밋의 이미지를 받아 해시를 검증합니다. 공개 DAP 앱·릴리스에도 이미지를 포함하지 않습니다.

근거: [DAP 개발 가이드](https://project-undonghae.github.io/desk-ai-pet/developers.html#ai-build), [원본 에셋](https://github.com/heelee912/chiikawa-dots-pets), [공식 캐릭터 소개](https://www.chiikawaofficial.com/characters).
