FROM node:latest

WORKDIR /app/frontend

COPY frontend/package-lock.json frontend/package.json ./
RUN npm install

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
