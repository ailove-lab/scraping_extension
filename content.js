console.log("CONTENT SCRIPT");

let btn = (text, ico, click)=>`
<button 
    class="button is-small is-primary is-rounded"
    v-on:click='${click}'>
    <span class="icon is-small"><i class="fas fa-${ico}"></i></span>
    <span>${text}</span>
</button>`;

let ico = (ico, click)=>`
<button 
    class="button is-small is-primary"
    v-on:click='${click}'>
    <span class="icon is-small"><i class="fas fa-${ico}"></i></span>
</button>`;


let categories_list = `
<div 
    class="message-header is-small is-info">
    <span>Категории</span>
    <button 
        class="delete is-small is-right"
        v-on:click="hide_panel">
    </button>
</div>

<!--
<div class="buttons has-addons is-fullwidth is-centered">
    <button class="button is-small">
        <span class="icon is-small"><i class="fas fa-play-circle"></i></span>
        <span>Собрать всё<span>
    </button>
    <button class="button is-small">
        <span class="icon is-small"><i class="fas fa-trash"></i></span>
        <span>Очистить</span>
    </button>
    <button class="button is-small">
        <span class="icon is-small"><i class="fas fa-file-download"></i></span>
        <span>Скачать</span>
    </button>
</div>
-->

<table v-if="categories && categories.length > 0" class="table" style="width:100%;">
  <tr
    v-for="c,i in categories" 
    :key="c.name">
    <td><a v-on:click="goto_category(c.url)">{{ c.name }}</a></td>
    <td>
        <!-- span v-on:click="download_category(i)" class="icon is-small has-text-grey"><i class="fas fa-file-download"></i></span -->
        <span v-on:click="delete_category(i)"   class="icon is-small has-text-grey"><i class="fa fa-trash"></i></span>
    </td>
  </tr>
</table>

<button 
    v-if="!category_exists"
    class="button is-small is-link is-outlined is-fullwidth"
    v-on:click='add_category'>
    Добавить&nbsp;<b>{{category_name}}</b>
</button>  
`;

let goods_list = `
<div class="message-header is-small">
    <span>{{category_name}}</span>
    <span 
        class="is-right"
        v-if="goods">

        <span 
            class="icon is-small"
            v-on:click="download_category">
            <i class="fas fa-file-download"></i>
        </span>

        <span
            v-show="status=='paused'"
            v-on:click="scrap_goods_details" 
            class="icon is-small">
            <i class="fas fa-play-circle"></i>
        </span>
        <span
            v-show="status=='scraping'"
            class="icon is-small"
            v-on:click="status='paused'">
            <i class="fas fa-spinner fa-pulse has-text-info"></i>
        </span>      
    </span>
</div>

<table v-if="goods && goods.length > 0" class="table is-small">
  <tr
    v-for="g, i in goods" 
    :key="g.name">
    <td><a v-on:click='goto_product(i)'>{{ g.title }}</a></td>
    <td>
        <span
            v-show="g.status=='error'" 
            class="icon is-small">
            <i class="far fa-times-circle has-text-danger"></i>
        </span>
        <span
            v-show="g.status=='scraped'" 
            class="icon is-small">
            <i class="fas fa-circle has-text-success"></i>
        </span>
        <span
            v-show="g.status=='scraping'"
            class="icon is-small">
            <i class="fas fa-spinner fa-pulse has-text-info"></i>
        </span>
        <span
            v-show="!g.status"
            class="icon is-small">
            <i class="far fa-circle"></i>
        </span>
    </td>
  </tr>
</table>
`;


const app_tpl = `
<div class="block">${categories_list}</div>
<div class="block">${goods_list}</div>
`

