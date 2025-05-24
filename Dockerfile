# ベースイメージとしてBun公式イメージを使用
FROM oven/bun:1

# アプリケーションの作業ディレクトリを設定
WORKDIR /usr/src/app

# Next.js開発サーバーがリッスンするポート
# (docker-compose.ymlのPORT環境変数で上書きされることを想定)
ARG APP_PORT=3001
ENV PORT=${APP_PORT}
EXPOSE ${APP_PORT}

# コンテナ起動時のデフォルトコマンドは、開発時はdocker-compose.ymlで上書きする
# (例: sleep infinity にして、コンテナ内で手動でbun run devを実行)
# もしこのDockerfileを直接 `docker run` するなら、以下のようなCMDが考えられる
# COPY package.json bun.lockb ./
# RUN bun install
# COPY . .
# CMD ["bun", "run", "dev", "--port", "${PORT}"]
