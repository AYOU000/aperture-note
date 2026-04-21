FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npx prisma generate

RUN npm install

EXPOSE 3001

CMD ["npm", "run", "dev"]