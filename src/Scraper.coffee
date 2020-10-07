class Scraper
  # Продуктовая карточка озона
  @ozon_prod_sel  : "#__ozon > div > div.a4e4 > div.container.b6e3 > div:nth-child(2) > div:nth-child(2) > div.b6k2.b5y1 > div:nth-child(1) > div.widget-search-result-container.ao3 > div > div";
  @ozon_search_sel: "#__ozon > div > div.a4e4 > header > div.c5y1 > div.c5y5 > div > form"
  @ozon_search_btn: "#{@ozon_search_sel} div.b7j > div > button"

  @ozon:
    category:
      category: "#{@ozon_search_sel} div.b7i4 > input"
      links   : "#{@ozon_prod_sel} > div > div.a0s9 > a.a0y9.tile-hover-target"
      price1  : "#{@ozon_prod_sel} > div > div.a0s9 > a.a0y9.tile-hover-target > div > span"
      price2  : "#{@ozon_prod_sel} > div > div.a0s9 > a.a0y9.tile-hover-target > div > div"
      titles  : "#{@ozon_prod_sel} > div > div.a0s9 > a.a2g0.tile-hover-target"
      rating  : "#{@ozon_prod_sel} > div > div.a0s9 > div.a1a9 > div > div"
      reviews : "#{@ozon_prod_sel} > div > div.a0s9 > div.a1a9 > a"
      sizes   : "#{@ozon_prod_sel} > div > div.a0s9 > div.a2i2.common-aspect"

    product:
      breadcrumbs : "#__ozon > div > div.a4e4 > div:nth-child(5) > div:nth-child(1) > div > div.b0h8.b0i6.b0j0.b0j8.b5y1 > div > ol"
      sizes       : "#__ozon > div > div.a4e4 > div:nth-child(5) > div:nth-child(3) > div.b5z.b5y > div:nth-child(1) > div:nth-child(2) > div > div.b0h8.b0i.b0j3.b0k0 > div:nth-child(1) > div > div:nth-child(1) > div.a0n3 > div"
      units       : "#__ozon > div > div.a4e4 > div:nth-child(5) > div:nth-child(3) > div.b5z.b5y > div:nth-child(1) > div:nth-child(2) > div > div.b0h8.b0i.b0j3.b0k0 > div:nth-child(1) > div > div:nth-child(2) > div.a0n3 > div"
      details     : "#__ozon > div > div.a4e4 > div:nth-child(5) > div:nth-child(3) > div.b5z.b5y > div:nth-child(1) > div:nth-child(2) > div > div.b0h8.b0i.b0j3.b0k0 > div:nth-child(2) > div > div > div > div"
      prices      : "#__ozon > div > div.a4e4 > div:nth-child(5) > div:nth-child(3) > div.b5y4.b5y > div > div:nth-child(2) > div > div > div > div.b3d3 > div > div > div:nth-child(2)"
      description : "#__ozon > div > div.a4e4 > div:nth-child(6) > div > div > div > div.b0h8.b0i.b0j3.b0j9 > div:nth-child(2) > div.b5z.b5y > div > div:nth-child(1)"
      specs       : "#__ozon > div > div.a4e4 > div:nth-child(6) > div > div > div > div.b0h8.b0i.b0j3.b0j9 > div:nth-child(2) > div.b5z.b5y > div > div:nth-child(3) > div > div"
      tags        : "#__ozon > div > div.a4e4 > div:nth-child(6) > div > div > div > div.b0h8.b0i.b0j3.b0j9 > div:nth-child(2) > div.b5z.b5y > div > div:nth-child(4) > div"
      stars       : "#__ozon > div > div.a4e4 > div:nth-child(6) > div > div > div > div.b0h8.b0i.b0j3.b0j9 > div.paginator > div > div:nth-child(2) > div.b5y4.b5y > div:nth-child(1) > div > div > div.a4d3"
      
  @market: -> "ozon"

  @on_category_change: (handler)->
    if @market() is "ozon" 
      i = document.querySelector Scraper.ozon.category.category
      i.addEventListener "change", handler

  # singelton url-change dispatcher
  @location_listeners: []
  @location_iid: undefined
  @location_href: undefined
  @on_location_change: (handler)->
    @location_listeners.push handler
    check_href = =>
      new_href = window.location.href
      if @location_href isnt new_href
        l() for l in @location_listeners
      @location_href = new_href
    # На первом вызове создаем таймер
    unless @location_iid?
      @location_href = window.location.href
      @location_iid = setInterval check_href, 500
      
  # Пулинг смены урла, ждем пока урл не сменится
  # к сожалению у window.location нет события измения 
  @wait_for_location_change: ->new Promise (resolve, reject)->
      old_href = window.location.href
      timeout = 20
      check_href = ->
        new_href = window.location.href
        if old_href != window.location.href
          return resolve new_href
        if --timeout>0 then setTimeout check_href, 500
        else reject "Timeout"
      do check_href

  # Простая асинхорнная задержка
  @wait: (t)-> new Promise (resolve, reject)-> setTimeout resolve, t

  @goto_category: (cat)->
    console.log "Goto category #{cat.name}"
    if @market() is "ozon"
      # Заполняем поле поиска
      i = document.querySelector Scraper.ozon.category.category
      i.value = cat.name
      # Дергаем тригеры обновления
      i.dispatchEvent new Event "input"
      i.dispatchEvent new Event "change"
      # кликаем кнопку поиска
      b = document.querySelector Scraper.ozon_search_btn
      b.click()

  # получаем имя категории поля поиска
  @get_current_category: ->
    m = @market()
    if m is "ozon"
      url: window.location.href
      name: document.querySelector(Scraper[m].category.category).value;
      status: "unknown"

  @get_page_type: ->
    href = window.location.href 
    m = @market()
    if m is "ozon"
      switch
        when /ru\/(search|category)\//.test href then "category"
        when /ru\/(context|product)\//.test href then "product"
        else "unknown"
        
  # получаем страницу
  # page:
  #   type: "category" | "product" | "unknown"
  #   url
  #   [category]
  #   [products]
  @get_current_page: ->
    m = @market()
    if m is "ozon"
      page = 
        type: @get_page_type()
        url: window.location.href
      if page.type is "category"
        page = {
          ...page
          category: @get_current_category()
          products: @get_products() }
      if page.type is "product"
        page = {
          ...page
          product: @get_product()
        }
    page
    
  # Собираем продукты со страницы
  @get_products: ->
    m = @market()
    if m is "ozon"
      sel = Scraper[m].category
      ds  = (s)->document.querySelectorAll s 
      links   = [...ds(sel.links)]
      hrefs   = links.map((e)->e.getAttribute("href"))
      price1  = [...ds(sel.price1 )].map((e)->e.innerText)
      price2  = [...ds(sel.price2 )].map((e)->e.innerText)
      titles  = [...ds(sel.titles )].map((e)->e.innerText)
      rating  = [...ds(sel.rating )].map((e)->e.style.width)
      reviews = [...ds(sel.reviews)].map((e)->e.innerText)
      sizes   = [...ds(sel.sizes  )].map((e)->[...e.querySelectorAll("div")].map((d)=>d.innerText).join("/"))
            
      links.map (h,i)->
        link:    links[i]
        href:    hrefs[i]
        price1:  price1[i]
        price2:  price2[i]
        title:   titles[i]
        rating:  rating[i]
        reviews: reviews[i]
        sizes:   sizes[i]
        
  @get_product: ->
    m = @market()
    if m is "ozon" 
      sel = Scraper[m].product
      da  = (s)->document.querySelectorAll s
      ds  = (s)->document.querySelector s

      product =
        breadcrumbs : [...da(sel.breadcrumbs)].map((e)=>e.innerText.trim()).join("/")
        sizes_prod  : [...da(sel.sizes      )].map((e)=>e.innerText.trim()).join("/")
        units       : [...da(sel.units      )].map((e)=>e.innerText.trim()).join("\n\n")
        details     : ds(sel.details    )?.innerText
        prices_prod : ds(sel.prices     )?.innerText
        description : ds(sel.description)?.innerText
        specs       : ds(sel.specs      )?.innerText
        tags        : ds(sel.tags       )?.innerText
        stars       : ds(sel.stars      )?.innerText

    product
    
module.exports = Scraper
