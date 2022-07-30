const locations = document.querySelectorAll(".location div:first-child");

for(const i of locations) {

  (async function() {
    const system = i.querySelector('a').innerHTML;
    const classSpan = i.querySelector('span');
    
    const whClass = (await chrome.storage.local.get('whData:'+system))['whData:'+system];
    
    if(whClass) {
      classSpan.innerHTML = whClass;
      classSpan.style.color = (await chrome.storage.local.get('whColors:'+whClass))['whColors:'+whClass];
    }
  })()

}