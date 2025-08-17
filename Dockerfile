FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # 👈 compiles TS → dist/

CMD ["node", "dist/src/index.js"]
