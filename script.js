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
