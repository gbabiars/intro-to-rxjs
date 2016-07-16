let clickCount = 0;

const target = document.getElementById('target');
const count = document.getElementById('count');

target.addEventListener('click', () => {
  clickCount += 1;
  count.textContent = clickCount;

  $.ajax({
    url: '/api/clicks',
    method: 'POST',
    data: {
      clicks: clickCount
    }
  })
});
