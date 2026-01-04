# --- 第一阶段：编译 (Builder) ---
FROM golang:1.21-alpine AS builder

# 安装 git 以便下载依赖
RUN apk add --no-cache git

WORKDIR /app

# 先拷贝依赖文件，利用 Docker 缓存层
COPY go.mod go.sum ./
RUN go mod download

# 拷贝源代码并编译
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# --- 第二阶段：运行 (Runner) ---
FROM alpine:latest

# 安装 ca-certificates 确保能进行 HTTPS 请求（调用 OpenRouter 等 API 必需）
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# 从编译阶段拷贝二进制文件
COPY --from=builder /app/main .

# 暴露端口（Railway 会自动检测）
EXPOSE 8080

# 启动程序
CMD ["./main"]
