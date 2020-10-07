#!/bin/bash
date=$(date '+%Y-%m-%d')
rm ../ozon.scraper.$date.zip
zip -r ../ozon.scraper.$date.zip ./dist

