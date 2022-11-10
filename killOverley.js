
class NameHandler {
  
  static cache = {};
  static nameCallbackID = 245765;
  static setupCallbackID(type) {
    const callbackID = this.nameCallbackID++

    (async () => {
      if(this.cache[type]) {
        document.getElementById(callbackID).title = this.cache[type];
      }
      else {
        const name = (await chrome.storage.local.get(type))[type];
        this.cache[type] = name;
        document.getElementById(callbackID).title = name;
      }
    })()

    return callbackID
  }

}

let lastTooltip = null;
class FitTooltip {

  showData(fit, attackers) {
    let _emptyFit = true
    for(const i in fit) {
      if(fit[i].length > 0) {
        _emptyFit = false;
        break;
      }
    }
    if(_emptyFit) {
      this.tooltipFit.innerHTML = ''
      return
    }

    this.tooltipFit.innerHTML = `
      <div class="kill-fit__group">
      ${fit.highSlot.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" id="${NameHandler.setupCallbackID('types:'+i.type)}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.medSlot.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" id="${NameHandler.setupCallbackID('types:'+i.type)}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.lowSlot.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" id="${NameHandler.setupCallbackID('types:'+i.type)}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.rigs.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" id="${NameHandler.setupCallbackID('types:'+i.type)}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.subsystem.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" id="${NameHandler.setupCallbackID('types:'+i.type)}" />
      `)).join('')}
      </div>
      <div class="kill-fit__group">
      ${fit.drones.map(i => (`
        <img src="https://images.evetech.net/types/${i.type}/icon?size=32" id="${NameHandler.setupCallbackID('types:'+i.type)}" />
      `)).join('')}
      </div>
    `;

    this.tooltipAtt.innerHTML = `
      ${attackers.slice(0, 10).map(att => (`
        <div>
          <img id="${NameHandler.setupCallbackID('types:'+att.ship)}" src="${att.ship !== 0 ? `https://images.evetech.net/types/${att.ship}/render?size=32` : `https://zkillboard.com/img/eve-question.png` }">
          <img id="${NameHandler.setupCallbackID('corpTypes:'+att.corp)}" src="https://images.evetech.net/corporations/${att.corp}/logo?size=32">
          <img id="${NameHandler.setupCallbackID('allyTypes:'+att.alliance)}" src="https://images.evetech.net/alliances/${att.alliance}/logo?size=32">
        </div>
      `)).join('')}

      ${attackers.length > 10 ? `
        <span class="ellipsis">...</span>
      ` : ''}
    `;
  }

  async fetchKillData(killID) {
    const fit = { highSlot: [], medSlot: [], lowSlot: [], rigs: [], subsystem: [], drones: [] }
    const attackers = []
    
    const rep = await fetch(`https://kb.evetools.org/api/v1/killmails/${killID}`, { headers: { "User-Agent": "raph_5#0989 ^^" } });
    const data = await rep.json();
    
    async function pushItem(position, [ slot, type ], fit) {
      fit[position].push({ type, slot })
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

    for(const att of data.atts) {
      attackers.push({
        character: att.character,
        corp: att.corp,
        alliance: att.ally,
        ship: att.ship,
        weapon: att.weapon,
      })
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
    
    return { fit, attackers }
  }

  constructor(parentEl, killID, visible=false) {
    // props
    this.parentEl = parentEl;

    // fetching
    let fitPromise = this.fetchKillData(killID)
    
    // remove other existing tooltips
    if(lastTooltip) {
      lastTooltip.style.visibility = 'hidden';
    }
    
    // tooltop DOM element
    this.tooltip = document.createElement('div');
    this.tooltipFit = document.createElement('div');
    this.tooltipAtt = document.createElement('div');

    parentEl.style.position = 'relative';
    parentEl.style.display = 'inline-block';
    parentEl.title = '';
    this.tooltipFit.className = 'box kill-fit';
    this.tooltipFit.innerHTML = '<span class="loader"></span>';
    this.tooltipAtt.className = 'box kill-att';
    this.tooltipAtt.innerHTML = '<span class="loader"></span>';
    this.tooltip.className = 'overlay-tooltip';
    this.tooltip.style.visibility = visible ? 'visible' : 'hidden';
    this.tooltip.appendChild(this.tooltipFit)
    this.tooltip.appendChild(this.tooltipAtt)
    
    
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

    fitPromise.then( ({ fit, attackers }) => this.showData(fit, attackers) )

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