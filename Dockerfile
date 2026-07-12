
FROM node:20-alpine

# Folder kerja di dalam container
WORKDIR /app

# Copy manifest dulu supaya layer install bisa di-cache
COPY package*.json ./

# Install dependency (termasuk devDependencies untuk nodemon saat dev)
RUN npm install

# Copy sisa source code
COPY . .

# Port yang diekspos (samakan dengan PORT di .env)
EXPOSE 5000

# Jalankan mode dev (auto-reload via nodemon).
# Untuk production, ganti ke: CMD ["npm", "start"]
CMD ["npm", "run", "dev"]
