const fs = require('fs');
const xml = require("xmlhttprequest").XMLHttpRequest;

const config = JSON.stringify(fs.readFileSync(`${__dirname}/config.json`).toString());
var stor = fs.readFileSync(`${__dirname}/stor.json`);

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

                            for(var [id, item] of Object.entries(content)){
                                if(item.data && item.data.price_overview){
                                    if(item.data.price_overview.discount_percent == 100){
                                        
                                        var title = await checkName(id);
                                        console.log("Title: "+ title);

                                        const link = `https://store.steampowered.com/app/${id}/${title}/`
                                        
                                        var array = new Array(title, item);
                                        stor.push(array);
                                    }
                                }
                            }


                            reques(numb, tempnumb, list);                            
                        }else{
                            if(req.readyState == 4){
                                console.log(`Request Faild \nerr(${req.status}). try to handle`);

                                //skip the 500 error bug. have to fix. its PFUSCH we would say in germany
                                if(req.status == 500){
                                    console.log("Skiped");
                                    reques(numb, tempnumb, list);
                                }else{
                                    console.log("try again");

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
function checkName(id){
    console.log(`fetch name for ${id}`);
    var checkreq = new xml();
    checkreq.open('GET',  `https://store.steampowered.com/api/appdetails?appids=${id}`, true);
    checkreq.send();
    checkreq.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            const response = JSON.parse(this.responseText);
            console.log(response);
            if(response[id].data && response[id].data.name){
                console.log(">"+ response[id].data.name);
                return response[id].data.name;
            }else{
                console.log("data error");
                setTimeout(checkName, 120000, id);
            }
        }
        else if(this.readyState == 4){
            console.log(`Fetch Faild \nerr(${this.status})`);
            setTimeout(checkName, 120000, id);
        }
    }
}