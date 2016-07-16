let clickCount = 0;

const target = document.getElementById('target');
const count = document.getElementById('count');

target.addEventListener('click', event => {
  clickCount += 1;
  count.textContent = clickCount;
});
