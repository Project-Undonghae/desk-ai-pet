# DAP 랜딩 페이지

이 저장소의 `gh-pages` 브랜치가 DAP 랜딩 페이지의 배포 원본입니다.
랜딩 화면과 공개 문서는 이 저장소에서 직접 수정하며, GitHub Pages가 저장소 루트를 배포합니다.

- 서비스: https://project-undonghae.github.io/desk-ai-pet/
- 앱 설치 파일: 이 저장소의 GitHub Releases
- 앱 소스: `Project-Undonghae/mydeskpet` (랜딩을 배포하지 않음)

`downloads/` 폴더는 기존 다운로드 메타데이터를 위해 유지합니다.

최신 안정 릴리스의 다운로드 정보와 페이지 버전 표시는 `node scripts/sync-release-metadata.mjs`로 동기화합니다. 공개 API는 토큰 없이 사용할 수 있으며, API 제한이 걸리면 `GITHUB_TOKEN` 또는 `GH_TOKEN`을 설정합니다.

검증: `node --test scripts/sync-release-metadata.test.mjs`

현재 사이트는 공개 설치본을 직접 제공하지 않고 v1.7.1 웨이팅리스트를 안내합니다. 다음 공개 빌드는 macOS Apple Silicon부터 준비하며 Windows 일정은 후속 안내합니다. v1.6.26은 마지막 Intel Mac 공개 릴리스이고, 이전 다운로드·체크섬 기록과 기존 GitHub 릴리스 파일은 보존합니다.

v1.7.1 개발 미리보기는 공개 배포와 구분합니다. 실제 산출물·서명·공증을 확인하기 전에는 초안 설치 파일로 연결하지 않으며, 버튼은 공식 이메일을 여는 웨이팅리스트로 유지합니다.

## 제품 시연 이미지

`screenshots/product-scenes/`의 랜딩 시연 이미지는 macOS에서 v1.7.1 개발 빌드(앱 소스 `265f1582e`)의 실제 렌더러를 캡처한 것입니다. 격리된 예시 프로젝트에서 모델 응답을 재현하되, Crew의 하위 세션 생성·진행 상태·보고 전달·최종 답변 표시는 실제 앱 흐름입니다. 화면에 들어온 시연만 순서대로 재생되며, 일시 정지와 장면 선택 및 원본 크기 보기를 지원합니다.
