FROM node:20-alpine

WORKDIR /app

# Vite needs this for hot reload to work inside Docker on some systems
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]