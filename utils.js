'use strict'

/**
 * Temporal solution to bent get buffer. See more info in PR https://github.com/mikeal/bent/pull/84 
 * 
 */
module.exports.getBuffer = async stream => new Promise((resolve, reject) => {
  const parts = []
  stream.on('error', reject)
  stream.on('end', () => resolve(Buffer.concat(parts)))
  stream.on('data', d => parts.push(d))
})