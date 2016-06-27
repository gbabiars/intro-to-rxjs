'use strict';

const Hapi = require('hapi');
const inert = require('inert');

const server = new Hapi.Server();

server.register(inert, err => {
  if(err) {
    throw err;
  }

  server.connection({
    host: 'localhost',
    port: 8000
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        listing: true
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: {
      file: 'demos/index.html'
    }
  });

  server.route({
    method: 'POST',
    path: '/api/contacts',
    handler(request, reply) {
      const data = request.payload;
      if(data.email === 'mjordan@bulls.com') {
        return reply({
          validation: {
            name: '',
            email: 'Email is already being used'
          }
        }).code(400);
      }
      if(data.email === 'lbird@celtics.com') {
        return reply().code(500);
      }
      return reply(data);
    }
  });

  server.start(err => {
    if(err) {
      throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
  });
});
