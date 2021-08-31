const { LND } = require('./backend')
const axios = require('axios')
const crypto = require('crypto')

const createInvoice = async (backend, metadata, msat) => {
    switch (backend) {
        case LND:
            return await _getLndInvoice(metadata, msat)
    }
}

const _getLndInvoice = async (metadata, msat) => {
    const invoiceResult = await axios.post(process.env.LIGESS_LND_REST + '/v1/invoices',
        {
            value_msat: msat,
            description_hash: crypto.createHash('sha256').update(metadata).digest('base64')
        },
        {
            headers: {
                'Grpc-Metadata-macaroon': process.env.LIGESS_LND_MACAROON
            }
        })
    return invoiceResult.data.payment_request
}

module.exports = { createInvoice }