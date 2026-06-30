/* ==========================================================================
   主动健康管理机构端 - 纯 JS 前端逻辑与数据联动中心 (UI/UX Pro Max 级重构)
   ========================================================================== */

const API_BASE = "http://localhost:8080/api";

// 莫兰迪圆形发光正式头像生成函数 (Anti-Q-Style Avatar)
function getFormalAvatar(gender, age, name) {
    const initial = name ? name[0] : "";
    let bg = "#808893"; // 默认灰色
    if (gender === "女") {
        if (age < 45) bg = "linear-gradient(135deg, #FAD0C4 0%, #FFD1FF 100%)"; // 浅粉暖粉
        else bg = "linear-gradient(135deg, #E6B9B8 0%, #D29C9B 100%)"; // 莫兰迪暗粉
    } else if (gender === "男") {
        if (age < 45) bg = "linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)"; // 冰蓝/浅蓝
        else if (age < 60) bg = "linear-gradient(135deg, #6A9AB0 0%, #3A6D8C 100%)"; // 稳重蓝灰
        else bg = "linear-gradient(135deg, #8E9A8E 0%, #5C6E5C 100%)"; // 灰金/灰绿
    } else {
        bg = "linear-gradient(135deg, #0064FA 0%, #2985FF 100%)"; // 主品牌色渐变
    }
    return `<span class="formal-avatar" style="background: ${bg};">${initial}</span>`;
}

// 全局状态
const state = {
    currentRole: "agency", // "agency" (机构管理员) | "doctor" (平台医生)
    currentModule: "m07-dashboard",
    doctors: [],
    residents: [],
    schemes: [],
    servicePackages: [],
    products: [],
    banners: [],
    auditLogs: [],
    agency: {},
    subAccounts: [],
    commissions: [],
    
    // 当前选中的特定实体 ID
    selectedDoctorId: null,
    selectedResidentId: null,
    selectedSchemeId: null,
    
    // 方案编辑中的临时节点数据
    editingSchemeNodes: [],
    
    // 动态拓扑图动画帧 ID
    relationshipAnimationId: null,
    
    // 图表实例
    charts: {
        warningsTrend: null,
        warningsRatio: null,
        residentTrend: null
    },

    // 医生端特定状态
    activePatientId: null,
    activeWarningId: null,
    imWatchTimer: null,
    imWatchSeconds: 30,
    chatMessages: {}, // 格式: { residentId: [{ sender: 'doc'|'patient', text: '...', time: '...' }] },
    publishedArticles: [
        { id: "art_1", title: "高血压人群如何科学安排低盐膳食？", status: "published", reads: 142, type: "text" },
        { id: "art_2", title: "夏季防暑降温：中医食疗养生指导", status: "draft", reads: 0, type: "text" }
    ]
};

// 角色导航代币定义
const AGENCY_NAV_ITEMS = [
    { target: "m07-dashboard", text: "业务监管大屏", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>` },
    { target: "m01-approval", text: "医生入驻审批", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>` },
    { target: "m02-residents", text: "在管居民档案", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>` },
    { target: "m03-schemes", text: "调理方案维护", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>` },
    { target: "m04-service-packages", text: "调理服务包维护", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>` },
    { target: "m05-products", text: "药食同源商品", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>` },
    { target: "m06-cms", text: "CMS 内容运营", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>` },
    { target: "m08-devices", text: "智能设备管理", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="7" /><rect x="9" y="1" width="6" height="4" rx="1" /><rect x="9" y="19" width="6" height="4" rx="1" /><path d="M12 9v3l2 2" /></svg>` },
    { target: "m09-settings", text: "系统配置与日志", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>` }
];

const DOCTOR_NAV_ITEMS = [
    { target: "d03-patients", text: "我的在管病人", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>` },
    { target: "d06-warnings", text: "待处理预警工作台", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` },
    { target: "d04-schemes", text: "专科方案管理", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>` },
    { target: "d07-bindings", text: "居民绑定审批", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>` },
    { target: "d01-profile", text: "医生执业信息", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>` },
    { target: "d02-articles", text: "科普主页维护", icon: `<svg class="semi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>` }
];

// ==================== 1. 初始化与模块路由 ====================

// 双触发兼容机制：确保 DOM 加载不论早晚均能成功执行初始化
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

function initApp() {
    initClock();
    initRoleSwitcher(); // 注册角色切换器
    initSidebar();      // 动态侧边栏加载
    initModalHandlers();
    
    // 初始加载当前角色的首屏数据
    if (state.currentRole === "agency") {
        loadModuleData("m07-dashboard");
    } else {
        loadModuleData("d03-patients");
    }
}

function initClock() {
    const clockEl = document.getElementById("system-clock");
    if (clockEl) {
        setInterval(() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const date = String(now.getDate()).padStart(2, '0');
            const hrs = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${year}-${month}-${date} ${hrs}:${mins}:${secs}`;
        }, 1000);
    }
}

// 注册角色切换器事件
function initRoleSwitcher() {
    const btnAgency = document.getElementById("btn-role-agency");
    const btnDoctor = document.getElementById("btn-role-doctor");
    
    if (btnAgency && btnDoctor) {
        btnAgency.addEventListener("click", () => switchRole("agency"));
        btnDoctor.addEventListener("click", () => switchRole("doctor"));
    }
}

function switchRole(role) {
    if (state.currentRole === role) return;
    
    state.currentRole = role;
    
    // 切换按钮高亮
    const btnAgency = document.getElementById("btn-role-agency");
    const btnDoctor = document.getElementById("btn-role-doctor");
    const parentBc = document.querySelector(".parent-bc");
    
    if (btnAgency && btnDoctor) {
        if (role === "agency") {
            btnAgency.classList.add("active");
            btnDoctor.classList.remove("active");
            if (parentBc) parentBc.textContent = "机构控制台";
        } else {
            btnAgency.classList.remove("active");
            btnDoctor.classList.add("active");
            if (parentBc) parentBc.textContent = "医生工作台";
        }
    }
    
    // 重新渲染侧边栏
    initSidebar();
    
    // 默认跳转模块
    const defaultModule = role === "agency" ? "m07-dashboard" : "d03-patients";
    switchModule(defaultModule);
}

function initSidebar() {
    const container = document.querySelector(".sidebar-nav");
    if (!container) return;
    
    // 动态绘制对应角色的菜单
    const items = state.currentRole === "agency" ? AGENCY_NAV_ITEMS : DOCTOR_NAV_ITEMS;
    
    let html = `<ul class="nav-list">`;
    items.forEach((item, index) => {
        // 判断激活状态
        const isActive = item.target === state.currentModule;
        html += `
            <li class="nav-item ${isActive ? 'active' : ''}" data-target="${item.target}">
                ${item.icon}
                <span class="nav-text">${item.text}</span>
            </li>
        `;
    });
    html += `</ul>`;
    container.innerHTML = html;
    
    // 重新绑定点击切换模块事件
    const navItems = container.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            const target = item.getAttribute("data-target");
            switchModule(target);
        });
    });
}

function switchModule(targetId) {
    document.querySelectorAll(".content-section").forEach(sec => {
        sec.classList.remove("active");
    });
    
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add("active");
    }
    
    const bcTitle = document.getElementById("current-bc-title");
    
    // 适配动态渲染下的 nav-text 获取
    const navItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    const navText = navItem ? navItem.querySelector(".nav-text") : null;
    if (bcTitle && navText) {
        bcTitle.textContent = navText.textContent;
    }
    
    state.currentModule = targetId;
    
    // 🌓 业务监管大屏全深色模式切换
    if (targetId === "m07-dashboard" && state.currentRole === "agency") {
        document.body.classList.add("semi-always-dark");
    } else {
        document.body.classList.remove("semi-always-dark");
    }
    
    // 销毁时钟/IM计时器等，防止内存泄漏或冲突
    if (state.imWatchTimer) {
        clearInterval(state.imWatchTimer);
        state.imWatchTimer = null;
    }
    
    destroyChart("residentTrend");
    stopRelationshipAnimation();
    
    loadModuleData(targetId);
}

// ==================== 2. 数据请求封装 ====================

async function request(url, method = "GET", body = null) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json" }
    };
    if (body) {
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${url}`, opts);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `请求错误: ${res.status}`);
    }
    return res.json();
}

async function loadModuleData(moduleId) {
    try {
        switch (moduleId) {
            case "m07-dashboard":
                await fetchDashboardData();
                break;
            case "m01-approval":
                await fetchDoctorsList();
                renderApprovalTable();
                break;
            case "m02-residents":
                await fetchResidentsList();
                renderResidentsTable();
                break;
            case "m03-schemes":
                await fetchSchemesList();
                await fetchProductsList();
                renderSchemesTable();
                break;
            case "m04-service-packages":
                await fetchServicePackages();
                renderPackagesModule();
                break;
            case "m05-products":
                await fetchProductsList();
                renderProductsModule();
                break;
            case "m06-cms":
                await fetchDoctorsList();
                await fetchBannersList();
                renderCmsModule();
                break;
            case "m08-devices":
                await fetchResidentsList();
                renderDevicesModule();
                break;
            case "m09-settings":
                await fetchSettingsData();
                await fetchAuditLogs();
                renderSettingsModule();
                break;
                
            // 医生工作台模块
            case "d03-patients":
                await fetchResidentsList();
                renderPatientsModule();
                break;
            case "d06-warnings":
                await fetchResidentsList();
                renderWarningsModule();
                break;
            case "d04-schemes":
                await fetchSchemesList();
                await fetchProductsList();
                renderDoctorSchemesModule();
                break;
            case "d07-bindings":
                renderBindingRequestsModule();
                break;
            case "d01-profile":
                renderDoctorProfileModule();
                break;
            case "d02-articles":
                renderDoctorArticlesModule();
                break;
        }
    } catch (err) {
        console.error("加载模块数据错误:", err);
    }
}

// API 拉取
async function fetchDashboardData() {
    const data = await request("/dashboard");
    
    // 防御性空值检查：确保大屏 KPI 元素存在再写入
    const elResidents = document.getElementById("kpi-residents");
    if (elResidents) elResidents.textContent = data.kpis.residents_total;
    
    const elDevices = document.getElementById("kpi-devices");
    if (elDevices) elDevices.textContent = data.device_status.online;
    
    const elWarnings = document.getElementById("kpi-warnings");
    if (elWarnings) elWarnings.textContent = data.kpis.active_warnings;
    
    const elRevenue = document.getElementById("kpi-revenue");
    if (elRevenue) elRevenue.textContent = Math.floor(data.kpis.revenue_total).toLocaleString();
    
    renderWarningsTrendChart(data.chart_7days);
    renderWarningsRatioChart(data.warnings_ratio);
    renderDashboardDoctors(data.doctors_performance);
    
    const elDevOnline = document.getElementById("dev-online-num");
    if (elDevOnline) elDevOnline.textContent = data.device_status.online;
    
    const elDevOffline = document.getElementById("dev-offline-num");
    if (elDevOffline) elDevOffline.textContent = data.device_status.offline;
    
    const elDevLowpower = document.getElementById("dev-lowpower-num");
    if (elDevLowpower) elDevLowpower.textContent = data.device_status.low_power;
}

async function fetchDoctorsList() { state.doctors = await request("/doctors"); }
async function fetchResidentsList() { state.residents = await request("/residents"); }
async function fetchSchemesList() { state.schemes = await request("/schemes"); }
async function fetchServicePackages() { state.servicePackages = await request("/service-packages"); }
async function fetchProductsList() { state.products = await request("/products"); }
async function fetchBannersList() { state.banners = await request("/cms/banners"); }
async function fetchAuditLogs(q = "") { state.auditLogs = await request(`/system/logs?q=${encodeURIComponent(q)}`); }
async function fetchSettingsData() {
    const data = await request("/system/settings");
    state.agency = data.agency;
    state.subAccounts = data.sub_accounts;
    state.commissions = data.commissions;
}

// ==================== 3. 模块数据表格渲染 ====================

function renderDashboardDoctors(list) {
    const tbody = document.getElementById("dashboard-doctors-list");
    if (!tbody) return;
    tbody.innerHTML = list.map(item => `
        <tr>
            <td style="font-weight: 500;">${item.name}</td>
            <td>${item.title}</td>
            <td>${item.interventions}</td>
            <td>${item.schemes_sent}</td>
            <td class="font-mono text-green">${item.avg_response}</td>
            <td style="font-weight: bold; color: var(--semi-color-warning);">★ ${item.rating.toFixed(1)}</td>
        </tr>
    `).join("");
}

