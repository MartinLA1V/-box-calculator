let focused = 'robot';
const robotInput = document.getElementById('robot');
const dasInput   = document.getElementById('das');
const innerInput = document.getElementById('inner');

/* 0) 뷰포트 높이 동기화 (iOS 주소창 대응) */
function setVhUnit() {
  const h = (window.visualViewport?.height ?? window.innerHeight) * 0.01;
  document.documentElement.style.setProperty('--vh', `${h}px`);
}
setVhUnit();
window.addEventListener('resize', setVhUnit);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setVhUnit);
  window.visualViewport.addEventListener('scroll', setVhUnit);
}

/* 1) 입력 필드 자동 너비 */
function autoResizeInput(el) {
  const span = document.createElement("span");
  span.style.visibility = "hidden";
  span.style.position = "fixed";
  span.style.whiteSpace = "pre";
  span.style.font = window.getComputedStyle(el).font;
  span.textContent = el.value || el.placeholder || "0";
  document.body.appendChild(span);
  el.style.width = `${span.offsetWidth}px`;
  document.body.removeChild(span);
}

/* 2) 포커스 표시 */
robotInput.onclick = () => { focused = 'robot'; updateFocusStyle('robot'); document.getElementById('robot-box-container').classList.remove('dimmed-input'); };
dasInput.onclick   = () => { focused = 'das';   updateFocusStyle('das');   document.getElementById('das-box-container').classList.remove('dimmed-input'); };
innerInput.onclick = () => { focused = 'inner'; updateFocusStyle('inner'); };

function updateFocusStyle(targetId) {
  ['robot', 'das', 'inner'].forEach(id => document.getElementById(id).classList.remove('input-selected'));
  document.getElementById(targetId).classList.add('input-selected');
}
function clearFocusStyle() {
  ['robot', 'das', 'inner'].forEach(id => document.getElementById(id).classList.remove('input-selected'));
}

/* 3) 숫자 입력/삭제/초기화 */
function press(num) {
  // ※ 한글 주석: 포커스된 입력창에 숫자 추가 (inner 포함)
  const el = document.getElementById(focused);
  el.value = (el.value === '0') ? `${num}` : el.value + num;
  el.scrollLeft = el.scrollWidth;
  autoResizeInput(el);
}
function backspace() {
  // ✅ inner 도 백스페이스 허용 (기존의 if (focused === 'inner') return; 제거)
  const el = document.getElementById(focused);
  if (!el) return;
  const current = el.value;
  el.value = current.length <= 1 ? "0" : current.slice(0, -1);
  autoResizeInput(el);
}

// 🧩 공통 기본값 상수
const DEFAULT_INNER = 12;

// 🧩 inner 값/기본값/속성값을 동시에 세팅하는 유틸
function setInner(v = DEFAULT_INNER) {
  // 현재값
  innerInput.value = String(v);
  // 폼 리셋/기본값 참조 대비
  innerInput.defaultValue = String(v);
  // 속성 자체도 바꿔서 DOM 어트리뷰트 기준 로직이 있어도 안전
  innerInput.setAttribute('value', String(v));
  // 가변 폭 조정 함수 호출(있다면)
  if (typeof autoResizeInput === 'function') autoResizeInput(innerInput);
}

function clearInner() {
  // ✅ 항상 12로
  setInner(DEFAULT_INNER);
}

function clearAll() {
  // ✅ 값 초기화
  robotInput.value = "0";
  dasInput.value   = "0";
  setInner(DEFAULT_INNER); // inner=12 유지

  const totalEl = document.getElementById('total');
  totalEl.textContent = "0";
  totalEl.style.display = 'none';

  // ✅ 전환 끊김 방지: 초기화 순간 전환 OFF
  const rb = document.getElementById('robot-box-container');
  const db = document.getElementById('das-box-container');
  rb.classList.add('no-anim');
  db.classList.add('no-anim');

  // ✅ 결과/클래스 일괄 리셋 (전환 없이 한 번에 스냅)
  ['robot', 'das'].forEach(id => {
    document.getElementById(`${id}-box`).innerText    = "0";
    document.getElementById(`${id}-rem`).innerText    = "0";
    document.getElementById(`${id}-remove`).innerText = "0";

    const res = document.getElementById(`${id}-result`);
    const box = document.getElementById(`${id}-box-container`);
    res.style.display = 'none';
    res.classList.remove('dimmed');
    box.classList.remove('dimmed-input', 'expanded');
  });

  clearFocusStyle();

  // ✅ 입력 폭 재계산
  [robotInput, dasInput, innerInput].forEach(autoResizeInput);
  setInner(DEFAULT_INNER); // 최종 보정

  // ✅ 다음 프레임에 전환 복구 (향후 애니메이션은 정상 작동)
  //    - 강제 리플로우로 현재 상태 확정 후, rAF에서 클래스 제거
  void rb.offsetHeight; void db.offsetHeight; // 강제 리플로우
  requestAnimationFrame(() => {
    rb.classList.remove('no-anim');
    db.classList.remove('no-anim');
  });
}


