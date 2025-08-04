# Lottie Web 예제들

이 디렉토리에는 [lottie-web](https://github.com/airbnb/lottie-web) 라이브러리를 사용한 다양한 예제들이 포함되어 있습니다.

## 예제 파일들

### 1. lottie-web-example.html
기본적인 lottie-web 사용법을 보여주는 예제입니다.

**주요 기능:**
- 애니메이션 재생/일시정지/정지
- 애니메이션 생성/삭제
- 속도 조절
- 프레임 탐색
- 루프 설정
- 역방향 재생
- SVG/Canvas 내보내기

**사용법:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
```

### 2. lottie-web-advanced.html
고급 기능들을 포함한 예제입니다.

**주요 기능:**
- 여러 애니메이션 동시 제어
- 개별 애니메이션 컨트롤
- 실시간 성능 모니터링 (FPS, 메모리 사용량)
- 이벤트 로깅 시스템
- 애니메이션 상태 시각화
- 다양한 Lottie 애니메이션 샘플

**고급 기능:**
- 성능 모니터링 토글
- 이벤트 로그 실시간 확인
- 애니메이션별 상태 표시기
- 그리드 레이아웃으로 여러 애니메이션 표시

## lottie-web API 주요 메서드

### 애니메이션 로드
```javascript
const animation = lottie.loadAnimation({
  container: element,
  renderer: 'svg', // 'svg', 'canvas', 'html'
  loop: true,
  autoplay: true,
  path: 'animation.json'
});
```

### 재생 제어
```javascript
animation.play();        // 재생
animation.pause();       // 일시정지
animation.stop();        // 정지
animation.destroy();     // 삭제
```

### 속성 설정
```javascript
animation.setSpeed(2);           // 속도 설정
animation.setDirection(1);       // 방향 설정 (1: 정방향, -1: 역방향)
animation.goToAndStop(frame, true); // 특정 프레임으로 이동
```

### 이벤트 리스너
```javascript
animation.addEventListener('enterFrame', (e) => {
  console.log('현재 프레임:', e.currentTime);
});

animation.addEventListener('complete', () => {
  console.log('애니메이션 완료');
});

animation.addEventListener('loopComplete', () => {
  console.log('루프 완료');
});
```

## ThorVG vs lottie-web 비교

| 기능 | ThorVG | lottie-web |
|------|--------|------------|
| 렌더링 엔진 | ThorVG (C++ 기반) | Canvas/SVG/HTML |
| 성능 | 매우 빠름 (네이티브) | 빠름 |
| 파일 크기 | 작음 (WASM) | 중간 |
| 브라우저 지원 | WASM 지원 브라우저 | 모든 모던 브라우저 |
| 커스터마이징 | 제한적 | 매우 유연 |
| 커뮤니티 | 작음 | 매우 큼 |

## 사용 팁

1. **성능 최적화**
   - 많은 애니메이션을 동시에 재생할 때는 성능 모니터링을 활성화하세요
   - 필요하지 않은 애니메이션은 즉시 destroy() 호출하세요

2. **메모리 관리**
   - 애니메이션을 더 이상 사용하지 않을 때는 반드시 destroy()를 호출하세요
   - 이벤트 리스너도 함께 정리하세요

3. **에러 처리**
   - 애니메이션 로드 실패 시 'data_failed' 이벤트를 처리하세요
   - 네트워크 오류에 대비한 fallback을 준비하세요

## 참고 자료

- [lottie-web 공식 문서](https://github.com/airbnb/lottie-web)
- [LottieFiles](https://lottiefiles.com/) - 무료 Lottie 애니메이션
- [Lottie Web Player](https://lottiefiles.com/web-player) - 온라인 플레이어

## 라이선스

이 예제들은 MIT 라이선스 하에 제공됩니다. 