<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Engineering Challenge

<p>During the assignment, I encountered intriguing challenges and I'm interested in exploring ways to improve it and create a better solution.</p>

## Patterns

<h4>Publish-Subscribe</h4>
<p>Publish-Subscribe Pattern to avoid data synchronization issues, with the queue we are able to process events one by one to avoid the issue with synchronize multiple events at the same time and overwrite our events in database.</p>
<p>--------------------------------------</p>

<h4>MongoDB transaction</h4>
<p>This approach ensures that update operations are blocked concurrently, guaranteeing the accurate transmission of our corrected data to the database.</p>
<p>In addition, if the service is unavailable, we are able to read events that have already been pushed into the queue - a good practice would be to make the fetching data of from chain as a separate microservice and separate this with writing to the database.</p>
<p>--------------------------------------</p>

<h4>Dependency Injection (DI)</h4>
<p>Dependency Injection to make the code more modular and testable.</p>
<p>--------------------------------------</p>

<h4>Docker</h4>
<p>Enables application migration between different environments and easy deployment to production. We can easily scale and manage application resources. With this solution, applications run more reliably, are more secure and are easier to deploy in microservices architecture.</p>

## Observability

<p>Metrics - Collect important metrics, such as the rate of account updates, indexing speed, Redis channel message rate, and MongoDB query performance. </p>
<p>Error Tracking - Integrate an error tracking service like Sentry to automatically capture and analyze errors and exceptions in the system.</p>
<p>Alerting - Set up alerting based on certain thresholds or anomalies in metrics to promptly respond to issues and incidents.</p>

## Running the app
<p>To run the application on the local environment you must have docker installed along with docker-compose and use bash</p>

<p>Copy example .env from .env.example file to .env file - you don't need to provide variables, there are already added values needed to run the service</p>

```bash
$ cp .env.example .env
```

<p>Run project on local environment</p>

```bash
$ docker-compose up
```

<p>After running docker everything will happen automatically, build the project will open a fake stream with data from the file then the data will go to the redis queue and will be written to the database as expected - if the queue is empty for another 5 seconds the application will display the results and will be closed.</p>

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Framework Nest.js

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
