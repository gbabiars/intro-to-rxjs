const incrementEl = document.getElementById('increment');
const decrementEl = document.getElementById('decrement');
const countEl = document.getElementById('count');
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

function accumulator(count, action) {
  if(action.type === INCREMENT) {
    return count += 1;
  }
  if(action.type === DECREMENT) {
    return count -= 1;
  }
  return count;
}

const dispatcher = new Rx.BehaviorSubject({});

const increments = Rx.Observable.fromEvent(incrementEl, 'click')
  .map(() => ({ type: INCREMENT }))
  .subscribe(dispatcher);
const decrements = Rx.Observable.fromEvent(decrementEl, 'click')
  .map(() => ({ type: DECREMENT }))
  .subscribe(dispatcher);

dispatcher.scan(accumulator, 0)
  .subscribe(result => countEl.textContent = result);