function renderApprovalTable() {
    const tbody = document.getElementById("approval-docs-table-body");
    if (!tbody) return;
    
    const search = document.getElementById("doc-name-search")?.value.trim().toLowerCase() || "";
    const status = document.getElementById("doc-status-filter")?.value || "";
    const dept = document.getElementById("doc-dept-filter")?.value || "";
    
    let filtered = state.doctors.filter(d => {
        const matchesSearch = search ? d.name.toLowerCase().includes(search) : true;
        const matchesStatus = status ? d.status === status : true;
        const matchesDept = dept ? d.department === dept : true;
        return matchesSearch && matchesStatus && matchesDept;
    });
    
    tbody.innerHTML = filtered.map(d => {
        let actionBtn = "";
        if (d.status === "pending") {
            actionBtn = `
                <button class="btn btn-secondary btn-sm" onclick="openApprovalModal('${d.id}')">查看</button>
                <button class="btn btn-primary btn-sm" onclick="confirmApproveDoctor('${d.id}', 'approved')" style="margin-left:4px;">通过</button>
                <button class="btn btn-danger btn-sm" onclick="confirmApproveDoctor('${d.id}', 'rejected')" style="margin-left:4px;">驳回</button>
            `;
        } else if (d.status === "approved") {
            actionBtn = `
                <button class="btn btn-secondary btn-sm" onclick="openApprovalModal('${d.id}')">查看</button>
                <button class="btn btn-danger btn-sm" onclick="confirmApproveDoctor('${d.id}', 'disabled')" style="margin-left:4px;">禁用</button>
            `;
        } else if (d.status === "disabled") {
            actionBtn = `
                <button class="btn btn-secondary btn-sm" onclick="openApprovalModal('${d.id}')">查看</button>
                <button class="btn btn-primary btn-sm" onclick="confirmApproveDoctor('${d.id}', 'approved')" style="margin-left:4px;">启用</button>
            `;
        } else {
            // 已驳回 rejected
            actionBtn = `
                <button class="btn btn-secondary btn-sm" onclick="openApprovalModal('${d.id}')">查看</button>
                <button class="btn btn-secondary btn-sm" disabled style="margin-left:4px; opacity:0.5;">已驳回</button>
            `;
        }
        
        const avatarHtml = getFormalAvatar(d.gender, d.age, d.name);
        const sourceHtml = d.source === "register" ? `<span class="badge" style="background:#E8F2FF; color:#0064fa;">自主注册</span>` : `<span class="badge" style="background:#F4F5F7; color:#4F5660;">后台添加</span>`;
        
        return `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${avatarHtml}
                        <span style="font-weight:600;">${d.name}</span>
                    </div>
                </td>
                <td>${d.department}</td>
                <td>${d.title}</td>
                <td>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        ${d.tags.slice(0,2).map(t => `<span class="badge" style="background:#f1f5f9; color:#475569;">${t}</span>`).join("")}
                        ${d.tags.length > 2 ? `<span class="badge" style="background:#e2e8f0; color:#475569;">+${d.tags.length - 2}</span>` : ''}
                    </div>
                </td>
                <td>${sourceHtml}</td>
                <td class="font-mono">${d.residents_count} 人</td>
                <td>
                    <span class="badge ${d.status === 'pending' ? 'badge-warning' : (d.status === 'approved' ? 'badge-primary' : 'badge-danger')}">
                        ${d.status === 'pending' ? '待审核' : (d.status === 'approved' ? '已激活' : (d.status === 'disabled' ? '已禁用' : '已驳回'))}
                    </span>
                </td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join("");
}

// 医生资质审批弹窗打开 (双栏重构版)
async function openApprovalModal(id) {
    const doc = state.doctors.find(d => d.id === id);
    if (!doc) return;
    
    state.selectedDoctorId = id;
    const container = document.getElementById("doc-approval-modal-body");
    if (!container) return;
    
    container.innerHTML = `
        <div class="doctor-detail-layout" style="display: flex; gap: 24px;">
            <!-- 左侧：基本信息 -->
            <div class="doc-detail-left" style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
                <div class="doctor-detail-header" style="display:flex; gap:16px; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--semi-color-border);">
                    <img src="${doc.avatar}" style="width:52px; height:52px; border-radius:50%; background:#f1f5f9;">
                    <div>
                        <h4 style="font-size:16px; font-weight:700;">${doc.name}</h4>
                        <p style="font-size:12px; color:var(--semi-color-text-2);">${doc.department} · ${doc.title}</p>
                    </div>
                </div>
                <div class="form-row">
                    <span class="premium-label">来源渠道</span>
                    <p style="font-size:13px; font-weight:500; margin-top:4px;">
                        ${doc.source === 'admin' ? '<span class="badge" style="background:#e6f8ea; color:#10b981;">管理员添加</span>' : '<span class="badge" style="background:#fef3c7; color:#d97706;">自主注册</span>'}
                    </p>
                </div>
                <div class="form-row">
                    <span class="premium-label">联系电话与微信</span>
                    <p style="font-size:13px; font-weight:500; margin-top:4px;">电话: ${doc.phone || '未填写'} | 微信: ${doc.wechat || '未填写'}</p>
                </div>
                <div class="form-row">
                    <span class="premium-label">医生学术简介说明</span>
                    <div class="doc-bio-content" style="background:#f9f9fc; padding:12px; border-radius:6px; font-size:13px; line-height:1.6; margin-top:4px;">${doc.bio || '无简介'}</div>
                </div>
                <div class="form-row">
                    <span class="premium-label">擅长调理方向</span>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                        ${doc.tags.map(t => `<span class="badge" style="background:#e8f2ff; color:#0064fa;">${t}</span>`).join("")}
                    </div>
                </div>
            </div>
            <!-- 右侧：资质双证及状态 -->
            <div class="doc-detail-right" style="flex: 1; display: flex; flex-direction: column; gap: 12px; border-left: 1px solid var(--semi-color-border); padding-left: 24px;">
                <div class="form-row">
                    <span class="premium-label">在线资质双证核验 (执业证与职称证)</span>
                    <div class="certificate-preview-group" style="margin-top:6px; display: flex; gap: 12px;">
                        <div class="cert-card" onclick="alert('预览医师执业证书')" style="flex: 1; cursor: pointer;">
                            <img src="mock_assets/doctor_certificate.png" class="cert-img" style="width: 100%; border-radius: 4px; border: 1px solid var(--semi-color-border);">
                            <div class="cert-label" style="font-size: 11px; text-align: center; color: var(--semi-color-text-2); margin-top: 4px;">医师执业资格证书.png</div>
                        </div>
                        <div class="cert-card" onclick="alert('预览医生职称证书')" style="flex: 1; cursor: pointer;">
                            <img src="mock_assets/doctor_certificate.png" class="cert-img" style="width: 100%; border-radius: 4px; border: 1px solid var(--semi-color-border);">
                            <div class="cert-label" style="font-size: 11px; text-align: center; color: var(--semi-color-text-2); margin-top: 4px;">专业技术职称等级证书.png</div>
                        </div>
                    </div>
                </div>
                <div class="form-row" style="margin-top: 12px;">
                    <span class="premium-label">当前状态</span>
                    <p style="font-size:14px; font-weight:600; margin-top:4px;">
                        ${doc.status === 'pending' ? '<span class="text-orange">⏳ 待审批</span>' : doc.status === 'approved' ? '<span class="text-green">✅ 已激活</span>' : doc.status === 'rejected' ? '<span class="text-red">❌ 已驳回</span>' : '<span class="text-gray">🚫 已禁用</span>'}
                    </p>
                </div>
                <div class="modal-footer" style="margin-top: auto; padding-top:12px; border-top: none; justify-content: flex-end; display: flex;">
                    ${doc.status === 'pending' ? `
                        <button class="btn btn-secondary" onclick="confirmApproveDoctor('${doc.id}', 'rejected')">审批驳回</button>
                        <button class="btn btn-primary" onclick="confirmApproveDoctor('${doc.id}', 'approved')" style="margin-left:8px;">审核通过</button>
                    ` : doc.status === 'approved' ? `
                        <button class="btn btn-danger" onclick="confirmApproveDoctor('${doc.id}', 'disabled')">禁用该医生</button>
                    ` : `
                        <button class="btn btn-primary" onclick="confirmApproveDoctor('${doc.id}', 'approved')">启用激活该账户</button>
                    `}
                </div>
            </div>
        </div>
    `;
    
    openModal("doc-approval-modal");
}

async function approveDoctor(id, action, reason = "") {
    try {
        await request("/doctors/approve", "POST", { id, action, reason });
        closeModal("doc-approval-modal");
        await fetchDoctorsList();
        renderApprovalTable();
    } catch (e) {
        alert("操作失败: " + e.message);
    }
}

// 统一二次审批确认拦截器
function confirmApproveDoctor(id, action) {
    const doc = state.doctors.find(d => d.id === id);
    if (!doc) return;
    
    let title = "审批操作确认";
    let message = "";
    if (action === "approved") {
        message = `确定要批准医生 [${doc.name}] 的入驻申请吗？审批后该医生将拥有登录和管理在管居民档案的权限。`;
        confirmAction(title, message, () => {
            approveDoctor(id, action);
        });
    } else if (action === "rejected") {
        message = `确定要拒绝/驳回医生 [${doc.name}] 的入驻申请吗？需要录入驳回理由。`;
        confirmAction(title, message, () => {
            const reason = prompt("请录入驳回审批的意见：") || "";
            if (!reason) return;
            approveDoctor(id, action, reason);
        });
    } else if (action === "disabled") {
        message = `确定要禁用医生 [${doc.name}] 账户吗？禁用后该医生将无法登录系统。`;
        confirmAction("账户禁用提示", message, () => {
            approveDoctor(id, action);
        });
    }
}

// 居民档案
function renderResidentsTable() {
    const tbody = document.getElementById("residents-table-body");
    if (!tbody) return;
    
    const search = document.getElementById("res-search").value.trim().toLowerCase();
    const level = document.getElementById("res-level-filter").value;
    
    let filtered = state.residents.filter(r => {
        const matchesSearch = search ? (r.name.toLowerCase().includes(search) || r.phone.includes(search)) : true;
        const matchesLevel = level ? r.health_level === level : true;
        return matchesSearch && matchesLevel;
    });
    
    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td style="font-weight:600;">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${getFormalAvatar(r.gender, r.age, r.name)}
                    <span>${r.name}</span>
                </div>
            </td>
            <td>${r.gender}</td>
            <td class="font-mono">${r.age} 岁</td>
            <td>
                <span class="badge ${r.health_level === 'red' ? 'badge-danger' : (r.health_level === 'yellow' ? 'badge-warning' : 'badge-primary')}">
                    ${r.health_level === 'red' ? '🔴 高危' : (r.health_level === 'yellow' ? '🟡 亚健康' : '🟢 正常')}
                </span>
            </td>
            <td>${r.doctor_name}</td>
            <td class="font-mono">${r.service_days} 天</td>
            <td class="font-mono">${r.last_contact}</td>
            <td>
                <span class="badge" style="background:#f1f5f9; color:#475569;">
                    ${r.device_online ? '⌚ 在线' : '离线'} (${r.device_power}%)
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openResidentModal('${r.id}')">健康画像</button>
            </td>
        </tr>
    `).join("");
}

// 居民画像弹窗打开
async function openResidentModal(id) {
    state.selectedResidentId = id;
    const portrait = await request(`/residents/portrait?id=${id}`);
    const r = portrait.resident;
    
    const container = document.getElementById("res-portrait-modal-body");
    if (!container) return;
    
    container.innerHTML = `
        <div class="res-portrait-layout">
            <div class="res-vital-grid">
                <div class="vital-box">
                    <span class="stat-lbl">实时心率值</span>
                    <div class="vital-val font-mono" style="color:${r.heart_rate > 95 ? 'var(--semi-color-danger)' : 'var(--semi-color-text-0)'}">
                        ${r.heart_rate} <span style="font-size:11px; font-weight:normal;">bpm</span>
                    </div>
                </div>
                <div class="vital-box">
                    <span class="stat-lbl">血氧饱和度</span>
                    <div class="vital-val font-mono" style="color:${r.blood_oxygen < 95 ? 'var(--semi-color-danger)' : 'var(--semi-color-text-0)'}">
                        ${r.blood_oxygen}%
                    </div>
                </div>
                <div class="vital-box">
                    <span class="stat-lbl">实时血压等级</span>
                    <div class="vital-val font-mono">${r.blood_pressure}</div>
                </div>
                <div class="vital-box">
                    <span class="stat-lbl">今日计步</span>
                    <div class="vital-val font-mono">${r.steps} 步</div>
                </div>
            </div>
            
            <h4 class="card-title" style="margin-bottom:8px;">近30天历史心率与血氧健康曲线</h4>
            <div class="chart-wrapper" style="height:170px;">
                <canvas id="residentTrendChart"></canvas>
            </div>
            
            <h4 class="card-title" style="margin-bottom:8px; margin-top:12px;">在管医患关系与设备服务图谱 (数据脉冲流动)</h4>
            <div class="canvas-wrapper">
                <canvas id="relationshipCanvas" width="830" height="150"></canvas>
            </div>
        </div>
    `;
    
    openModal("resident-portrait-modal");
    
    requestAnimationFrame(() => {
        renderResidentTrendChart(portrait.trends);
        startRelationshipAnimation(r);
    });
}

// ==================== 4. Canvas 动态呼吸连线拓扑图 (Pro Max) ====================

function stopRelationshipAnimation() {
    if (state.relationshipAnimationId) {
        cancelAnimationFrame(state.relationshipAnimationId);
        state.relationshipAnimationId = null;
    }
}

function startRelationshipAnimation(resident) {
    stopRelationshipAnimation();
    
    const canvas = document.getElementById("relationshipCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // 定义初始位置
    const center = { x: 415, y: 75, label: resident.name, role: "居民档案", color: "#0064FA" };
    const nodes = [
        { x: 180, y: 35, label: resident.doctor_name, role: "责任医生", color: "#00B365" },
        { x: 180, y: 115, label: "小雅", role: "专属客服", color: "#FC8800" },
        { x: 650, y: 75, label: "智能手表", role: resident.device_imei.substring(0, 15), color: "#808893" }
    ];
    
    let frame = 0;
    
    function drawLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;
        
        // 1. 各个节点微小呼吸正弦偏移
        const offset = Math.sin(frame * 0.05) * 2; // -2px 到 2px
        const currentCenter = { x: center.x, y: center.y + offset };
        
        const currentNodes = nodes.map((n, i) => {
            // 对每个节点采用不同相位偏移，使其异步呼吸
            const nodeOffset = Math.sin(frame * 0.06 + i) * 2;
            return {
                x: n.x,
                y: n.y + nodeOffset,
                label: n.label,
                role: n.role,
                color: n.color
            };
        });
        
        // 2. 绘制连线
        ctx.lineWidth = 1;
        currentNodes.forEach(n => {
            ctx.strokeStyle = "#E6E8EB";
            ctx.beginPath();
            ctx.moveTo(currentCenter.x, currentCenter.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
            
            // 3. 数据光点脉冲在连线上匀速流动
            // 根据帧数计算百分比
            const particleSpeed = 0.008; // 速度
            const t = (frame * particleSpeed) % 1.0;
            
            // 粒子坐标：从节点 n 流向中心 center
            const px = n.x + (currentCenter.x - n.x) * t;
            const py = n.y + (currentCenter.y - n.y) * t;
            
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = n.color; // 与对应节点同色
            ctx.shadowBlur = 8;
            ctx.shadowColor = n.color;
            ctx.fill();
            ctx.shadowBlur = 0; // 重置虚化
        });
        
        // 4. 绘制中心节点
        ctx.beginPath();
        // 外圆呼吸缩放
        const centerRadius = 20 + Math.sin(frame * 0.05) * 1.5;
        ctx.arc(currentCenter.x, currentCenter.y, centerRadius, 0, Math.PI * 2);
        ctx.fillStyle = center.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = center.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(center.label.substring(0, 4), currentCenter.x, currentCenter.y + 4);
        ctx.fillStyle = "#808893";
        ctx.font = "9px Inter, sans-serif";
        ctx.fillText(center.role, currentCenter.x, currentCenter.y + centerRadius + 10);
        
        // 5. 绘制各个子节点
        currentNodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.fill();
            
            ctx.fillStyle = "#fff";
            ctx.font = "bold 9px Inter, sans-serif";
            ctx.fillText(n.label.substring(0, 4), n.x, n.y + 3);
            ctx.fillStyle = "#808893";
            ctx.font = "9px Inter, sans-serif";
            ctx.fillText(n.role, n.x, n.y + 26);
        });
        
        state.relationshipAnimationId = requestAnimationFrame(drawLoop);
    }
    
    drawLoop();
}

