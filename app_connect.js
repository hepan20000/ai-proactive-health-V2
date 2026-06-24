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
    }
};

// ==================== 1. 初始化与模块路由 ====================

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initSidebar();
    initModalHandlers();
    
    // 默认加载大屏数据
    loadModuleData("m07-dashboard");
});

function initClock() {
    // 顶部工具栏时钟（日间模式）
    const clockEl = document.getElementById("system-clock");
    // 大屏专属顶栏时钟与日期
    const dsClock = document.getElementById("ds-realtime-clock");
    const dsDate  = document.getElementById("ds-realtime-date");

    function tick() {
        const now = new Date();
        const year  = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date  = String(now.getDate()).padStart(2, '0');
        const hrs   = String(now.getHours()).padStart(2, '0');
        const mins  = String(now.getMinutes()).padStart(2, '0');
        const secs  = String(now.getSeconds()).padStart(2, '0');
        const day   = ['日','一','二','三','四','五','六'][now.getDay()];

        if (clockEl)  clockEl.textContent = `${year}-${month}-${date} ${hrs}:${mins}:${secs}`;
        if (dsClock)  dsClock.textContent  = `${hrs}:${mins}:${secs}`;
        if (dsDate)   dsDate.textContent   = `${year} / ${month} / ${date}  周${day}`;
    }

    tick(); // 立即执行一次，避免首秒空白
    setInterval(tick, 1000);
}

function initSidebar() {
    const navItems = document.querySelectorAll(".nav-item");
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
    const navText = document.querySelector(`.nav-item[data-target="${targetId}"] .nav-text`);
    if (bcTitle && navText) {
        bcTitle.textContent = navText.textContent;
    }
    
    state.currentModule = targetId;
    
    // 🌓 业务监管大屏全深色模式切换
    if (targetId === "m07-dashboard") {
        document.body.classList.add("semi-always-dark");
    } else {
        document.body.classList.remove("semi-always-dark");
    }
    
    // 清理图表与 Canvas 渲染循环，防内存溢出
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
        }
    } catch (err) {
        console.error("加载模块数据错误:", err);
    }
}

// API 拉取
async function fetchDashboardData() {
    const data = await request("/dashboard");

    // KPI 数字
    const kpiResidents = document.getElementById("kpi-residents");
    const kpiDevices   = document.getElementById("kpi-devices");
    const kpiWarnings  = document.getElementById("kpi-warnings");
    const kpiRevenue   = document.getElementById("kpi-revenue");
    if (kpiResidents) kpiResidents.textContent = data.kpis.residents_total;
    if (kpiDevices)   kpiDevices.textContent   = data.device_status.online;
    if (kpiWarnings)  kpiWarnings.textContent  = data.kpis.active_warnings;
    if (kpiRevenue)   kpiRevenue.textContent   = Math.floor(data.kpis.revenue_total).toLocaleString();

    // 图表渲染
    renderWarningsTrendChart(data.chart_7days);
    renderWarningsRatioChart(data.warnings_ratio);
    renderDashboardDoctors(data.doctors_performance);

    // 设备统计
    const onlineNum   = data.device_status.online   || 0;
    const offlineNum  = data.device_status.offline  || 0;
    const lowPowerNum = data.device_status.low_power || 0;
    const totalDevs   = onlineNum + offlineNum;

    const devOnlineEl   = document.getElementById("dev-online-num");
    const devOfflineEl  = document.getElementById("dev-offline-num");
    const devLowPowerEl = document.getElementById("dev-lowpower-num");
    if (devOnlineEl)   devOnlineEl.textContent   = onlineNum;
    if (devOfflineEl)  devOfflineEl.textContent  = offlineNum;
    if (devLowPowerEl) devLowPowerEl.textContent = lowPowerNum;

    // 设备在线率进度条
    const rateText = document.getElementById("dev-online-rate-text");
    const rateFill = document.getElementById("dev-online-bar-fill");
    if (totalDevs > 0) {
        const pct = Math.round((onlineNum / totalDevs) * 100);
        if (rateText) rateText.textContent = `${pct}%`;
        // 延迟渲染触发 CSS transition 动画
        if (rateFill) setTimeout(() => { rateFill.style.width = `${pct}%`; }, 200);
    } else {
        if (rateText) rateText.textContent = '--';
    }
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
    // 监听关闭模态框，增加 Canvas 循环安全终止
    document.querySelectorAll(".modal-close, [data-close]").forEach(btn => {
        btn.addEventListener("click", () => {
            const modalId = btn.getAttribute("data-close") || btn.closest(".modal").id;
            closeModal(modalId);
            
            // 如果关闭居民画像，安全终止 Canvas 动画帧
            if (modalId === "resident-portrait-modal") {
                stopRelationshipAnimation();
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

// 大屏趋势图
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
                    borderColor: '#F93920',
                    backgroundColor: 'rgba(249, 57, 32, 0.04)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true
                },
                {
                    label: '睡眠暂停预警',
                    data: data.sleep,
                    borderColor: '#00B365',
                    backgroundColor: 'rgba(0, 179, 101, 0.04)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true
                },
                {
                    label: '压力负荷偏高',
                    data: data.pressure,
                    borderColor: '#FC8800',
                    backgroundColor: 'rgba(252, 136, 0, 0.04)',
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
                legend: { labels: { color: '#94A3B8', font: { size: 11, family: 'Inter, sans-serif' } } }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { color: '#64748B', font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { color: '#64748B', font: { size: 10 } } }
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
                backgroundColor: ['#F93920', '#00B365', '#FC8800'],
                borderWidth: 0,
                hoverOffset: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94A3B8', font: { size: 10 } } }
            }
        }
    });
}

// 居民详情 30 天体征图 (Pro Max 高光渐变填充)
function renderResidentTrendChart(trends) {
    const el = document.getElementById("residentTrendChart");
    if (!el) return;
    
    destroyChart("residentTrend");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    // 创建心率渐变填充区
    const hrGradient = ctx.createLinearGradient(0, 0, 0, 150);
    hrGradient.addColorStop(0, 'rgba(0, 100, 250, 0.15)');
    hrGradient.addColorStop(1, 'rgba(0, 100, 250, 0)');
    
    // 创建血氧渐变填充区
    const oxGradient = ctx.createLinearGradient(0, 0, 0, 150);
    oxGradient.addColorStop(0, 'rgba(249, 57, 32, 0.15)');
    oxGradient.addColorStop(1, 'rgba(249, 57, 32, 0)');
    
    state.charts.residentTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trends.labels,
            datasets: [
                {
                    label: '实时心率波动(bpm)',
                    data: trends.heart_rate,
                    borderColor: '#0064FA',
                    backgroundColor: hrGradient,
                    fill: true,
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: '血氧饱和度(%)',
                    data: trends.blood_oxygen,
                    borderColor: '#F93920',
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
                legend: { labels: { color: '#4F5660', font: { size: 10 } } }
            },
            scales: {
                x: { grid: { color: '#E6E8EB' }, ticks: { color: '#808893', font: { size: 9 } } },
                y: { position: 'left', grid: { color: '#E6E8EB' }, ticks: { color: '#808893', font: { size: 9 } } },
                y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#808893', font: { size: 9 } } }
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
