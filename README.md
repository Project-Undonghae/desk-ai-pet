# DAP 랜딩 페이지

이 저장소의 `gh-pages` 브랜치가 DAP 랜딩 페이지의 배포 원본입니다.
랜딩 화면과 공개 문서는 이 저장소에서 직접 수정하며, GitHub Pages가 저장소 루트를 배포합니다.

- 서비스: https://project-undonghae.github.io/desk-ai-pet/
- 앱 설치 파일: 이 저장소의 GitHub Releases
- 앱 소스: `Project-Undonghae/mydeskpet` (랜딩을 배포하지 않음)

`downloads/` 폴더는 기존 다운로드 메타데이터를 위해 유지합니다.

최신 안정 릴리스의 다운로드 정보와 페이지 버전 표시는 `node scripts/sync-release-metadata.mjs`로 동기화합니다. 공개 API는 토큰 없이 사용할 수 있으며, API 제한이 걸리면 `GITHUB_TOKEN` 또는 `GH_TOKEN`을 설정합니다.

검증: `node --test scripts/sync-release-metadata.test.mjs`

현재 사이트의 다운로드 대상은 Windows와 macOS Apple Silicon입니다. Intel Mac 신규 제공은 종료하며 v1.6.26이 마지막 Intel 릴리스입니다. 동기화는 Windows EXE와 arm64 DMG만 요구하고 게시합니다. 이전 버전의 다운로드·체크섬 기록과 기존 GitHub 릴리스 파일은 보존합니다.

개발 미리보기는 정식 다운로드와 분리합니다. v1.7.0은 아직 공개되지 않은 개발 체크포인트이므로 버전 메타데이터를 바꾸거나 초안 설치 파일로 연결하지 않습니다.
