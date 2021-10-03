# LIGESS (**Lig**~~hting addr~~**ess**)

## Your personnal Lightning address server
> Like an email address, but for your Bitcoin!
A massively simpler way for anyone to send you Bitcoin instantly on the Lightning Network.

*https://lightningaddress.com/*

## Prerequisite
- Nodejs >= 14
- Lightning node
- A domain name

## Supported Lightning implementation
- LND (LND with REST API)
- Eclair (Soon. Waiting for [#1919](https://github.com/ACINQ/eclair/pull/1919))

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
LIGESS_LND_REST=https://yourLNDRestAPI.com
LIGESS_LND_MACAROON=hex macaroon with createinvoice
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
