# LIGESS (**Lig**~~hting addr~~**ess**)

## Your personnal Lightning address server

## Prerequisite
- Nodejs >= 14
- Lightning node
- A domain name

## Supported Lightning implementation
- LND (LND with REST API)

## Installation
``` shell
git clone https://github.com/dolu89/ligess
cd ligess && yarn install
cp .env.example .env
# Edit .env with your info
yarn dev
```

## Usage
You should be able to access to https://YOUDOMAIN.COM/.well-known/lnurlp/USERNAME and get a valid [LUD-06](https://github.com/fiatjaf/lnurl-rfc/blob/luds/06.md) JSON response.


### Installation for LND
In .env config file
```
LIGESS_LN_BACKEND=LND
LIGESS_LND_REST=https://yourLNDRestAPI.com
LIGESS_LND_MACAROON=hex macaroon with createinvoice
```

## Support this project
You can help me by contributing to this project or by donating to my Lightning address `dolu@bips.xyz`

Other donation methods are avaible here https://bips.xyz/support
