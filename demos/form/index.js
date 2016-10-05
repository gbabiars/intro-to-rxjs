const Observable = Rx.Observable;
const { fromEvent, merge, combineLatest, ajax, of } = Observable;

const log = data => console.log(data);


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

function renderNameErrorMessage(err) {
  nameMessage.textContent = err;
}

function renderEmailErrorMessage(err) {
  emailMessage.textContent = err;
}

function renderFormErrorMessage(err) {
  formMessage.textContent = err;
}


// name
const nameKeyup$ = fromEvent(name, 'keyup');
const nameKeypress$ = fromEvent(name, 'keypress');
const nameChange$ = merge(nameKeyup$, nameKeypress$);
const nameValue$ = nameChange$
  .map(event => event.target.value.trim())
  .startWith('')
  .distinctUntilChanged();
const nameClientState$ = nameValue$
  .map(value => ({ value, error: validateName(value) }));




// email
const emailBlur$ = fromEvent(email, 'blur')
  .map(() => true)
  .startWith(false)
  .distinctUntilChanged();




const emailKeyup$ = fromEvent(email, 'keyup');
const emailKeypress$ = fromEvent(email, 'keypress');
const emailChange$ = merge(emailKeyup$, emailKeypress$);
const emailValue$ = emailChange$
  .map(event => event.target.value.trim())
  .startWith('')
  .distinctUntilChanged();
const emailClientState$ = emailValue$
  .map(value => ({ value, error: validateEmail(value) }));


// form events
const formData$ = combineLatest(
  nameClientState$,
  emailClientState$,
  (name, email) => ({ name, email })
);
const formSubmit$ = fromEvent(form, 'submit')
  .do(event => event.preventDefault())
  .share();
const formSubmitWithState$ = formSubmit$
  .withLatestFrom(
    formData$,
    (event, data) => data
  );
const formValidSubmitWithState$ = formSubmitWithState$
  .filter(({ name, email }) => name.error === '' && email.error === '');
const formRequestValues$ = formValidSubmitWithState$
  .map(({ name, email }) => ({ name: name.value, email: email.value }));







// ajax
const response$ = formRequestValues$
  .switchMap(data =>
    ajax({
      url: '/api/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(ajaxError => of(ajaxError))
  )
  .share();
const serverValidationErrors$ = response$
  .filter(res => res.status === 400 && res.xhr.response.validation)
  .map(res => res.xhr.response.validation);
const serverFormErrors$ = response$
  .filter(res => res.status !== 200 && res.status !== 400)
  .map(res => res.xhr.statusText);




const nameBlur$ = fromEvent(name, 'blur');
const nameTrackingState$ = merge(nameBlur$, formSubmit$)
  .map(() => true)
  .distinctUntilChanged();


// combine errors
const nameServerErrors$ = serverValidationErrors$
  .map(errors => errors.name);
const nameClientErrors$ = nameClientState$
  .map(state => state.error);
const nameErrors$ = merge(nameClientErrors$, nameServerErrors$)
  .distinctUntilChanged();


const nameErrorsWithTrackingState$ = nameErrors$
  .combineLatest(
    nameTrackingState$,
    err => err
  );

const name$ = nameErrorsWithTrackingState$.do(renderNameErrorMessage);





const emailServerErrors$ = serverValidationErrors$
  .map(errors => errors.email);
const emailClientErrors$ = emailClientState$
  .map(state => state.error);
const emailErrors$ = merge(emailClientErrors$, emailServerErrors$)
  .distinctUntilChanged();


// nameTrackingState$.subscribe(log);
// nameErrors$.subscribe(log);
nameErrorsWithTrackingState$.subscribe(log);


const form$ = merge(
  name$
);


form$.subscribe();





// const response = formSubmit
//   .map(() => {
//     return {
//       name: getValueForInput(name),
//       email: getValueForInput(email)
//     };
//   })
//   .filter(({ name, email }) => {
//     return validateName(name) === '' && validateEmail(email) === '';
//   })
//   .mergeMap(data => Observable.ajax({
//       url: '/api/contacts',
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(data)
//     })
//       .catch(ajaxError => Observable.of(ajaxError))
//   )
//   .share();
//
// const responseSuccess = response
//   .filter(res => res.status === 200)
//   .map(res => res.response);
// const responseValidationErrors = response
//   .filter(res => res.status === 400 && res.xhr.response.validation)
//   .map(res => res.xhr.response.validation);
// const responseServerErrors = response
//   .filter(res => res.status !== 200 && res.status !== 400);
