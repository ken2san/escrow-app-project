#!/bin/bash

echo "--- Docker Compose を起動します (コンテナは自動削除) ---"
docker compose up --build

echo "--- アプリケーションが停止しました ---"
read -p "関連するDockerイメージも全て削除しますか？ (y/N): " choice

if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
  echo "--- Dockerイメージを削除中 ---"
  docker compose down --rmi all
  echo "--- イメージの削除が完了しました ---"
else
  echo "--- イメージは削除されませんでした ---"
fi

echo "--- 処理終了 ---"
