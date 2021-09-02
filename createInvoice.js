const { LND, Eclair } = require('./backend')
const axios = require('axios')
const crypto = require('crypto')
const FormData = require('form-data');

const createInvoice = async (backend, metadata, msat) => {
    switch (backend) {
        case LND:
            return await _getLndInvoice(metadata, msat)
        case Eclair:
            return await _getEcairInvoice(metadata, msat)
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

const _getEcairInvoice = async (metadata, msat) => {
    const form = new FormData()
    form.append('description', 'Test invoice eclair')
    form.append('amountMsat', Number.parseInt(msat))

    const invoiceResult = await axios.post(process.env.LIGESS_ECLAIR_REST + '/createinvoice',
        form,
        {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(':' + process.env.LIGESS_ECLAIR_PASSWORD).toString('base64'),
                ...form.getHeaders()
            }
        })
    return invoiceResult.data.payment_request
}

module.exports = { createInvoice }