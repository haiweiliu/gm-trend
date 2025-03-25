#!/bin/bash

# Create a temporary directory for deployment
mkdir -p dist

# Copy necessary files to dist
cp -r home.html search.html server.js package.json package-lock.json dist/

# Rename home.html to index.html in dist
mv dist/home.html dist/index.html

# Deploy to gh-pages branch
./node_modules/.bin/gh-pages -d dist 