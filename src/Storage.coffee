###

  Структура данных

    Спсиок категорий

    categories: {
      url: {name, url}
    }

    Снепшоты страниц категорий

    url: {
      2020.12.12: [...products]
    }

###

#timestamp = -> d = new Date; "#{d.getFullYear()}.#{d.getMonth()+1}.#{d.getDate()}"
timestamp = -> Date.now()

class Storage
  
  @get:(key)-> new Promise (resolve, reject)->
    chrome?.storage?.local?.get key, (res)->resolve res
  
  @set:(key, value)-> new Promise (resolve, reject)->
    obj = {}
    obj[key] = value
    chrome?.storage?.local?.set obj, resolve

  @remove: (key)-> new Promise (resolve, reject)->
    chrome?.storage?.local?.remove key, resolve
    
  @clear: (key)-> new Promise (resolve, reject)->
    chrome?.storage?.local?.clear resolve

  @on_change:(listener)->
    chrome?.storage?.onChanged?.addListener listener


  # CATEGORIES
  
  # get categories -> {url: {url, name}} 
  @get_categories: ->
    key = "categories"
    res = await @get ["categories"]
    categories = res[key]
    categories?={}
    categories

  # check if category exists
  @is_category_exists: (cat)-> 
    categories = await @get_categories()
    cat.url of categories

  # add category {url,name}
  @add_category: (cat)->
    console.log "Add category #{cat.url}"
    categories = await @get_categories()
    unless categories[cat.url]?
      cat.snapshot_ts = ""
      cat.status=""
      categories[cat.url] = cat
      @set "categories", categories
    categories

  # update categories
  @update_categories: (categories)->
    await @set "categories", categories
    categories

  # update category {url,name}
  @update_category: (cat)->
    console.log "Update category #{cat.url}"
    categories = await @get_categories()
    categories[cat.url] = cat
    @set "categories", categories
    categories

  # Delete category by url
  @delete_category: ({url})->
    console.log "Delete category #{url}"
    categories = await @get_categories()
    if categories[url]?
      delete categories[url]
      @set "categories", categories
      # clear snapshots
      @remove url
    categories


  # SNAPSHOTS

  @get_snapshots: (url)->
    console.log "Get snapshots #{url}"
    res = await @get [url]
    snapshots = res[url]
    snapshots?={}
    snapshots

  # Add snapshot 
  @add_snapshot: (url, snapshot)->
    console.log "Add snapshot for #{url}"
    if snapshot?
      snapshots = await @get_snapshots url
      ts = Date.now()
      snapshots[ts] = snapshot
      @set url, snapshots
      snapshots

  # delete snapshots for particular timestamp
  @delete_snapshots: (url, ts)->
    console.log "Delete snapshots #{ts}"
    snapshots = await @get_snapshots url
    if snapshots[ts]
      delete snapshots[ts]
      @set url, snapshots
    snapshots

module.exports = Storage
