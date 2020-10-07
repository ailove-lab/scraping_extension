<template lang="pug">
  v-card(v-if="scraping_products")
    //- Продукты текущей страницы
    template(v-if="scraping_products")
      v-card-title
        span Собираемые продукты

      v-card-text
        v-data-table(
          :headers="headers"
          :items="scraping_products"
          dense)
          template(v-slot:item.status="{ item }")
            v-icon(v-if="item.status=='waiting'" ) mdi-update
            v-icon(v-else-if="item.status=='run'" color="orange") mdi-play-circle
            v-icon(v-else-if="item.status=='err'" color="red"   ) mdi-alert-circle
            v-icon(v-else-if="item.status=='ok'"  color="green" ) mdi-checkbox-marked-circle
            v-icon(v-else) mdi-circle-outline
</template>

<script lang="coffee">

import Storage from "../Storage.coffee"

export default
  name: "products"
  props: ["scraping_products"]
  data:->
    headers: [
      {text: "Статус"   , value: "status"  }
      {text: "#"        , value: "rank"    }
      {text: "Название" , value: "title"   }
      {text: "Рейтинг"  , value: "rating"  }
      {text: "Цена"     , value: "price1"  }
      {text: "Цена"     , value: "price2"  }
      {text: "Размеры"  , value: "sizes"   }
      {text: "Обзоров"  , value: "reviews" }
      # Детали со страницы продукта
      # {text: "Крошки"   , value: "breadcrumbs"}
      # {text: ""       , value: "sizes"      }
      # {text: "шт/уп"    , value: "units"      }
      # {text: "Детали"   , value: "details"    }
      # {text: ""       , value: "prices"     }
      # {text: "Описание" , value: "description"}
      # {text: "Информ"   , value: "specs"      }
      # {text: "Тэги"     , value: "tags"       }
      # {text: "Звезды"   , value: "stars"      }       
      ]
</script>

<style>
.v-data-table { 
  overflow-x: auto !important;
}
</style>
