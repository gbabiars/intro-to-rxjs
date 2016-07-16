const Observable = Rx.Observable;

const targetElement = document.getElementById('target');
const countElement = document.getElementById('count');
const messageElement = document.getElementById('message');

Observable.fromEvent(targetElement, 'click')
  .scan(clicks => clicks + 1, 0)
  .do(clicks => countElement.textContent = clicks)
  .throttleTime(1000)
  .mergeMap(clicks =>
    Observable.ajax({
      url: '/api/clicks',
      method: 'POST',
      body: JSON.stringify({ clicks }),
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'text'
    })
  )
  .do(res => messageElement.textContent = res.response)
  .subscribe();
