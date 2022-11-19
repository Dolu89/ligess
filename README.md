# LIGESS (**Lig**~~hting addr~~**ess**)

## Your personal Lightning address server
> Like an email address, but for your Bitcoin!
A massively simpler way for anyone to send you Bitcoin instantly on the Lightning Network.

*https://lightningaddress.com/*

## Prerequisite
- Nodejs >= 14
- Lightning node
- A domain name

## Supported Lightning implementation
- LND (LND with REST API)
- Eclair (v0.6.2)

## Installation

### Standalone
``` shell
git clone https://github.com/dolu89/ligess
cd ligess && yarn install
cp .env.example .env
# Edit .env with your info
yarn dev
```

### Using Docker compose
``` shell
git clone https://github.com/dolu89/ligess
# Edit `docker-compose.yml` with your details.
docker-compose up -d
```

## Usage
You should be able to access to https://YOURDOMAIN.COM/.well-known/lnurlp/USERNAME and get a valid [LUD-06](https://github.com/fiatjaf/lnurl-rfc/blob/luds/06.md) JSON response.

Now your Lightning address is configured as follow `USERNAME@YOURDOMAIN.COM`

### Installation for LND
In `.env` config file or `docker-compose` environment:
```
LIGESS_LN_BACKEND=LND
LIGESS_LND_REST=https://yourLNDRestAPI.com # can be an onion url
LIGESS_LND_MACAROON=hex string macaroon with invoice:create # should be a long (~265 character) string that you generate either on a CLI or in a UI.
```

#### Tip

The macaroon is what gives ligess the permissions to create invoices on behalf of your LND node.

The act of generating a macaroon is called "baking".  If you're paying for hosting an LND node, there should be a UI.  On Voltage, it's Connect > Other Macaroons > "Bake Other Macaroon".  For self-hosted, there is a CLI tool to generate it.

More information on macaroons can be found [here](https://github.com/lightningnetwork/lnd/blob/master/docs/macaroons.md).  

### Installation for Eclair
In `.env` config file or `docker-compose` environment:
```
LIGESS_LN_BACKEND=Eclair
LIGESS_ECLAIR_REST=http://eclair_rest_api # can be an onion url
LIGESS_ECLAIR_LOGIN=login
LIGESS_ECLAIR_PASSWORD=password
```

### Installation for LNbits
In `.env` config file or `docker-compose` environment:
```
LIGESS_LN_BACKEND=LNbits
LIGESS_LNBITS_DOMAIN=https://lnbits.com # can be replaced by your own LNbits isntance url
LIGESS_LNBITS_API_KEY=this1is2an3example # can be found at the right of your wallet page, under "API info" > "Invoice/read key"
```

### Using Tor
For the standalone install, be sure to have Tor running on your computer.

For the Docker install, add (or uncomment) the following lines in 'docker-compose.yml` in order to run Tor as a Docker container:
```yml
  tor:
    image: lncm/tor:latest
    restart: on-failure
    command: --SocksPort 0.0.0.0:9050
    expose:
      - 9050
```
Then specify the Tor proxy URL in `.env` config file or `docker-compose` environment:
```
LIGESS_TOR_PROXY_URL=socks5h://127.0.0.1:9050 # standalone installation
# or
LIGESS_TOR_PROXY_URL=socks5h://tor:9050 # docker installation
```

## Support this project
You can help me by contributing to this project or by donating to my Lightning address `dolu@bips.xyz`

Other donation methods are avaible here https://bips.xyz/support
