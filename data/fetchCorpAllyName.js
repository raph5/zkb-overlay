const https = require('https');
const fs = require('fs/promises');

function fetch(url, body=null, calls=0) {
  return new Promise((res, rej) => {
    const _url = new URL(url)
    const options = {
      hostname: _url.hostname,
      path: _url.pathname,
      method: body ? 'POST' : 'GET'
    }
    const req = https.request(url, options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        try {
          res(JSON.parse(data));
        } catch (err) {
          if(calls < 5) {
            fetch(url, null, calls-1)
          }
          else {
            rej(`url : ${url}\nrep :\n${data}\n${err}`)
          }
        }
      });
    })
    req.on("error", (err) => {
      if(calls < 5) {
        fetch(url, null, calls-1)
      }
      else {
        rej(`url : ${url}\n${err}`)
      }
    });
    if(body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  })
}

ESI = "https://esi.evetech.net/latest";

// TODO: use https://esi.evetech.net/ui/#/Universe/post_universe_names

(async () => {

const alliancesID = await fetch(ESI+'/alliances')

const corpsID = (await Promise.all(alliancesID.map(async (id) => (
  await fetch(`${ESI}/alliances/${id}/corporations`).catch(e => console.error(e))
)))).flat()

const chunkedAlliancesID = []
for(let i=0; i<alliancesID.length; i+=1000) {
  chunkedAlliancesID.push(alliancesID.slice(i, i+1000))
}
const alliancesData = (await Promise.all(chunkedAlliancesID.map(async (chunk) => (
  await fetch(`${ESI}/universe/names`, chunk)
)))).flat()

const chunkedCorpsID = []
for(let i=0; i<corpsID.length; i+=1000) {
  chunkedCorpsID.push(corpsID.slice(i, i+1000))
}
const corpsData = (await Promise.all(chunkedCorpsID.map(async (chunk) => (
  await fetch(`${ESI}/universe/names`, chunk)
)))).flat()

const alliancesTypeToName = {}
for(const i of alliancesData) {
  alliancesTypeToName[i.id] = i.name
}
const corpsTypeToName = {}
for(const i of corpsData) {
  corpsTypeToName[i.id] = i.name
}

await fs.writeFile('./allianceTypeToName.json', JSON.stringify(alliancesTypeToName))
await fs.writeFile('./corpTypeToName.json', JSON.stringify(corpsTypeToName))

})()