// 3.4 M03. 调理方案维护单栏 Table
function renderSchemesTable() {
    const tbody = document.getElementById("schemes-table-body");
    if (!tbody) return;
    
    const activeTab = document.querySelector(".scheme-tab.active");
    const reportType = activeTab ? activeTab.getAttribute("data-type") : "sleep";
    
    const filtered = state.schemes.filter(s => s.report_type === reportType);
    
    tbody.innerHTML = filtered.map(s => {
        const typeText = s.report_type === "sleep" ? "睡眠报告" : (s.report_type === "cardio" ? "脑血管报告" : "情绪压力报告");
        return `
            <tr>
                <td style="font-weight:600;">${s.name}</td>
                <td><span class="badge badge-primary">${typeText}</span></td>
                <td class="font-mono">${s.nodes.length} 个</td>
                <td class="font-mono">${s.products.length} 个</td>
                <td class="font-mono">${s.updated_at}</td>
                <td>
                    <span class="badge ${s.status === 'published' ? 'badge-primary' : 'badge-warning'}">
                        ${s.status === 'published' ? '已发布' : '草稿暂存'}
                    </span>
                </td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${s.status === 'published' ? 'checked' : ''} onchange="toggleSchemeStatus('${s.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openSchemeEditorModal('${s.id}')">编辑配置</button>
                </td>
            </tr>
        `;
    }).join("");
}

async function toggleSchemeStatus(id, checked) {
    const sch = state.schemes.find(s => s.id === id);
    if (!sch) return;
    try {
        await request("/schemes/save", "POST", {
            ...sch,
            status: checked ? "published" : "draft"
        });
        await fetchSchemesList();
        renderSchemesTable();
    } catch (e) {
        alert("操作失败: " + e.message);
    }
}

// 方案编辑弹窗打开
function openSchemeEditorModal(id) {
    state.selectedSchemeId = id;
    let scheme;
    if (id === "NEW") {
        scheme = {
            id: "",
            name: "",
            report_type: document.querySelector(".scheme-tab.active").getAttribute("data-type"),
            nodes: [],
            products: [],
            status: "draft"
        };
    } else {
        scheme = state.schemes.find(s => s.id === id);
    }
    
    if (!scheme) return;
    
    const container = document.getElementById("scheme-config-editor");
    if (!container) return;
    
    container.innerHTML = `
        <div class="form-row">
            <label class="premium-label">方案模板名称 *</label>
            <input type="text" id="sch-editor-name" value="${scheme.name}" class="premium-input" placeholder="输入调理建议的大标题..." oninput="updatePhonePreview()">
        </div>
        <input type="hidden" id="sch-editor-id" value="${scheme.id}">
        
        <div class="form-row-grid">
            <div class="form-row">
                <label class="premium-label">适配报告类型</label>
                <select id="sch-editor-type" class="premium-select">
                    <option value="sleep" ${scheme.report_type === 'sleep' ? 'selected' : ''}>睡眠分析报告</option>
                    <option value="cardio" ${scheme.report_type === 'cardio' ? 'selected' : ''}>脑血管硬化报告</option>
                    <option value="pressure" ${scheme.report_type === 'pressure' ? 'selected' : ''}>情绪压力评估</option>
                </select>
            </div>
            <div class="form-row">
                <label class="premium-label">关联药食同源推荐</label>
                <div style="display:flex; gap:6px;">
                    <select id="sch-editor-product-select" class="premium-select">
                        <option value="">-- 选择推荐商品 --</option>
                        ${state.products.map(p => `<option value="${p.id}">${p.name} (¥${p.price})</option>`).join("")}
                    </select>
                    <button class="btn btn-secondary btn-sm" onclick="associateProductToScheme()">关联</button>
                </div>
            </div>
        </div>
        
        <div id="sch-editor-associated-list" style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
            <!-- 关联徽章 -->
        </div>
        
        <div class="form-row" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
            <label class="premium-label">方案节点编辑与排序 (文字/图片/跳转链接)</label>
            <div class="search-filter-row" style="margin-bottom:8px;">
                <button class="btn btn-secondary btn-sm" onclick="addSchemeNode('text')">+ 文本节点</button>
                <button class="btn btn-secondary btn-sm" onclick="addSchemeNode('image')">+ 图片节点</button>
                <button class="btn btn-secondary btn-sm" onclick="addSchemeNode('link')">+ 链接节点</button>
            </div>
            <div class="nodes-drag-list" id="editor-nodes-list">
                <!-- 拖动节点 -->
            </div>
        </div>
        
        <div class="modal-footer" style="margin-top:12px; padding-top:8px;">
            <button class="btn btn-secondary" data-close="scheme-editor-modal">取消</button>
            <button class="btn btn-secondary" onclick="saveScheme(false)" style="margin-left:6px;">暂存草稿</button>
            <button class="btn btn-primary" onclick="saveScheme(true)" style="margin-left:6px;">发布上线</button>
        </div>
    `;
    
    scheme.products.forEach(pId => addAssociatedProductBadge(pId));
    renderEditorNodes(scheme.nodes);
    
    openModal("scheme-editor-modal");
    
    requestAnimationFrame(() => {
        updatePhonePreview();
    });
}

// 4.5 M04 & M05 服务包商品
// 通用二次确认交互函数
function confirmAction(title, message, onConfirm) {
    const titleEl = document.getElementById("confirm-warning-title");
    const msgEl = document.getElementById("confirm-warning-message");
    if (titleEl) titleEl.querySelector("span").textContent = title;
    if (msgEl) msgEl.textContent = message;
    
    openModal("confirm-warning-modal");
    
    const confirmBtn = document.getElementById("btn-confirm-warning-submit");
    if (confirmBtn) {
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener("click", () => {
            onConfirm();
            closeModal("confirm-warning-modal");
        });
    }
}

function confirmApproveDoctor(id, action, message) {
    confirmAction("账户禁用提示", message, () => {
        approveDoctor(id, action);
    });
}

function renderPackagesModule() {
    const tbody = document.getElementById("packages-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = state.servicePackages.map(pkg => `
        <tr>
            <td style="font-weight:600;">${pkg.name}</td>
            <td><span class="badge" style="background:#F4F5F7; color:#4F5660;">${pkg.period}</span></td>
            <td class="font-mono" style="font-weight:700; color:var(--semi-color-primary);">¥${pkg.price.toFixed(2)}</td>
            <td class="font-mono">${pkg.sales} 份</td>
            <td class="font-mono">¥${pkg.revenue.toLocaleString()}</td>
            <td class="font-mono text-green">${pkg.conv_rate}%</td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${pkg.status === 'published' ? 'checked' : ''} onchange="togglePackageStatus('${pkg.id}', this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openPackageModal('${pkg.id}')">编辑配置</button>
            </td>
        </tr>
    `).join("");
}

function renderProductsModule() {
    const tbody = document.getElementById("products-table-body");
    if (!tbody) return;
    
    const activeBtn = document.querySelector(".filter-prod-btn.active");
    const category = activeBtn ? activeBtn.getAttribute("data-cat") : "";
    
    let filtered = state.products;
    if (category) {
        filtered = state.products.filter(p => p.category === category);
    }
    
    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td>
                <img src="${p.image}" style="width:36px; height:36px; object-fit:cover; border-radius:4px; border:1px solid var(--semi-color-border);">
            </td>
            <td style="font-weight:600;">${p.name}</td>
            <td><span class="badge badge-primary">${p.category}</span></td>
            <td class="font-mono" style="font-weight:700; color:var(--semi-color-primary);">¥${p.price.toFixed(2)}</td>
            <td class="font-mono">
                <span class="${p.stock < 20 ? 'col-red font-bold' : ''}">${p.stock}</span>
                ${p.stock < 20 ? ' <span class="badge badge-danger" style="font-size:9px; padding:1px 4px;">库存偏低</span>' : ''}
            </td>
            <td>
                <label class="switch">
                    <input type="checkbox" ${p.status === 'published' ? 'checked' : ''} onchange="toggleProductStatus('${p.id}', this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openProductModal('${p.id}')">编辑库存</button>
                <button class="btn btn-secondary btn-sm" onclick="showProductLogs('${p.id}')" style="margin-left:4px;">审计日志</button>
            </td>
        </tr>
    `).join("");
}

// 4.6 M06. CMS内容运营
function renderCmsModule() {
    const bannersTbody = document.getElementById("banners-table-body");
    if (bannersTbody) {
        bannersTbody.innerHTML = state.banners.map(b => `
            <tr>
                <td>
                    <img src="${b.image}" style="width:70px; height:42px; object-fit:cover; border-radius:4px; border:1px solid var(--semi-color-border);">
                </td>
                <td style="font-weight:600;">${b.title}</td>
                <td class="font-mono" style="font-size:12px; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    <a href="${b.url}" target="_blank" style="color:var(--semi-color-primary); text-decoration:none;">${b.url}</a>
                </td>
                <td class="font-mono">${b.start_time} 至 ${b.end_time}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${b.status === 'on' ? 'checked' : ''} onchange="toggleBannerStatus('${b.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openBannerModal('${b.id}')">修改</button>
                </td>
            </tr>
        `).join("");
    }
    
    const docsWeightTbody = document.getElementById("cms-doctors-weight-list");
    if (docsWeightTbody) {
        const recommendedDocs = state.doctors.filter(d => d.status === "approved" && d.is_recommended);
        docsWeightTbody.innerHTML = recommendedDocs.map(d => `
            <tr>
                <td style="font-weight:600;">${d.name} (${d.title})</td>
                <td>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        ${d.tags.slice(0,2).map(t => `<span class="badge" style="background:#f1f5f9; color:#475569;">${t}</span>`).join("")}
                    </div>
                </td>
                <td>
                    <input type="text" class="premium-input btn-sm" id="rec-intro-${d.id}" value="${d.recommend_intro || ''}" style="padding:4px 8px; width:220px; font-size:12px;">
                </td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px; width:140px;">
                        <input type="range" min="1" max="100" class="weight-slider" value="${d.weight}" onchange="updateDoctorWeight('${d.id}', this.value)" style="flex:1;">
                        <span class="font-mono" style="font-weight:bold; width:24px; text-align:right;">${d.weight}</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="saveDoctorCmsConfig('${d.id}')">保存</button>
                    <button class="btn btn-danger btn-sm" onclick="cancelDoctorRecommendation('${d.id}')" style="margin-left:4px;">取消推荐</button>
                </td>
            </tr>
        `).join("");
    }
}

