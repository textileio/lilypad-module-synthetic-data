FROM node:20
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN mkdir /outputs
CMD ["sh", "-c", "SEED=${SEED} NUM_CONTRACTS=${NUM_CONTRACTS} node generate.js"]