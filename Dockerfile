# Dockerfile for React frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm install
COPY . .
RUN npm run build

# Serve the build with a static server
FROM node:20-alpine AS serve
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