// 4.7 M08. 智能设备
function renderDevicesModule() {
    const tbody = document.getElementById("devices-table-list");
    if (!tbody) return;
    
    const filterStatus = document.getElementById("device-status-filter").value;
    let filtered = state.residents;
    
    if (filterStatus === "online") filtered = state.residents.filter(r => r.device_online);
    else if (filterStatus === "offline") filtered = state.residents.filter(r => !r.device_online);
    else if (filterStatus === "lowpower") filtered = state.residents.filter(r => r.device_power < 20);
    
    tbody.innerHTML = filtered.map(r => `
        <tr>
            <td class="font-mono" style="font-weight:600;">${r.device_imei}</td>
            <td>
                <span class="badge" style="background-color:${r.device_online ? '#1d4ed8' : '#64748b'}; color:#fff; font-weight:600; padding:4px 8px; border-radius:4px;">
                    ${r.device_online ? '● 在线' : '离线'}
                </span>
            </td>
            <td>
                <div style="display:flex; align-items:center; gap:6px; width:100px;">
                    <div style="flex:1; height:4px; background-color:var(--semi-color-border); border-radius:2px; overflow:hidden;">
                        <div style="width:${r.device_power}%; height:100%; background-color:${r.device_power < 20 ? 'var(--semi-color-danger)' : 'var(--semi-color-success)'}"></div>
                    </div>
                    <span class="font-mono ${r.device_power < 20 ? 'col-red font-bold' : ''}">${r.device_power}%</span>
                </div>
            </td>
            <td style="font-weight:600;">${r.name}</td>
            <td class="font-mono">${r.device_online ? '2026-06-24 15:03:00' : '2026-06-23 20:15:00'}</td>
            <td class="font-mono">v1.2.4</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="sendDeviceCommand('${r.device_imei}', 'ping')">Ping</button>
                <button class="btn btn-danger btn-sm" onclick="sendDeviceCommand('${r.device_imei}', 'restart')" style="margin-left:4px;">重启</button>
            </td>
        </tr>
    `).join("");
}

// 4.8 M09. 系统设置与审计
function renderSettingsModule() {
    document.getElementById("agency-name").value = state.agency.name || "";
    document.getElementById("agency-phone").value = state.agency.phone || "";
    document.getElementById("agency-area").value = state.agency.area || "";
    document.getElementById("agency-desc").value = state.agency.desc || "";
    
    // 渲染多机构费率与分佣配置表格
    const commTbody = document.getElementById("commission-table-list");
    if (commTbody) {
        commTbody.innerHTML = (state.commissions || []).map(c => `
            <tr>
                <td style="font-weight:600;">${c.name}</td>
                <td class="font-mono">¥${c.subscription_fee.toFixed(2)}</td>
                <td class="font-mono">${c.product_commission.toFixed(1)}%</td>
                <td class="font-mono">${c.service_commission.toFixed(1)}%</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openCommissionModal('${c.id}')">编辑费率</button>
                </td>
            </tr>
        `).join("");
    }
    
    const subTbody = document.getElementById("subaccounts-table-list");
    if (subTbody) {
        subTbody.innerHTML = state.subAccounts.map(a => {
            const roleText = a.role === "ops" ? "运营人员" : "专属客服";
            const badgeClass = a.role === "ops" ? "badge-primary" : "badge-warning";
            return `
                <tr>
                    <td class="font-mono">${a.username}</td>
                    <td style="font-weight:600;">${a.nickname}</td>
                    <td><span class="badge ${badgeClass}">${roleText}</span></td>
                    <td class="font-mono">${a.phone || '—'}</td>
                    <td class="font-mono">${a.email || '—'}</td>
                    <td class="font-mono">${a.created_at}</td>
                    <td><span class="badge" style="background:#E2F9EB; color:#00B365;">正常</span></td>
                </tr>
            `;
        }).join("");
    }
    
    const auditTbody = document.getElementById("auditlogs-table-list");
    if (auditTbody) {
        auditTbody.innerHTML = state.auditLogs.map(l => `
            <tr>
                <td class="font-mono" style="font-size:12px;">${l.time}</td>
                <td style="font-weight:600;">${l.user}</td>
                <td style="font-size:13px;">${l.action}</td>
                <td class="font-mono">${l.ip}</td>
            </tr>
        `).join("");
    }
}

// ==================== 5. 模态框与辅助交互控制 ====================

function initModalHandlers() {
    // 监听关闭模态框，增加 Canvas 循环安全终止 (防御性空值检查)
    document.querySelectorAll(".modal-close, [data-close]").forEach(btn => {
        btn.addEventListener("click", () => {
            const modalEl = btn.closest(".modal");
            const modalId = btn.getAttribute("data-close") || (modalEl ? modalEl.id : null);
            if (modalId) {
                closeModal(modalId);
                
                // 如果关闭居民画像，安全终止 Canvas 动画帧
                if (modalId === "resident-portrait-modal") {
                    stopRelationshipAnimation();
                }
            }
        });
    });
    
    // 医生直加表单
    const formAddDoc = document.getElementById("form-add-doctor");
    if (formAddDoc) {
        formAddDoc.addEventListener("submit", async (e) => {
            e.preventDefault();
            const tags = document.getElementById("new-doc-tags").value.split(",").map(t => t.trim()).filter(Boolean);
            const payload = {
                name: document.getElementById("new-doc-name").value,
                department: document.getElementById("new-doc-dept").value,
                title: document.getElementById("new-doc-title").value,
                phone: document.getElementById("new-doc-phone").value,
                wechat: document.getElementById("new-doc-wechat").value,
                tags,
                bio: document.getElementById("new-doc-bio").value,
                gender: document.getElementById("new-doc-gender").value,
                age: parseInt(document.getElementById("new-doc-age").value)
            };
            try {
                await request("/doctors/add", "POST", payload);
                closeModal("add-doctor-modal");
                formAddDoc.reset();
                await fetchDoctorsList();
                renderApprovalTable();
            } catch (err) {
                alert("添加医生失败: " + err.message);
            }
        });
    }
    
    // 打开新增医生模态框
    document.getElementById("btn-add-doc-modal")?.addEventListener("click", () => openModal("add-doctor-modal"));
    
    // 方案报告类型切换
    document.querySelectorAll(".scheme-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".scheme-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderSchemesTable();
        });
    });
    
    document.getElementById("btn-create-scheme")?.addEventListener("click", () => {
        openSchemeEditorModal("NEW");
    });
    
    // 产品表单与编辑保存
    const formProd = document.getElementById("form-edit-product");
    if (formProd) {
        formProd.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById("edit-prod-id").value,
                name: document.getElementById("edit-prod-name").value,
                category: document.getElementById("edit-prod-cat").value,
                price: parseFloat(document.getElementById("edit-prod-price").value),
                stock: parseInt(document.getElementById("edit-prod-stock").value),
                desc: document.getElementById("edit-prod-desc").value
            };
            try {
                await request("/products/save", "POST", payload);
                closeModal("product-modal");
                await fetchProductsList();
                renderProductsModule();
            } catch (err) {
                alert("产品保存错误: " + err.message);
            }
        });
    }
    
    document.getElementById("btn-add-product")?.addEventListener("click", () => {
        document.getElementById("prod-modal-title").textContent = "新建商品";
        document.getElementById("edit-prod-id").value = "";
        formProd.reset();
        openModal("product-modal");
    });
    
    // 调理服务包表单
    const formPkg = document.getElementById("form-edit-package");
    if (formPkg) {
        formPkg.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById("edit-pkg-id").value,
                name: document.getElementById("edit-pkg-name").value,
                period: document.getElementById("edit-pkg-period").value,
                price: parseFloat(document.getElementById("edit-pkg-price").value),
                desc: document.getElementById("edit-pkg-desc").value
            };
            try {
                await request("/service-packages/save", "POST", payload);
                closeModal("package-modal");
                await fetchServicePackages();
                renderPackagesModule();
            } catch (err) {
                alert("服务包保存错误: " + err.message);
            }
        });
    }
    
    document.getElementById("btn-add-package")?.addEventListener("click", () => {
        document.getElementById("pkg-modal-title").textContent = "新建调理包";
        document.getElementById("edit-pkg-id").value = "";
        formPkg.reset();
        openModal("package-modal");
    });
    
    // Banner 广告表单
    const formBan = document.getElementById("form-edit-banner");
    if (formBan) {
        formBan.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById("edit-ban-id").value,
                title: document.getElementById("edit-ban-title").value,
                url: document.getElementById("edit-ban-url").value
            };
            try {
                await request("/cms/banners/save", "POST", payload);
                closeModal("banner-modal");
                await fetchBannersList();
                renderCmsModule();
            } catch (err) {
                alert("Banner保存错误: " + err.message);
            }
        });
    }
    
    // 打开新增 Banner 模态框
    document.getElementById("btn-add-banner-modal")?.addEventListener("click", () => {
        document.getElementById("banner-modal-title").textContent = "新增首页轮播广告 Banner";
        document.getElementById("edit-ban-id").value = "";
        formBan.reset();
        openModal("banner-modal");
    });
    
    // 医生审批筛选器级联
    document.getElementById("doc-name-search")?.addEventListener("input", () => renderApprovalTable());
    document.getElementById("doc-status-filter")?.addEventListener("change", () => renderApprovalTable());
    document.getElementById("doc-dept-filter")?.addEventListener("change", () => renderApprovalTable());
    
    // 居民搜索与级别筛选
    document.getElementById("res-search")?.addEventListener("input", () => renderResidentsTable());
    document.getElementById("res-level-filter")?.addEventListener("change", () => renderResidentsTable());
    
    // 药食同源类商品分类筛选
    document.querySelectorAll(".filter-prod-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-prod-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderProductsModule();
        });
    });
    
    // M09 左侧垂直二级子导航切换
    document.querySelectorAll(".settings-menu-item").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".settings-menu-item").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const targetPanel = btn.getAttribute("data-subtab");
            document.querySelectorAll(".settings-sub-panel").forEach(p => p.classList.remove("active"));
            const pEl = document.getElementById(targetPanel);
            if (pEl) pEl.classList.add("active");
        });
    });
    
    // 保存机构信息表单
    const formAgency = document.getElementById("agency-info-form");
    if (formAgency) {
        formAgency.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById("agency-name").value,
                phone: document.getElementById("agency-phone").value,
                area: document.getElementById("agency-area").value,
                desc: document.getElementById("agency-desc").value
            };
            try {
                await request("/system/settings/save-agency", "POST", payload);
                alert("机构信息保存成功！");
                await fetchSettingsData();
                renderSettingsModule();
            } catch (err) {
                alert("资料保存错误: " + err.message);
            }
        });
    }
    
    // 保存系统分佣表单 (机构费率配置保存)
    const formEditCommission = document.getElementById("form-edit-commission");
    if (formEditCommission) {
        formEditCommission.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById("edit-comm-agency-id").value,
                subscription_fee: parseFloat(document.getElementById("edit-comm-sub-fee").value),
                product_commission: parseFloat(document.getElementById("edit-comm-prod-rate").value),
                service_commission: parseFloat(document.getElementById("edit-comm-serv-rate").value)
            };
            try {
                await request("/system/settings/save-commission", "POST", payload);
                alert("机构费率与分佣配置保存成功！");
                closeModal("commission-edit-modal");
                await fetchSettingsData();
                renderSettingsModule();
            } catch (err) {
                alert("分佣配置保存错误: " + err.message);
            }
        });
    }
    
    // 新增子账号
    document.getElementById("btn-create-subaccount")?.addEventListener("click", async () => {
        const username = document.getElementById("sub-username").value.trim();
        const nickname = document.getElementById("sub-nickname").value.trim();
        const password = document.getElementById("sub-password").value.trim();
        const phone = document.getElementById("sub-phone").value.trim();
        const email = document.getElementById("sub-email").value.trim();
        const role = document.getElementById("sub-role").value;
        if (!username || !nickname || !password) {
            alert("请输入登录账号、姓名和初始密码！");
            return;
        }
        try {
            await request("/system/settings/add-account", "POST", { username, nickname, password, phone, email, role });
            document.getElementById("sub-username").value = "";
            document.getElementById("sub-nickname").value = "";
            document.getElementById("sub-password").value = "";
            document.getElementById("sub-phone").value = "";
            document.getElementById("sub-email").value = "";
            await fetchSettingsData();
            renderSettingsModule();
        } catch (e) {
            alert("添加子账号失败: " + e.message);
        }
    });

    // 绑定添加推荐医生弹窗及表单提交
    document.getElementById("btn-add-recommend-doc-modal")?.addEventListener("click", () => {
        openRecommendDocModal();
    });

    const formAddRecommendDoc = document.getElementById("form-add-recommend-doc");
    if (formAddRecommendDoc) {
        formAddRecommendDoc.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("recommend-doc-select").value;
            const weight = parseInt(document.getElementById("recommend-doc-weight").value);
            const recommend_intro = document.getElementById("recommend-doc-intro").value.trim();
            if (!id) {
                alert("请先选择待推荐的医生！");
                return;
            }
            try {
                await request("/cms/recommend-doctors", "POST", { id, weight, recommend_intro, is_recommended: true });
                closeModal("recommend-doc-modal");
                await fetchDoctorsList();
                renderCmsModule();
            } catch (err) {
                alert("添加推荐医生失败: " + err.message);
            }
        });
    }
    
    // 审计日志防抖过滤检索
    let logSearchTimeout;
    const logSearch = document.getElementById("audit-log-search");
    if (logSearch) {
        logSearch.addEventListener("input", () => {
            clearTimeout(logSearchTimeout);
            logSearchTimeout = setTimeout(async () => {
                await fetchAuditLogs(logSearch.value.trim());
                renderSettingsModule();
            }, 300);
        });
    }
    
    document.getElementById("btn-clear-search-log")?.addEventListener("click", async () => {
        if (logSearch) logSearch.value = "";
        await fetchAuditLogs("");
        renderSettingsModule();
    });
    
    // 设备在线监控筛选
    document.getElementById("device-status-filter")?.addEventListener("change", () => renderDevicesModule());
    
    // 大屏下钻数字绑定
    document.getElementById("kpi-devices")?.addEventListener("click", () => {
        document.querySelector(".nav-item[data-target='m08-devices']")?.click();
    });
    document.getElementById("kpi-warnings")?.addEventListener("click", () => {
        const devItem = document.querySelector(".nav-item[data-target='m08-devices']");
        if (devItem) {
            devItem.click();
            const devSelect = document.getElementById("device-status-filter");
            if (devSelect) {
                devSelect.value = "lowpower";
                devSelect.dispatchEvent(new Event("change"));
            }
        }
    });
    
    // 导出居民健康档案
    document.getElementById("btn-export-res")?.addEventListener("click", () => {
        alert("系统开始为您导出PDF健康档案与审计清单，请等待浏览器下载。");
        request("/system/logs", "POST", { action: "导出居民健康档案审计" });
    });
}

