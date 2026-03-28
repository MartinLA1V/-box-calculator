let focused = 'robot';
const robotInput = document.getElementById('robot');
const dasInput   = document.getElementById('das');
const innerInput = document.getElementById('inner');

// 🔒 계산 후 입력 잠금 상태
let isLocked = false;

// 한글 주석: inner pack 빠른 선택용 옵션
const INNER_PACK_OPTIONS = [12, 15, 16, 18];

// 한글 주석: U 버튼 눌렀을 때 보여줄 배수 기준값
const MULTIPLE_BASES = [12, 15, 16, 18];

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
  wrap.style.padding = '10px';

  // 한글 주석: 더 투명 + 블러 강화
  wrap.style.background = 'rgba(255,255,255,0.01)';
  wrap.style.backdropFilter = 'blur(7px)';

  wrap.style.borderRadius = '12px';
  wrap.style.boxShadow = 'none';
  wrap.style.zIndex = '200';

  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.flexWrap = 'wrap';
  wrap.style.justifyContent = 'center';
  wrap.style.minWidth = '420px';
  wrap.style.minHeight = '420px';

  INNER_PACK_OPTIONS.forEach((num) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = String(num);

    btn.style.width = '44px';
    btn.style.height = '44px';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.background = '#000';
    btn.style.color = '#fff';
    btn.style.fontSize = '16px';
    btn.style.fontWeight = '600';
    btn.style.cursor = 'pointer';

    // 한글 주석: 버튼 그림자 유지
    btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.35)';

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectInnerPack(num);
    });

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
  isLocked = false;

  const totalEl = document.getElementById('total');
  totalEl.style.display = 'none';

  ['robot', 'das'].forEach(id => {
    const resultBox = document.getElementById(`${id}-result`);
    const boxContainer = document.getElementById(`${id}-box-container`);

    // 한글 주석: 먼저 박스 축소
    boxContainer.classList.remove('expanded', 'dimmed-input');
    resultBox.classList.remove('dimmed');

    // 한글 주석: 축소 애니메이션 후 결과 숨김
    setTimeout(() => {
      resultBox.style.display = 'none';
    }, 220);
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

  // 한글 주석: 배수표 모달이 열려 있으면 같이 닫기
  closeUnshipped();

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

/* 5) U 버튼 모달: 12 / 15 / 16 / 18 배수표 10단계 */
function closeUnshipped() {
  const modal = document.getElementById("unshipped-modal");
  if (!modal) return;
  modal.style.display = "none";
}

function handleUnshipped() {
  const modal = document.getElementById("unshipped-modal");
  if (!modal) return;

  // 한글 주석: 기존 미출고 계산 관련 내용 전부 제거하고 배수표만 표시
  modal.innerHTML = `
    <div class="modal-content" style="width:min(92vw, 680px); max-height:85vh; overflow:auto;">
      <button class="close-btn" type="button" onclick="closeUnshipped()">닫기</button>

      <h3 style="margin:0 0 14px; text-align:center;">배수표</h3>

      <div style="overflow:auto;">
        <table style="
          width:100%;
          border-collapse:collapse;
          text-align:center;
          font-size:16px;
          font-weight:600;
        ">
          <thead>
            <tr>
              <th style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.18);">단계</th>
              <th style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.18);">12</th>
              <th style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.18);">15</th>
              <th style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.18);">16</th>
              <th style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.18);">18</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: 10 }, (_, idx) => {
              const step = idx + 1;
              return `
                <tr>
                  <td style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.08);">${step}</td>
                  <td style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.08);">${12 * step}</td>
                  <td style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.08);">${15 * step}</td>
                  <td style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.08);">${16 * step}</td>
                  <td style="padding:10px 6px; border-bottom:1px solid rgba(255,255,255,0.08);">${18 * step}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

/* 6) iOS(WebKit) 터치 → 클릭 위임 */
(function ensureIOSClick() {
  const selectors = [
    '.keypad button',
    '.clear-inner-btn',
    '.backspace-btn',
    '.unshipped-btn',
    '.modal .close-btn',
    '.modal button'
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