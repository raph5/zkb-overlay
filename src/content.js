import { bindPreview } from "./preview"
import { setClass } from "./systemclass"

const anchorSet = new Set()
function updatePreviewBinds() {
  const anchors = document.getElementsByTagName("a");
  for (const a of anchors) {
    if (anchorSet.has(a)) {
      continue
    }
    anchorSet.add(a)
    const match = a?.href?.match(/kill\/(\d+)/)
    const child = a?.children[0]
    if (match && child && child.nodeName == "IMG") {
      const killId = parseInt(match[1])
      if (killId != NaN) {
        bindPreview(a, killId)
      }
    }
  }
}

const locationSet = new Set()
function updateClass() {
  const locations = document.getElementsByClassName("location")
  for (const loc of locations) {
    if (locationSet.has(loc)) {
      continue
    }
    locationSet.add(loc)
    setClass(loc)
  }
}

setInterval(updatePreviewBinds, 2000)
setInterval(updateClass, 2000)
