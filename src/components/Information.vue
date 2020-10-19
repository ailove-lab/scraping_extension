<template lang="pug">
  v-card
    v-card-title {{current_page.type}}
    v-card-subtitle {{current_page.url}}
    template(v-if="current_page.type=='category'")
      v-card-title Поисковый запрос: {{current_page.category.name}}
      v-card-text()
        v-data-table(
          :headers="products_headers"
          :items="products")
        //-
          v-list
            v-list-item(
              v-for="(p, n, i) in products"
              :key="n+'-'+p.title") {{n}}. {{p.title}}
    template(v-if="current_page.type=='product'")
      div(v-for="(p, n, i) in product" :key="n")
        v-card-title {{n}}
        v-card-text: pre {{p}}

      
</template>

<script lang="coffee">

import Scraper from "../Scraper.coffee"

export default
  name: "information"
  props: ["current_page"]
  data:->
    products_headers: [
      { text: "#"        , value: "rank"       }
      { text: "href"     , value: "href"       }
      { text: "Цена 1"   , value: "price1"     }
      { text: "Цена 2"   , value: "price2"     }
      { text: "Цена prem", value: "prem_price" }
      { text: "Цена ед"  , value: "unit_price" }
      { text: "Скидка"   , value: "discount"   }
      { text: "Название" , value: "title"      }
      { text: "Рейтинг"  , value: "rating"     }
      { text: "Отзывы"   , value: "reviews"    }
      { text: "Рзамеры"  , value: "sizes"      }]
    
  computed:
    products:->
      page = Scraper.get_current_page()
      page.products  
    product:->
      page = Scraper.get_current_page()
      page.product
</script>

<style>
</style>