/* 4) 계산 & 확장 */
function calculate() {
  const robot = parseInt(robotInput.value) || 0;
  const das   = parseInt(dasInput.value)   || 0;
  const inner = parseInt(innerInput.value || DEFAULT_INNER) || DEFAULT_INNER;

  if (inner === 0) {
    alert("inner pack 수량은 1 이상이어야 합니다.");
    return;
  }

  const total = robot + das;
  const totalEl = document.getElementById('total');
  totalEl.textContent = total;
  totalEl.style.display = 'flex';

  // 결과 보이기 → 강제 리플로우 → 다음 프레임에 확장
  ['robot', 'das'].forEach(id => {
    const res = document.getElementById(`${id}-result`);
    const box = document.getElementById(`${id}-box-container`);
    res.style.display = 'flex';
    void box.offsetHeight;
    requestAnimationFrame(() => { box.classList.add('expanded'); });
  });

  // 값 계산/표시
  ['robot', 'das'].forEach(id => {
    const val = parseInt(document.getElementById(id).value) || 0;
    const box = Math.floor(val / inner);
    const rem = val % inner;
    const remove = rem === 0 ? 0 : inner - rem;

    document.getElementById(`${id}-box`).innerText    = box;
    document.getElementById(`${id}-rem`).innerText    = rem;
    document.getElementById(`${id}-remove`).innerText = remove;

    const resultBox = document.getElementById(`${id}-result`);
    const inputBox  = document.getElementById(`${id}-box-container`);
    if (val === 0) {
      resultBox.classList.add('dimmed');
      inputBox.classList.add('dimmed-input');
    } else {
      resultBox.classList.remove('dimmed');
      inputBox.classList.remove('dimmed-input');
    }
  });

  clearFocusStyle();
}

