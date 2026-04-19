FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client inside the container environment
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]