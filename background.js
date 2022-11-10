chrome.runtime.onInstalled.addListener(async () => {

  const whColors = await fetch(chrome.runtime.getURL('/data/whColors.json')).then(rep => rep.json())
  for(const i in whColors) { chrome.storage.local.set({ ['whColors:'+i]: whColors[i] }) }

  const whData = await fetch(chrome.runtime.getURL('/data/whData.json')).then(rep => rep.json())
  for(const i in whData) { chrome.storage.local.set({ ['whData:'+i]: whData[i] }) }
  
  const types = await fetch(chrome.runtime.getURL('/data/typeToName.json')).then(rep => rep.json())
  for(const i in types) { chrome.storage.local.set({ ['types:'+i]: types[i] }) }
  
  const alliances = await fetch(chrome.runtime.getURL('/data/allianceTypeToName.json')).then(rep => rep.json())
  for(const i in alliances) { chrome.storage.local.set({ ['allyTypes:'+i]: alliances[i] }) }
  
  const corps = await fetch(chrome.runtime.getURL('/data/corpTypeToName.json')).then(rep => rep.json())
  for(const i in corps) { chrome.storage.local.set({ ['corpTypes:'+i]: corps[i] }) }

});