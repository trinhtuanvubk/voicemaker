FROM node:latest 

WORKDIR /workspace

ENV HOME=/config

COPY package*.json ./

RUN npm install
RUN npm install express multer body-parser --save

# COPY . .

# EXPOSE 6666

# CMD ["node", "server.js"]