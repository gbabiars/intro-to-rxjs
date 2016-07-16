'use strict';

const Hapi = require('hapi');
const inert = require('inert');
const _ = require('lodash');

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
  
  server.route({
    method: 'GET',
    path: '/api/teams',
    handler(request, reply) {
      if(request.headers.authorization === 'Bearer token1') {
        return reply().code(401);
      }
      return reply([
        { id: 1, city: 'Chicago', name: 'Bulls' },
        { id: 2, city: 'Los Angeles', name: 'Lakers' },
        { id: 3, city: 'Phoenix', name: 'Suns' }
      ]);
    }
  });

  server.route({
    method: 'GET',
    path: '/api/authorization',
    handler(request, reply) {
      reply('token2');
    }
  });
  
  server.route({
    method: 'GET',
    path: '/api/scores',
    handler(request, reply) {
      const scores = [
        {
          home: { name: 'Lakers', score: 4 },
          visitor: { name: 'Warriors', score: 2 },
          time: '10:45 1st'
        },
        {
          home: { name: 'Lakers', score: 40 },
          visitor: { name: 'Warriors', score: 45 },
          time: '6:30 2nd'
        },
        {
          home: { name: 'Lakers', score: 88 },
          visitor: { name: 'Warriors', score: 100 },
          time: '1:10 3rd'
        },
        {
          home: { name: 'Lakers', score: 92 },
          visitor: { name: 'Warriors', score: 107 },
          time: '8:11 4th'
        },
        {
          home: { name: 'Lakers', score: 101 },
          visitor: { name: 'Warriors', score: 119 },
          time: 'F'
        }
      ];
      reply(scores[_.random(0, 4)]);
    }
  });
  
  server.route({
    method: 'POST',
    path: '/api/clicks',
    handler(request, reply) {
      const clicks = request.payload.clicks;
      if(clicks >= 20) {
        return reply('Great job!');
      }
      if(clicks >= 10) {
        return reply('Doing well!');
      }
      return reply('Keep trying.');
    }
  });

  server.start(err => {
    if(err) {
      throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
  });
});
