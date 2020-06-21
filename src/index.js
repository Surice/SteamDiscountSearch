const fs = require('fs');
const xml = require("xmlhttprequest").XMLHttpRequest;

const steamAPI = "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=STEAMKEY&format=json";
var out = new Array();

initRequest();


function initRequest(){
    var initReq = new xml();

    initReq.open('GET', steamAPI, true);
    initReq.send();
    initReq.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            const gameList = JSON.parse(this.responseText);
            if(!gameList.applist.apps[0]){initRequest()}
                gameList.applist.apps.forEach(e => {
                    var id = e.appid.toString();
                    var req = new xml();
                    req.open('GET', `https://store.steampowered.com/api/appdetails?appids=${id}&cc=de`, true);
                    req.send();
                    req.onreadystatechange = function(){
                        console.log("change");
                        if(req.readyState == 4 && req.status == 200){
                            console.log(req.responseText);
                            const content = JSON.parse(req.responseText);
                            console.log(content);
                        }else{
                            console.log(req.status);
                        }
                    }
                });
        //        fs.writeFileSync('./stor.json', gameList);
        }else{
            if(this.readyState == 4){
                console.log(this.status);
            }
        }
    }
}