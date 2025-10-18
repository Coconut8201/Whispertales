FROM mongo:latest

# 設定環境變數
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=p@ssw0rd123
ENV MONGO_INITDB_DATABASE=whispertales

# 建立初始化腳本目錄
RUN mkdir -p /docker-entrypoint-initdb.d

# 建立初始化腳本
RUN echo 'db = db.getSiblingDB("whispertales"); \
db.createCollection("user"); \
db.user.insertOne({ \
  userName: "admin", \
  password: "p@ssw0rd", \
  Permissions: "root" \
}); \
db.createUser({ \
  user: "admin", \
  pwd: "p@ssw0rd123", \
  roles: [ \
    { role: "root", db: "admin" } \
  ] \
});' > /docker-entrypoint-initdb.d/init-mongo.js

# 暴露 MongoDB 預設埠號
EXPOSE 27017

# 使用預設的 MongoDB 啟動命令
CMD ["mongod"]