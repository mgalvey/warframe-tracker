#!/bin/bash

au build --env prod
mkdir -p build
cp index.html build/
rsync -r scripts build/
