FROM nginx:alpine

# next export 산출물(apps/playground/out)을 그대로 서빙한다. 빌드는 CI에서 먼저 한다.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/playground/out /usr/share/nginx/html

EXPOSE 3000
