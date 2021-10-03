const fastify = require('fastify')({ logger: true })
const { createInvoice } = require('./createInvoice')
const { bech32 } = require('bech32')

const _username = process.env.LIGESS_USERNAME
const _domain = process.env.LIGESS_DOMAIN
const _identifier = `${_username}@${_domain}`
const _lnurlpUrl = `https://${_domain}/.well-known/lnurlp/${_username}`
const _metadata = [['text/identifier', _identifier], ['text/plain', `Satoshis to ${_identifier}`]]

fastify.get('/', async (request, reply) => {
    // TODO Render html instead of JSON
    const words = bech32.toWords(Buffer.from(_lnurlpUrl, 'utf8'))
    return {
        lnurlp: bech32.encode('lnurl', words, 1023),
        decodedUrl: _lnurlpUrl,
        info: {
            title: 'Ligess: Lightning address personnal server',
            source: 'https://github.com/dolu89/ligess'
        }
    }

})

fastify.get('/.well-known/lnurlp/:username', async (request, reply) => {
    try {
        if (_username !== request.params.username) {
            return { status: 'ERROR', reason: 'Username not found' }
        }

        if (!request.query.amount) {
            return {
                status: 'OK',
                callback: _lnurlpUrl,
                tag: 'payRequest',
                maxSendable: 100000000,
                minSendable: 1000,
                metadata: JSON.stringify(_metadata),
                commentAllowed: 0
            }
        }
        else {
            const msat = request.query.amount
            const metadata = JSON.stringify(_metadata)

            const payment_request = await createInvoice(process.env.LIGESS_LN_BACKEND, metadata, msat)

            return {
                status: 'OK',
                successAction: { 'tag': 'message', 'message': 'Payment received!' },
                routes: [],
                pr: payment_request,
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
        await fastify.listen(process.env.PORT || 3000, process.env.HOST || '127.0.0.1')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

module.exports = { start }