let clickCount = 0;

const target = document.getElementById('target');
const count = document.getElementById('count');
const message = document.getElementById('message');

const postClicks = function(clickCount) {
  return $.ajax({
    url: '/api/clicks',
    method: 'POST',
    data: {
      clicks: clickCount
    }
  }).then(text => message.textContent = text);
};

const throttledPostClicks = _.throttle(postClicks, 2000);

target.addEventListener('click', () => {
  clickCount += 1;
  count.textContent = clickCount;

  throttledPostClicks(clickCount);
});
