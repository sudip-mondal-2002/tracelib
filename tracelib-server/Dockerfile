# Use lighter weight runner
FROM node:22-alpine

COPY . /app

WORKDIR /app
RUN npm ci
RUN npx prisma generate
CMD ["npm", "start"]
