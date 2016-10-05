const Observable = Rx.Observable;
const { fromEvent, merge, combineLatest, ajax, of } = Observable;

// elements
const form = document.querySelector('form');
const name = document.getElementById('name');
const email = document.getElementById('email');
const formMessage = document.getElementById('form-message');
const nameMessage = document.getElementById('name-message');
const emailMessage = document.getElementById('email-message');

// validation helpers
function validateName(name) {
  if(name === '') {
    return 'Name cannot be blank';
  }
  if(name.length > 30) {
    return 'Name cannot be longer than 30 characters'
  }
  return '';
}

function validateEmail(email) {
  if(email === '') {
    return 'Email cannot be blank';
  }
  if(!/^.+@.+\..+$/.test(email)) {
    return 'Must be valid email';
  }
  return '';
}


const nameClientState$ = fromEvent(name, 'keyup')
  .merge(fromEvent(name, 'keypress'))
  .map(event => event.target.value.trim())
  .startWith('')
  .distinctUntilChanged()
  .map(value => ({ value, error: validateName(value) }));

const emailClientState$ = fromEvent(email, 'keyup')
  .merge(fromEvent(email, 'keypress'))
  .map(event => event.target.value.trim())
  .startWith('')
  .distinctUntilChanged()
  .map(value => ({ value, error: validateEmail(value) }));


const formSubmit$ = fromEvent(form, 'submit')
  .do(event => event.preventDefault())
  .share();

const formData$ = combineLatest(
  nameClientState$,
  emailClientState$,
  (name, email) => ({ name, email })
);

const request$ = formSubmit$
  .withLatestFrom(
    formData$,
    (event, data) => data
  )
  .filter(
    ({ name, email}) => !name.error && !email.error
  )
  .map(({ name, email }) => ({
    url: '/api/contacts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name.value,
      email: email.value
    })
  }));

const response$ = request$
  .switchMap(request =>
    ajax(request)
      .catch(ajaxError => of(ajaxError))
  )
  .share();


const serverValidationErrors$ = response$
  .filter(res => res.status === 400 && res.xhr.response.validation)
  .map(res => res.xhr.response.validation);


const nameTrackingState$ = fromEvent(name, 'blur')
  .merge(formSubmit$)
  .map(() => true)
  .distinctUntilChanged();
const nameServerError$ = serverValidationErrors$
  .map(errors => errors.name);
const nameError$ = nameClientState$
  .map(state => state.error)
  .merge(nameServerError$)
  .distinctUntilChanged();
const nameErrorWithTrackingState$ = nameError$
  .combineLatest(
    nameTrackingState$,
    err => err
  );
const name$ = nameErrorWithTrackingState$
  .do(err => nameMessage.textContent = err);

const emailTrackingState$ = fromEvent(email, 'blur')
  .merge(formSubmit$)
  .map(() => true)
  .distinctUntilChanged();
const emailServerError$ = serverValidationErrors$
  .map(errors => errors.email);
const emailError$ = emailClientState$
  .map(state => state.error)
  .merge(emailServerError$)
  .distinctUntilChanged();
const emailErrorWithTrackingState$ = emailError$
  .combineLatest(
    emailTrackingState$,
    err => err
  );
const email$ = emailErrorWithTrackingState$
  .do(err => emailMessage.textContent = err);


const formMessage$ = response$
  .filter(res => res.status !== 200 && res.status !== 400)
  .map(res => res.xhr.statusText)
  .do(err => formMessage.textContent = err);


const success$ = response$
  .filter(res => res.status === 200)
  .map(res => res.response);

const successMessage$ = success$
  .do(data => {
    form.remove();
    let successMessage = document.createElement('div');
    successMessage.innerText = `${data.name} was created!`;
    document.body.appendChild(successMessage);
  });


const form$ = merge(
  name$,
  email$,
  formMessage$
).takeUntil(successMessage$);


form$.subscribe();
