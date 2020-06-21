const fs = require('fs');
const xml = require("xmlhttprequest").XMLHttpRequest;

const config = JSON.stringify(fs.readFileSync(`${__dirname}/config.json`).toString());

const steamAPI = `http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=${config.key}&format=json`;
var out = new Array(),
    ids = new Array(),
    count = 0,
    state = -1,
    cache = 0;

initRequest();


function initRequest(){
    var initReq = new xml();

    initReq.open('GET', steamAPI, true);
    initReq.send();
    initReq.onreadystatechange = async function(){
        if(this.readyState == 4 && this.status == 200){
            const gameList = JSON.parse(this.responseText);
            if(!gameList.applist.apps[0]){
                initRequest()
            }
            await gameList.applist.apps.forEach(element => {
                ids.push(element.appid);
                count ++;
            });

            console.log("check: "+ count+ "\n");
            reques();
            
        //        fs.writeFileSync('./stor.json', gameList);
        }else{
            if(this.readyState == 4){
                console.log(">"+ this.status);
            }
        }
    }
}

function reques(){
            if(state < count){
                state++;
                var req = new xml();
                req.open('GET', `https://store.steampowered.com/api/appdetails?appids=${ids[state]}&cc=de`);
                req.send();
                req.onreadystatechange = function(){
                    if(req.readyState == 4 && req.status == 200){
                        const content = JSON.parse(req.responseText);

                        if(content[ids[state]].data && content[ids[state]].data.price_overview){
                            if(content[ids[state]].data.price_overview.discount_percent > 0){
                                console.log(content[ids[state]].data.name+ ": " + content[ids[state]].data.price_overview.discount_percent+ "%");
                            }
                        }
                        if(state == 450){
                            console.log("<"+ state);
                        }
                        if(state/count*100 >= cache + 1){
                            cache = state/count*100;
                            console.log(state/count*100+ "%");
                        }

                        reques();
                    }else{
                        if(req.readyState == 4){
                            console.log(`err(${req.status}). try to catch`);

                            if(req.status == 429){
                                state --;
                                setTimeout(reques, 300000);
                            }
                            if(req.status == 403 || req.status == 0 || req.status == 502){
                                state --;
                                setTimeout(reques, 5000);
                            }
                        }
                    }
                }
            }
}