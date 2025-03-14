# Sample custom Waku Network Setup

This example has 3 components:

1. Public (bootstrap) node using nwaku-compose
1. Web app using JS Waku
1. Backend app usin Waku Go Bindings

## Setup

## Bootstrap

First we'll need to setup the bootstrap node and obtain its multiaddress

```
git clone https://github.com/waku-org/nwaku-compose.git
cd nwaku-compose
git checkout network/42
openssl rand --hex 32 > .nodekey
DOMAIN=<your domain> NODEKEY=$(cat .nodekey) docker compose up -d
```

You'll need to obtain the multiaddress of the node. You can do this by inspecting the logs (`docker compose logs nwaku`) or by querying the REST API

```
curl -v localhost:8645/debug/v1/info
```

You will need both `tcp` and `wss` addresses - e.g.

```
"listenAddresses": [
        "/dns4/waku-test.bloxy.one/tcp/30304/p2p/16Uiu2HAmSZbDB7CusdRhgkD81VssRjQV5ZH13FbzCGcdnbbh6VwZ",
        "/dns4/waku-test.bloxy.one/tcp/8095/wss/p2p/16Uiu2HAmSZbDB7CusdRhgkD81VssRjQV5ZH13FbzCGcdnbbh6VwZ"
    ],
```

## Backend

First, clone the example repo

```
git clone  https://github.com/vpavlin/example-waku-go-bindings
cd example-waku-go-bindings
git checkout network/42
make buildlib
```

You will need to update your bootstrap node to connect to the node we started above. Modify the `BootstrapNode` constant at the top of the `main.go` file and run

```
make
```

This will setup a `receiverNode` connected to the `BootstrapNode` and will start a listen loop for new messages on pre-configured `ContentTopic`.

## Webapp

The webapp is hosted in this repository. You'll need to update the list of `BOOTSTRAP_NODES` in `src/constants.ts`, install dependencies and start it

```
npm install
npm start
```

You should see your the webapp to connect to given bootstrap node(s). 

## Let's publish
Assuming you followed this tutorial and everything is well, you should be able to type some message to the input field in the WebApp, hit send and then observe the message printed by Backend node

