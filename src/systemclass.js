import { regionToClass, classToColor } from "./region"

/**
 * @param {HTMLElement} loc Html element of class location
 */
export function setClass(loc) {
  const a = loc?.children?.[1]
  const ss = loc?.children?.[0]?.children?.[0]
  if (a.tagName != 'A' || !a.href || ss.tagName != 'SPAN') {
    return
  }
  const region = parseInt(a.href.match(/\/region\/(\d+)/)?.[1])
  if (region == NaN) {
    return
  }
  const space = regionToClass.get(region)
  if (space == undefined) {
    return
  }
  const color = classToColor.get(space)
  ss.innerHTML = space
  ss.style.color = color
}
