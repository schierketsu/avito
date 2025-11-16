FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build static assets
RUN npm run build

ENV PORT=5173
EXPOSE 5173

# Serve the built app
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]


