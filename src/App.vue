<template lang="pug">

  v-app#scrap_app: v-main
    
    v-speed-dial#scrap_button(
      v-model="speed_dial" top left 
      direction="right" 
      open-on-hover
      transition="slide-x-transition")
     
      template(v-slot:activator)
        v-btn(v-model="speed_dial" color="pink" dark fab)
          v-icon(v-if="speed_dial" @click="dialog=true") mdi-table
          v-icon(v-else) mdi-triangle

      v-btn(v-if="current_page.type=='category'" fab dark small color="indigo" @click.stop="add_category"): v-icon mdi-plus
      v-btn(fab small @click.stop="information = true"): v-icon mdi-information
      //- v-btn(v-else fab small): v-icon mdi-circle-outline
      //- v-btn(fab dark small color="green"  @click.stop="start_schedule"): v-icon mdi-update
        
    v-row#scrap_panel
      v-dialog(
        v-model="dialog"
        max-width="75%"
        scorllable
        hide-overlay)
        v-card
          v-toolbar(dark color="primary")
            v-toolbar-title Агрегатор первой полки
            v-spacer
            v-btn(icon dark @click="dialog = false"): v-icon mdi-close
          v-card-text(v-if="categories && Object.keys(categories).length")
            v-row: v-col
              Categories(
                :categories="categories"
                @category-select="goto_category"
                @category-delete="category_delete"
                @category-snapshot="category_snapshot"
                @snapshot-all="snapshot_all"
                @download-xlst="download_xlst")
              Products(:key="scraping_table_key" :scraping_products="scraping_products")
          v-card-title(v-else): span.hedaline Категории не добавлены
            
    v-row#info_panel
      v-dialog(
        v-model="information"
        max-width="75%"
        scrollable
        hide-overlay)
        
        v-card
          v-toolbar(dark color="green")
            v-toolbar-title Информация по текущей странице
            v-btn(icon dark @click="refresh_current_page()"): v-icon mdi-update
            v-spacer
            v-btn(icon dark @click="information = false"): v-icon mdi-close
          v-card-text: v-row: v-col
            Information(:key="info_key" :current_page="current_page")
        
</template>

<script lang="coffee">

import Categories from "./components/Categories.vue"
import Products from "./components/Products.vue"
import Information from "./components/Information.vue"
import Scraper from "./Scraper.coffee"
import Storage from "./Storage.coffee"

export default
  components: { Categories, Products, Information }
  data: ->
    categories: {}
    current_page: {}
    scraping_products: undefined
    scraping_table_key: 0
    speed_dial: false
    dialog: false
    information: false
    info_key: 0

  created: ->
    # Мониторинг изменения урла
    Scraper.on_location_change @refresh_current_page
    @refresh_current_page()

    # Мониторинг изменения списка категорий
    Storage.on_change @on_storage_change
    @update_categories()
  
  methods:

    update_categories: ->
      @categories = await Storage.get_categories()
 
    on_storage_change: (obj, area)->
      if area is "local" and obj.categories?
        @update_categories()

    refresh_current_page:->
      @current_page = Scraper.get_current_page()
      @info_key++
      console.log "Refresh current page"
      console.log @current_page

    category_select: (cat)->
      @goto_category cat

    add_category: ->
      if @current_page.type is "category"
        await Storage.add_category @current_page.category
      
    category_delete: (cat)->
      confirm("Точно удалить '#{cat.name}'?") and
      await Storage.delete_category cat

    goto_category: (cat)->
      try
        Scraper.goto_category cat
        await Scraper.wait_for_location_change()
        await Scraper.wait 2000
        @current_page = Scraper.get_current_page()       
      catch e
        console.error e
        
    category_status: (cat, status)->
      cat.status = status
      Storage.update_category cat
      
    category_snapshot: (cat)->
      @category_status cat, "run"
      
      # Проверяем текущую страницу
      # если ещё не на ней - переходим
      if @current_page.url isnt cat.url
        await @goto_category cat

      page = Scraper.get_current_page()
      @scraping_products = page.products
      @scraping_products.map (p,i)=>p.rank=i+1; p.status="waiting"

      for p, i in @scraping_products
        try
          p.status = "run"
          p.link.click()
          
          try
            await Scraper.wait_for_location_change()
          catch e
            err = "Не получилось открыть продуктовую страницу"
            console.error err, p
            p.status = "err"
            p.error = err
            continue
            
          # Скорлим страницу вниз, для ленивой прогрузки
          for j in [0..20]
            window.scrollBy 0, 500
            await Scraper.wait 250
          window.scrollTo 0, document.body.scrollHeight

          # Дополняем продукт данными
          page = Scraper.get_current_page()
          product = page.product
          p[k] = v for k, v of product
          p.status = "ok"
          
          # Лайфак / костыль - по какой-то причине v-data-table не апдейтися из событий          
          # Обновляем ключ компоненту, чтобы он перерисовался
          @scraping_table_key++
        catch e
          console.error e
          p.status = "err"
          p.error = e

        # break if i>=2
      cat.snapshot_ts = Date.now()
      @category_status cat, "ok"
      await Storage.add_snapshot cat.url, @scraping_products
      await Storage.update_category cat

    snapshot_all: ->
      list = []
      for k, cat of @categories
        cat.status = 'waiting'
      await Storage.update_categories @categories
      
      for k, cat of @categories
        @category_status cat, 'run'
        try
          await @category_snapshot cat
          @category_status cat, 'ok'
        catch e
          console.error e
          @category_status cat, "err"


    download_xlst: ->
      header = [
        "timestamp"
        "rank"
        "href"
        "title"
        "rating"
        "price1"
        "price2"
        "sizes"
        "reviews"
        "breadcrumbs"
        "sizes_prod"
        "units"
        "details"
        "prices_prod"
        "description"
        "specs"
        "tags"
        "stars"]

      ts2date = (ts)->
        d = new Date parseInt ts
        z = (n)->('0'+n)[-2..]
        "#{z d.getDate()}.#{z d.getMonth()+1}.#{d.getFullYear()} #{z d.getHours()}:#{z d.getMinutes()}"
        
      book = XLSX.utils.book_new()
      for url, category of await Storage.get_categories()
        products = []
        for ts, snapshot of await Storage.get_snapshots url
          products = products.concat snapshot.map((p)->p.timestamp=ts2date(ts); p)
        sheet = XLSX.utils.json_to_sheet products, header: header
        XLSX.utils.book_append_sheet(book, sheet, category.name[..30]);
          
      XLSX.writeFile(book,"ozon_#{Date.now()}.xlsx");

</script>

<style scoped lang="styl">
#scrap_app
  position: fixed
  left: 0px
  top: 0px
  width: 1px
  height: 1px
  oveflow: visible
  z-index: 2147483648

#scrap_button
  padding: 8px
  position: fixed
  left: 8px
  top: 8px
  z-index: 10000
  cursor: pointer

#scrap_panel, #info_panel
   display: none
   padding: 4px
   position: fixed
   left: 0px
   top: 0px
   width: 100%
   height: 100%

</style>
