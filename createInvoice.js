const { LND } = require('./backend')
const axios = require('axios')
const crypto = require('crypto')
const { SocksProxyAgent } = require('socks-proxy-agent')

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';

const createInvoice = async (backend, metadata, msat) => {
    switch (backend) {
        case LND:
            return await _getLndInvoice(metadata, msat)
    }
}

const _getLndInvoice = async (metadata, msat) => {
    const requestConfig = {
        url: process.env.LIGESS_LND_REST + '/v1/invoices',
        method: 'POST',
        data: {
            value_msat: msat,
            description_hash: crypto.createHash('sha256').update(metadata).digest('base64')
        },
        headers: {
            'Grpc-Metadata-macaroon': process.env.LIGESS_LND_MACAROON
        },
        rejectUnauthorized: false
    }

    if (process.env.LIGESS_TOR_PROXY_URL) {
        const agent = new SocksProxyAgent(process.env.LIGESS_TOR_PROXY_URL)
        requestConfig.httpAgent = agent
        requestConfig.httpsAgent = agent
    }

    const invoiceResult = await axios(requestConfig)

    return invoiceResult.data.payment_request
}

module.exports = { createInvoice }