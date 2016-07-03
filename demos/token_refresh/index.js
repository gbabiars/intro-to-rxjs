const Observable = Rx.Observable;

const token = new Rx.BehaviorSubject('token1');

const teamResponse = token
  .mergeMap(t => {
    return Observable.ajax({
      url: '/api/teams',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${t}`,
        'Content-Type': 'application/json'
      }
    });
  })
  .retryWhen(errors => {
    return errors
      .scan((retryCount, err) => {
        if(err.status !== 401) {
          throw err;
        }
        if(retryCount >= 1) {
          throw err;
        }
        return retryCount + 1;
      }, 0)
      .mergeMap(() => {
        return Observable.ajax({
          url: '/api/authorization',
          method: 'GET',
          responseType: 'text',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      })
      .do(res => token.next(res.response));
  });

teamResponse.subscribe(
  res => {
    let list = document.createElement('ul');
    res.response.forEach(team => {
      let item = document.createElement('li');
      item.textContent = `${team.city} ${team.name}`;
      list.appendChild(item);
    });
    document.body.appendChild(list);
  },
  err => {
    let message = document.createElement('div');
    message.textContent = 'Unable to retrieve teams';
    document.body.appendChild(message);
  }
);
