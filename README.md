# NestJS ETH.USDC transfers monitor
## Description

Stwórz aplikację w nestjs z jednym endpointem, który przyjmuje numer bloku i zwraca wszystkie przesyły USDC, które wystąpiły w tym bloku na sieci Ethereum.

[Nest](https://github.com/nestjs/nest) app with */blockchain/usdc-transfers/:block (GET)* endpoint that fetches all USDC transfers for given block number on Ethereum blockchain.

## Project setup

**First creare .env file with PROVIDER_API_KEY env that contains provider API key from Infura!!**

You can copy example .env file and change only PROVIDER_API_KEY:

```bash
cp .env.example .env
```

then run 

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