/* 5) Unshipped 모달 (요청: 적용 안 해도 됨 → 기존 유지) */
function closeUnshipped() {
  document.getElementById("unshipped-modal").style.display = "none";
}
function handleUnshipped() {
  const robotVal = parseInt(document.getElementById("robot").value) || 0;
  const dasVal   = parseInt(document.getElementById("das").value)   || 0;
  const innerVal = parseInt(document.getElementById("inner").value) || 0;

  const totalPicking = robotVal + dasVal;

  document.getElementById("unshipped-modal").style.display = "flex";
  document.getElementById("preview-total-picking").innerHTML = `<strong>총 피킹 수량: ${totalPicking}개</strong>`;

  document.getElementById("unshipped-robot").value = robotVal;
  document.getElementById("unshipped-das").value   = dasVal;
  document.getElementById("unshipped-inner").value = innerVal || 1;

  document.getElementById("unshipped-result").innerHTML = "";

  updateBoxInfo();
}
function calculateUnshipped() {
  const robot     = parseInt(document.getElementById("unshipped-robot").value)     || 0;
  const das       = parseInt(document.getElementById("unshipped-das").value)       || 0;
  const inner     = parseInt(document.getElementById("unshipped-inner").value)     || 0;
  const available = parseInt(document.getElementById("unshipped-available").value) || 0;

  const totalPicking = robot + das;
  document.getElementById("preview-total-picking").innerHTML = `<strong>총 피킹 수량: ${totalPicking}개</strong>`;

  if (inner <= 0) {
    alert("inner pack은 1 이상이어야 합니다.");
    return;
  }

  const extraPicking = Math.max(totalPicking - available, 0);

  let extraInfoEl = document.getElementById("extra-picking-info");
  if (!extraInfoEl) {
    const previewArea = document.querySelector(".input-preview");
    extraInfoEl = document.createElement("p");
    extraInfoEl.id = "extra-picking-info";
    previewArea.appendChild(extraInfoEl);
  }
  extraInfoEl.innerHTML = `<strong>추가 피킹 수량: ${extraPicking}개</strong>`;

  let remaining = available;
  const robotPicked = Math.min(robot, remaining);
  remaining -= robotPicked;

  const dasPicked = Math.min(das, remaining);
  remaining -= dasPicked;

  const robotShort = robot - robotPicked;
  const dasShort   = das - dasPicked;

  let robotStatus = `✅ robot: 피킹 완료`;
  let dasStatus   = `✅ das: 피킹 완료`;

  if (robotShort > 0) {
    const robotBox = Math.floor(robotShort / inner);
    const robotEa  = robotShort % inner;
    robotStatus = `❗ robot: 추가 피킹 ${robotShort}개 (${robotBox}box / ${robotEa}ea)`;
  }

  if (dasShort > 0) {
    const dasBox = Math.floor(dasShort / inner);
    const dasEa  = dasShort % inner;
    dasStatus = `❗ das: 추가 피킹 ${dasShort}개 (${dasBox}box / ${dasEa}ea)`;
  }

  const result = `
    <p>${robotStatus}<br>${dasStatus}</p>
    ${extraPicking > 0
      ? `<p><strong>🚨 아직 ${extraPicking}개 더 피킹이 필요합니다.</strong></p>`
      : `<p>🎉 현재 수량으로 피킹이 충분합니다.</p>`}
  `;
  document.getElementById("unshipped-result").innerHTML = result;
}
function updateBoxInfo() {
  const robot = parseInt(document.getElementById("unshipped-robot").value) || 0;
  const das   = parseInt(document.getElementById("unshipped-das").value)   || 0;
  const inner = parseInt(document.getElementById("unshipped-inner").value) || 1;

  const robotBox = Math.floor(robot / inner);
  const robotEa  = robot % inner;
  const dasBox   = Math.floor(das / inner);
  const dasEa    = das % inner;

  document.getElementById("robot-box-info").innerText = `${robotBox}box / ${robotEa}ea`;
  document.getElementById("das-box-info").innerText   = `${dasBox}box / ${dasEa}ea`;
}

/* 6) iOS(WebKit) 터치 → 클릭 위임 (간헐적 click 스킵 대응) */
(function ensureIOSClick() {
  const selectors = [
    '.keypad button', '.clear-inner-btn', '.backspace-btn',
    '.unshipped-btn', '.modal .close-btn', '.modal button'
  ];
  const buttons = document.querySelectorAll(selectors.join(','));
  buttons.forEach(btn => {
    btn.addEventListener('touchend', (e) => {
      if (e.cancelable) e.preventDefault();
      btn.click();
    }, { passive: false });
  });
})();

/* 7) iOS Standalone(홈 추가)에서 확대/스크롤 전면 금지 */
(function lockIOSGestures() {
  // ※ 한글 주석: iOS 홈 추가 여부 확인 (사파리 탭에서는 과도하므로 standalone일 때만)
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  if (!isStandalone) return;

  // body/html에 클래스 부여 → CSS에서 고정 처리
  document.documentElement.classList.add('standalone');
  document.body.classList.add('standalone');

  // 핀치 제스처 확대 차단
  const blockGesture = (e) => { e.preventDefault(); };
  document.addEventListener('gesturestart', blockGesture, { passive: false });
  document.addEventListener('gesturechange', blockGesture, { passive: false });
  document.addEventListener('gestureend', blockGesture, { passive: false });

  // 더블탭 확대 차단
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 350) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // 스크롤/바운스 차단
  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });

  // 두 손가락 시작 확대 즉시 차단
  document.addEventListener('touchstart', function(e) {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
})();

/* 8) 초기 상태 */
window.onload = () => {
  // ✅ 시작할 때부터 12로 확정(현재값/기본값/속성 모두)
  setInner(DEFAULT_INNER);

  [robotInput, dasInput, innerInput].forEach(autoResizeInput);
  document.getElementById('robot-result').style.display = 'none';
  document.getElementById('das-result').style.display   = 'none';
  document.getElementById('total').style.display        = 'none';
  document.getElementById('robot-box-container').classList.remove('expanded');
  document.getElementById('das-box-container').classList.remove('expanded');
};
