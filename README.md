# Web Lab - Node.js + Postgres + Nginx (Docker Compose)

## 📌 概要

Docker Compose を使って **Nginx + Node.js (Express) + PostgreSQL** の 3 層構成を構築した学習プロジェクトです。  
Web サービスの基本構成を本番運用に近い形で再現し、シンプルな CRUD API を実装しました。

---

## 🏗️ 構成

- **Nginx** : リバースプロキシ
- **Node.js (Express)** : API サーバー
- **PostgreSQL** : データベース
- **Docker Compose** : 開発環境構築

---

## 🚀 セットアップ

```bash
git clone https://github.com/masaya481/web-lab.git
cd web-lab
docker-compose up -d --build
```

ブラウザでアクセス:

http://localhost:8080
→ サーバー時刻を返す

http://localhost:8080/notes
→ ノート一覧を返す

---

## 📚 API（ノート管理）

- POST /notes : ノート追加
- GET /notes : ノート一覧取得
- PUT /notes/:id : ノート更新
- DELETE /notes/:id : ノート削除

---

## 📝 ログ管理

アプリのログはホスト側 ./logs/app.log に永続化されます

例:
[LOG] 2025-10-03T01:54:04.957Z Server running on port 3000
[LOG] 2025-10-03T01:54:04.981Z Connected to Postgres

---

## 🎯 学習目的

- Web サービスの基本構成を Docker Compose で再現
- Node.js + Postgres で API と DB の連携を体験
- 運用を意識したログ管理を導入

---

## 📌 このリポジトリについて

学習の一環として構築したプロジェクトです。
今後も改良や拡張を加えながら、実務に近い環境構築・開発スキルを磨いていく予定です。