function toggleApprovalTab(activeBtn, tabName) {
    document.querySelectorAll(".tabs-header .tab-btn").forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
    renderApprovalTable();
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
}

// 方案节点编辑器与拖拽渲染
function renderEditorNodes(nodes) {
    const listEl = document.getElementById("editor-nodes-list");
    if (!listEl) return;
    
    listEl.innerHTML = nodes.map((node, index) => {
        let inputField = "";
        if (node.type === "text") {
            inputField = `<textarea class="premium-textarea node-val" rows="2" placeholder="填写指导文本内容..." oninput="updatePhonePreview()">${node.content}</textarea>`;
        } else if (node.type === "image") {
            inputField = `<input type="text" class="premium-input node-val" value="${node.content}" placeholder="图片资源路径(例如 mock_assets/product_tea.png)..." oninput="updatePhonePreview()">`;
        } else if (node.type === "link") {
            const parts = node.content.split("||");
            const url = parts[0] || "";
            const title = parts[1] || "";
            inputField = `
                <div style="display:flex; gap:6px;">
                    <input type="text" class="premium-input node-link-url" value="${url}" placeholder="跳转外部URL..." oninput="updatePhonePreview()" style="flex:1.2;">
                    <input type="text" class="premium-input node-link-title" value="${title}" placeholder="按钮说明文字..." oninput="updatePhonePreview()" style="flex:1;">
                </div>
            `;
        }
        
        return `
            <div class="drag-item" draggable="true" data-index="${index}" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
                <div class="drag-handle">☰</div>
                <div style="font-size:11px; font-weight:bold; color:var(--semi-color-primary); width:32px;">
                    ${node.type === 'text' ? '文本' : (node.type === 'image' ? '图片' : '超链')}
                </div>
                <div class="node-content-input" data-type="${node.type}" style="flex:1;">
                    ${inputField}
                </div>
                <button class="node-delete-btn" onclick="removeNode(${index})">&times;</button>
            </div>
        `;
    }).join("");
}

function updatePhonePreview() {
    const previewBody = document.getElementById("phone-preview-body");
    if (!previewBody) return;
    
    const schName = document.getElementById("sch-editor-name")?.value || "未命名方案模板";
    const nodes = getEditorNodesData();
    
    if (nodes.length === 0) {
        previewBody.innerHTML = `<div class="phone-empty">在左侧编辑方案节点以在手机内预览</div>`;
        return;
    }
    
    let html = `<h4 style="font-size:12px; font-weight:700; margin-bottom:8px; color:#1F2429;">${schName}</h4>`;
    
    html += nodes.map(node => {
        if (node.type === "text") {
            return `<div class="phone-node-card"><p style="font-size:11px; color:#4F5660; line-height:1.5;">${node.content || '请输入文本内容...'}</p></div>`;
        } else if (node.type === "image") {
            return `
                <div class="phone-node-card" style="text-align:center;">
                    <img src="${node.content || 'mock_assets/product_tea.png'}" class="phone-node-img" onerror="this.src='mock_assets/product_tea.png'">
                </div>
            `;
        } else if (node.type === "link") {
            const parts = node.content.split("||");
            const url = parts[0] || "#";
            const title = parts[1] || "查阅详情";
            return `
                <div class="phone-node-card" style="text-align:center; padding: 4px;">
                    <a href="${url}" target="_blank" class="phone-node-link">🔗 ${title}</a>
                </div>
            `;
        }
        return "";
    }).join("");
    
    // 商品卡片
    const selectedProds = getAssociatedProducts();
    if (selectedProds.length > 0) {
        html += `<div style="border-top:1px dashed var(--semi-color-border); margin:12px 0 8px 0; padding-top:6px;">
            <p style="font-size:10px; font-weight:bold; color:var(--semi-color-primary);">🎁 方案推荐药食同源产品</p>
        </div>`;
        selectedProds.forEach(pId => {
            const p = state.products.find(x => x.id === pId);
            if (p) {
                html += `
                    <div style="display:flex; gap:6px; background:#F4F5F7; padding:6px; border-radius:4px; margin-bottom:4px; align-items:center;">
                        <img src="${p.image}" style="width:28px; height:28px; object-fit:cover; border-radius:3px;">
                        <div style="flex:1; overflow:hidden;">
                            <p style="font-size:10px; font-weight:bold; color:#1F2429; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${p.name}</p>
                            <p style="font-size:9px; color:var(--semi-color-primary); font-weight:700;">¥${p.price.toFixed(2)}</p>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    previewBody.innerHTML = html;
}

let dragSrcIndex = null;
function handleDragStart(e) {
    dragSrcIndex = parseInt(e.currentTarget.getAttribute("data-index"));
    e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    const targetIdx = parseInt(e.currentTarget.getAttribute("data-index"));
    if (dragSrcIndex !== null && dragSrcIndex !== targetIdx) {
        const nodes = getEditorNodesData();
        const dragNode = nodes.splice(dragSrcIndex, 1)[0];
        nodes.splice(targetIdx, 0, dragNode);
        renderEditorNodes(nodes);
        updatePhonePreview();
    }
    return false;
}

function addSchemeNode(type) {
    const nodes = getEditorNodesData();
    nodes.push({ type, content: "" });
    renderEditorNodes(nodes);
    updatePhonePreview();
}

function removeNode(idx) {
    const nodes = getEditorNodesData();
    nodes.splice(idx, 1);
    renderEditorNodes(nodes);
    updatePhonePreview();
}

function getEditorNodesData() {
    const items = document.querySelectorAll("#editor-nodes-list .drag-item");
    const nodes = [];
    items.forEach(item => {
        const type = item.querySelector(".node-content-input").getAttribute("data-type");
        let content = "";
        if (type === "text" || type === "image") {
            content = item.querySelector(".node-val").value;
        } else if (type === "link") {
            const url = item.querySelector(".node-link-url").value;
            const title = item.querySelector(".node-link-title").value;
            content = `${url}||${title}`;
        }
        nodes.push({ type, content });
    });
    return nodes;
}

function associateProductToScheme() {
    const select = document.getElementById("sch-editor-product-select");
    if (!select) return;
    const pId = select.value;
    if (!pId) return;
    
    const current = getAssociatedProducts();
    if (current.includes(pId)) return;
    
    addAssociatedProductBadge(pId);
    select.value = "";
    updatePhonePreview();
}

function addAssociatedProductBadge(pId) {
    const container = document.getElementById("sch-editor-associated-list");
    if (!container) return;
    const p = state.products.find(x => x.id === pId) || state.servicePackages.find(x => x.id === pId);
    if (!p) return;
    
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.style.backgroundColor = "var(--semi-color-primary-light)";
    badge.style.color = "var(--semi-color-primary)";
    badge.style.display = "flex";
    badge.style.alignItems = "center";
    badge.style.gap = "4px";
    badge.setAttribute("data-id", pId);
    badge.innerHTML = `
        ${p.name.substring(0, 5)}..
        <span style="cursor:pointer; font-weight:bold;" onclick="this.parentNode.remove(); updatePhonePreview();">&times;</span>
    `;
    container.appendChild(badge);
}

function getAssociatedProducts() {
    const badges = document.querySelectorAll("#sch-editor-associated-list .badge");
    const ids = [];
    badges.forEach(b => ids.push(b.getAttribute("data-id")));
    return ids;
}

async function saveScheme(publish = false) {
    const id = document.getElementById("sch-editor-id").value;
    const name = document.getElementById("sch-editor-name").value.trim();
    if (!name) {
        alert("请输入方案名称！");
        return;
    }
    const report_type = document.getElementById("sch-editor-type").value;
    const nodes = getEditorNodesData();
    const productsList = getAssociatedProducts();
    const status = publish ? "published" : "draft";
    
    try {
        await request("/schemes/save", "POST", { id, name, report_type, nodes, products: productsList, status });
        closeModal("scheme-editor-modal");
        await fetchSchemesList();
        renderSchemesTable();
    } catch (e) {
        alert("保存方案失败: " + e.message);
    }
}

// 其他通用操作
async function toggleProductStatus(id, checked) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    
    const action = async () => {
        try {
            await request("/products/save", "POST", { ...p, status: checked ? "published" : "draft" });
            await fetchProductsList();
            renderProductsModule();
        } catch (e) { alert(e.message); }
    };

    if (!checked) {
        confirmAction("下架商品确认", `确认要下架药食同源商品 [${p.name}] 吗？下架后居民端将不再展示此商品且不可购买。`, action);
        renderProductsModule(); // 重置视图状态
    } else {
        action();
    }
}

async function togglePackageStatus(id, checked) {
    const pkg = state.servicePackages.find(x => x.id === id);
    if (!pkg) return;
    
    const action = async () => {
        try {
            await request("/service-packages/save", "POST", { ...pkg, status: checked ? "published" : "draft" });
            await fetchServicePackages();
            renderPackagesModule();
        } catch (e) { alert(e.message); }
    };

    if (!checked) {
        confirmAction("下架服务包确认", `确认要下架标准化调理服务包 [${pkg.name}] 吗？下架后居民端将停止新订售卖。`, action);
        renderPackagesModule(); // 重置视图状态
    } else {
        action();
    }
}

function openProductModal(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    document.getElementById("prod-modal-title").textContent = "编辑产品库存属性";
    document.getElementById("edit-prod-id").value = p.id;
    document.getElementById("edit-prod-name").value = p.name;
    document.getElementById("edit-prod-cat").value = p.category;
    document.getElementById("edit-prod-price").value = p.price;
    document.getElementById("edit-prod-stock").value = p.stock;
    document.getElementById("edit-prod-desc").value = p.desc;
    openModal("product-modal");
}

function openPackageModal(id) {
    const pkg = state.servicePackages.find(x => x.id === id);
    if (!pkg) return;
    document.getElementById("pkg-modal-title").textContent = "编辑调理包服务条款";
    document.getElementById("edit-pkg-id").value = pkg.id;
    document.getElementById("edit-pkg-name").value = pkg.name;
    document.getElementById("edit-pkg-period").value = pkg.period;
    document.getElementById("edit-pkg-price").value = pkg.price;
    document.getElementById("edit-pkg-desc").value = pkg.desc;
    openModal("package-modal");
}

function showProductLogs(id) {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    const tbody = document.getElementById("prod-change-log-tbody");
    if (tbody) {
        if (!p.log || p.log.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--semi-color-text-2)">暂无库存修改审计日志</td></tr>`;
        } else {
            tbody.innerHTML = p.log.map(l => `
                <tr>
                    <td class="font-mono">${l.time}</td>
                    <td class="font-mono font-bold ${l.change.startsWith('+') ? 'text-green' : 'col-red'}">${l.change}</td>
                    <td>${l.operator}</td>
                </tr>
            `).join("");
        }
    }
    openModal("prod-log-modal");
}

async function toggleBannerStatus(id, checked) {
    const b = state.banners.find(x => x.id === id);
    if (!b) return;
    try {
        await request("/cms/banners/save", "POST", { ...b, status: checked ? "on" : "off" });
        await fetchBannersList();
        renderCmsModule();
    } catch (e) { alert(e.message); }
}

function openBannerModal(id) {
    const b = state.banners.find(x => x.id === id);
    if (!b) return;
    document.getElementById("edit-ban-id").value = b.id;
    document.getElementById("edit-ban-title").value = b.title;
    document.getElementById("edit-ban-url").value = b.url;
    openModal("banner-modal");
}

async function saveDoctorCmsConfig(id) {
    const introEl = document.getElementById(`rec-intro-${id}`);
    const doc = state.doctors.find(d => d.id === id);
    if (!doc || !introEl) return;
    
    try {
        await request("/cms/recommend-doctors", "POST", { id, weight: doc.weight, recommend_intro: introEl.value.trim() });
        alert("名医推荐参数更新成功！");
        await fetchDoctorsList();
        renderCmsModule();
    } catch (e) { alert(e.message); }
}

function updateDoctorWeight(id, value) {
    const doc = state.doctors.find(d => d.id === id);
    if (doc) {
        doc.weight = parseInt(value);
        const valSpan = document.querySelector(`input[onchange="updateDoctorWeight('${id}', this.value)"] + span`);
        if (valSpan) valSpan.textContent = value;
    }
}

async function sendDeviceCommand(imei, action) {
    try {
        await request("/devices/change", "POST", { imei, action });
        alert(`远程指令下发成功！IMEI: ${imei} | 指令: ${action === 'ping' ? '在线 Ping 心跳唤醒' : '远程硬重启'}`);
        await fetchResidentsList();
        renderDevicesModule();
    } catch (e) { alert(e.message); }
}

// ==================== 6. 图表实例化与销毁管理 ====================

function destroyChart(name) {
    if (state.charts[name]) {
        state.charts[name].destroy();
        state.charts[name] = null;
    }
}

// 大屏趋势图 (对齐官方 OKLCH feedback 与 charts 色系)
function renderWarningsTrendChart(data) {
    const el = document.getElementById("warningsTrendChart");
    if (!el) return;
    
    destroyChart("warningsTrend");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    state.charts.warningsTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: '脑血管风险警情',
                    data: data.cardio,
                    borderColor: '#ef4444', // Danger 绯红 oklch(0.62 0.23 22)
                    backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true
                },
                {
                    label: '睡眠暂停预警',
                    data: data.sleep,
                    borderColor: '#49a2f9', // Accent 冰蓝 oklch(0.78 0.18 195)
                    backgroundColor: 'rgba(73, 162, 249, 0.04)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true
                },
                {
                    label: '压力负荷偏高',
                    data: data.pressure,
                    borderColor: '#b180f9', // Chart-5 紫罗兰 oklch(0.6 0.2 290)
                    backgroundColor: 'rgba(177, 128, 249, 0.04)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter, sans-serif' } } }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#7204220', font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#7204220', font: { size: 10 } } }
            }
        }
    });
}

