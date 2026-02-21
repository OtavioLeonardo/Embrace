import { useCallback, useEffect, useId, useState } from "react";

// 👇 这里的 props 变简单了，直接接收 title, desc, exif
export default function PhotoModal({ imageSrc, title, desc, exif }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const titleId = useId();

  // 如果没有描述，显示默认占位符
  const displayDesc = desc || "暂无描述";

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, handleClose]);

  return (
    <>
      {/* 触发器 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="photo-trigger"
        aria-label={`查看: ${title}`}
      >
        <img src={imageSrc} alt={title} loading="lazy" />
      </button>

      {/* 弹窗 */}
      {isOpen && (
        <div
          className={`modal-overlay ${isClosing ? "closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="modal-backdrop-btn"
            onClick={handleClose}
            aria-label="关闭"
          />

          <div className="modal-content">
            <button
              type="button"
              className="image-container"
              onClick={handleClose}
              aria-label="点击关闭"
            >
              <img src={imageSrc} alt={title} className="main-image" />
            </button>

            <div className="info-panel">
              <div className="info-scroll">
                <h2 id={titleId} className="photo-title">
                  {title}
                </h2>
                <div className="separator"></div>

                <p className="photo-desc">{displayDesc}</p>

                {/* 只要有 EXIF 就显示 */}
                {exif && (
                  <div className="photo-exif">
                    <span>📷 拍摄于</span>
                    <p>{exif}</p>
                  </div>
                )}
              </div>
            </div>

            <button type="button" className="close-btn" onClick={handleClose}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <title>关闭</title>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 样式表 (保持你之前喜欢的那套高级样式) */}
      <style>{`
        .photo-trigger { display: block; width: 100%; height: 100%; border: none; padding: 0; background: transparent; cursor: zoom-in; overflow: hidden; }
        .photo-trigger img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .photo-trigger:hover img { transform: scale(1.03); }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; background-color: rgba(10, 10, 10, 0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; opacity: 0; animation: fadeIn 0.3s forwards; }
        .modal-overlay.closing { animation: fadeOut 0.3s forwards; }
        .modal-backdrop-btn { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; background: transparent; cursor: default; }

        .modal-content { position: relative; width: 95vw; height: 90vh; background: #111; border-radius: 12px; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8); display: flex; overflow: hidden; z-index: 10; border: 1px solid rgba(255,255,255,0.1); }
        
        .image-container { flex: 1; background: #000; display: flex; align-items: center; justify-content: center; position: relative; cursor: zoom-out; border: none; padding: 0; margin: 0; width: 100%; appearance: none; }
        .main-image { max-width: 100%; max-height: 100%; object-fit: contain; display: block; user-select: none; }

        .info-panel { width: 360px; flex-shrink: 0; background: #1a1a1a; color: #eee; display: flex; flex-direction: column; border-left: 1px solid rgba(255,255,255,0.08); }
        .info-scroll { padding: 40px 30px; overflow-y: auto; height: 100%; }
        .info-scroll::-webkit-scrollbar { width: 4px; }
        .info-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        .photo-title { font-family: system-ui, sans-serif; font-size: 1.5rem; font-weight: 600; margin: 0; line-height: 1.2; text-align: left; }
        .separator { width: 40px; height: 2px; background: linear-gradient(90deg, #ff8c00, transparent); margin: 20px 0; }
        .photo-desc { font-size: 0.95rem; line-height: 1.7; color: #bbb; margin-bottom: 40px; text-align: left; }
        
        .photo-exif { margin-top: auto; padding-top: 20px; border-top: 1px dashed rgba(255,255,255,0.15); font-family: monospace; font-size: 0.8rem; color: #666; text-align: left; }
        .photo-exif span { display: block; font-weight: bold; margin-bottom: 4px; color: #888; }

        .close-btn { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; z-index: 20; }
        .close-btn:hover { background: white; color: black; transform: rotate(90deg); }

        @media (max-width: 900px) {
          .modal-content { flex-direction: column; width: 100vw; height: 100vh; border-radius: 0; border: none; }
          .image-container { flex: 2; }
          .info-panel { width: 100%; flex: 1; border-left: none; border-top: 1px solid rgba(255,255,255,0.1); }
          .info-scroll { padding: 24px; }
          .close-btn { top: 15px; right: 15px; background: rgba(0,0,0,0.5); }
        }

        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.98); } }
      `}</style>
    </>
  );
}
