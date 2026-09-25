# 更新记录

## 2.0.0

- 首次发布「lumolog」Next.js 摄影图集，提供响应式作品墙、分类、标签、分页和组图弹层。
- 使用本地 `data/gallery.json` 或可选的远程 JSON 管理整套作品；远程文件在每次访问时读取，无需重新部署即可更新图库。
- 分类、标签、分页、图片来源与组图弹层统一由 JSON 生成；打开照片时按需读取远程原图 EXIF。
- 提供 Vercel、Netlify 和 EdgeOne Pages 的服务端部署配置。
