#!/usr/bin/env sh
git add .    
git commit -m 'update'
git push
set -e
npm run build
cp dist/index.html dist/404.html
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:prohetamine/oninet-front.git master:gh-pages
cd -