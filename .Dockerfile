FROM node:10
ADD . /app
RUN npm install --production
CMD node start