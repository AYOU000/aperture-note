FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY . .
RUN npm install

RUN npx prisma generate


RUN ./node_modules/.bin/prisma generate
RUN apk add --no-cache postgresql-client
RUN npm run dev
EXPOSE 3001

CMD ["npm", "run", "dev"]