import { bindPreview } from "./preview"

const anchorsSet = new Set()
function updatePreviewBinds() {
  const anchors = document.getElementsByTagName("a");
  for (const a of anchors) {
    if (anchorsSet.has(a)) {
      continue
    }
    anchorsSet.add(a)
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

setInterval(updatePreviewBinds, 1000)
