# based on standard nginx Alpine Linux image
FROM nginx:alpine

# remove any existing configuration
RUN rm -rf /etc/nginx/conf.d

# copy configuration
COPY nginx/conf /etc/nginx

# copy content files
COPY ./html /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run in non-daemon mode
CMD ["nginx", "-g", "daemon off;"]