// 大屏风险类型占比
function renderWarningsRatioChart(ratio) {
    const el = document.getElementById("warningsRatioChart");
    if (!el) return;
    
    destroyChart("warningsRatio");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    state.charts.warningsRatio = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['脑血管', '重度睡眠', '压力负荷'],
            datasets: [{
                data: [ratio.cardio, ratio.sleep, ratio.pressure],
                backgroundColor: [
                    '#ef4444', // 脑血管 - Danger 绯红
                    '#49a2f9', // 重度睡眠 - Accent 冰蓝
                    '#b180f9'  // 压力负荷 - 紫罗兰
                ],
                // 物理切缝感：用大屏 panel 背景色描边，并增加边框间隙
                borderWidth: 3,
                borderColor: '#1a2236',
                hoverOffset: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}

// 居民详情 30 天体征图 (亮色 B端后台对齐)
function renderResidentTrendChart(trends) {
    const el = document.getElementById("residentTrendChart");
    if (!el) return;
    
    destroyChart("residentTrend");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    // 创建冰蓝渐变填充区
    const hrGradient = ctx.createLinearGradient(0, 0, 0, 150);
    hrGradient.addColorStop(0, 'rgba(73, 162, 249, 0.15)');
    hrGradient.addColorStop(1, 'rgba(73, 162, 249, 0)');
    
    // 创建绯红渐变填充区
    const oxGradient = ctx.createLinearGradient(0, 0, 0, 150);
    oxGradient.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
    oxGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    
    state.charts.residentTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trends.labels,
            datasets: [
                {
                    label: '实时心率波动(bpm)',
                    data: trends.heart_rate,
                    borderColor: '#49a2f9',
                    backgroundColor: hrGradient,
                    fill: true,
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: '血氧饱和度(%)',
                    data: trends.blood_oxygen,
                    borderColor: '#ef4444',
                    backgroundColor: oxGradient,
                    fill: true,
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#64748b', font: { size: 10 } } }
            },
            scales: {
                x: { grid: { color: 'rgba(148, 163, 184, 0.12)' }, ticks: { color: '#64748b', font: { size: 9 } } },
                y: { position: 'left', grid: { color: 'rgba(148, 163, 184, 0.12)' }, ticks: { color: '#64748b', font: { size: 9 } } },
                y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#64748b', font: { size: 9 } } }
            }
        }
    });
}

// ==================== 6. 重构版新增模块交互与弹窗函数 ====================

// 动态填充并打开添加推荐医生弹窗
function openRecommendDocModal() {
    const selectEl = document.getElementById("recommend-doc-select");
    if (selectEl) {
        // 仅列出已激活（approved）且尚未推荐（!is_recommended）的医生
        const unrecommendedDocs = state.doctors.filter(d => d.status === "approved" && !d.is_recommended);
        if (unrecommendedDocs.length === 0) {
            selectEl.innerHTML = '<option value="">无待推荐医生 (所有已入驻医生均已被推荐)</option>';
        } else {
            selectEl.innerHTML = unrecommendedDocs.map(d => `<option value="${d.id}">${d.name} (${d.department} · ${d.title})</option>`).join("");
        }
    }
    const introEl = document.getElementById("recommend-doc-intro");
    if (introEl) introEl.value = "";
    const weightEl = document.getElementById("recommend-doc-weight");
    if (weightEl) weightEl.value = "50";
    openModal("recommend-doc-modal");
}

// 取消推荐医生，二次确认拦截
function cancelDoctorRecommendation(id) {
    const doc = state.doctors.find(d => d.id === id);
    if (!doc) return;
    confirmAction("取消推荐确认", `确定要取消医生 [${doc.name}] 的主页推荐展示吗？`, async () => {
        try {
            await request("/cms/recommend-doctors", "POST", { id, weight: doc.weight, recommend_intro: doc.recommend_intro || "", is_recommended: false });
            await fetchDoctorsList();
            renderCmsModule();
        } catch (e) {
            alert("取消推荐失败: " + e.message);
        }
    });
}

// 弹出特定机构的费率编辑弹窗
function openCommissionModal(id) {
    const c = state.commissions.find(x => x.id === id);
    if (!c) return;
    const agencyIdEl = document.getElementById("edit-comm-agency-id");
    const agencyNameEl = document.getElementById("edit-comm-agency-name");
    const subFeeEl = document.getElementById("edit-comm-sub-fee");
    const prodRateEl = document.getElementById("edit-comm-prod-rate");
    const servRateEl = document.getElementById("edit-comm-serv-rate");
    
    if (agencyIdEl) agencyIdEl.value = c.id;
    if (agencyNameEl) agencyNameEl.value = c.name;
    if (subFeeEl) subFeeEl.value = c.subscription_fee || 0;
    if (prodRateEl) prodRateEl.value = c.product_commission || 0;
    if (servRateEl) servRateEl.value = c.service_commission || 0;
    
    openModal("commission-edit-modal");
}

// ==========================================================================
// 16. 医生工作台核心交互与数据渲染模块 (Doctor Workspace Core Engine)
// ==========================================================================

// --- D03. 我的在管病人 ---
function renderPatientsModule() {
    const listContainer = document.getElementById("patient-items-list");
    if (!listContainer) return;
    
    // 初始化一些默认数据
    const searchVal = document.getElementById("patient-search-input")?.value.trim().toLowerCase() || "";
    
    // 过滤病人：高危(red)置顶，然后按最近联系时间
    let filtered = state.residents.filter(r => {
        return searchVal ? r.name.toLowerCase().includes(searchVal) : true;
    });
    
    const levelMap = { "red": 0, "yellow": 1, "green": 2 };
    filtered.sort((a, b) => levelMap[a.health_level] - levelMap[b.health_level]);
    
    if (filtered.length === 0) {
        listContainer.innerHTML = `<li style="padding:10px; text-align:center; color:var(--semi-color-text-2); font-size:12px;">无在管居民数据</li>`;
        return;
    }
    
    listContainer.innerHTML = filtered.map(r => {
        let levelBadge = "";
        if (r.health_level === "red") levelBadge = `<span class="badge badge-danger" style="animation: bounce-anim 1s infinite alternate;">高危红警</span>`;
        else if (r.health_level === "yellow") levelBadge = `<span class="badge badge-warning">中危黄警</span>`;
        else levelBadge = `<span class="badge badge-success" style="background:#e6fcf5; color:#0ca678;">健康绿码</span>`;
        
        const isCurrent = r.id === state.activePatientId;
        const alertClass = (r.health_level === "red") ? "warning-item-card unhandled-high" : "";
        
        return `
            <li class="patient-item-card ${isCurrent ? 'active' : ''} ${alertClass}" onclick="selectPatient('${r.id}')">
                <div style="display:flex; flex-direction:column; gap:4px; width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:600; font-size:13.5px;">${r.name} (${r.gender} · ${r.age}岁)</span>
                        ${levelBadge}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--semi-color-text-2);">
                        <span>心率: ${r.heart_rate}bpm</span>
                        <span>血氧: ${r.blood_oxygen}%</span>
                    </div>
                </div>
            </li>
        `;
    }).join("");
    
    // 监听搜索输入
    const searchInput = document.getElementById("patient-search-input");
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = "true";
        searchInput.addEventListener("input", () => {
            renderPatientsModule();
        });
    }
    
    // 若此前选中了病人，渲染其画像详情，否则保持空状态
    if (state.activePatientId) {
        selectPatient(state.activePatientId);
    }
}

async function selectPatient(id) {
    state.activePatientId = id;
    
    // 高亮选择行
    document.querySelectorAll(".patient-item-card").forEach(el => el.classList.remove("active"));
    
    // 异步拉取画像并填充
    try {
        const detailContainer = document.getElementById("patient-portrait-detail-view");
        if (!detailContainer) return;
        
        const data = await request(`/residents/portrait?id=${id}`);
        const r = data.resident;
        
        let levelText = "健康绿码";
        let levelColor = "var(--semi-color-success)";
        if (r.health_level === "red") {
            levelText = "红色高危警报";
            levelColor = "var(--semi-color-danger)";
        } else if (r.health_level === "yellow") {
            levelText = "黄色中危警报";
            levelColor = "var(--semi-color-warning)";
        }
        
        detailContainer.innerHTML = `
            <div class="patient-portrait-full" style="display:flex; flex-direction:column; gap:20px; height:100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--semi-color-border); padding-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:14px;">
                        ${getFormalAvatar(r.gender, r.age, r.name)}
                        <div>
                            <h3 style="margin:0; font-size:18px;">${r.name}</h3>
                            <p style="margin:2px 0 0 0; font-size:12px; color:var(--semi-color-text-2);">档案号: ID_${r.id} | 服务时长: 6个月</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-secondary" onclick="openDoctorImModal('${r.id}', '${r.name}', '${r.health_level}')">💬 发起主动沟通 (IM)</button>
                        <button class="btn btn-primary" onclick="switchModule('d04-schemes')">📋 下发调理方案</button>
                    </div>
                </div>
                
                <div class="form-row-grid">
                    <div class="card-card" style="padding:14px; background-color: var(--semi-color-bg-1);">
                        <span class="premium-label">健康体征及状态</span>
                        <p style="margin:4px 0 0 0; font-size:15px; font-weight:700; color:${levelColor}">${levelText}</p>
                        <div style="display:flex; gap:14px; margin-top:10px; font-size:12px; color:var(--semi-color-text-1);">
                            <span>血压: ${r.blood_pressure} mmHg</span>
                            <span>血糖: 5.4 mmol/L</span>
                        </div>
                    </div>
                    <div class="card-card" style="padding:14px; background-color: var(--semi-color-bg-1);">
                        <span class="premium-label">关联智能穿戴设备</span>
                        <p style="margin:4px 0 0 0; font-size:13.5px; font-weight:600;">⌚ AI 智能防护手表 (Active 4)</p>
                        <div style="display:flex; gap:14px; margin-top:10px; font-size:12px; color:var(--semi-color-text-2);">
                            <span>设备在线: ${r.device_online ? '在线' : '离线'}</span>
                            <span>电池电量: ${r.device_power}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- 30天心率血氧波形折线图 -->
                <div class="card-card" style="padding:16px; flex:1; min-height:220px; display:flex; flex-direction:column;">
                    <span class="premium-label" style="margin-bottom:10px;">📈 近 30 天体征连续波动趋势 (连续采集)</span>
                    <div style="flex:1; position:relative;">
                        <canvas id="residentTrendChart"></canvas>
                    </div>
                </div>
                
                <!-- 历史警报与干预记录 -->
                <div class="card-card" style="padding:16px; max-height: 180px; overflow-y:auto;">
                    <span class="premium-label" style="margin-bottom:8px; display:block;">⚠️ 历史干预归档与预警日志</span>
                    <table class="premium-table" style="font-size:11.5px; width:100%;">
                        <thead>
                            <tr>
                                <th>时间</th>
                                <th>事件类型</th>
                                <th>体征明细</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.warning_history.map(w => `
                                <tr>
                                    <td>${w.time}</td>
                                    <td>${w.type}</td>
                                    <td>${w.detail}</td>
                                    <td class="${w.status === '已处理' ? 'text-green' : 'text-danger'}">${w.status}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // 渲染图表
        renderResidentTrendChart(data.trends);
        
    } catch (e) {
        console.error("加载画像详情失败:", e);
    }
}

