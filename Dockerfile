FROM nginx:alpine

# Astro 정적 사이트(apps/site/dist)를 그대로 서빙한다. 빌드는 CI에서 먼저 한다.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/site/dist /usr/share/nginx/html

EXPOSE 3000
