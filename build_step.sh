#!/bin/bash

echo "building"

npm ci

cd frontend
npm ci
npm run build
cd ..

