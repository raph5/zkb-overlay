
/**
 * @typedef  {Object} Item
 * @property {string} name
 * @property {number} id
 *
 * @typedef  {Object} Fit
 * @property {Item[]} high
 * @property {Item[]} mid
 * @property {Item[]} low
 * @property {Item[]} rig
 * @property {Item[]} sub
 *
 * @typedef  {Object} Attacker
 * @property {string} char
 * @property {number} charId
 * @property {string} ship
 * @property {number} shipId
 * @property {string} [corp]
 * @property {number} [corpId]
 * @property {string} [ally]
 * @property {number} [allyId]
 * 
 * @typedef  {Object}     Kill
 * @property {Attacker[]} attacker
 * @property {Fit}        fit
 */

const maxAttacker = 8

/**
 * @param {number} killId 
 * @returns Kill
 */
export async function fetchKill(killId) {
  const kill = {
    fit: { high: [], mid: [], low: [], rig: [], sub: [], drone: [] },
    attacker: [],
  }

  const rep = await fetch(`https://zkillboard.com/kill/${killId}/`)
  const body = await rep.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(body, "text/html")

  for (let i = 1; i <= 8; ++i) {
    const [name, id] = readItemAnchor(doc.querySelector(`#high${i} a`))
    if (name != null && id != null) {
      kill.fit.high.push({name, id})
    }
  }
  for (let i = 1; i <= 8; ++i) {
    const [name, id] = readItemAnchor(doc.querySelector(`#mid${i} a`))
    if (name != null && id != null) {
      kill.fit.mid.push({name, id})
    }
  }
  for (let i = 1; i <= 8; ++i) {
    const [name, id] = readItemAnchor(doc.querySelector(`#low${i} a`))
    if (name != null && id != null) {
      kill.fit.low.push({name, id})
    }
  }
  for (let i = 1; i <= 3; ++i) {
    const [name, id] = readItemAnchor(doc.querySelector(`#rig${i} a`))
    if (name != null && id != null) {
      kill.fit.rig.push({name, id})
    }
  }
  for (let i = 1; i <= 5; ++i) {
    const [name, id] = readItemAnchor(doc.querySelector(`#sub${i} a`))
    if (name != null && id != null) {
      kill.fit.sub.push({name, id})
    }
  }

  const attacker = doc.querySelectorAll(".attacker")
  for (const att of attacker) {
    const [ship, shipId] = readItemAnchor(att?.children?.[1]?.children?.[0])
    const [char, charId] = readItemAnchor(att?.children?.[0]?.children?.[0])
    const [corp, corpId] = readEntityAnchor(att?.children?.[2]?.children?.[0]?.children?.[2])
    const [ally, allyId] = readEntityAnchor(att?.children?.[2]?.children?.[0]?.children?.[4])
    if (ship && shipId) {
      kill.attacker.push({char, charId, ship, shipId, corp, corpId, ally, allyId})      
      if (kill.attacker.length >= maxAttacker) {
        break
      }
    }
  }

  return kill
}

function readItemAnchor(a) {
  if (!a || a.nodeName != "A" || !a.title || !a.href) {
    return [null, null]
  }
  const name = a.title
  const id = parseInt(a?.href?.match(/\w+\/(\d+)/)?.[1])
  if (!id) {
    return [null, null]
  }
  return [name, id]
}

function readEntityAnchor(a) {
  if (!a || a.nodeName != "A" || !a.innerText || !a.href) {
    return [null, null]
  }
  const name = a.innerText
  const id = parseInt(a.href.match(/\w+\/(\d+)/)?.[1])
  if (!id) {
    return [null, null]
  }
  return [name, id]
}
