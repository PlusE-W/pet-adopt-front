// 后端地址（按你的后端端口修改）
const BASE_URL = "http://localhost:8080"; 

// 工具：获取cookie里的token/用户信息
function getCookie(name) {
  let arr = document.cookie.split("; ");
  for(let i=0; i<arr.length; i++){
    let [k,v] = arr[i].split("=");
    if(k === name) return v;
  }
  return "";
}

// 工具：发送POST请求（带token）
async function post(url, data) {
  const token = getCookie("token");
  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "token": token || ""
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 工具：发送GET请求（带token）
async function get(url) {
  const token = getCookie("token");
  const res = await fetch(BASE_URL + url, {
    headers: {
      "token": token || ""
    }
  });
  return await res.json();
}

// 工具：发送PUT请求
async function put(url, data) {
  const token = getCookie("token");
  const res = await fetch(BASE_URL + url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "token": token || ""
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 工具：发送DELETE请求
async function del(url) {
  const token = getCookie("token");
  const res = await fetch(BASE_URL + url, {
    method: "DELETE",
    headers: {
      "token": token || ""
    }
  });
  return await res.json();
}

// 工具：简单提示
function toast(msg, isSuccess=true) {
  alert(isSuccess ? "✅ 成功："+msg : "❌ 失败："+msg);
}

// 工具：判断是否登录
function checkLogin() {
  const userId = getCookie("userId");
  if(!userId) {
    alert("请先登录！");
    location.href = "login.html";
    return false;
  }
  return true;
}

// 工具：判断是否管理员
function checkAdmin() {
  const role = getCookie("role");
  if(role !== "admin") {
    alert("无管理员权限！");
    location.href = "../index.html";
    return false;
  }
  return true;
}