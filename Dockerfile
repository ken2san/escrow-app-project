# ===== ビルドステージ =====
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===== プロダクションステージ =====
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# 作成したNginx設定ファイルをコピー
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]