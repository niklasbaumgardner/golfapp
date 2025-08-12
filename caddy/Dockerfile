FROM caddy:latest

WORKDIR /app

COPY /caddy/caddy_start.sh /caddy/Caddyfile .
COPY /golfapp/static  ./static

RUN chmod a+x caddy_start.sh

RUN caddy fmt --overwrite Caddyfile

ENTRYPOINT ["/bin/sh"]

CMD ["caddy_start.sh"]