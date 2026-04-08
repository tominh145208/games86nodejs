FROM node:18-bullseye-slim

WORKDIR /app

# Keep container timezone aligned with app expectation.
ENV TZ=Asia/Ho_Chi_Minh
RUN apt-get update && apt-get install -y --no-install-recommends tzdata \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN chmod +x ./start.sh

EXPOSE 2004
CMD ["sh", "./start.sh"]
