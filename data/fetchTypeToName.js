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

ESI = "https://esi.evetech.net/latest"
CATEGOIES = [6, 7, 87, 32];


(async () => {

const groups = (await Promise.all(CATEGOIES.map(async (cat) => (
  (await fetch(`${ESI}/universe/categories/${cat}`).catch(e => console.error(e))).groups
)))).flat()

const types = (await Promise.all(groups.map(async (group) => (
  (await fetch(`${ESI}/universe/groups/${group}`).catch(e => console.error(e))).types
)))).flat()

const chunkedTypes = []
for(let i=0; i<types.length; i+=1000) {
  chunkedTypes.push(types.slice(i, i+1000))
}

const nameData = (await Promise.all(chunkedTypes.map(async (chunk) => (
  await fetch(`${ESI}/universe/names`, chunk)
)))).flat()

const typeToName = {}
for(const i of nameData) {
  typeToName[i.id] = i.name
}

await fs.writeFile('./typeToName.json', JSON.stringify(typeToName))

})()