// 打开医生端主动沟通IM对话浮层
function openDoctorImModal(patientId, patientName, healthLevel) {
    const modal = document.getElementById("doctor-im-modal-view");
    if (!modal) return;
    
    // 初始化聊天记录
    if (!state.chatMessages[patientId]) {
        state.chatMessages[patientId] = [
            { sender: 'patient', text: `医生您好，我的手表刚刚发出了心率异常提醒，瞬时心率好像偏高，请问这严重吗？`, time: "今天 10:20" },
            { sender: 'doc', text: `您好，我是您的责任管理医师。已经查看到您的瞬时心率达到异常阈值。请先在室内平躺或静坐休息，不要剧烈运动。`, time: "今天 10:22" }
        ];
    }
    
    document.getElementById("im-chatting-name").textContent = patientName;
    const levelBadge = document.getElementById("im-chatting-level");
    if (levelBadge) {
        if (healthLevel === "red") {
            levelBadge.className = "badge badge-danger";
            levelBadge.textContent = "高危警报";
        } else if (healthLevel === "yellow") {
            levelBadge.className = "badge badge-warning";
            levelBadge.textContent = "中危警报";
        } else {
            levelBadge.className = "badge badge-success";
            levelBadge.textContent = "健康绿码";
        }
    }
    
    modal.classList.add("active");
    renderImMessages(patientId);
    
    // 绑定发送事件
    const btnSend = document.getElementById("btn-send-im-msg");
    const textInput = document.getElementById("im-text-send-input");
    
    // 强制清理前序监听
    const newBtn = btnSend.cloneNode(true);
    btnSend.parentNode.replaceChild(newBtn, btnSend);
    
    newBtn.addEventListener("click", () => {
        const val = textInput.value.trim();
        if (!val) return;
        
        state.chatMessages[patientId].push({
            sender: 'doc',
            text: val,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        textInput.value = "";
        renderImMessages(patientId);
        
        // 自动产生模拟回复
        setTimeout(() => {
            state.chatMessages[patientId].push({
                sender: 'patient',
                text: `收到！谢谢医生指导，我休息一会看看。`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            renderImMessages(patientId);
        }, 1500);
    });
    
    // 关闭事件
    const btnClose = document.getElementById("btn-close-im");
    if (btnClose) {
        btnClose.onclick = () => {
            modal.classList.remove("active");
            if (state.imWatchTimer) {
                clearInterval(state.imWatchTimer);
                state.imWatchTimer = null;
            }
        };
    }
    
    // 开启 30 秒轮询的手表实时体征小看板
    startImWatchDashboard(patientId);
}

function renderImMessages(patientId) {
    const box = document.getElementById("im-chat-messages-container");
    if (!box) return;
    
    const msgs = state.chatMessages[patientId] || [];
    box.innerHTML = msgs.map(m => `
        <div class="chat-bubble ${m.sender === 'doc' ? 'doc' : 'patient'}">
            <div style="font-size:11px; opacity:0.75; margin-bottom:2px;">${m.sender === 'doc' ? '我' : '居民'} · ${m.time}</div>
            <div>${m.text}</div>
        </div>
    `).join("");
    
    // 滚动到底部
    box.scrollTop = box.scrollHeight;
}

// 常用语模板套用一键填充到 IM 输入框
window.useQuickPhrase = function(type) {
    const textInput = document.getElementById("im-text-send-input");
    if (!textInput) return;
    
    let text = "";
    if (type === '日常问候') {
        text = "您好！今天感觉怎么样？设备体征数据未见明显异常，请继续保持规律作息和适度运动。";
    } else if (type === '用药提醒') {
        text = "温馨提示：请按时服用调理方案中的心脑血管养护类膳食包，多喝温开水，忌辛辣生冷。";
    } else if (type === '干预随访') {
        text = "我已经为您定制了专科调理方案，已下发到您的居民端小程序，请抽空确认查看并开始日常打卡。";
    } else if (type === '警报跟进') {
        text = "注意！检测到您刚才出现了瞬时心脑血管风险报警，请立即停止一切活动，坐下或静卧，配合深呼吸，若身体持续不适请联系家属或送医。";
    }
    textInput.value = text;
};

// 开启智能手表 30s 看板轮询与数值随机漂移
function startImWatchDashboard(patientId) {
    const hrVal = document.getElementById("watch-hr-num");
    const oxVal = document.getElementById("watch-ox-num");
    const bpVal = document.getElementById("watch-bp-num");
    const sleepVal = document.getElementById("watch-sleep-num");
    const countdownEl = document.querySelector(".refresh-countdown");
    
    const resident = state.residents.find(r => r.id === patientId);
    if (!resident) return;
    
    if (state.imWatchTimer) {
        clearInterval(state.imWatchTimer);
    }
    
    state.imWatchSeconds = 30;
    
    function updateWatchUI() {
        // 心率在原数值上上下随机漂移 2bpm
        const driftHr = resident.heart_rate + Math.floor(Math.random() * 5) - 2;
        if (hrVal) hrVal.textContent = driftHr;
        
        // 血氧在 95-99% 波动
        const driftOx = Math.min(100, Math.max(90, resident.blood_oxygen + Math.floor(Math.random() * 3) - 1));
        if (oxVal) oxVal.textContent = driftOx;
        
        // 血压
        if (bpVal) bpVal.textContent = resident.blood_pressure;
        
        // 睡眠
        if (sleepVal) sleepVal.textContent = "7.2";
        
        // 异常高亮红色报警防御
        const hrBox = document.getElementById("watch-hr-box");
        if (hrBox) {
            if (driftHr > 100 || driftHr < 60) {
                hrBox.classList.add("warning-box");
            } else {
                hrBox.classList.remove("warning-box");
            }
        }
        
        const oxBox = document.getElementById("watch-ox-box");
        if (oxBox) {
            if (driftOx < 95) {
                oxBox.classList.add("warning-box");
            } else {
                oxBox.classList.remove("warning-box");
            }
        }
    }
    
    updateWatchUI();
    
    state.imWatchTimer = setInterval(() => {
        state.imWatchSeconds--;
        if (countdownEl) countdownEl.textContent = `${state.imWatchSeconds}s`;
        
        if (state.imWatchSeconds <= 0) {
            state.imWatchSeconds = 30;
            updateWatchUI();
        }
    }, 1000);
}

// --- D06. 待处理预警工作台 ---
function renderWarningsModule() {
    const listContainer = document.getElementById("warning-alert-list-container");
    if (!listContainer) return;
    
    // 从居民列表里筛选出高危(red)的当做待处理预警单
    const alertResidents = state.residents.filter(r => r.health_level === "red");
    
    const todoCountEl = document.getElementById("warning-todo-count");
    if (todoCountEl) {
        todoCountEl.textContent = alertResidents.length;
    }
    
    if (alertResidents.length === 0) {
        listContainer.innerHTML = `<li style="padding:16px; text-align:center; color:var(--semi-color-text-2); font-size:12px;">🎉 当前没有待处理的高危健康预警单</li>`;
        return;
    }
    
    listContainer.innerHTML = alertResidents.map(r => {
        const isCurrent = r.id === state.activeWarningId;
        return `
            <li class="warning-item-card unhandled-high ${isCurrent ? 'active' : ''}" onclick="selectWarning('${r.id}')">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-weight:700; color:var(--semi-color-danger); font-size:13px;">⚠️ 瞬时心脑血管预警</span>
                    <span style="font-size:11px; color:var(--semi-color-text-2);">今天 10:20</span>
                </div>
                <div style="font-size:12.5px; color:var(--semi-color-text-1);">在管居民: <strong style="color:var(--semi-color-text-0);">${r.name}</strong></div>
                <div style="font-size:12.5px; color:var(--semi-color-text-1); margin-top:2px;">异常体征: 心率高位波动至 ${r.heart_rate}bpm</div>
            </li>
        `;
    }).join("");
    
    if (state.activeWarningId) {
        selectWarning(state.activeWarningId);
    }
}

function selectWarning(id) {
    state.activeWarningId = id;
    
    document.querySelectorAll(".warning-item-card").forEach(el => el.classList.remove("active"));
    
    const detailContainer = document.getElementById("warning-handling-detail-view");
    if (!detailContainer) return;
    
    const r = state.residents.find(x => x.id === id);
    if (!r) return;
    
    detailContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px; height:100%;">
            <div style="border-bottom:1px solid var(--semi-color-border); padding-bottom:16px;">
                <h3 style="margin:0; font-size:17px; color:var(--semi-color-danger);">⚠️ 待处置高危健康预警研判</h3>
                <p style="margin:4px 0 0 0; font-size:12px; color:var(--semi-color-text-2);">预警单号: WN_${r.id} | 触发类型: 瞬时心率与心血管波动过载</p>
            </div>
            
            <div class="card-card" style="padding:14px; background-color:rgba(239,68,68,0.02); border-color:rgba(239,68,68,0.2);">
                <span class="premium-label" style="color:var(--semi-color-danger);">异常事件细节</span>
                <p style="margin:4px 0 0 0; font-size:13.5px; font-weight:600; line-height:1.5;">
                    居民 [${r.name}] 于 2026-06-30 09:20 智能防摔手表采集心率异常，瞬时心率突破预置阈值（100 bpm），当前数值达 ${r.heart_rate}bpm，伴有血压过高波动。
                </p>
            </div>
            
            <div class="card-card" style="padding:14px; background-color:rgba(0,102,255,0.02); border-color:rgba(0,102,255,0.15);">
                <span class="premium-label" style="color:var(--semi-color-primary);">🤖 平台 AI 健康干预助手建议</span>
                <p style="margin:4px 0 0 0; font-size:12.5px; line-height:1.6; color:var(--semi-color-text-1);">
                    研判分析：患者中老年且有历史高血压史，可能由于情绪剧烈起伏或睡眠质量差诱发瞬时心动过速。建议立即套用 <strong>[中医心脑血管益气养护调理方案]</strong> 下发至其小程序，并通过 IM 对话发起主动关怀与用药指导。
                </p>
            </div>
            
            <!-- 医生处置归档表单 -->
            <div class="card-card" style="padding:18px;">
                <h4 class="sub-panel-title" style="margin-bottom:12px;">预警单处置意见归档</h4>
                <form id="form-warning-handle-submit">
                    <div class="form-row">
                        <label class="premium-label">处置干预动作 *</label>
                        <select id="warning-handle-action" class="premium-select" required>
                            <option value="scheme">套用模板下发方案并归档</option>
                            <option value="im">发起 IM 主动随访跟进并归档</option>
                            <option value="check">标记为正常噪点并直接归档</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label class="premium-label">医生干预处置研判说明 *</label>
                        <textarea id="warning-handle-reason" class="premium-textarea" rows="3" required placeholder="请输入您的专业医学研判说明，此项将同步存入居民健康画像并推送审计日志..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top:8px; width:100%;">确认执行干预并处置归档</button>
                </form>
            </div>
        </div>
    `;
    
    // 绑定表单提交事件
    const form = document.getElementById("form-warning-handle-submit");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const action = document.getElementById("warning-handle-action").value;
            const reason = document.getElementById("warning-handle-reason").value.trim();
            
            // 归档处理：将该居民健康评级变绿，从而减少未处理预警数量，形成完整的数据链路
            r.health_level = "green";
            state.activeWarningId = null;
            
            // 审计日志推送
            const actionText = action === "scheme" ? "下发调理方案" : (action === "im" ? "发起 IM 主动随访" : "研判标记正常");
            const log_entry = {
                time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: "平台责任医生(张仲景)",
                action: `对高危预警单 WN_${r.id} 进行快速处置: [${actionText}]。研判说明: ${reason}`,
                ip: "192.168.1.58"
            };
            state.auditLogs.unshift(log_entry);
            
            alert(`预警处置归档成功！医生研判说明已成功保存并上报，该高危警情已归档关闭。`);
            
            // 重新刷新两个页面的展示
            renderWarningsModule();
            // 同步刷新大屏的警报 KPI 数量！
            const kpiWarnEl = document.getElementById("kpi-warnings");
            if (kpiWarnEl) {
                const cur = parseInt(kpiWarnEl.textContent) || 0;
                kpiWarnEl.textContent = Math.max(0, cur - 1);
            }
        });
    }
}

// --- D04. 专科方案管理 ---
function renderDoctorSchemesModule() {
    const container = document.getElementById("doctor-template-items-list");
    if (!container) return;
    
    if (state.schemes.length === 0) {
        container.innerHTML = `<li style="padding:10px; text-align:center; color:var(--semi-color-text-2);">暂无调理方案模板</li>`;
        return;
    }
    
    container.innerHTML = state.schemes.map(s => {
        const isCurrent = s.id === state.selectedSchemeId;
        let typeBadge = `<span class="badge" style="background:#e8f0f6; color:#0066ff;">${s.report_type}驱动</span>`;
        return `
            <li class="template-item-card ${isCurrent ? 'active' : ''}" onclick="selectDoctorScheme('${s.id}')">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-weight:700; font-size:12.5px;">${s.name}</span>
                    ${typeBadge}
                </div>
                <div style="font-size:11px; color:var(--semi-color-text-2);">关联产品数: ${s.products ? s.products.length : 0}</div>
            </li>
        `;
    }).join("");
    
    // 初始化节点添加与一键下发事件
    const btnAdd = document.getElementById("btn-add-text-node");
    if (btnAdd && !btnAdd.dataset.bound) {
        btnAdd.dataset.bound = "true";
        btnAdd.onclick = () => addNodeToDocScheme();
    }
    
    const btnSend = document.getElementById("btn-send-scheme-to-patient");
    if (btnSend && !btnSend.dataset.bound) {
        btnSend.dataset.bound = "true";
        btnSend.onclick = () => sendSchemeToPatient();
    }
    
    if (state.selectedSchemeId) {
        selectDoctorScheme(state.selectedSchemeId);
    }
}

function selectDoctorScheme(id) {
    state.selectedSchemeId = id;
    document.querySelectorAll(".template-item-card").forEach(el => el.classList.remove("active"));
    
    const s = state.schemes.find(x => x.id === id);
    if (!s) return;
    
    const nameInput = document.getElementById("doc-edit-scheme-name");
    if (nameInput) nameInput.value = s.name;
    
    state.editingSchemeNodes = JSON.parse(JSON.stringify(s.nodes || []));
    renderDocEditingNodes();
}

function renderDocEditingNodes() {
    const list = document.getElementById("doc-edit-nodes-list");
    if (!list) return;
    
    if (state.editingSchemeNodes.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:var(--semi-color-text-2); font-size:11px; padding:10px;">暂无节点，点击下方添加</div>`;
        return;
    }
    
    list.innerHTML = state.editingSchemeNodes.map((n, i) => `
        <div class="drag-item" style="margin-bottom:6px;">
            <span class="drag-handle">☰</span>
            <input type="text" class="premium-input node-content-input" value="${n.content}" oninput="updateDocSchemeNode(${i}, this.value)">
            <button class="node-delete-btn" onclick="deleteDocSchemeNode(${i})">&times;</button>
        </div>
    `).join("");
    
    // 渲染右侧 3D 手机预览
    renderPhonePreview();
}

window.updateDocSchemeNode = function(index, val) {
    if (state.editingSchemeNodes[index]) {
        state.editingSchemeNodes[index].content = val;
        renderPhonePreview();
    }
};

window.deleteDocSchemeNode = function(index) {
    state.editingSchemeNodes.splice(index, 1);
    renderDocEditingNodes();
};

function addNodeToDocScheme() {
    state.editingSchemeNodes.push({ type: "text", content: "新调理养生动作或膳食建议" });
    renderDocEditingNodes();
}

function renderPhonePreview() {
    const body = document.getElementById("phone-preview-body-container");
    if (!body) return;
    
    const nodesHtml = state.editingSchemeNodes.map((n, idx) => `
        <div class="phone-node-item" style="background:#f3f7fa; border-radius:6px; padding:8px 10px; margin-bottom:8px; border-left:3px solid var(--semi-color-primary); font-size:11px;">
            <div style="font-weight:700; color:var(--semi-color-primary); margin-bottom:2px;">节点 ${idx+1}</div>
            <div>${n.content}</div>
        </div>
    `).join("");
    
    body.innerHTML = `
        <div style="padding:10px; display:flex; flex-direction:column; gap:6px;">
            <h5 style="margin:0 0 6px 0; font-size:13px; font-weight:700; color:var(--semi-color-text-0);">${document.getElementById("doc-edit-scheme-name")?.value || "我的专科方案"}</h5>
            <div style="font-size:10px; color:var(--semi-color-text-2); margin-bottom:8px;">责任管理医生：张仲景 主任医师</div>
            ${nodesHtml}
            <div style="border-top:1px dashed #cbd5e1; padding-top:8px; margin-top:8px; text-align:center; font-size:10px; color:var(--semi-color-success);">
                💚 该方案已匹配您的健康画像，请每日打卡调理
            </div>
        </div>
    `;
}

function sendSchemeToPatient() {
    if (!state.selectedSchemeId) {
        alert("请先套用一个方案模板。");
        return;
    }
    alert(`下发成功！个性化调理方案已一键推送至在管居民的移动端小程序。`);
}

// --- D07. 居民绑定审批 ---
function renderBindingRequestsModule() {
    const grid = document.getElementById("binding-requests-grid");
    if (!grid) return;
    
    // 模拟几张绑定申请卡片
    const requests = [
        { id: "req_1", name: "李秀芬", age: 68, gender: "女", report: "重度睡眠呼吸暂停风险（血氧 < 90%）", time: "2026-06-30 08:30" },
        { id: "req_2", name: "王建国", age: 72, gender: "男", report: "瞬时高血压波动（160/95 mmHg）", time: "2026-06-30 09:12" }
    ];
    
    if (requests.length === 0) {
        grid.innerHTML = `<div style="text-align:center; color:var(--semi-color-text-2); font-size:12px; grid-column:span 3;">暂无待审批的居民绑定申请</div>`;
        return;
    }
    
    grid.innerHTML = requests.map(r => `
        <div class="binding-request-card" id="bind-card-${r.id}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; font-size:14px;">${r.name} (${r.gender} · ${r.age}岁)</span>
                <span style="font-size:10.5px; color:var(--semi-color-text-2);">${r.time}</span>
            </div>
            <div style="font-size:12px; color:var(--semi-color-text-1); background-color:var(--semi-color-bg-1); padding:8px; border-radius:var(--semi-border-radius-md); border: 1px solid var(--semi-color-border);">
                <strong>体征报告摘要：</strong>${r.report}
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
                <button class="btn btn-secondary btn-sm" onclick="handleBindingApproval('${r.id}', 'rejected')">驳回</button>
                <button class="btn btn-primary btn-sm" onclick="handleBindingApproval('${r.id}', 'approved')">批准绑定</button>
            </div>
        </div>
    `).join("");
}

window.handleBindingApproval = function(id, action) {
    const card = document.getElementById(`bind-card-${id}`);
    if (card) {
        card.style.transform = "scale(0.9)";
        card.style.opacity = "0";
        setTimeout(() => {
            card.remove();
            alert(action === "approved" ? "批准成功！该居民已成功纳入您的在管责任范围内。" : "驳回申请成功，通知已下发。");
        }, 300);
    }
};

// --- D01. 医生信息维护 ---
function renderDoctorProfileModule() {
    const bioTextarea = document.getElementById("doc-profile-bio");
    const counter = document.getElementById("profile-char-counter");
    
    if (bioTextarea && counter) {
        bioTextarea.value = "主任医师，国医大师，出身中医世家。深耕《伤寒论》与《金匮要略》经方医学研究三十余载，擅长运用柴胡桂枝汤、小建中汤进行亚健康慢性病人体质调理及脾胃失调干预。针对心脑血管警情具有独特的预警研判理论，已累计指导调理服务超过一万名在管居民。";
        counter.textContent = `${bioTextarea.value.length}/500`;
        
        // 绑定字数限制和实时切断
        bioTextarea.oninput = () => {
            let val = bioTextarea.value;
            if (val.length > 500) {
                bioTextarea.value = val.slice(0, 500);
            }
            counter.textContent = `${bioTextarea.value.length}/500`;
        };
    }
    
    const btnSave = document.getElementById("btn-save-doc-profile");
    if (btnSave) {
        btnSave.onclick = () => {
            alert("保存成功！个人执业简介及隐私限制已即时发布同步至 C 端名医名片。");
        };
    }
}

// --- D02. 科普主页维护 ---
function renderDoctorArticlesModule() {
    const list = document.getElementById("doc-published-articles-list");
    if (!list) return;
    
    // 渲染科普列表
    list.innerHTML = state.publishedArticles.map(a => `
        <li style="display:flex; justify-content:space-between; align-items:center; background:var(--semi-color-bg-1); padding:8px 12px; border-radius:var(--semi-border-radius-md); font-size:12.5px; border:1px solid var(--semi-color-border);">
            <div style="display:flex; flex-direction:column; gap:2px;">
                <span style="font-weight:600;">${a.title}</span>
                <span style="font-size:10px; color:var(--semi-color-text-2);">状态: ${a.status === 'published' ? '已公开发布' : '草稿暂存'} | 浏览量: ${a.reads}</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="deletePublishedArticle('${a.id}')" style="padding:4px 8px; font-size:11px;">删除</button>
        </li>
    `).join("");
    
    // 渲染小程序预览
    renderDoctorCardMiniApp();
    
    // 绑定发布按钮
    const btnPublish = document.getElementById("btn-publish-art-btn");
    if (btnPublish && !btnPublish.dataset.bound) {
        btnPublish.dataset.bound = "true";
        btnPublish.onclick = () => publishArticleSubmit();
    }
    
    // 绑定草稿按钮
    const btnDraft = document.getElementById("btn-save-draft-btn");
    if (btnDraft && !btnDraft.dataset.bound) {
        btnDraft.dataset.bound = "true";
        btnDraft.onclick = () => saveArticleDraft();
    }
    
    // 视频校验与第一帧封面图截取提示
    const videoInput = document.getElementById("doc-video-file-input");
    if (videoInput) {
        videoInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type !== "video/mp4") {
                    alert("错误：仅支持 MP4 格式视频文件！已拦截上传。");
                    videoInput.value = "";
                    return;
                }
                alert(`上传成功！视频 [${file.name}] 已解析完毕，系统自动提取视频首帧封面进行云端配准。`);
            }
        };
    }
}

