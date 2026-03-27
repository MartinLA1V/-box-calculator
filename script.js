let focused = 'robot';
const robotInput = document.getElementById('robot');
const dasInput   = document.getElementById('das');
const innerInput = document.getElementById('inner');

// 🔒 계산 후 입력 잠금 상태
let isLocked = false;

// 한글 주석: inner pack 빠른 선택용 옵션
const INNER_PACK_OPTIONS = [12, 15, 16, 18];

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

/* 1-1) INNER PACK 선택 필드 생성 */
function createInnerPackOptions() {
  if (document.getElementById('inner-pack-options')) return;

  const wrap = document.createElement('div');
  wrap.id = 'inner-pack-options';
  wrap.style.display = 'none';
  wrap.style.position = 'absolute';
  wrap.style.left = '50%';
  wrap.style.transform = 'translateX(-50%)';
  wrap.style.marginTop = '8px';
  wrap.style.padding = '8px';
  wrap.style.background = '#ffffff';
  wrap.style.border = '1px solid #d0d0d0';
  wrap.style.borderRadius = '8px';
  wrap.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
  wrap.style.zIndex = '200';
  wrap.style.display = 'none';
  wrap.style.gap = '6px';
  wrap.style.flexWrap = 'wrap';
  wrap.style.justifyContent = 'center';
  wrap.style.minWidth = '220px';

  INNER_PACK_OPTIONS.forEach((num) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = String(num);
    btn.style.padding = '8px 12px';
    btn.style.border = '1px solid #999';
    btn.style.borderRadius = '6px';
    btn.style.background = '#fff';
    btn.style.color = '#333';
    btn.style.fontSize = '14px';
    btn.style.cursor = 'pointer';

    // 한글 주석: 클릭으로 inner pack 값 즉시 적용
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectInnerPack(num);
    });

    // 한글 주석: iOS 터치 대응
    btn.addEventListener('touchend', function(e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      selectInnerPack(num);
    }, { passive: false });

    wrap.appendChild(btn);
  });

  const innerPackArea = document.querySelector('.inner-pack');
  if (innerPackArea) {
    innerPackArea.style.position = 'relative';
    innerPackArea.appendChild(wrap);
  }
}

function showInnerPackOptions() {
  const wrap = document.getElementById('inner-pack-options');
  if (!wrap) return;
  wrap.style.display = 'flex';
}

function hideInnerPackOptions() {
  const wrap = document.getElementById('inner-pack-options');
  if (!wrap) return;
  wrap.style.display = 'none';
}

function toggleInnerPackOptions() {
  const wrap = document.getElementById('inner-pack-options');
  if (!wrap) return;
  wrap.style.display = (wrap.style.display === 'flex') ? 'none' : 'flex';
}

function selectInnerPack(value) {
  setInner(value);
  focused = 'inner';
  updateFocusStyle('inner');
  hideInnerPackOptions();
}

/* 2) 포커스 표시 */
robotInput.onclick = () => {
  // 한글 주석: 잠금 상태면 ROBOT은 수정 모드로 전환
  if (isLocked) {
    enterEditMode('robot');
    return;
  }
  focused = 'robot';
  updateFocusStyle('robot');
  document.getElementById('robot-box-container').classList.remove('dimmed-input');
  hideInnerPackOptions();
};

dasInput.onclick = () => {
  // 한글 주석: 잠금 상태면 DAS는 수정 모드로 전환
  if (isLocked) {
    enterEditMode('das');
    return;
  }
  focused = 'das';
  updateFocusStyle('das');
  document.getElementById('das-box-container').classList.remove('dimmed-input');
  hideInnerPackOptions();
};

innerInput.onclick = (e) => {
  e.stopPropagation();

  // 한글 주석: 계산 후에도 inner pack 수정 가능하게 편집 모드 전환
  if (isLocked) {
    enterEditMode('inner');
  }

  focused = 'inner';
  updateFocusStyle('inner');
  toggleInnerPackOptions();
};

function updateFocusStyle(targetId) {
  ['robot', 'das', 'inner'].forEach(id => document.getElementById(id).classList.remove('input-selected'));
  document.getElementById(targetId).classList.add('input-selected');
}

