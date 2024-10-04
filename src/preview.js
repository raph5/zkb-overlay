import { fetchKill } from "./fetchkill"

/**
 * @typedef {import("./fetchkill").Kill} Kill
 */

/**
 * @param {HTMLElement} el
 * @param {number} killId
 */
export function bindPreview(el, killId) {
  let isKillFetched = false

  const loader = buildPreviewLoader()
  const preview = document.createElement("div")
  preview.className = "zkbo-preview"
  preview.style.visibility = "hidden"
  preview.appendChild(loader)

  el.addEventListener("mouseover", () => {
    preview.style.visibility = "visible"
    if (!isKillFetched) {
      isKillFetched = true
      fetchKill(killId)
        .then(kill => {
          const [fit, attacker] = buildPreviewContent(kill)
          preview.removeChild(loader)
          preview.appendChild(fit)
          preview.appendChild(attacker)
        })
        .catch(console.error)
    }
  })
  el.addEventListener("mouseout", () => {
    preview.style.visibility = "hidden"
  })

  el.classList.add("zkbo-bind")
  el.title = ""
  el.appendChild(preview)
}

/**
 * @param {Kill} kill 
 * @returns {[HTMLElement, HTMLElement]}
 */
function buildPreviewContent(kill) {
  const createImg = (name, id, type) => {
    const img = document.createElement("img")
    img.title = name
    img.alt = name
    if (type == "item") {
      img.src = `https://images.evetech.net/types/${id}/icon?size=32`
      img.onerror = `this.onerror = null; this.src='https://images.evetech.net/type/${id}/bp?size=32';`
    } else if (type == "char") {
      img.src = `https://images.evetech.net/characters/${id}/portrait?size=32`
    } else if (type == "ship") {
      img.src = `https://images.evetech.net/types/${id}/render?size=32`
    } else if (type == "corp") {
      img.src = `https://images.evetech.net/corporations/${id}/logo?size=32`
      img.onerror = `this.onerror = null; this.src='https://images.evetech.net/alliances/1/logo?size=32'`
    } else if (type == "ally") {
      img.src = `https://images.evetech.net/alliances/${id}/logo?size=32`
    }
    return img
  }

  const fit = document.createElement("ul")
  fit.className = "zkbo-box zkbo-fit"
  for (const slot of ["high", "mid", "low", "rig", "sub"]) {
    if (kill.fit[slot].length > 0) {
      const slotLi = document.createElement("li")
      for (const item of kill.fit[slot]) {
        const img = createImg(item.name, item.id, "item")
        slotLi.appendChild(img)
      }
      fit.appendChild(slotLi)
    }
  }

  const attackers = document.createElement("ul")
  attackers.className = "zkbo-box"
  for (const att of kill.attacker) {
    const slotLi = document.createElement("li")
    slotLi.className = "zkbo-attacker"
    if (att.ship && att.shipId) {
      slotLi.appendChild(createImg(att.ship, att.shipId, "ship"))
    }
    if (att.char && att.charId) {
      slotLi.appendChild(createImg(att.char, att.charId, "char"))
    }
    if (att.corp && att.corpId) {
      slotLi.appendChild(createImg(att.corp, att.corpId, "corp"))
    }
    if (att.ally && att.allyId) {
      slotLi.appendChild(createImg(att.ally, att.allyId, "ally"))
    }
    attackers.appendChild(slotLi)
  }

  return [fit, attackers]
}

/**
 * @returns {HTMLElement}
 */
function buildPreviewLoader() {
  const loader = document.createElement("div")
  loader.className = "zkbo-box zkbo-loader"
  return loader
}
