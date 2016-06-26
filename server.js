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

  server.start(err => {
    if(err) {
      throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
  });
});
