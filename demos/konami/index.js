const Observable = Rx.Observable;

const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const A = 65;
const B = 66;

const secret = [B, A, RIGHT, LEFT, RIGHT, LEFT, DOWN, DOWN, UP, UP];

const konami = Observable.fromEvent(document, 'keyup')
  .map(event => event.which)
  .scan((arr, code) => [code].concat(arr).slice(0, 10))
  .filter(sequence => _.isEqual(sequence, secret))
  .take(1);

konami.subscribe(
  () => document.querySelector('h1').textContent = 'Unlocked!'
);
