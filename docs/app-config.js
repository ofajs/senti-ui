export const home = "./pages/home.html";

export const allowForward = true;

export const loading = () => "<div style='padding:24px;font-family:system-ui'>加载中...</div>";

export const fail = ({ src, error }) => {
  return `<div style="padding:24px;font-family:system-ui">
    <p>页面加载失败: ${src}</p>
    <p>${error}</p>
  </div>`;
};
