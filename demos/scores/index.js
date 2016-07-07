const Observable = Rx.Observable;

const results = document.getElementById('results');

const clicksArray = Array.from(document.querySelectorAll('#refresh a'))
  .map(el => Observable.fromEvent(el, 'click').do(event => event.preventDefault()));

const selections = Observable.merge(...clicksArray)
  .map(event => parseInt(event.target.attributes.getNamedItem('data-interval').value, 10))
  .startWith(1);

const interval = selections.switchMap(
  time => Observable.interval(time * 1000)
    .startWith(null)
);

const responses = interval
  .mergeMap(() => {
    return Observable.fromPromise(
      fetch('/api/scores').then(res => res.json())
    );
  });

responses.subscribe(data => {
  const html = `
    <div>
      <table>
        <tr>
          <td>${data.home.name}</td>
          <td>${data.home.score}</td>
        </tr>
        <tr>
          <td>${data.visitor.name}</td>
          <td>${data.visitor.score}</td>
        </tr>
        <tr>
          <td colspan="2">${data.time}</td>
        </tr>
      </table>
    </div>
  `;
  results.innerHTML = html;
});
