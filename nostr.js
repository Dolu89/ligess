const fastify = require('fastify')({ logger: true })
const { RelayPool, Relay, signId, calculateId, verifyEvent, getPublicKey } = require('nostr')
const { bech32 } = require('bech32')
const buffer = require('buffer')

const _nostrPrivKey = process.env.LIGESS_NOSTR_ZAPPER_PRIVATE_KEY
const _nostrPubKey = _nostrPrivKey ? getPublicKey(_nostrPrivKey) : null

const pendingZapRequests = {}

if (_nostrPubKey) {
  fastify.log.info({msg: 'Nostr NIP-57 enabled', npub: pubkeytonpub(_nostrPubKey)})
}

const getNostrPubKey = () => _nostrPubKey

const verifyZapRequest = async (zapRequest, queryAmount) => {
  if (!zapRequest) return

  try {
    zapRequest = JSON.parse(zapRequest)
  } catch(error) {
    throw new Error(`Invalid JSON on zap request`)
  }
  
  if (zapRequest.kind !== 9734) {
    throw new Error(`Invalid zap request kind ${zapRequest.kind}`)
  }

  if (await calculateId(zapRequest) !== zapRequest.id) {
    throw new Error(`Invalid id on zap request`)
  }

  if (!await verifyEvent(zapRequest)) {
    throw new Error(`Invalid signature in zap request`)
  }

  if (!zapRequest.tags || zapRequest.tags.length === 0) {
    throw new Error(`No tags on zap request`)
  }

  const ptags = getTags(zapRequest.tags, 'p')
  if (ptags.length === 0) {
    throw new Error(`No p tag on zap request`)
  }
  if (ptags.length >= 2) {
    throw new Error(`Multiple p tags on zap request`)
  }

  const etags = getTags(zapRequest.tags, 'e')
  if (etags.length >= 2) {
    throw new Error(`Multiple e tags on zap request`)
  }

  const relaytags = getTags(zapRequest.tags, 'relays')
  if (relaytags.length === 0) {
    throw new Error(`No relay tag on zap request`)
  }
  if (relaytags.length >= 2) {
    throw new Error(`Multiple relay tags on zap request`)
  }

  const amounttags = getTags(zapRequest.tags, 'amount')
  if (amounttags.length === 1 && queryAmount && amounttags[0][1] !== queryAmount) {
    throw new Error(`Amount tag in the zap request does not equal amount on query`)
  }
  if (amounttags.length >= 2) {
    throw new Error(`Multiple amount tags on zap request`)
  }

  return zapRequest
}

const storePendingZapRequest = (paymentHash, zapRequest, comment, logger) => {
  pendingZapRequests[paymentHash] = {zapRequest: zapRequest, comment: comment, logger: logger}
}

const handleInvoiceUpdate = async (invoice) => {

  if (invoice.status == 'Cancelled') {
    delete pendingZapRequests[invoice.paymentHash]
    return
  }
  if (!invoice.settled) return
  
  if (!pendingZapRequests[invoice.paymentHash]) return

  const {zapRequest, comment, logger} = pendingZapRequests[invoice.paymentHash]

  let content = ''
  if (comment) {
    content = comment
  } else if (zapRequest.content) {
    content = zapRequest.content
  }

  const zapNote = {
    kind: 9735,
    pubkey: _nostrPubKey,
    created_at: Date.parse(invoice.settleDate) / 1000,
    tags: [],
    content: content
  }

  const ptags = getTags(zapRequest.tags, 'p')
  zapNote.tags.push(ptags[0])

  const etags = getTags(zapRequest.tags, 'e')
  if (etags.length === 1) zapNote.tags.push(etags[[0]])

  zapNote.tags.push(['bolt11', invoice.bolt11])
  zapNote.tags.push(['description', JSON.stringify(zapRequest)])
  zapNote.tags.push(['preimage', invoice.preImage])

  zapNote.id = await calculateId(zapNote)
  zapNote.sig = await signId(_nostrPrivKey, zapNote.id)

  logger.info({msg: 'Invoice settled', note: zapNote.id, amount: invoice.amount, npub: pubkeytonpub(zapRequest.pubkey), comment: content})

  const relaytags = getTags(zapRequest.tags, 'relays')
  relaytags[0].slice(1).forEach(relay => sendNote(relay, zapNote, logger))

  delete pendingZapRequests[invoice.paymentHash]
}

function getTags(tags, tag) {
  return tags.filter(t => t && t.length && t.length >= 2 && t[0] === tag)
}

function sendNote(url, note, logger) {
  const relay = Relay(url, {reconnect: false})
  
  relay.on('open', async () => {
    
    await relay.send(["EVENT", note])

    setTimeout(() => relay.close(), 5_000)
  });

  relay.on('notice', (notice) => {
    logger.info({msg: notice, relay: relay.url})
  });

  relay.on('close', (e) => {
    if (e.code !== 1000 && e.code !== 1005) {
      logger.info({msg: 'Close', relay: relay.url, code: e.code, reason: e.reason})
    }
  });
  
  relay.on('error', (e) => {
    logger.warn({msg: e.message, relay: relay.url})
  });
  
  relay.on('ok', (id) => {
    if (id === note.id) {
      logger.info({msg: 'Zap note sent', relay: relay.url})

      setImmediate(() => relay.close())
    }
  });
}

function pubkeytonpub(pubkey) {
  let words = bech32.toWords( buffer.Buffer.from( pubkey, 'hex' ) );
  return bech32.encode( "npub", words );
}

module.exports = { getNostrPubKey, verifyZapRequest, storePendingZapRequest, handleInvoiceUpdate }