function clearFocusStyle() {
  ['robot', 'das', 'inner'].forEach(id => document.getElementById(id).classList.remove('input-selected'));
}

/* 2-1) 계산 결과가 나온 상태에서 다시 수정할 수 있게 편집 모드로 전환 */
function enterEditMode(target) {
  // 한글 주석: 잠금 해제
  isLocked = false;

  const totalEl = document.getElementById('total');
  totalEl.style.display = 'none';

  ['robot', 'das'].forEach(id => {
    const resultBox = document.getElementById(`${id}-result`);
    const boxContainer = document.getElementById(`${id}-box-container`);

    // 한글 주석: 결과 영역 숨기기
    resultBox.style.display = 'none';
    resultBox.classList.remove('dimmed');

    // 한글 주석: 펼쳐진 상태 해제
    boxContainer.classList.remove('expanded', 'dimmed-input');
  });

  focused = target;
  updateFocusStyle(target);
}

/* 2-2) 박스 전체 클릭 시 포커스 이동 / 계산 후 수정 모드 */
document.getElementById('robot-box-container').addEventListener('click', function() {
  // 한글 주석: 계산 후 잠금 상태면 수정 모드로 전환
  if (isLocked) {
    enterEditMode('robot');
    hideInnerPackOptions();
    return;
  }

  focused = 'robot';
  updateFocusStyle('robot');
  this.classList.remove('dimmed-input');
  hideInnerPackOptions();
});

document.getElementById('das-box-container').addEventListener('click', function() {
  // 한글 주석: 계산 후 잠금 상태면 수정 모드로 전환
  if (isLocked) {
    enterEditMode('das');
    hideInnerPackOptions();
    return;
  }

  focused = 'das';
  updateFocusStyle('das');
  this.classList.remove('dimmed-input');
  hideInnerPackOptions();
});

/* 3) 숫자 입력/삭제/초기화 */
function press(num) {
  // 한글 주석: 계산 완료 후에는 입력 막음
  if (isLocked) return;

  const el = document.getElementById(focused);
  el.value = (el.value === '0') ? `${num}` : el.value + num;
  el.scrollLeft = el.scrollWidth;
  autoResizeInput(el);

  // 한글 주석: 수동 입력 시 inner 옵션창은 닫기
  if (focused === 'inner') {
    hideInnerPackOptions();
  }
}

function backspace() {
  // 한글 주석: 계산 완료 후에는 백스페이스도 막음
  if (isLocked) return;

  const el = document.getElementById(focused);
  if (!el) return;
  const current = el.value;
  el.value = current.length <= 1 ? "0" : current.slice(0, -1);
  autoResizeInput(el);

  // 한글 주석: 수동 수정 시 inner 옵션창은 닫기
  if (focused === 'inner') {
    hideInnerPackOptions();
  }
}

// 🧩 공통 기본값 상수
const DEFAULT_INNER = 12;

// 🧩 inner 값/기본값/속성값을 동시에 세팅하는 유틸
function setInner(v = DEFAULT_INNER) {
  innerInput.value = String(v);
  innerInput.defaultValue = String(v);
  innerInput.setAttribute('value', String(v));
  if (typeof autoResizeInput === 'function') autoResizeInput(innerInput);
}

function clearInner() {
  // 한글 주석: 계산 완료 후에도 inner pack 초기화 가능하게 수정 모드 진입
  if (isLocked) {
    enterEditMode('inner');
  }

  setInner(DEFAULT_INNER);
  focused = 'inner';
  updateFocusStyle('inner');
  showInnerPackOptions();
}

function clearAll() {
  // 한글 주석: C 버튼을 누르면 잠금 해제
  isLocked = false;

  // ✅ 값 초기화
  robotInput.value = "0";
  dasInput.value   = "0";
  setInner(DEFAULT_INNER);

  const totalEl = document.getElementById('total');
  totalEl.textContent = "0";
  totalEl.style.display = 'none';

  // ✅ 전환 끊김 방지: 초기화 순간 전환 OFF
  const rb = document.getElementById('robot-box-container');
  const db = document.getElementById('das-box-container');
  rb.classList.add('no-anim');
  db.classList.add('no-anim');

  // ✅ 결과/클래스 일괄 리셋
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
  hideInnerPackOptions();

  // ✅ 입력 폭 재계산
  [robotInput, dasInput, innerInput].forEach(autoResizeInput);
  setInner(DEFAULT_INNER);

  // ✅ 다음 프레임에 전환 복구
  void rb.offsetHeight;
  void db.offsetHeight;
  requestAnimationFrame(() => {
    rb.classList.remove('no-anim');
    db.classList.remove('no-anim');
  });
}

