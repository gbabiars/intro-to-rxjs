let clickCount = 0;

const target = document.getElementById('target');
const count = document.getElementById('count');
const message = document.getElementById('message');

target.addEventListener('click', () => {
  clickCount += 1;
  count.textContent = clickCount;

  $.ajax({
    url: '/api/clicks',
    method: 'POST',
    data: {
      clicks: clickCount
    }
  }).then(text => message.textContent = text);
});
