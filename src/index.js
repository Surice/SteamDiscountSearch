const fs = require('fs');
const xml = require("xmlhttprequest").XMLHttpRequest;

const config = JSON.stringify(fs.readFileSync(`${__dirname}/config.json`).toString());

const steamAPI = `http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=${config.key}&format=json`;
var out = new Array(),
    count = 0;

initRequest();


function initRequest(){
    var initReq = new xml();

    initReq.open('GET', steamAPI, true);
    initReq.send();
    initReq.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            const gameList = JSON.parse(this.responseText);
            if(!gameList.applist.apps[0]){
                initRequest()
            }
            gameList.applist.apps.forEach(element => {
                var id = element.appid;
                count ++;
                reques(id);
            });
            console.log(">"+ count);
        //        fs.writeFileSync('./stor.json', gameList);
        }else{
            if(this.readyState == 4){
                console.log(this.status);
            }
        }
    }
}

function reques(id){
    var req = new xml();
    req.open('GET', `https://store.steampowered.com/api/appdetails?appids=${id}&cc=de`);
    req.send();
    req.onreadystatechange = function(){
        if(req.readyState == 4 && req.status == 200){
            const content = JSON.parse(req.responseText);
            if(content[id].data && content[id].data.price_overview){
                if(content[id].data.price_overview.discount_percent > 0){
                    console.log(content[id].data.name+ ": " + content[id].data.price_overview.discount_percent);
                }
            }
        }else{
            if(req.readyState == 4){
                if(req.status == 429 || req.status == 403 || req.status == 0){
                    setTimeout(reques, 50, id);
                }else{
                    console.log("error code: "+ req.status);
                }
            }
        }
    }
}