function create_panel() {
    
    let scrap_panel = document.createElement("div");
    scrap_panel.innerHTML = app_tpl; 
    scrap_panel.id = "scrap_panel";
    scrap_panel.class = "container is-fluid";
    document.body.appendChild(scrap_panel);
    
    let scrap_button = document.createElement("img"); 
    scrap_button.id = "scrap_button";
    scrap_button.src = chrome.runtime.getURL("img/favicon.png");
    scrap_button.addEventListener("click", function() {
        let s = document.getElementById("scrap_panel")
        s.style.display="block"; 
        console.log(s)});
    document.body.appendChild(scrap_button);
    
    var app = new Vue({
      el: '#scrap_panel',
      
      data: {
        market: "ozon",
        status: 'paused',
        goods: [],
        category_name: null,
        categories: []
      },

      created: function() {
        // Категории
        this.get_categories();
        setTimeout(()=>{
            this.goods = this.scrap_category();
        }, 3000);
        // забираем категории
        if(this.market == "ozon") {
          // находим поиск, обновляем изменени поискового запроса
          let category_input = document.querySelector("#__ozon > div > div.a4e4 > header > div.c5y1 > div.c5y5 > div > form > div.b7i4 > input");
          this.category_name = category_input.value;
          category_input.addEventListener("change",(e)=> {
            console.log(e, this, this.category_name);
            this.category_name=category_input.value
          });

        }

      },
      computed: {
        category_exists: function() {
            for(let k of this.categories) {
                if (this.category_name === k.name) return true
            }
            return false
        }
      },
      methods: {

          // Прячет панель
          hide_panel: function() {
            let s = document.getElementById("scrap_panel")
            s.style.display="none";
          },

          // Собирает первую полку категории
          scrap: function() {
            this.message = JSON.stringify(scrap_catalogue());
          },

          // Обходит все продукты категории, открыват, заполняет описания, размеры 
          scrap_goods_details: function() {
            this.status = "scraping";
            let m = this.goods.length;
            let i = -1;
            var scrap_product_page = ()=> {
                try {
                    this.goods[i].description = document.querySelector("#section-description > div > div > div > div").innerHTML
                    this.goods[i].details = [...document.querySelectorAll("#__ozon > div > div > div > div > div > div> div > div > div > div > div > div > div > div > dl")]
                        .reduce((o, d)=>{ o[d.querySelector("dt").innerText] = d.querySelector("dd").innerText; return o}, {});
                    this.goods[i].sizes = [...document.querySelectorAll("div.b0h8.b0i.b0j3.b0k0 > div:nth-child(1) > div > div:nth-child(1) > div.a0n3 > div > div > button > div > div > span > span")]
                        .map((el)=>el.innerText);
                    this.$set(this.goods,i, {...this.goods[i], status:"scraped"});
                    console.log(this.goods[i]);
                } catch {
                    this.$set(this.goods,i, {...this.goods[i], status:"error"});
                }
                scrap_next_product();
            }
            var scrap_next_product = ()=> {
                i++;
                if(this.status == "scraping" && i<m) {
                    this.$set(this.goods, i, {...this.goods[i], status: "scraping"});
                    this.goods[i].link.click();       
                    setTimeout(scrap_product_page, 2000);
                } else {
                    this.status = "paused";
                }
            }
            scrap_next_product();
          },

          // Получает список категорий из localstorage
          get_categories: function() {
            let key = `${this.market}_categories`;
            chrome.storage.local.get(key, (res)=>{
              console.log(res)
              // Ключ пустой
              if(Object.keys(res).length === 0 && res.constructor === Object) {
                console.log("Категории пусты");
                this.categories = [];
                this.save_categories();
              } else {
                 this.categories = res[key];
              } 
            })
          },

          // получает список категорий из localstorage
          save_categories: function() {
            console.log("set categories");
            let key = `${this.market}_categories`;
            let obj = {}; obj[key]=this.categories;
            chrome.storage.local.set(obj);
          },

          // добавленинее новой категории
          add_category: function() {
            let goods = this.scrap_category();
            this.categories.push({name: this.category_name, url: window.location.href, goods: goods});
            this.save_categories();
          },

          // Удаление категории
          delete_category: function(i) {
              if(confirm(`Точно удалить ${this.categories[i].name}`)) {
                  this.categories.splice(i,1);
                  this.save_categories();
              }
          },

          // открыват категорию
          goto_category: function(url) {
              window.location = url;
          },

          // скачивание категории
          download_category: function() {
              var book = XLSX.utils.book_new();
              var sheet = XLSX.utils.json_to_sheet(
                this.goods, 
                {header: [ 
                  "href",
                  "price1",
                  "price2",
                  "title",
                  "rating",
                  "reviews",
                  "sizes",
                  "details",
                  "description"]});
              XLSX.utils.book_append_sheet(book, sheet, this.category_name);
              XLSX.writeFile(book,`${this.category_name}.xlsx`);
          },

          // Сбор товаров со стрнаинцы категории
          scrap_category: function() {
            let prod_sel = "#__ozon > div > div.a4e4 > div.container.b6e3 > div:nth-child(2) > div:nth-child(2) > div.b6k2.b5y1 > div:nth-child(1) > div.widget-search-result-container.ao3 > div > div";
            
            let links = [...document.querySelectorAll(`${prod_sel} > div > div.a0s9 > a.a0y9.tile-hover-target`)];
            let hrefs = links.map((e)=>e.getAttribute("href"));

            let price1  = [...document.querySelectorAll(`${prod_sel} > div > div.a0s9 > a.a0y9.tile-hover-target > div > span`)].map((e)=>e.innerText);
            let price2  = [...document.querySelectorAll(`${prod_sel} > div > div.a0s9 > a.a0y9.tile-hover-target > div > div`)].map((e)=>e.innerText);
            let titles  = [...document.querySelectorAll(`${prod_sel} > div > div.a0s9 > a.a2g0.tile-hover-target`)].map((e)=>e.innerText);
            let rating  = [...document.querySelectorAll(`${prod_sel} > div > div.a0s9 > div.a1a9 > div > div`)].map((e)=>e.style.width);
            let reviews = [...document.querySelectorAll(`${prod_sel} > div > div.a0s9 > div.a1a9 > a`)].map((e)=>e.innerText);
            let sizes   = [...document.querySelectorAll(`${prod_sel} > div > div.a0s9 > div.a2i2.common-aspect`)].map((e)=>[...e.querySelectorAll("div")].map((d)=>d.innerText));
            
            return links.map((h,i)=>{
                return {
                    link:    links[i],
                    href:    hrefs[i],
                    price1:  price1[i],
                    price2:  price2[i],
                    title:   titles[i],
                    rating:  rating[i],
                    reviews: reviews[i],
                    sizes:   sizes[i],
                }
            })
          },
          goto_product: function(i) {
              this.goods[i].link.click();
          } 
      }
      
    })
    
    window.addEventListener ("load", onload, false);

    function onload (evt) {
        console.log("page loaded");
    }
}

create_panel();
