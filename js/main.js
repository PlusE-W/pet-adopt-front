// 后端地址（按你的后端端口修改）
const BASE_URL = "http://localhost:8080";
let currentUser = null; // 全局当前登录用户

// ======================
// 核心：统一请求方法（带 Session 跨域凭证）
// ======================
async function request(url, options = {}) {
  const defaultOpts = {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  };

  const config = { ...defaultOpts, ...options };
  const res = await fetch(BASE_URL + url, config);
  const result = await res.json();

  if (result.code !== 200) {
    throw new Error(result.msg || "请求失败");
  }
  return result;
}

// ======================
// 常用请求封装
// ======================
async function post(url, data) {
  return request(url, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

async function get(url) {
  return request(url);
}

async function put(url, data) {
  return request(url, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

async function del(url) {
  return request(url, {
    method: "DELETE"
  });
}

// ======================
// 工具函数
// ======================
function toast(msg, isSuccess=true) {
  alert(isSuccess ? "✅ 成功："+msg : "❌ 失败："+msg);
}

// 全局登录校验：校验后端 Session 登录态
async function checkLogin() {
  try {
    await get("/api/user/current");
    return true;
  } catch (err) {
    toast("请先登录！", false);
    location.href = "login.html";
    return false;
  }
}

// 管理员权限校验
async function checkAdmin() {
  try {
    const res = await get("/api/user/current");
    const user = res.data;
    if (user.role !== 1) {
      toast("无管理员权限！", false);
      location.href = "../index.html";
      return false;
    }
    return true;
  } catch (err) {
    toast("请先登录！", false);
    location.href = "login.html";
    return false;
  }
}

// ======================
// 全局初始化：所有页面加载必执行，同步后端登录态
// ======================
async function initGlobalUser() {
  try {
    const res = await get("/api/user/current");
    currentUser = res.data;
    // 同步到本地缓存
    sessionStorage.setItem("isLogin", "true");
    sessionStorage.setItem("username", currentUser.account || currentUser.nickname);
    sessionStorage.setItem("isAdmin", currentUser.role === 1 ? "true" : "false");
    // 更新页面导航栏登录状态
    renderUserNav();
  } catch (e) {
    // 后端未登录，清空缓存
    currentUser = null;
    sessionStorage.removeItem("isLogin");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("isAdmin");
    renderUserNav();
  }
}

// 渲染导航栏：已登录显示用户名/退出，未登录显示登录/注册
function renderUserNav() {
  const navMenu = document.querySelector(".nav-menu");
  if(!navMenu) return;

  if (currentUser) {
    // 已登录：替换为 用户名 + 退出
    navMenu.innerHTML = `
      <a href="index.html">首页</a>
      <a href="process.html">领养流程</a>
      <a href="story.html">领养故事</a>
      <a href="about.html">关于我们</a>
      <span style="color:#ff7f50;margin:0 10px;">欢迎，${currentUser.nickname || currentUser.account}</span>
      <a href="javascript:logout()">退出登录</a>
    `;
  } else {
    // 未登录：恢复默认导航
    navMenu.innerHTML = `
      <a href="index.html">首页</a>
      <a href="process.html">领养流程</a>
      <a href="story.html">领养故事</a>
      <a href="about.html">关于我们</a>
      <a href="login.html">登录</a>
      <a href="register.html">注册</a>
    `;
  }
}

// 退出登录
function logout() {
  sessionStorage.clear();
  currentUser = null;
  // 调用后端退出接口（可选）
  get("/api/user/logout").finally(()=>{
    location.href = "login.html";
  });
}

// ======================
// 评论功能（自动加载 + 提交 + 刷新）
// ======================
async function loadComments() {
  try {
    const petId = 1;
    const res = await get(`/api/comment/list?petId=${petId}`);
    const list = res.data || [];

    const html = list.map(item => `
      <div style="border:1px solid #eee; padding:10px; margin-bottom:8px; border-radius:6px;">
        <div style="font-weight:bold;">${item.nickname}</div>
        <div style="margin:5px 0;">${item.content}</div>
        <div style="font-size:12px; color:#888;">${item.createTime}</div>
      </div>
    `).join('');

    document.getElementById("commentList").innerHTML = html;
  } catch (e) {
    console.error("加载评论失败", e);
  }
}

// 提交评论：先校验登录，再提交
async function submitComment() {
  const loginOk = await checkLogin();
  if (!loginOk) return;

  const content = document.getElementById("commentInput").value?.trim();
  if (!content) {
    toast("请输入评论内容", false);
    return;
  }

  try {
    await post("/api/comment/add", {
      petId: 1,
      content: content
    });
    toast("评论发布成功！");
    document.getElementById("commentInput").value = "";
    loadComments();
  } catch (err) {
    toast(err.message, false);
  }
}

// 页面统一入口：优先执行登录态同步，再执行页面原有逻辑
window.onload = async function() {
  // 1. 所有页面优先同步后端登录态（核心修复）
  await initGlobalUser();

  // 2. 原有评论逻辑
  if (document.getElementById("commentList")) {
    loadComments();
  }
};