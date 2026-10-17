# DAP 랜딩 페이지

이 저장소의 `gh-pages` 브랜치가 DAP 랜딩 페이지의 배포 원본입니다.
랜딩 화면과 공개 문서는 이 저장소에서 직접 수정하며, GitHub Pages가 저장소 루트를 배포합니다.

- 서비스: https://project-undonghae.github.io/desk-ai-pet/
- 앱 설치 파일: 이 저장소의 GitHub Releases
- 앱 소스: `Project-Undonghae/mydeskpet` (랜딩을 배포하지 않음)

`downloads/` 폴더는 기존 다운로드 메타데이터를 위해 유지합니다.

최신 안정 릴리스의 다운로드 정보와 페이지 버전 표시는 `node scripts/sync-release-metadata.mjs`로 동기화합니다. 공개 API는 토큰 없이 사용할 수 있으며, API 제한이 걸리면 `GITHUB_TOKEN` 또는 `GH_TOKEN`을 설정합니다.

검증: `node --test scripts/sync-release-metadata.test.mjs`
