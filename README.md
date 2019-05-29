<img src="https://user-images.githubusercontent.com/211411/34776833-6f1ef4da-f618-11e7-8b13-f0697901d6a8.png" height="80" /> <img src="https://user-images.githubusercontent.com/211411/52533081-e679d380-2d2e-11e9-9c5e-571e4ad0107b.png" height="80" />

[![onlykey Devs Slack](https://img.shields.io/badge/Slack-onlykeyDevs-yellow.svg?style=flat)](https://onlykey-dev.slack.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Welcome to onlykey's JavaScript libraries.

**See also:**

- [Changelog](https://github.com/trustcrypto/onlykeyjs/releases)
- [**onlykeyJS examples**](https://github.com/trustcrypto/onlykeyjs-examples)
- [onlykey Live Desktop](https://github.com/trustcrypto/onlykey-live-desktop)
- [onlykey Live Mobile](https://github.com/trustcrypto/onlykey-live-mobile)
- [live-common](https://github.com/trustcrypto/onlykey-live-common)

## `@trustcrypto/hw-transport-*`

**To communicate with a onlykey device, you first need to identify which transport(s) to use.**

> The _hw-transport_ libraries implement communication protocol for our [hardware wallet devices](https://www.onlykey.com/) (onlykey Nano / onlykey Nano S / onlykey Nano X / onlykey Blue) in many platforms: **Web, Node, Electron, React Native,...** and using many different communication channels: **U2F, HID, WebUSB, Bluetooth,...**

| Channels | U2F | HID | WebUSB | Bluetooth |
| -------- | --- | --- | ------ | --------- |
| Blue     | YES | YES | NO     | NO        |
| Nano S   | YES | YES | YES    | NO        |
| Nano X   | YES | YES | YES    | YES       |

**Please find respective documentation for each transport:**

- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-u2f.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-u2f) [@trustcrypto/hw-transport-u2f](./packages/hw-transport-u2f) **[Web]** **(U2F)** (legacy but reliable) – FIDO U2F api. [check browser support](https://caniuse.com/u2f).
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-webauthn.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-webauthn) [@trustcrypto/hw-transport-webauthn](./packages/hw-transport-webauthn) **[Web]** **(WebAuthn)** (experimental) – WebAuthn api. [check browser support](https://caniuse.com/webauthn).
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-webusb.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-webusb) [@trustcrypto/hw-transport-webusb](./packages/hw-transport-webusb) **[Web]** **(WebUSB)** (experimental) – WebUSB [check browser support](https://caniuse.com/webusb).
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-web-ble.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-web-ble) [@trustcrypto/hw-transport-web-ble](./packages/hw-transport-web-ble) **[Web]** **(Bluetooth)** – [check browser support](https://caniuse.com/web-bluetooth).
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-node-hid.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-node-hid) [@trustcrypto/hw-transport-node-hid](./packages/hw-transport-node-hid) **[Node]**/Electron **(HID)** – uses `node-hid` and `usb`.
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-node-hid-noevents.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-node-hid-noevents) [@trustcrypto/hw-transport-node-hid-noevents](./packages/hw-transport-node-hid-noevents) **[Node]**/Electron **(HID)** – uses **only** `node-hid`. Does not provide USB events.
- [![npm](https://img.shields.io/npm/v/@trustcrypto/react-native-hw-transport-ble.svg)](https://www.npmjs.com/package/@trustcrypto/react-native-hw-transport-ble) [@trustcrypto/react-native-hw-transport-ble](./packages/react-native-hw-transport-ble) **[React Native]** **(Bluetooth)** – uses `react-native-ble-plx`
- [![npm](https://img.shields.io/npm/v/@trustcrypto/react-native-hid.svg)](https://www.npmjs.com/package/@trustcrypto/react-native-hid) [@trustcrypto/react-native-hid](./packages/react-native-hid) **[React Native]** **(HID)** _Android_ – onlykey's native implementation
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-http.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-http) [@trustcrypto/hw-transport-http](./packages/hw-transport-http) **[DEV only]** universal HTTP channel. **NOT for PROD**.

### An unified _Transport_ interface

All these transports implement a generic interface exposed by
[@trustcrypto/hw-transport](./packages/hw-transport).
There are specifics for each transport which are explained in each package.

A Transport is essentially:

- `Transport.listen: (observer)=>Subscription`
- `Transport.open: (descriptor)=>Promise<Transport>`
- `transport.exchange(apdu: Buffer): Promise<Buffer>`
- `transport.close()`

and some derivates:

- `transport.create(): Promise<Transport>`: make use of `listen` and `open` for the most simple scenario.
- `transport.send(cla, ins, p1, p2, data): Promise<Buffer>`: a small abstraction of `exchange`

> NB: [APDU](https://en.wikipedia.org/wiki/Smart_card_application_protocol_data_unit) is the encoding primitive for all binary exchange with the devices. (it comes from smart card industry)

## `@trustcrypto/hw-app-*`

As soon as your _Transport_ is created, you can already communicate by implementing the apps protocol (refer to application documentations, for instance [BTC app](https://github.com/trustcrypto/onlykey-app-btc/blob/master/doc/btc.asc) and [ETH app](https://github.com/trustcrypto/onlykey-app-eth/blob/master/doc/ethapp.asc) ones).

We also provide libraries that help implementing the low level exchanges. These higher level APIs are split per app:

- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-app-eth.svg)](https://www.npmjs.com/package/@trustcrypto/hw-app-eth) [@trustcrypto/hw-app-eth](./packages/hw-app-eth): Ethereum Application API
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-app-btc.svg)](https://www.npmjs.com/package/@trustcrypto/hw-app-btc) [@trustcrypto/hw-app-btc](./packages/hw-app-btc): Bitcoin Application API
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-app-xrp.svg)](https://www.npmjs.com/package/@trustcrypto/hw-app-xrp) [@trustcrypto/hw-app-xrp](./packages/hw-app-xrp): Ripple Application API
- [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-app-str.svg)](https://www.npmjs.com/package/@trustcrypto/hw-app-str) [@trustcrypto/hw-app-str](./packages/hw-app-str): Stellar Application API

**Community packages:**

- [![npm](https://img.shields.io/npm/v/@cardano-foundation/onlykeyjs-hw-app-cardano.svg)](https://www.npmjs.com/package/@cardano-foundation/onlykeyjs-hw-app-cardano) [@cardano-foundation/onlykeyjs-hw-app-cardano](https://github.com/cardano-foundation/onlykeyjs-hw-app-cardano): Cardano ADA Application API

> We invite all third party app developers to not send PR to this repository to provide more implementations but instead to maintain your own version in your own repository and we would be happy to reference them here ♥.

## Other packages

### Published Packages

| Package                                                                  | Version                                                                                                                                       | Description                                                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`create-dapp`](/packages/create-dapp)                                   | [![npm](https://img.shields.io/npm/v/create-dapp.svg)](https://www.npmjs.com/package/create-dapp)                                             | onlykey DApp Ethereum starter kit                                                                             |
| [`@trustcrypto/web3-subprovider`](/packages/web3-subprovider)               | [![npm](https://img.shields.io/npm/v/@trustcrypto/web3-subprovider.svg)](https://www.npmjs.com/package/@trustcrypto/web3-subprovider)               | web3 subprovider implementation for web3-provider-engine                                                     |
| **Development Tools**                                                    |
| [`@trustcrypto/hw-http-proxy-devserver`](/packages/hw-http-proxy-devserver) | [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-http-proxy-devserver.svg)](https://www.npmjs.com/package/@trustcrypto/hw-http-proxy-devserver) | HTTP server proxy to use with `hw-transport-node-hid` **NB: DEV & testing purpose only. DO NOT use in PROD** |
| [`@trustcrypto/hw-hid-cli`](/packages/hw-hid-cli)                           | [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-hid-cli.svg)](https://www.npmjs.com/package/@trustcrypto/hw-hid-cli)                           | CLI utility to send APDU to the device via node-hid                                                          |
| [`@trustcrypto/hw-transport-mocker`](/packages/hw-transport-mocker)         | [![npm](https://img.shields.io/npm/v/@trustcrypto/hw-transport-mocker.svg)](https://www.npmjs.com/package/@trustcrypto/hw-transport-mocker)         | Tool used for test to record and replay APDU calls.                                                          |

## Basic gist

```js
import Transport from "@trustcrypto/hw-transport-node-hid";
// import Transport from "@trustcrypto/hw-transport-web-usb";
// import Transport from "@trustcrypto/react-native-hw-transport-ble";
import AppBtc from "@trustcrypto/hw-app-btc";
const getBtcAddress = async () => {
  const transport = await Transport.create();
  const btc = new AppBtc(transport);
  const result = await btc.getWalletPublicKey("44'/0'/0'/0/0");
  return result.bitcoinAddress;
};
getBtcAddress().then(a => console.log(a));
```

## Contributing

Please read our [contribution guidelines](./CONTRIBUTING.md) before getting
started.

**You need to have a recent [Node.js](https://nodejs.org/) and
[Yarn](https://yarnpkg.com/) installed.**

### Install dependencies

```bash
yarn
```

### Build

Build all packages

```bash
yarn build
```

### Watch

Watch all packages change. Very useful during development to build only file that changes.

```bash
yarn watch
```

### Lint

Lint all packages

```bash
yarn lint
```

### Run Tests

First of all, this ensure the libraries are correctly building, and passing lint and flow:

```
yarn test
```

**then to test on a real device...**

Plug a device like the Nano S and open Bitcoin app.

Then run the test and accept the commands on the devices for the tests to
continue.

```bash
yarn test-node
```

You can also test on the web:

```bash
yarn test-browser
```

> make sure to configure your device app with "Browser support" set to "YES".

### Deploy

Checklist before deploying a new release:

- you have the right in the trustcrypto org on NPM
- you have run `npm login` once (check `npm whoami`)
- Go to **master** branch
  - your master point on trustcrypto repository (check with `git config remote.$(git config branch.master.remote).url` and fix it with `git branch --set-upstream master origin/master`)
  - you are in sync (`git pull`) and there is no changes in `git status`
- Run `yarn` once, there is still no changes in `git status`

**deploy a new release**

```
 yarn run publish
```

then, go to [/releases](https://github.com/trustcrypto/onlykeyjs/releases) and create a release with change logs.

**alternatively:**

deploy a canary release (beta, etc)

```
 yarn run publish -c
```

> NB: if there is a new package, AFAIK you need to manually `npm publish` it once on NPM.
