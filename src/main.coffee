# import Vue from 'vue'
# import vuetify from './plugins/vuetify'
import App from './App.vue'

load_script = (src)-> new Promise (resolve, reject)->
  console.log "LOAD #{src}"
  scr = document.createElement 'script'
  scr.onload = resolve
  scr.src = src
  document.head.appendChild(scr)

init = ->
  console.log "START SCRAPER"
  # await load_script chrome.runtime.getURL "vue.js"
  # await load_script chrome.runtime.getURL "vuetify.js"

  # автообновление расширения
  # TODO закоментировать
  # chrome?.runtime?.reload?()

  # onload = (evt)-> console.log("page loaded")
  # window.addEventListener "load", onload, false

  # Основная панель
  scrap_panel = document.createElement("div")
  scrap_panel.id = "scrap_panel"
  document.body.appendChild(scrap_panel)

  app = new Vue(
    # el: '#scrap_panel'  
    render: (h)->h App
    data:->
      scrap_panel: scrap_panel
    vuetify: new Vuetify).$mount "#scrap_panel"
    
init()