/* 4) 계산 & 확장 */
function calculate() {
  const robot = parseInt(robotInput.value) || 0;
  const das   = parseInt(dasInput.value) || 0;
  const inner = parseInt(innerInput.value || DEFAULT_INNER) || DEFAULT_INNER;

  if (inner === 0) {
    alert("inner pack 수량은 1 이상이어야 합니다.");
    return;
  }

  // 한글 주석: 계산이 정상 실행되면 이후 입력 잠금
  isLocked = true;
  hideInnerPackOptions();

  const total = robot + das;
  const totalEl = document.getElementById('total');
  totalEl.textContent = total;
  totalEl.style.display = 'flex';

  ['robot', 'das'].forEach(id => {
    const res = document.getElementById(`${id}-result`);
    const box = document.getElementById(`${id}-box-container`);
    res.style.display = 'flex';
    void box.offsetHeight;
    requestAnimationFrame(() => {
      box.classList.add('expanded');
    });
  });

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

/* 5) Unshipped 모달 */
function closeUnshipped() {
  document.getElementById("unshipped-modal").style.display = "none";
}

function handleUnshipped() {
  // 한글 주석: 계산 완료 후에는 U 버튼도 막음
  if (isLocked) return;

  const robotVal = parseInt(document.getElementById("robot").value) || 0;
  const dasVal   = parseInt(document.getElementById("das").value) || 0;
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
  const robot     = parseInt(document.getElementById("unshipped-robot").value) || 0;
  const das       = parseInt(document.getElementById("unshipped-das").value) || 0;
  const inner     = parseInt(document.getElementById("unshipped-inner").value) || 0;
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
  const das   = parseInt(document.getElementById("unshipped-das").value) || 0;
  const inner = parseInt(document.getElementById("unshipped-inner").value) || 1;

  const robotBox = Math.floor(robot / inner);
  const robotEa  = robot % inner;
  const dasBox   = Math.floor(das / inner);
  const dasEa    = das % inner;

  document.getElementById("robot-box-info").innerText = `${robotBox}box / ${robotEa}ea`;
  document.getElementById("das-box-info").innerText   = `${dasBox}box / ${dasEa}ea`;
}

/* 6) iOS(WebKit) 터치 → 클릭 위임 */
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
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  if (!isStandalone) return;

  document.documentElement.classList.add('standalone');
  document.body.classList.add('standalone');

  const blockGesture = (e) => { e.preventDefault(); };
  document.addEventListener('gesturestart', blockGesture, { passive: false });
  document.addEventListener('gesturechange', blockGesture, { passive: false });
  document.addEventListener('gestureend', blockGesture, { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 350) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchstart', function(e) {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
})();

/* 8) 바깥 클릭 시 INNER PACK 선택 필드 닫기 */
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('inner-pack-options');
  if (!wrap) return;

  const clickedInnerInput = e.target === innerInput;
  const clickedInsideOptions = wrap.contains(e.target);

  if (!clickedInnerInput && !clickedInsideOptions) {
    hideInnerPackOptions();
  }
});

/* 9) 초기 상태 */
window.onload = () => {
  setInner(DEFAULT_INNER);

  // 한글 주석: 페이지 최초 진입 시 잠금 해제 상태
  isLocked = false;

  createInnerPackOptions();

  [robotInput, dasInput, innerInput].forEach(autoResizeInput);
  document.getElementById('robot-result').style.display = 'none';
  document.getElementById('das-result').style.display   = 'none';
  document.getElementById('total').style.display        = 'none';
  document.getElementById('robot-box-container').classList.remove('expanded');
  document.getElementById('das-box-container').classList.remove('expanded');
};