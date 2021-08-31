const fastify = require('fastify')({ logger: true })
const axios = require('axios')
const crypto = require('crypto')

const _username = process.env.LIGESS_USERNAME
const _domain = process.env.LIGESS_DOMAIN
const _identifier = `${_username}@${_domain}`
const _metadata = [['text/identifier', _identifier], ['text/plain', `Satoshis to ${_identifier}`]]

fastify.get('/', async (request, reply) => {
    return { info: 'Ligess personnal server at https://github.com/dolu89/ligess' }

})

fastify.get('/.well-known/lnurlp/:username', async (request, reply) => {
    try {
        if (_username !== request.params.username) {
            return { status: 'ERROR', reason: 'Username not found' }
        }

        if (!request.query.amount) {
            return {
                status: 'OK',
                callback: `https://${_domain}/.well-known/lnurlp/${_username}`,
                tag: 'payRequest',
                maxSendable: 100000000,
                minSendable: 1000,
                metadata: JSON.stringify(_metadata),
                commentAllowed: 0
            }
        }
        else {
            const msat = request.query.amount
            const stringToHash = JSON.stringify(_metadata)

            const invoiceResult = await axios.post(process.env.LIGESS_LND_REST + '/v1/invoices',
                {
                    value_msat: msat,
                    description_hash: crypto.createHash('sha256').update(stringToHash).digest('base64')
                },
                {
                    headers: {
                        'Grpc-Metadata-macaroon': process.env.LIGESS_LND_MACAROON
                    }
                })

            return {
                status: 'OK',
                successAction: { 'tag': 'message', 'message': 'Payment received!' },
                routes: [],
                pr: invoiceResult.data.payment_request,
                disposable: false
            }
        }
    } catch (error) {
        console.error(error)
        return { status: 'ERROR', reason: 'An error occured while getting invoice' }
    }
})

const start = async () => {
    try {
        await fastify.listen(process.env.PORT || 3000)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

module.exports = { start }