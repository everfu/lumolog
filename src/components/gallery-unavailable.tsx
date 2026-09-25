import { PageFrame } from './page-frame';

export function GalleryUnavailable() {
  return <PageFrame className="is-inner"><section className="gallery-error" role="alert"><h1>图库暂时无法读取</h1><p>图片数据链接不可访问，或文件格式有误。请稍后重试。</p><a href="">重新载入</a></section></PageFrame>;
}
