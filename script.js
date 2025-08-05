let focused = 'robot';
const robotInput = document.getElementById('robot');
const dasInput = document.getElementById('das');
const innerInput = document.getElementById('inner');

robotInput.onclick = () => {
  focused = 'robot';
  updateFocusStyle('robot');
  document.getElementById('robot-box-container').classList.remove('dimmed-input');
};

dasInput.onclick = () => {
  focused = 'das';
  updateFocusStyle('das');
  document.getElementById('das-box-container').classList.remove('dimmed-input');
};

innerInput.onclick = () => {
  focused = 'inner';
  updateFocusStyle('inner');
};

function updateFocusStyle(targetId) {
  ['robot', 'das', 'inner'].forEach(id => {
    document.getElementById(id).classList.remove('input-selected');
  });
  document.getElementById(targetId).classList.add('input-selected');
}

function clearFocusStyle() {
  ['robot', 'das', 'inner'].forEach(id => {
    document.getElementById(id).classList.remove('input-selected');
  });
}

function press(num) {
  const el = document.getElementById(focused);
  el.value = (el.value === '0') ? `${num}` : el.value + num;
  el.scrollLeft = el.scrollWidth;
}

function clearAll() {
  robotInput.value = "0";
  dasInput.value = "0";
  innerInput.value = "0";
  document.getElementById('total').innerText = "0";

  ['robot', 'das'].forEach(id => {
    document.getElementById(`${id}-box`).innerText = "0";
    document.getElementById(`${id}-rem`).innerText = "0";
    document.getElementById(`${id}-remove`).innerText = "0";
    document.getElementById(`${id}-result`).classList.remove('dimmed');
    document.getElementById(`${id}-box-container`).classList.remove('dimmed-input');
  });

  clearFocusStyle();
}

function backspace() {
  if (focused === 'inner') return; // ❗ inner일 때는 무시

  const el = document.getElementById(focused);
  if (!el /* || el.readOnly */) return;

  const current = el.value;
  el.value = current.length <= 1 ? "0" : current.slice(0, -1);
}



function clearInner() {
  innerInput.value = "0";
}

function calculate() {
  const robot = parseInt(robotInput.value) || 0;
  const das = parseInt(dasInput.value) || 0;
  const inner = parseInt(innerInput.value) || 0;

  if (inner === 0) {
    alert("inner pack 수량은 1 이상이어야 합니다.");
    return;
  }

  const total = robot + das;
  document.getElementById('total').innerText = total;

  ['robot', 'das'].forEach(id => {
    const val = parseInt(document.getElementById(id).value) || 0;
    const box = Math.floor(val / inner);
    const rem = val % inner;
    const remove = rem === 0 ? 0 : inner - rem;

    document.getElementById(`${id}-box`).innerText = box;
    document.getElementById(`${id}-rem`).innerText = rem;
    document.getElementById(`${id}-remove`).innerText = remove;

    const resultBox = document.getElementById(`${id}-result`);
    const inputBox = document.getElementById(`${id}-box-container`);

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


function closeUnshipped() {
  document.getElementById("unshipped-modal").style.display = "none";
}

function handleUnshipped() {
  const robotVal = parseInt(document.getElementById("robot").value) || 0;
  const dasVal = parseInt(document.getElementById("das").value) || 0;
  const innerVal = parseInt(document.getElementById("inner").value) || 0;

  const totalPicking = robotVal + dasVal;

  document.getElementById("unshipped-modal").style.display = "flex";
  document.getElementById("preview-total-picking").innerHTML = `<strong>총 피킹 수량: ${totalPicking}개</strong>`;

  // 입력값 반영
  document.getElementById("unshipped-robot").value = robotVal;
  document.getElementById("unshipped-das").value = dasVal;
  document.getElementById("unshipped-inner").value = innerVal;

  // 결과 초기화
  document.getElementById("unshipped-result").innerHTML = "";

  // ✅ 박스/낱개 정보 초기 업데이트
  updateBoxInfo();
}


function calculateUnshipped() {
  const robot = parseInt(document.getElementById("unshipped-robot").value) || 0;
  const das = parseInt(document.getElementById("unshipped-das").value) || 0;
  const inner = parseInt(document.getElementById("unshipped-inner").value) || 0;
  const available = parseInt(document.getElementById("unshipped-available").value) || 0;

  // 총 피킹 수량
  const totalPicking = robot + das;
  document.getElementById("preview-total-picking").innerHTML = `<strong>총 피킹 수량: ${totalPicking}개</strong>`;

  if (inner <= 0) {
    alert("inner pack은 1 이상이어야 합니다.");
    return;
  }

  // 추가 피킹 수량 계산
  const extraPicking = Math.max(totalPicking - available, 0);

  // ✅ 상단 미리보기 영역 아래에 표시
  let extraInfoEl = document.getElementById("extra-picking-info");
  if (!extraInfoEl) {
    const previewArea = document.querySelector(".input-preview");
    extraInfoEl = document.createElement("p");
    extraInfoEl.id = "extra-picking-info";
    previewArea.appendChild(extraInfoEl);
  }
  extraInfoEl.innerHTML = `<strong>추가 피킹 수량: ${extraPicking}개</strong>`;

  // robot → das 순서로 피킹 처리
  let remaining = available;
  const robotPicked = Math.min(robot, remaining);
  remaining -= robotPicked;

  const dasPicked = Math.min(das, remaining);
  remaining -= dasPicked;

  const robotShort = robot - robotPicked;
  const dasShort = das - dasPicked;

  // 상태 메시지
  let robotStatus = `✅ robot: 피킹 완료`;
  let dasStatus = `✅ das: 피킹 완료`;

  if (robotShort > 0) {
    const robotBox = Math.floor(robotShort / inner);
    const robotEa = robotShort % inner;
    robotStatus = `❗ robot: 추가 피킹 ${robotShort}개 (${robotBox}box / ${robotEa}ea)`;
  }

  if (dasShort > 0) {
    const dasBox = Math.floor(dasShort / inner);
    const dasEa = dasShort % inner;
    dasStatus = `❗ das: 추가 피킹 ${dasShort}개 (${dasBox}box / ${dasEa}ea)`;
  }

  // ✅ 결과창에 표시 (🚨 메시지는 여전히 하단에 위치)
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
  const das = parseInt(document.getElementById("unshipped-das").value) || 0;
  const inner = parseInt(document.getElementById("unshipped-inner").value) || 1; // 0 방지

  const robotBox = Math.floor(robot / inner);
  const robotEa = robot % inner;
  const dasBox = Math.floor(das / inner);
  const dasEa = das % inner;

  document.getElementById("robot-box-info").innerText = `${robotBox}box / ${robotEa}ea`;
  document.getElementById("das-box-info").innerText = `${dasBox}box / ${dasEa}ea`;
}



