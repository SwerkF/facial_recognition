FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g nodemon

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3000

# Use nodemon for development
CMD ["nodemon", "--exec", "npm", "run", "dev"]