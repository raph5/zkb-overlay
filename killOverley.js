
let lastTooltip = null;
class FitTooltip {

  showFit(fit) {
    let _emptyFit = true
    for(const i in fit) {
      if(fit[i].length > 0) {
        _emptyFit = false;
        break;
      }
    }
    if(_emptyFit) {
      this.tooltip.innerHTML = ''
      return
    }

    this.tooltip.innerHTML = `
      <div class="kill-fit__group">
      ${fit.highSlot.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" title="${i.name}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.medSlot.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" title="${i.name}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.lowSlot.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" title="${i.name}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.rigs.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" title="${i.name}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.subsystem.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" title="${i.name}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.drones.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" title="${i.name}" />
      `)).join('')}
      </div>
    `;
  }

  async fetchKillFit(killID) {
    const fit = { highSlot: [], medSlot: [], lowSlot: [], rigs: [], subsystem: [], drones: [],   }
    
    const rep = await fetch(`https://kb.evetools.org/api/v1/killmails/${killID}`, { headers: { "User-Agent": "raph_5#0989 ^^" } });
    const data = await rep.json();
    
    async function pushItem(position, [ slot, type ], fit) {
      const name = (await chrome.storage.local.get('types:'+type))['types:'+type];
      fit[position].push({ name, type, slot })
    }
    if(Array.isArray(data.vict.itms)) {
      for(const item of data.vict.itms) {
        if(item[0] >= 11 && item[0] < 19) { await pushItem('lowSlot', item, fit) } else
        if(item[0] >= 19 && item[0] < 27) { await pushItem('medSlot', item, fit) } else
        if(item[0] >= 27 && item[0] < 35) { await pushItem('highSlot', item, fit) } else
        if(item[0] >= 92 && item[0] < 94) { await pushItem('rigs', item, fit) } else
        if(item[0] >= 125 && item[0] < 128) { await pushItem('subsystem', item, fit) } else
        if(item[0] == 87 || item[0] == 158) { await pushItem('drones', item, fit) }
      }
    }
  
    for(const position in fit) {
      const _types = {}
      for(const item in fit[position]) {
        if(!_types[fit[position][item].slot] || (_types[fit[position][item].slot] && fit[position][item].name != undefined)) {
          _types[fit[position][item].slot] = { type: fit[position][item].type, name: fit[position][item].name }
        }
      }
      fit[position] = Object.values(_types).sort((v1, v2) => (v1.type - v2.type))
    }
    
    return fit
  }

  constructor(parentEl, killID, visible=false) {
    // props
    this.parentEl = parentEl;

    // fetching
    let fitPromise = this.fetchKillFit(killID)
    
    // remove other existing tooltips
    if(lastTooltip) {
      lastTooltip.style.visibility = 'hidden';
    }
    
    // tooltop DOM element
    this.tooltip = document.createElement('div');

    parentEl.style.position = 'relative';
    parentEl.style.display = 'inline-block';
    parentEl.title = '';
    this.tooltip.className = 'kill-fit';
    this.tooltip.style.visibility = visible ? 'visible' : 'hidden';
    this.tooltip.innerHTML = '<span class="loader"></span>';


    // hidde tooltip on mouseout
    parentEl.addEventListener('mouseout', () => {
      lastTooltip = null;
      this.tooltip.style.visibility = 'hidden';
    });

    // reshow tooltip on hover
    parentEl.addEventListener('mouseover', () => {
      lastTooltip = this.tooltip;
      this.tooltip.style.visibility = 'visible'
    })
    
    // add to the DOM
    parentEl.insertAdjacentElement('afterbegin', this.tooltip);

    fitPromise.then( fit => this.showFit(fit) )

    return fitPromise;
  }

}


let kills = Array.from(document.querySelectorAll('a[class=""]'));
kills = kills.filter(a => a.href.match(/\/kill\/\d+/g));


kills.forEach(el => {
  const killID = el.href.split('/')[4]

  const listener = () => {
    const timeoutID = setTimeout(() => {
      if(!el.dataset.hadTooltip) {
        el.dataset.hadTooltip = true;
        el.removeEventListener('mouseover', listener)
        
        new FitTooltip(el, killID, true)

      }
    }, 600);

    el.addEventListener('mouseout', () => clearTimeout(timeoutID));
  }
  el.addEventListener('mouseover', listener)

})