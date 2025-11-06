# Quick Test Checklist

1. Jalankan backend: `node backend/server.js`.
2. Jalankan frontend: `npm run dev`.
3. Buka browser ke `/admin`, lalu cek tab Courses sambil membuka DevTools > Network untuk memastikan ada request `GET http://localhost:5000/api/admin/courses?page=1&limit=50` status 200 dengan payload berisi `rows`, `page`, `limit`, dan `total`.
4. Uji via curl:
   ```bash
   curl -i -H "X-Admin-Token: $(node -e \"console.log((localStorage||{}).sw_admin_token||'dev')\")" \
     "http://localhost:5000/api/admin/courses?page=1&limit=50"
   ```
   (Ganti header token manual jika perlu.)
