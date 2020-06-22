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

            var numb = ids.length/1000,
            tempnumb = 0,
            list = new Array();

            reques(numb, tempnumb, list);
            
        //        fs.writeFileSync('./stor.json', gameList);
        }else{
            if(this.readyState == 4){
                console.log(">"+ this.status);
            }
        }
    }
}

function reques(numb, tempnumb, list){
                if(numb > 0){
                    list = ids.splice(0, 1000);
                    numb --;
                                        
                    list = list.join(",");

                    console.log(ids.length);

                    var req = new xml();
                    req.open('GET', `https://store.steampowered.com/api/appdetails?appids=${list}&filters=price_overview`);
                    req.send();
                    req.onreadystatechange = async function(){
                        if(req.readyState == 4 && req.status == 200){

                            const content = JSON.parse(req.responseText);
                            out.push(content);

                            reques(numb, tempnumb, list);                            
                        }else{
                            if(req.readyState == 4){
                                //skip the 500 error bug. have to fix. its PFUSCH we would say in germany
                                if(req.status == 500){
                                    reques(numb, tempnumb, list);
                                }else{
                                    console.log(`err(${req.status}). try to catch`);

                                    list = list.split(",");
                                    await list.forEach(e => {
                                        ids.unshift(e);
                                    });
                                    numb++;

                                    setTimeout(reques, 300000, numb, tempnumb, list);
                                }
                            }
                        }
                    }
                }else{
                    console.log(out);
                }    
}