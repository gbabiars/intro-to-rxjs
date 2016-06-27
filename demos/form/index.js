const Observable = Rx.Observable;


// elements
const form = document.querySelector('form');
const name = document.getElementById('name');
const email = document.getElementById('email');
const formMessage = document.getElementById('form-message');
const nameMessage = document.getElementById('name-message');
const emailMessage = document.getElementById('email-message');


// helper functions
function getValueForInput(input) {
  return input.value.trim()
}

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


// form submit and response
const formSubmit = Observable.fromEvent(form, 'submit')
  .do(event => event.preventDefault())
  .share();

const response = formSubmit
  .map(() => {
    return {
      name: getValueForInput(name),
      email: getValueForInput(email)
    };
  })
  .filter(({ name, email }) => {
    return validateName(name) === '' && validateEmail(email) === '';
  })
  .mergeMap(data => Observable.ajax({
      url: '/api/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .catch(ajaxError => Observable.of(ajaxError))
  )
  .share();

const responseSuccess = response
  .filter(res => res.status === 200)
  .map(res => res.response);
const responseValidationErrors = response
  .filter(res => res.status === 400 && res.xhr.response.validation)
  .map(res => res.xhr.response.validation);
const responseServerErrors = response
  .filter(res => res.status !== 200 && res.status !== 400);


// field level validation
function createFieldValidationObservable(element, validationFn, submit, serverMessages) {
  const trackingState = Observable.merge(
    Observable.fromEvent(element, 'blur'),
    submit
  );
  const values = Observable.fromEvent(element, 'keyup')
    .startWith(null)
    .map(() => getValueForInput(element))
    .distinctUntilChanged();
  const clientMessages = values.map(validationFn);
  const combinedMessages = clientMessages.merge(serverMessages);
  const combinedMessagesWithTracking = combinedMessages.combineLatest(
    trackingState,
    message => message
  );
  return combinedMessagesWithTracking;
}

const nameErrors = createFieldValidationObservable(
  name,
  validateName,
  formSubmit,
  responseValidationErrors.map(errors => errors.name)
);
const emailErrors = createFieldValidationObservable(
  email,
  validateEmail,
  formSubmit,
  responseValidationErrors.map(errors => errors.email)
);


// subscribe
nameErrors.subscribe(message => nameMessage.innerText = message);
emailErrors.subscribe(message => emailMessage.innerText = message);
formSubmit.subscribe(() => formMessage.innerText = '');
responseServerErrors.subscribe(() => formMessage.innerText = 'An error occurred while saving');
responseSuccess.subscribe(data => {
  form.remove();
  let successMessage = document.createElement('div');
  successMessage.innerText = `${data.name} was created!`;
  document.body.appendChild(successMessage);
});
