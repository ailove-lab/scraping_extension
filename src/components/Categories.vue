<template lang="pug">
  v-card
    v-card-title Категории товаров
      v-spacer
      v-btn(icon @click.stop="$emit('snapshot-all')"): v-icon mdi-camera-retake
      v-btn(icon @click.stop="$emit('download-xlst')"): v-icon mdi-table-arrow-down

    v-list(color="transparent")
      v-list-item(
        v-for="(cat, n, i) in categories"
        :key="cat.url"
        v-on:click="$emit('category-select', cat)"
        selectable)
         
        v-list-item-icon(v-if="cat.status")
          v-icon(v-if="cat.status=='waiting'" ) mdi-update
          v-icon(v-else-if="cat.status=='run'" color="orange") mdi-play-circle
          v-icon(v-else-if="cat.status=='err'" color="red"   ) mdi-alert-circle
          v-icon(v-else-if="cat.status=='ok'"  color="green" ) mdi-checkbox-marked-circle
          v-icon(v-else) mdi-circle-outline

        v-list-item-content
          v-list-item-title {{cat.name}}
          v-list-item-subtitle(v-if="cat.snapshot_ts") обновлено {{new Date(cat.snapshot_ts)}}
        v-list-item-icon: v-icon(@click.stop="$emit('category-snapshot', cat)") mdi-camera
        v-list-item-icon: v-icon(@click.stop="$emit('category-delete', cat)") mdi-delete
         
</template>

<script lang="coffee">

import Scraper from "../Scraper.coffee"
import Storage from "../Storage.coffee"

export default
  name: "categories"
  props: ["categories"]
        
</script>
