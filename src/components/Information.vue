<template lang="pug">
  v-card
    v-card-title {{current_page.type}}
    v-card-subtitle {{current_page.url}}
    template(v-if="current_page.type=='category'")
      v-card-title Поисковый запрос: {{current_page.category.name}}
      v-card-text()
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
