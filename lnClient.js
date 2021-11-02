const { LND, Eclair } = require('./backend')
const { Una, EBackendType } = require('una-wrapper')

const getLnClient = () => {
  const backend = process.env.LIGESS_LN_BACKEND
  const proxy = process.env.LIGESS_TOR_PROXY_URL ?? null

  switch (backend) {
    case LND:
      return new Una(
        EBackendType.LndRest,
        {
          url: process.env.LIGESS_LND_REST,
          hexMacaroon: process.env.LIGESS_LND_MACAROON,
        },
        proxy
      )
    case Eclair:
      return new Una(
        EBackendType.EclairRest,
        {
          url: process.env.LIGESS_ECLAIR_REST,
          login: process.env.LIGESS_ECLAIR_LOGIN,
          password: process.env.LIGESS_ECLAIR_PASSWORD,
        },
        proxy
      )
  }
}

module.exports = { getLnClient }