function renderDoctorCardMiniApp() {
    const preview = document.getElementById("doctor-card-miniapp-body");
    if (!preview) return;
    
    const articlesHtml = state.publishedArticles.filter(x => x.status === "published").map(a => `
        <div style="padding:6px; border-bottom:1px solid rgba(0,102,255,0.05); font-size:11px; display:flex; justify-content:space-between; align-items:center;">
            <span>📖 ${a.title.slice(0,18)}...</span>
            <span style="font-size:9px; color:var(--semi-color-text-2);">🔥 ${a.reads}</span>
        </div>
    `).join("");
    
    preview.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; gap:8px; align-items:center; background:rgba(0,102,255,0.03); padding:8px; border-radius:6px;">
                <div style="width:36px; height:36px; background:#0066ff; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">张</div>
                <div>
                    <h5 style="margin:0; font-size:12px;">张仲景 主任医师</h5>
                    <p style="margin:2px 0 0 0; font-size:9.5px; color:var(--semi-color-text-2);">中医内科 | 执业30年</p>
                </div>
            </div>
            <div style="font-size:10px; color:var(--semi-color-text-1); line-height:1.4;">
                <strong>主治专长：</strong>体质调理、脾胃调理、经方调理
            </div>
            <div style="border-top:1.5px solid var(--semi-color-border); padding-top:6px;">
                <h6 style="margin:0 0 4px 0; font-size:10.5px; font-weight:700; color:var(--semi-color-primary);">📚 医生科普发布专栏</h6>
                ${articlesHtml || '<div style="color:var(--semi-color-text-2); font-size:9px; text-align:center; padding:10px;">暂无公开科普内容</div>'}
            </div>
        </div>
    `;
}

window.deletePublishedArticle = function(id) {
    state.publishedArticles = state.publishedArticles.filter(a => a.id !== id);
    renderDoctorArticlesModule();
};

function publishArticleSubmit() {
    const titleInput = document.getElementById("doc-article-title");
    const contentInput = document.getElementById("doc-article-content");
    
    if (!titleInput || !contentInput) return;
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) {
        alert("请输入标题和正文！");
        return;
    }
    
    const newArt = {
        id: `art_${Date.now()}`,
        title: title,
        status: "published",
        reads: 0,
        type: "text"
    };
    state.publishedArticles.push(newArt);
    
    titleInput.value = "";
    contentInput.value = "";
    
    alert(`科普内容 [${title}] 发布成功！即时同步发布在居民端电子名片。`);
    renderDoctorArticlesModule();
}

function saveArticleDraft() {
    const titleInput = document.getElementById("doc-article-title");
    const contentInput = document.getElementById("doc-article-content");
    
    if (!titleInput || !contentInput) return;
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) {
        alert("请输入标题和正文以存为草稿！");
        return;
    }
    
    const newArt = {
        id: `art_${Date.now()}`,
        title: title,
        status: "draft",
        reads: 0,
        type: "text"
    };
    state.publishedArticles.push(newArt);
    
    titleInput.value = "";
    contentInput.value = "";
    
    alert(`科普草稿 [${title}] 暂存成功。`);
    renderDoctorArticlesModule();
}
