/* ==========================================================================
   主动健康管理机构端 - 纯 JS 前端逻辑与数据联动中心 (UI/UX Pro Max 级重构)
   ========================================================================== */

const API_BASE = "/api";

// ==================== 离线高保真 Mock 数据库 (GitHub Pages Fallback) ====================
const OFFLINE_DB = {
    doctors: [
        {
            "id": "doc_001",
            "name": "张仲景",
            "department": "中医内科",
            "title": "主任医师",
            "tags": ["体质调理", "脾胃调理", "经方调理"],
            "status": "approved",
            "residents_count": 42,
            "last_intervention": "2026-06-24 10:30:00",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=doc1",
            "bio": "深耕伤寒杂病论与经方调理三十余年，擅长脾胃虚弱、亚健康慢病管理。",
            "phone": "13800000001",
            "wechat": "zzj_healer",
            "privacy": {"phone": "resident", "wechat": "admin"},
            "weight": 95,
            "recommend_intro": "国医名师，深谙脾胃调理之法",
            "gender": "男",
            "age": 65,
            "source": "register",
            "is_recommended": true
        },
        {
            "id": "doc_002",
            "name": "孙思邈",
            "department": "针灸推拿科",
            "title": "副主任医师",
            "tags": ["慢病管理", "经络养生"],
            "status": "approved",
            "residents_count": 28,
            "last_intervention": "2026-06-24 11:15:00",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=doc2",
            "bio": "千金要方编撰者，致力于针灸与食疗养生相结合的现代慢病主动干预模式。",
            "phone": "13800000002",
            "wechat": "ssm_qianjin",
            "privacy": {"phone": "admin", "wechat": "self"},
            "weight": 88,
            "recommend_intro": "药王传人，擅长针灸与食疗结合",
            "gender": "男",
            "age": 70,
            "source": "admin",
            "is_recommended": true
        },
        {
            "id": "doc_003",
            "name": "华佗",
            "department": "康复医学科",
            "title": "主任医师",
            "tags": ["康复调理", "失眠多梦"],
            "status": "pending",
            "residents_count": 0,
            "last_intervention": "",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=doc3",
            "bio": "五禽戏创编者，精通运动康复、外科微创与术后体质重建。",
            "phone": "13800000003",
            "wechat": "ht_fivebirds",
            "privacy": {"phone": "resident", "wechat": "resident"},
            "weight": 10,
            "recommend_intro": "康复外科泰斗，五禽戏创编人",
            "gender": "男",
            "age": 55,
            "source": "register",
            "is_recommended": false
        },
        {
            "id": "doc_004",
            "name": "扁鹊",
            "department": "治未病科",
            "title": "主任医师",
            "tags": ["亚健康调理", "慢病管理"],
            "status": "pending",
            "residents_count": 0,
            "last_intervention": "",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=doc4",
            "bio": "擅长四诊合参、望闻问切，专注亚健康主动筛查与干优。",
            "phone": "13800000004",
            "wechat": "bq_lookpulse",
            "privacy": {"phone": "self", "wechat": "self"},
            "weight": 5,
            "recommend_intro": "神医扁鹊，深谙治未病之理",
            "gender": "男",
            "age": 50,
            "source": "admin",
            "is_recommended": false
        },
        {
            "id": "doc_005",
            "name": "李时珍",
            "department": "中医内科",
            "title": "主任医师",
            "tags": ["中药调理", "本草辨识"],
            "status": "disabled",
            "residents_count": 12,
            "last_intervention": "2026-06-23 10:00:00",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=doc5",
            "bio": "本草纲目撰写者，擅长中药配伍及本草调理。",
            "phone": "13800000005",
            "wechat": "lsz_bencao",
            "privacy": {"phone": "admin", "wechat": "admin"},
            "weight": 20,
            "recommend_intro": "本草纲目撰写者，精通本草调治",
            "gender": "男",
            "age": 48,
            "source": "admin",
            "is_recommended": false
        },
        {
            "id": "doc_006",
            "name": "董奉",
            "department": "治未病科",
            "title": "副主任医师",
            "tags": ["杏林调理", "日常保健"],
            "status": "rejected",
            "residents_count": 0,
            "last_intervention": "",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=doc6",
            "bio": "杏林春暖典故发起者，重德尚医，擅长日常养生保健调理。",
            "phone": "13800000006",
            "wechat": "df_xinglin",
            "privacy": {"phone": "resident", "wechat": "self"},
            "weight": 5,
            "recommend_intro": "杏林春暖典故发起者，德艺双馨",
            "gender": "男",
            "age": 42,
            "source": "register",
            "is_recommended": false
        }
    ],
    residents: [
        {
            "id": "res_001",
            "name": "苏东坡",
            "age": 45,
            "gender": "男",
            "phone": "186****1089",
            "health_level": "red",
            "doctor_id": "doc_001",
            "doctor_name": "张仲景",
            "service_days": 180,
            "last_contact": "2026-06-24 09:00:00",
            "heart_rate": 98,
            "blood_oxygen": 94,
            "blood_pressure": "145/95",
            "steps": 2800,
            "sleep_score": 58,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=res1",
            "reports": ["情绪压力报告_0623.pdf", "睡眠脑血管分析_0620.pdf"],
            "device_imei": "IMEI_889271822830",
            "device_power": 18,
            "device_online": true
        },
        {
            "id": "res_002",
            "name": "李清照",
            "age": 38,
            "gender": "女",
            "phone": "186****5678",
            "health_level": "yellow",
            "doctor_id": "doc_001",
            "doctor_name": "张仲景",
            "service_days": 90,
            "last_contact": "2026-06-23 16:30:00",
            "heart_rate": 72,
            "blood_oxygen": 98,
            "blood_pressure": "120/80",
            "steps": 8500,
            "sleep_score": 75,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=res2",
            "reports": ["睡眠分析报告_0622.pdf"],
            "device_imei": "IMEI_889271822831",
            "device_power": 65,
            "device_online": true
        },
        {
            "id": "res_003",
            "name": "陆游",
            "age": 72,
            "gender": "男",
            "phone": "139****1122",
            "health_level": "red",
            "doctor_id": "doc_002",
            "doctor_name": "孙思邈",
            "service_days": 365,
            "last_contact": "2026-06-24 08:10:00",
            "heart_rate": 105,
            "blood_oxygen": 92,
            "blood_pressure": "160/100",
            "steps": 1200,
            "sleep_score": 45,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=res3",
            "reports": ["脑血管硬化风险报告_0621.pdf", "睡眠监测分析_0618.pdf"],
            "device_imei": "IMEI_889271822832",
            "device_power": 90,
            "device_online": false
        },
        {
            "id": "res_004",
            "name": "辛弃疾",
            "age": 52,
            "gender": "男",
            "phone": "135****4433",
            "health_level": "green",
            "doctor_id": "doc_002",
            "doctor_name": "孙思邈",
            "service_days": 120,
            "last_contact": "2026-06-22 14:00:00",
            "heart_rate": 68,
            "blood_oxygen": 99,
            "blood_pressure": "118/75",
            "steps": 11000,
            "sleep_score": 88,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=res4",
            "reports": ["情绪评估分析_0615.pdf"],
            "device_imei": "IMEI_889271822833",
            "device_power": 95,
            "device_online": true
        }
    ],
    schemes: [
        {
            "id": "sch_001",
            "name": "酸枣仁百合舒眠调理方案（基础版）",
            "report_type": "sleep",
            "nodes": [
                {"id": "node_1", "type": "text", "content": "建议每晚22点前洗热水澡，并在睡前饮用酸枣仁百合茶150ml，有助于缓和植物神经。"},
                {"id": "node_2", "type": "image", "content": "mock_assets/product_tea.png"},
                {"id": "node_3", "type": "link", "content": "https://m.e-health-agency.com/sleep-guide", "title": "科学健康睡眠方法论视频引导"}
            ],
            "products": ["prod_001", "pkg_001"],
            "status": "published",
            "updated_at": "2026-06-24 12:00:00"
        },
        {
            "id": "sch_002",
            "name": "脑血管硬化高危饮食干预方案",
            "report_type": "cardio",
            "nodes": [
                {"id": "node_1", "type": "text", "content": "限制每日食盐摄入在5g以下，严格禁酒。多食用木耳、洋葱及全谷物食品。"},
                {"id": "node_2", "type": "link", "content": "https://m.e-health-agency.com/blood-pressure-guide", "title": "高血压与脑血管硬化防控宣教"}
            ],
            "products": ["prod_002"],
            "status": "published",
            "updated_at": "2026-06-23 15:40:00"
        },
        {
            "id": "sch_003",
            "name": "情绪焦虑及高压自主调息方案",
            "report_type": "pressure",
            "nodes": [
                {"id": "node_1", "type": "text", "content": "推荐每日午后练习腹式呼吸15分钟，吸气4秒，呼气6秒，可有效降低皮质醇浓度。"},
                {"id": "node_2", "type": "text", "content": "可配合薰衣草浴包泡脚，静心放松。"}
            ],
            "products": ["prod_003"],
            "status": "draft",
            "updated_at": "2026-06-24 14:10:00"
        }
    ],
    servicePackages: [
        {
            "id": "pkg_001",
            "name": "失眠多梦专科深度调理服务包",
            "period": "包季",
            "price": 1299.00,
            "products_count": 3,
            "status": "published",
            "desc": "包含名医IM一对一无限沟通、智能硬件实时数据看护、两盒安神酸枣仁茶及浴包赠送。",
            "sales": 156,
            "revenue": 202644.00,
            "conv_rate": 18.5
        },
        {
            "id": "pkg_002",
            "name": "脑血管高危主动干预金牌服务包",
            "period": "包年",
            "price": 4999.00,
            "products_count": 2,
            "status": "published",
            "desc": "针对心脑血管亚健康高危人群，提供专属三甲医生健康画像订制干预，配带智能手表监测心率血压，出现异常立刻响应。",
            "sales": 48,
            "revenue": 239952.00,
            "conv_rate": 12.2
        },
        {
            "id": "pkg_003",
            "name": "职场解压与心率平衡调理套餐",
            "period": "包月",
            "price": 499.00,
            "products_count": 1,
            "status": "draft",
            "desc": "专为白领研发的抗压心理情绪调解包，含睡眠情绪报告分析及中药理疗茶饮。",
            "sales": 0,
            "revenue": 0.00,
            "conv_rate": 0.0
        }
    ],
    products: [
        {
            "id": "prod_001",
            "name": "野生酸枣仁茯苓百合安神茶 (20袋/盒)",
            "category": "茶类",
            "price": 68.00,
            "stock": 140,
            "status": "published",
            "desc": "优选太行山酸枣仁，茯苓，百合，科学配比，开水冲泡5分钟，助眠安神。",
            "image": "mock_assets/product_tea.png",
            "log": [{"time": "2026-06-24 09:30:00", "change": "+50", "operator": "管理员"}]
        },
        {
            "id": "prod_002",
            "name": "低钠深海木耳片天然食疗款 (250g/袋)",
            "category": "膳类",
            "price": 38.00,
            "stock": 15,
            "status": "published",
            "desc": "极低钠盐，含有丰富的多糖，适合脑血管病理人群和高血压膳食干预。",
            "image": "mock_assets/product_tea.png",
            "log": [{"time": "2026-06-23 11:20:00", "change": "-30", "operator": "管理员"}]
        },
        {
            "id": "prod_003",
            "name": "安神解压艾草浴足包 (10包/盒)",
            "category": "浴类",
            "price": 45.00,
            "stock": 350,
            "status": "published",
            "desc": "精选陈艾，融入远志、百合，泡脚20分钟微出汗，解压助眠效果极佳。",
            "image": "mock_assets/product_tea.png",
            "log": []
        }
    ],
    banners: [
        {
            "id": "ban_001",
            "title": "主动健康新纪元，智能看护每一天",
            "image": "mock_assets/banner_health.png",
            "url": "https://m.e-health-agency.com/active-health-intro",
            "status": "on",
            "sort": 1,
            "start_time": "2026-06-01",
            "end_time": "2026-12-31"
        },
        {
            "id": "ban_002",
            "title": "失眠多梦难入睡？听听中医怎么说",
            "image": "mock_assets/banner_health.png",
            "url": "https://m.e-health-agency.com/sleep-tea-intro",
            "status": "on",
            "sort": 2,
            "start_time": "2026-06-15",
            "end_time": "2026-09-15"
        }
    ],
    auditLogs: [
        {"time": "2026-06-24 14:30:00", "user": "Admin(李明)", "action": "导出居民档案健康报表", "ip": "192.168.1.45"},
        {"time": "2026-06-24 14:10:00", "user": "Admin(李明)", "action": "修改方案模版 [情绪焦虑及高压自主调息方案] 保存草稿", "ip": "192.168.1.45"},
        {"time": "2026-06-24 12:00:00", "user": "Admin(李明)", "action": "发布新方案模版 [酸枣仁百合舒眠调理方案（基础版）]", "ip": "192.168.1.45"},
        {"time": "2026-06-24 10:00:00", "user": "Admin(李明)", "action": "设置医生 [张仲景] 推荐名医权重为 95", "ip": "192.168.1.45"},
        {"time": "2026-06-24 09:30:00", "user": "Admin(李明)", "action": "录入药食同源商品 [野生酸枣仁茯苓百合安神茶] 库存 +50", "ip": "192.168.1.45"}
    ],
    agency: {
        "name": "益康智慧主动健康管理中心",
        "logo": "mock_assets/agency_logo.png",
        "phone": "400-888-9999",
        "area": "广东省深圳市南山区高新园",
        "desc": "致力于将智能穿戴大数据与现代中医主动干预完美融合的健康服务机构。"
    },
    commissions: [
        {"id": "ag_001", "name": "益康智慧主动健康管理中心", "subscription_fee": 9800.00, "product_commission": 15.0, "service_commission": 20.0},
        {"id": "ag_002", "name": "杏林春暖慢病调理诊所", "subscription_fee": 8500.00, "product_commission": 12.0, "service_commission": 18.0},
        {"id": "ag_003", "name": "智慧社区治未病服务驿站", "subscription_fee": 5000.00, "product_commission": 10.0, "service_commission": 15.0}
    ]
};

// 离线 Fallback 处理器
function handleOfflineRequest(url, method, body) {
    // 兼容可能存在的不同主机名与相对路径解析
    let path = url;
    let search = "";
    if (url.includes("?")) {
        const parts = url.split("?");
        path = parts[0];
        search = parts[1];
    }
    const params = new URLSearchParams(search);

    if (path.includes("/dashboard")) {
        const total_residents = OFFLINE_DB.residents.length;
        const online_devices = OFFLINE_DB.residents.filter(r => r.device_online).length;
        const low_power_devices = OFFLINE_DB.residents.filter(r => r.device_power < 20).length;
        const active_warnings = OFFLINE_DB.residents.filter(r => r.health_level === "red").length;
        
        const doc_perf = OFFLINE_DB.doctors.filter(d => d.status === "approved").map(d => ({
            name: d.name,
            title: d.title,
            interventions: d.residents_count * 3 + 12,
            schemes_sent: d.residents_count * 2 + 5,
            avg_response: d.name === "张仲景" ? "8.5分钟" : "12.2分钟",
            rating: d.name === "张仲景" ? 4.9 : 4.7
        })).sort((a, b) => b.interventions - a.interventions);

        return {
            kpis: {
                residents_total: total_residents,
                residents_growth: "+12.5%",
                online_devices: online_devices,
                active_warnings: active_warnings,
                sales_total: OFFLINE_DB.servicePackages.reduce((acc, curr) => acc + curr.sales, 0),
                revenue_total: OFFLINE_DB.servicePackages.reduce((acc, curr) => acc + curr.revenue, 0)
            },
            warnings_ratio: {
                sleep: 35,
                cardio: 45,
                pressure: 20
            },
            chart_7days: {
                labels: ["6-18", "6-19", "6-20", "6-21", "6-22", "6-23", "6-24"],
                sleep: [12, 19, 15, 8, 22, 10, 14],
                cardio: [8, 12, 18, 24, 15, 20, 25],
                pressure: [15, 10, 14, 18, 9, 12, 8]
            },
            doctors_performance: doc_perf,
            device_status: {
                online: online_devices,
                offline: total_residents - online_devices,
                low_power: low_power_devices
            }
        };
    }


    if (path.includes("/residents/portrait")) {
        const id = params.get("id");
        const resident = OFFLINE_DB.residents.find(r => r.id === id) || OFFLINE_DB.residents[0];
        const trends = {
            labels: ["6-18", "6-19", "6-20", "6-21", "6-22", "6-23", "6-24"],
            heart_rate: [75, 78, 82, 90, 85, 88, resident.heart_rate],
            blood_oxygen: [97, 98, 97, 96, 98, 99, resident.blood_oxygen]
        };
        return { resident, trends };
    }

    if (path.includes("/residents")) return OFFLINE_DB.residents;
    
    if (path.includes("/doctors/approve")) {
        const doc = OFFLINE_DB.doctors.find(d => d.id === body.id);
        if (doc) doc.status = body.action;
        return { success: true };
    }
    if (path.includes("/doctors")) return OFFLINE_DB.doctors;
    
    if (path.includes("/schemes/save")) {
        if (body.id) {
            const idx = OFFLINE_DB.schemes.findIndex(s => s.id === body.id);
            if (idx !== -1) OFFLINE_DB.schemes[idx] = body;
        } else {
            body.id = "sch_" + Math.random().toString(36).substr(2, 9);
            OFFLINE_DB.schemes.push(body);
        }
        return { success: true };
    }
    if (path.includes("/schemes")) return OFFLINE_DB.schemes;
    if (path.includes("/service-packages")) return OFFLINE_DB.servicePackages;
    if (path.includes("/products")) return OFFLINE_DB.products;
    if (path.includes("/cms/banners")) return OFFLINE_DB.banners;
    if (path.includes("/system/logs")) return OFFLINE_DB.auditLogs;
    if (path.includes("/settings/save")) {
        OFFLINE_DB.agency = body.agency;
        return { success: true };
    }
    if (path.includes("/settings")) {
        return {
            agency: OFFLINE_DB.agency,
            commissions: OFFLINE_DB.commissions
        };
    }

    return { success: true };
}

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
    approvalFilterStatus: "pending", // 默认为待审批选项卡
    
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
    try {
        const res = await fetch(`${API_BASE}${url}`, opts);
        if (!res.ok) {
            throw new Error(`HTTP_${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.warn(`[主动健康] 网络 API 请求失败(${url})，无缝切换至纯前端离线 Mock 演示模式`, err);
        return handleOfflineRequest(url, method, body);
    }
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
    
    // 拉取最新的居民列表以供渲染实时预警流
    await fetchResidentsList();
    
    // 防御性空值检查：确保大屏 KPI 元素存在再写入
    const elResidents = document.getElementById("kpi-residents");
    if (elResidents) elResidents.textContent = data.kpis.residents_total.toLocaleString();
    
    const elDevices = document.getElementById("kpi-devices");
    if (elDevices) elDevices.textContent = data.device_status.online.toLocaleString();
    
    const elWarnings = document.getElementById("kpi-warnings");
    if (elWarnings) elWarnings.textContent = data.kpis.active_warnings;
    
    const elRevenue = document.getElementById("kpi-revenue");
    if (elRevenue) elRevenue.textContent = Math.floor(data.kpis.revenue_total).toLocaleString();
    
    renderWarningsTrendChart(data.chart_7days);
    renderWarningsRatioChart(data.warnings_ratio);
    
    // 渲染医生绩效榜和实时警报流
    renderScreenDoctorsPerformance(data.doctors_performance);
    renderScreenWarningStream();
    renderScreenNewResidentsChart();
    
    const elDevOnline = document.getElementById("dev-online-num");
    if (elDevOnline) elDevOnline.textContent = data.device_status.online;
    
    const elDevOffline = document.getElementById("dev-offline-num");
    if (elDevOffline) elDevOffline.textContent = data.device_status.offline;
    
    const elDevLowpower = document.getElementById("dev-lowpower-num");
    if (elDevLowpower) elDevLowpower.textContent = data.device_status.low_power;
}

// 渲染大屏专属系统时钟，格式：2026年06月30日星期二 10:57:57
function initClock() {
    const clockEl = document.getElementById("system-clock");
    const screenClockEl = document.getElementById("screen-system-clock");
    
    const updateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        
        if (clockEl) {
            clockEl.textContent = `${year}-${month}-${date} ${hrs}:${mins}:${secs}`;
        }
        
        if (screenClockEl) {
            const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            const dayStr = dayNames[now.getDay()];
            screenClockEl.textContent = `${year}年${month}月${date}日${dayStr} ${hrs}:${mins}:${secs}`;
        }
    };
    
    updateTime();
    setInterval(updateTime, 1000);
}

function renderScreenDoctorsPerformance(docs) {
    const box = document.getElementById("screen-doctor-efficiency-list");
    if (!box) return;
    
    // 拷贝并按干预人次降序排序，取前 6
    const sorted = [...docs].sort((a, b) => b.residents_count - a.residents_count);
    const top6 = sorted.slice(0, 6);
    
    box.innerHTML = top6.map((d, i) => {
        const maxVal = top6[0].residents_count || 1;
        const pct = Math.min(100, Math.floor((d.residents_count / maxVal) * 100));
        return `
            <div class="doc-efficiency-card">
                <div class="doc-efficiency-top">
                    <span style="font-weight:700;">
                        <span class="rank" style="color:var(--screen-accent); margin-right:4px;">${i+1}</span>
                        ${d.name}
                        <span style="font-size:10px; color:var(--screen-muted); font-weight:normal; margin-left:6px;">${d.department}</span>
                    </span>
                    <span style="font-weight:700; color:var(--screen-foreground); font-family:var(--semi-font-mono);">${d.residents_count}</span>
                </div>
                <div class="progress-bar-bg" style="height:6px; margin: 4px 0;"><div class="progress-bar-fill" style="width:${pct}%; background:var(--screen-accent);"></div></div>
                <div class="doc-efficiency-details">
                    <span>方案 ${d.schemes_count}</span>
                    <span>响应 ${d.response_speed} 分</span>
                    <span>满意度 ${d.satisfaction_rate}</span>
                </div>
            </div>
        `;
    }).join("");
}

function renderScreenWarningStream() {
    const box = document.getElementById("screen-warning-stream-list");
    if (!box) return;
    
    // 从全局居民里筛选出 red / yellow 风险状态的居民，作为预警流
    const warns = state.residents.filter(r => r.health_level === "red" || r.health_level === "yellow");
    if (warns.length === 0) {
        box.innerHTML = `<div style="text-align:center; padding:30px; color:var(--screen-muted); font-size:11.5px;">🎉 暂无高危或中危异常体警情记录</div>`;
        return;
    }
    
    box.innerHTML = warns.map((r, i) => {
        const tag = r.health_level === "red" 
            ? '<span class="warning-stream-tag bg-red-light">高危</span>' 
            : '<span class="warning-stream-tag bg-yellow-light">中危</span>';
        
        // 伪造生成对应参考图的时间及异常说明细节
        const mockTime = `10:${42 - i * 3}:${String(18 + i * 2).padStart(2, '0')}`;
        let detail = "";
        if (r.health_level === "red") {
            detail = `触发收缩压 ${r.blood_pressure || '186 mmHg'} 高频或心率 ${r.heart_rate}bpm 红色警报`;
        } else {
            detail = `触发低电量警报或心跳异常波动（${r.heart_rate}bpm）`;
        }
        
        const docList = ["陈雪松", "罗思琪", "周婷", "李翰林", "孙磊"];
        const docName = docList[i % docList.length];
        
        return `
            <div class="warning-stream-card">
                <div class="warning-stream-card-top">
                    ${tag}
                    <span style="font-family:var(--semi-font-mono); font-size:10.5px; color:var(--screen-muted);">${mockTime}</span>
                </div>
                <div style="font-size:12px; color:var(--screen-foreground); margin:4px 0; line-height:1.45;">
                    <strong style="color:var(--screen-foreground); font-weight:700;">${r.name}</strong> · ${r.age}岁 | ${detail}
                </div>
                <div style="font-size:11px; color:var(--screen-accent); text-align:right; font-weight:600;">
                    ➜ 指派给 ${docName}
                </div>
            </div>
        `;
    }).join("");
}

function renderScreenNewResidentsChart() {
    const el = document.getElementById("screenNewResidentsChart");
    if (!el) return;
    
    destroyChart("screenNewResidents");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 45);
    gradient.addColorStop(0, 'rgba(73, 162, 249, 0.15)');
    gradient.addColorStop(1, 'rgba(73, 162, 249, 0)');
    
    state.charts.screenNewResidents = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['22日', '23日', '24日', '25日', '26日', '27日', '28日'],
            datasets: [{
                data: [180, 220, 260, 210, 280, 310, 342],
                borderColor: '#49a2f9',
                backgroundColor: gradient,
                fill: true,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0 // 消除图表节点圆点，与 DESIGN 规范一致
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
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
    const status = state.approvalFilterStatus || ""; // 从选项卡状态过滤
    const dept = document.getElementById("doc-dept-filter")?.value || "";
    
    let filtered = state.doctors.filter(d => {
        const matchesSearch = search 
            ? (d.name.toLowerCase().includes(search) || d.id.toLowerCase().includes(search) || d.hospital?.toLowerCase().includes(search)) 
            : true;
        const matchesStatus = status ? d.status === status : true;
        const matchesDept = dept ? d.department === dept : true;
        return matchesSearch && matchesStatus && matchesDept;
    });
    
    // 更新选项卡徽章中的待审批数
    const pendingCount = state.doctors.filter(d => d.status === "pending").length;
    const tabPendingBadge = document.querySelector(".app-tab[data-status='pending'] .badge");
    if (tabPendingBadge) tabPendingBadge.textContent = pendingCount;
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--semi-color-text-2);">没有检索到符合过滤条件的医生入驻申请</td></tr>`;
        return;
    }
    
    tbody.innerHTML = filtered.map(d => {
        const initial = d.name ? d.name[0] : "";
        
        // 医生姓名彩色首字头像，莫兰迪配色
        let bg = "oklch(0.55 0.13 195)";
        if (d.gender === "女") bg = "oklch(0.65 0.12 350)"; // 粉红
        else if (d.age > 50) bg = "oklch(0.45 0.08 140)";   // 稳重绿
        
        const avatarHtml = `<div class="doctor-avatar-circle" style="background:${bg};">${initial}</div>`;
        const sourceBadge = d.source === "register" 
            ? `<span class="badge" style="background:oklch(0.55 0.13 195 / 8%); color:var(--semi-color-primary); border:1px solid oklch(0.55 0.13 195 / 15%); font-size:10.5px;">自主注册</span>` 
            : `<span class="badge" style="background:oklch(0.6 0.2 290 / 8%); color:oklch(0.6 0.2 290); border:1px solid oklch(0.6 0.2 290 / 15%); font-size:10.5px;">后台添加</span>`;
        
        // 状态带点徽章
        let statusBadge = "";
        if (d.status === "pending") statusBadge = `<span class="status-badge-dot orange"><span class="dot"></span>待审批</span>`;
        else if (d.status === "approved") statusBadge = `<span class="status-badge-dot green"><span class="dot"></span>已激活</span>`;
        else if (d.status === "rejected") statusBadge = `<span class="status-badge-dot red"><span class="dot"></span>已驳回</span>`;
        else statusBadge = `<span class="status-badge-dot" style="color:var(--semi-color-text-2);"><span class="dot"></span>已禁用</span>`;
        
        const mockTime = d.submit_time || "2026-06-28 09:42";
        
        // 操作列按钮逻辑
        let actionButtons = "";
        if (d.status === "pending") {
            actionButtons = `
                <button class="btn btn-primary btn-sm" onclick="openApprovalModal('${d.id}')" style="font-size:12px; padding:3px 8px; font-weight:600;">审核资质</button>
                <button class="btn btn-secondary btn-sm" onclick="confirmApproveDoctor('${d.id}', 'rejected')" style="font-size:12px; padding:3px 8px; margin-left:4px; color:var(--semi-color-danger); border-color:var(--semi-color-danger);">驳回</button>
            `;
        } else if (d.status === "approved") {
            actionButtons = `
                <button class="btn btn-secondary btn-sm" onclick="openApprovalModal('${d.id}')" style="font-size:12px; padding:3px 8px; margin-right:4px;">查看资质</button>
                <button class="btn btn-secondary btn-sm" onclick="confirmApproveDoctor('${d.id}', 'disabled')" style="font-size:12px; padding:3px 8px; color:var(--semi-color-danger);">禁用</button>
            `;
        } else if (d.status === "disabled") {
            actionButtons = `
                <button class="btn btn-secondary btn-sm" onclick="openApprovalModal('${d.id}')" style="font-size:12px; padding:3px 8px; margin-right:4px;">查看资质</button>
                <button class="btn btn-primary btn-sm" onclick="confirmApproveDoctor('${d.id}', 'approved')" style="font-size:12px; padding:3px 8px;">启用</button>
            `;
        } else {
            actionButtons = `
                <button class="btn btn-secondary btn-sm" onclick="openApprovalModal('${d.id}')" style="font-size:12px; padding:3px 8px;">查看资质</button>
            `;
        }
        
        return `
            <tr class="approval-table-row">
                <td><input type="checkbox" onclick="event.stopPropagation()"></td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${avatarHtml}
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:700; color:var(--semi-color-text-0);">${d.name} <span style="font-size:11px; font-weight:normal; color:var(--semi-color-text-2);">${d.gender} · ${d.age}岁</span></span>
                            <span style="font-size:10.5px; color:var(--semi-color-text-2); margin-top:2px;">DR-${d.id.substring(0,8)} · ${d.hospital || '市第一人民医院'}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:600;">${d.department}</span>
                        <span style="font-size:11px; color:var(--semi-color-text-2);">${d.title}</span>
                    </div>
                </td>
                <td>${sourceBadge}</td>
                <td style="font-family:var(--semi-font-mono); color:var(--semi-color-text-2); font-size:11.5px;">${mockTime}</td>
                <td>${statusBadge}</td>
                <td style="text-align:right;">
                    <div style="display:inline-flex; gap:4px; justify-content:flex-end;">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// 唤出医生资质审批详情弹窗
function openApprovalModal(id) {
    const d = state.doctors.find(x => x.id === id);
    if (!d) return;
    
    state.selectedDoctorId = id;
    const body = document.getElementById("doc-approval-modal-body");
    if (!body) return;
    
    const initial = d.name ? d.name[0] : "";
    let avatarBg = "oklch(0.55 0.13 195)";
    if (d.gender === "女") avatarBg = "oklch(0.65 0.12 350)";
    
    const avatarHtml = `<div class="doctor-avatar-circle" style="width:44px; height:44px; font-size:16px; background:${avatarBg};">${initial}</div>`;
    
    // 状态标签
    let statusText = "";
    if (d.status === "pending") statusText = '<span style="color:var(--semi-color-warning); font-weight:700;">● 待审批</span>';
    else if (d.status === "approved") statusText = '<span style="color:var(--semi-color-success); font-weight:700;">● 已激活</span>';
    else if (d.status === "rejected") statusText = '<span style="color:var(--semi-color-danger); font-weight:700;">● 已驳回</span>';
    else statusText = '<span style="color:var(--semi-color-text-2); font-weight:700;">● 已禁用</span>';
    
    body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
            <!-- 头部医生名片 -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--semi-color-border); padding-bottom:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    ${avatarHtml}
                    <div>
                        <h4 style="margin:0; font-size:15px; font-weight:800; color:var(--semi-color-text-0);">${d.name}</h4>
                        <p style="margin:3px 0 0 0; font-size:11.5px; color:var(--semi-color-text-2);">DR-${d.id.substring(0,8)} · 执业医师审核</p>
                    </div>
                </div>
                <div>
                    <span class="badge" style="background:var(--semi-color-primary-light); color:var(--semi-color-primary);">${d.department}</span>
                    <span class="badge" style="background:var(--semi-color-bg-2); color:var(--semi-color-text-1); margin-left:4px;">${d.title}</span>
                </div>
            </div>
            
            <!-- 黄色资质警告横栏 -->
            <div class="warning-notice-bar" style="margin:0;">
                <h5>⚠️ 执业资质安全提示</h5>
                <span style="line-height:1.4;">职称等级证书与医师执业证书在国家卫健委系统核验通过。系统检测到职称证有效期将于 <strong>2026-12 前到期</strong>，通过后请提示医生上传最新延期证件。</span>
            </div>
            
            <!-- 详细信息与双证预览网格 -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                <!-- 左侧基本档案 -->
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div class="card-card" style="padding:14px; background:var(--semi-color-bg-1); border:1px solid var(--semi-color-border);">
                        <div class="info-grid">
                            <div>
                                <span class="info-grid-label">性别 / 年龄</span>
                                <span class="info-grid-val">${d.gender} · ${d.age}岁</span>
                            </div>
                            <div>
                                <span class="info-grid-label">执业年限</span>
                                <span class="info-grid-val">${d.age - 26} 年</span>
                            </div>
                            <div>
                                <span class="info-grid-label">联系电话</span>
                                <span class="info-grid-val" style="font-family:var(--semi-font-mono);">${d.phone || '139****1102'}</span>
                            </div>
                            <div>
                                <span class="info-grid-label">电子邮箱</span>
                                <span class="info-grid-val" style="font-family:var(--semi-font-mono); font-size:12px;">${d.name.toLowerCase()}@example.com</span>
                            </div>
                            <div>
                                <span class="info-grid-label">执业医院</span>
                                <span class="info-grid-val">${d.hospital || '华东睡眠医学科研所'}</span>
                            </div>
                            <div>
                                <span class="info-grid-label">职称等级</span>
                                <span class="info-grid-val">${d.title}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-card" style="padding:12px; border:1px solid var(--semi-color-border);">
                        <span class="info-grid-label" style="margin-bottom:4px;">📚 医生学术与特色擅长</span>
                        <p style="font-size:12px; color:var(--semi-color-text-1); line-height:1.6; margin:0;">
                            ${d.bio || '主任中医师，慢病与睡眠干预学科带头人。擅长亚健康食疗与药食同源膳食指导，提供针对失眠、高血压、情绪波动的系统调理方案。'}
                        </p>
                    </div>
                </div>
                
                <!-- 右侧双证预览图片 -->
                <div class="card-card" style="padding:14px; border:1px solid var(--semi-color-border); display:flex; flex-direction:column; gap:8px;">
                    <span class="info-grid-label">📂 资质证明原件核验</span>
                    <div style="display:flex; gap:10px; flex:1;">
                        <div style="flex:1; border:1px solid var(--semi-color-border); border-radius:4px; padding:6px; background:#fafafa; cursor:pointer;" onclick="alert('查看医师执业证书原图')">
                            <img src="mock_assets/doctor_certificate.png" style="width:100%; height:110px; object-fit:cover; border-radius:2px;" onerror="this.src='design-system/医生入驻审批 · 主动健康管理.png'; this.style.objectFit='contain';">
                            <div style="font-size:10.5px; text-align:center; color:var(--semi-color-text-2); margin-top:4px;">医师执业资格证.jpg</div>
                        </div>
                        <div style="flex:1; border:1px solid var(--semi-color-border); border-radius:4px; padding:6px; background:#fafafa; cursor:pointer;" onclick="alert('查看专业技术职称证原图')">
                            <img src="mock_assets/doctor_certificate.png" style="width:100%; height:110px; object-fit:cover; border-radius:2px;" onerror="this.src='design-system/医生入驻审批 · 主动健康管理.png'; this.style.objectFit='contain';">
                            <div style="font-size:10.5px; text-align:center; color:var(--semi-color-text-2); margin-top:4px;">专业技术职称等级证.jpg</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 底部确认操作栏 -->
            <div style="border-top:1px solid var(--semi-color-border); padding-top:14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:6px; font-size:12px;">
                    <input type="checkbox" id="chk-modal-delay" style="cursor:pointer;">
                    <label for="chk-modal-delay" style="cursor:pointer; font-weight:600; color:var(--semi-color-text-1);">通过后延迟 24h 激活生效</label>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:12.5px; color:var(--semi-color-text-2); margin-right:12px;">状态：${statusText}</span>
                    <button class="btn btn-secondary" onclick="confirmApproveDoctor('${d.id}', 'rejected')" style="border-color:var(--semi-color-danger); color:var(--semi-color-danger); font-size:12.5px; padding:6px 12px;">资质驳回</button>
                    <button class="btn btn-secondary" onclick="alert('退回补充通知已通过短信形式发送给该医生！'); closeModal('doc-approval-modal');" style="font-size:12.5px; padding:6px 12px;">退回补充</button>
                    <button class="btn btn-primary" onclick="confirmApproveDoctor('${d.id}', 'approved')" style="font-size:12.5px; padding:6px 16px; font-weight:600;">批准入驻</button>
                </div>
            </div>
        </div>
    `;
    
    openModal("doc-approval-modal");
}

// 选项卡过滤
window.filterApprovalStatus = function(status) {
    state.approvalFilterStatus = status;
    
    document.querySelectorAll(".approval-tabs .app-tab").forEach(tab => {
        if (tab.getAttribute("data-status") === status) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
    
    renderApprovalTable();
};

window.triggerApprovalSearch = function() {
    renderApprovalTable();
};

async function approveDoctor(id, action, reason = "") {
    try {
        await request("/doctors/approve", "POST", { id, action, reason });
        closeModal("doc-approval-modal"); // 审批完后自动关闭弹窗
        await fetchDoctorsList();
        renderApprovalTable();
        alert("审批操作执行成功，已即时更新医生档案及入驻状态！");
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
    
    // 强防崩：解构获取 trends 变量，彻底封杀 ReferenceError 导致后续模块无法渲染的致命 Bug
    const trends = portrait.trends || {};
    
    // 对姓名及手机号进行脱敏显示 (对齐大屏设计规范)
    const maskedName = r.name.length > 2 ? r.name[0] + "*" + r.name[r.name.length - 1] : r.name[0] + "*";
    const maskedPhone = r.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    
    // 动态计算 BMI
    const bmiVal = r.bmi || (r.weight ? (r.weight / Math.pow((r.height || 170)/100, 2)).toFixed(2) : "23.88");
    
    // 动态判定健康星级与状态词
    let healthLabel = "亚健康";
    if (r.health_level === "red") {
        healthLabel = "风险";
    } else if (r.health_level === "yellow") {
        healthLabel = "亚健康";
    } else {
        healthLabel = "健康";
    }

    // 动态注入饱满的中医体质信息 (增加中医体质信息)
    let tcmConstitution = r.tcm_body_constitution || "气虚质(兼阴虚)";
    let tcmFeature = "体质特征：易疲劳、气短懒言、易感冒、手脚偏凉。";
    let tcmAdvice = "宜平补脾肾，多食山药、山楂、大枣，忌吃生冷。";
    
    if (r.health_level === "red") {
        tcmConstitution = "阴虚质(兼气虚)";
        tcmFeature = "体质特征：口干咽燥、潮热盗汗、五心烦热、舌红少苔。";
        tcmAdvice = "宜滋阴清热，多食百合、银耳、沙参、麦冬，忌辛辣温燥。";
    } else if (r.health_level === "green" || r.health_level === "healthy") {
        tcmConstitution = "平和质";
        tcmFeature = "体质特征：体形匀称、面色红润、精力充沛、睡眠良好。";
        tcmAdvice = "宜合理膳食，规律运动，保持充足睡眠，阴阳调和。";
    }
    
    const container = document.getElementById("res-portrait-modal-body");
    if (!container) return;
    
    // 动态载入科技感字体 (Outfit, Noto Sans SC) 以便大屏样式极致对齐
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Outfit"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap";
        document.head.appendChild(link);
    }
    
    // 1. 组装一屏紧凑版 HTML 骨架 (使用纯色线条风格 SVG 图标，去除 Emoji)
    container.innerHTML = `
        <div class="health-portrait-screen">
            <div class="cyber-grid"></div>
            
            <div class="large-screen-container">
                <!-- Header 标题栏 -->
                <header class="top-header">
                    <div class="header-left">
                        <span class="back-btn" data-close="resident-portrait-modal">← 返回</span>
                        <span class="opacity-40">|</span>
                        <span>北京时间：</span>
                        <span class="font-mono" id="headerTime">加载中...</span>
                    </div>
                    <h1 class="main-title">居 民 健 康 画 像</h1>
                    <div class="header-right">
                        <button class="power-btn" data-close="resident-portrait-modal" style="font-size: 14px;">
                            ⏻
                        </button>
                    </div>
                </header>
                
                <!-- 大屏主网格 (双排六卡片紧凑布局) -->
                <div class="dashboard-grid-container">
                    
                    <!-- ==================== 第一排 ==================== -->
                    <div class="grid-row-top">
                        
                        <!-- 左栏 (用户核心资料及5大体征磁贴) -->
                        <div class="flex-col gap-10">
                            <!-- 用户基本信息 -->
                            <div class="screen-panel" style="padding: 10px 12px; height: auto;">
                                <div class="profile-header">
                                    <span class="profile-avatar-box">
                                        <span class="profile-avatar-circle">👤</span>
                                        <span class="font-medium" id="profile-name">${maskedName}</span>
                                    </span>
                                    <span class="text-xs" id="profile-phone" style="color: var(--screen-muted);">手机号 ${maskedPhone}</span>
                                </div>
                                <div class="profile-base-grid">
                                    <div class="profile-base-item">
                                        <div class="profile-base-lbl">性别</div>
                                        <div class="profile-base-val" id="profile-gender">${r.gender}</div>
                                    </div>
                                    <div class="profile-base-item">
                                        <div class="profile-base-lbl">身高</div>
                                        <div class="profile-base-val" id="profile-height">${r.height || 170}cm</div>
                                    </div>
                                    <div class="profile-base-item">
                                        <div class="profile-base-lbl">体重</div>
                                        <div class="profile-base-val" id="profile-weight">${r.weight || 69}kg</div>
                                    </div>
                                    <div class="profile-base-item">
                                        <div class="profile-base-lbl">BMI</div>
                                        <div class="profile-base-val text-neon-green" id="profile-bmi">${bmiVal}</div>
                                    </div>
                                </div>
                                <!-- 中医体质信息判定显示栏 -->
                                <div class="profile-tcm-constitution-box">
                                    <span style="color: var(--screen-muted);">中医体质</span>
                                    <span class="constitution-title" id="profile-tcm-constitution">${tcmConstitution}</span>
                                    <span class="constitution-tag">辨证评估</span>
                                </div>
                            </div>
                            
                            <!-- 5个核心指标小磁贴 (只留心率、血压、血氧、睡眠时长、今日步数) -->
                            <div class="vitals-grid">
                                <!-- 心率 -->
                                <div class="vital-tile">
                                    <div class="vital-tile-header">
                                        <span class="vital-tile-label tone-danger">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px; vertical-align:middle; margin-right:3px;">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                            <span>心率</span>
                                        </span>
                                        <span class="font-mono" id="ts-heart">13:52</span>
                                    </div>
                                    <div class="vital-tile-val-box">
                                        <span class="vital-tile-val tone-danger" id="val-heart">--</span>
                                        <span class="vital-tile-unit">次/分</span>
                                    </div>
                                </div>
                                <!-- 血压 -->
                                <div class="vital-tile">
                                    <div class="vital-tile-header">
                                        <span class="vital-tile-label tone-danger">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px; height:12px; vertical-align:middle; margin-right:3px;">
                                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                            </svg>
                                            <span>血压</span>
                                        </span>
                                        <span class="font-mono" id="ts-bp">13:52</span>
                                    </div>
                                    <div class="vital-tile-val-box">
                                        <span class="vital-tile-val tone-danger" id="val-bp">--</span>
                                        <span class="vital-tile-unit">mmHg</span>
                                    </div>
                                </div>
                                <!-- 血氧 -->
                                <div class="vital-tile">
                                    <div class="vital-tile-header">
                                        <span class="vital-tile-label tone-info">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px; vertical-align:middle; margin-right:3px;">
                                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                                            </svg>
                                            <span>血氧</span>
                                        </span>
                                        <span class="font-mono" id="ts-o2">13:52</span>
                                    </div>
                                    <div class="vital-tile-val-box">
                                        <span class="vital-tile-val tone-info" id="val-o2">--</span>
                                        <span class="vital-tile-unit">%</span>
                                    </div>
                                </div>
                                <!-- 睡眠时长 -->
                                <div class="vital-tile">
                                    <div class="vital-tile-header">
                                        <span class="vital-tile-label tone-warn">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px; vertical-align:middle; margin-right:3px;">
                                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                            </svg>
                                            <span>睡眠时长</span>
                                        </span>
                                        <span class="font-mono">今日</span>
                                    </div>
                                    <div class="vital-tile-val-box">
                                        <span class="vital-tile-val tone-warn" id="val-sleep">--</span>
                                        <span class="vital-tile-unit">小时</span>
                                    </div>
                                </div>
                                <!-- 今日步数 -->
                                <div class="vital-tile col-span-2">
                                    <div class="vital-tile-header">
                                        <span class="vital-tile-label tone-accent">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px; vertical-align:middle; margin-right:3px;">
                                                <path d="M18 20V10M12 20V4M6 20v-6" stroke-linecap="round"/>
                                            </svg>
                                            <span>今日步数</span>
                                        </span>
                                        <span class="font-mono" style="color: var(--color-success);">24h连续监测</span>
                                    </div>
                                    <div class="vital-tile-val-box">
                                        <span class="vital-tile-val tone-accent" id="val-step">--</span>
                                        <span class="vital-tile-unit">步</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 中栏 (生理数字人视觉模型 - 深度还原内脏器官透视) -->
                        <div class="screen-panel" style="padding: 10px 12px;">
                            <div class="panel-title-bar" style="margin-bottom: 4px;">
                                <div class="panel-title-box">
                                    <h3><span class="panel-title-indicator"></span>生理数字人模型</h3>
                                    <p class="panel-subtitle">中医脏腑透视 · 实时状态映射</p>
                                </div>
                            </div>
                            
                            <div class="digital-human-view">
                                <div class="orbit-ring-outer"></div>
                                <div class="orbit-ring-inner"></div>
                                
                                <!-- 左右悬浮胶囊标签 -->
                                <div class="body-tag tag-warn" style="top: 8%; left: 8%;">睡眠不足</div>
                                <div class="body-tag tag-warn" style="top: 8%; right: 8%;">体质阴虚</div>
                                
                                <div class="body-tag tag-normal" style="top: 28%; left: 6%;">胃经不顺</div>
                                <div class="body-tag tag-normal" style="top: 28%; right: 6%;">脉搏偏实</div>
                                
                                <div class="body-tag tag-normal" style="top: 48%; left: 6%;">脾失健运</div>
                                <div class="body-tag tag-normal" style="top: 48%; right: 6%;">易口干</div>
                                
                                <div class="body-tag tag-good" style="top: 68%; left: 8%;">正常体重</div>
                                <div class="body-tag tag-good" style="top: 68%; right: 8%;">心律规则</div>
                                
                                <!-- SVG生理数字人与脏腑透视模型 (1:1 像素级逼真还原内脏发光心脏、肝脏、双肾、肠道) -->
                                <svg class="body-silhouette-svg" viewBox="0 0 200 460" style="position:relative; z-index:5;">
                                    <defs>
                                        <!-- 人体外轮廓发光渐变 -->
                                        <linearGradient id="bodyOutlineGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.9" />
                                            <stop offset="100%" stop-color="#10b981" stop-opacity="0.2" />
                                        </linearGradient>
                                        
                                        <!-- 心脏粉红渐变 -->
                                        <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.9" />
                                            <stop offset="100%" stop-color="#fda4af" stop-opacity="0.6" />
                                        </linearGradient>
                                        
                                        <!-- 肝脏橙褐渐变 -->
                                        <linearGradient id="liverGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stop-color="#ea580c" stop-opacity="0.85" />
                                            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.5" />
                                        </linearGradient>
                                        
                                        <!-- 肾脏粉红发光渐变 -->
                                        <linearGradient id="kidneyGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stop-color="#ec4899" stop-opacity="0.9" />
                                            <stop offset="100%" stop-color="#fbcfe8" stop-opacity="0.5" />
                                        </linearGradient>
                                        
                                        <!-- 肠道青蓝发光渐变 -->
                                        <linearGradient id="intestinesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8" />
                                            <stop offset="100%" stop-color="#0891b2" stop-opacity="0.45" />
                                        </linearGradient>
                                        
                                        <!-- 各种发光滤镜 -->
                                        <filter id="glowFilt"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                                        <filter id="organGlowFilt"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                                    </defs>
                                    
                                    <!-- A. 脉络人体外轮廓线框 (未来科技感) -->
                                    <g fill="none" stroke="url(#bodyOutlineGrad)" stroke-width="1.2" filter="url(#glowFilt)">
                                        <circle cx="100" cy="40" r="23" />
                                        <path d="M76 68 L124 68 L138 130 L128 220 L120 320 L128 420 L108 428 L100 340 L92 428 L72 420 L80 320 L72 220 L62 130 Z" />
                                        <path d="M62 130 L28 200 L36 260 L46 250 L46 200" />
                                        <path d="M138 130 L172 200 L164 260 L154 250 L154 200" />
                                    </g>
                                    
                                    <g fill="url(#bodyOutlineGrad)" opacity="0.1">
                                        <path d="M76 68 L124 68 L138 130 L128 220 L120 320 L128 420 L108 428 L100 340 L92 428 L72 420 L80 320 L72 220 L62 130 Z" />
                                        <circle cx="100" cy="40" r="23" />
                                    </g>
                                    
                                    <!-- B. 内脏器官透视系统 (带有器官动态呼吸跳动) -->
                                    <!-- 1. 心脏 (Chest Cavity) -->
                                    <path id="svg-organ-heart" class="tcm-organ-svg-node" d="M 100 132 C 92 121, 80 124, 80 137 C 80 150, 100 166, 100 166 C 100 166, 120 150, 120 137 C 120 124, 108 121, 100 132 Z" 
                                          fill="url(#heartGrad)" filter="url(#organGlowFilt)" style="transition: all 0.5s;" />
                                    
                                    <!-- 2. 肝脏 (Upper Abdomen) -->
                                    <path id="svg-organ-liver" class="tcm-organ-svg-node" d="M 86 175 L 118 178 C 118 190, 88 194, 86 175 Z" 
                                          fill="url(#liverGrad)" filter="url(#organGlowFilt)" style="transition: all 0.5s;" />
                                          
                                    <!-- 3. 双肾 (Symmetrical Kidneys) -->
                                    <!-- 左肾 -->
                                    <path id="svg-organ-kidney-l" class="tcm-organ-svg-node" d="M 83 196 C 77 196, 77 214, 83 214 C 87 214, 87 196, 83 196 Z" 
                                          fill="url(#kidneyGrad)" filter="url(#organGlowFilt)" style="transition: all 0.5s;" />
                                    <!-- 右肾 -->
                                    <path id="svg-organ-kidney-r" class="tcm-organ-svg-node" d="M 117 196 C 113 196, 113 214, 117 214 C 123 214, 123 196, 117 196 Z" 
                                          fill="url(#kidneyGrad)" filter="url(#organGlowFilt)" style="transition: all 0.5s;" />
                                          
                                    <!-- 4. 肠道 (Lower Abdomen) -->
                                    <path id="svg-organ-intestines" class="tcm-organ-svg-node" d="M 85 228 Q 100 220 115 228 T 115 244 T 85 244 T 85 260 T 115 260 T 100 274 Z" 
                                          fill="url(#intestinesGrad)" filter="url(#organGlowFilt)" style="transition: all 0.5s;" />
                                    
                                    <!-- C. 14个脊椎发光点 -->
                                    <circle cx="100" cy="80" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="102" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="124" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="146" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="168" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="190" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="212" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="234" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="256" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="278" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="300" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="322" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="344" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                    <circle cx="100" cy="366" r="1.5" fill="var(--screen-accent)" opacity="0.6" />
                                </svg>
                                
                                <div class="base-ellipse-glow"></div>
                            </div>
                            
                            <!-- 底部评估面板 -->
                            <div class="assessment-footer">
                                <span class="assess-lbl">24 小时健康评估：</span>
                                <span class="assess-val tone-warn" id="overall-assessment-text">亚健康</span>
                                <div class="assess-stars tone-warn" id="overall-assessment-stars">
                                    <!-- 动态渲染 -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- 右栏 (睡眠分析与运动分析) -->
                        <div class="flex-col gap-10">
                            <!-- 睡眠分析 -->
                            <div class="screen-panel" style="padding: 10px 12px;">
                                <div class="panel-title-bar" style="margin-bottom: 4px;">
                                    <div class="panel-title-box">
                                        <h3><span class="panel-title-indicator"></span>睡眠分析</h3>
                                        <p class="panel-subtitle">入睡 03:22 · 起床 06:04</p>
                                    </div>
                                    <!-- 睡眠图例 -->
                                    <div class="sleep-legend-row">
                                        <span><span class="sleep-legend-dot" style="background: var(--color-chart-2);"></span> 深睡</span>
                                        <span><span class="sleep-legend-dot" style="background: var(--color-chart-1);"></span> 浅睡</span>
                                        <span><span class="sleep-legend-dot" style="background: var(--color-warning);"></span> 清醒</span>
                                    </div>
                                </div>
                                <div class="sleep-stats-summary">
                                    <span>总睡眠<span id="sleep-summary-total">2h42m</span></span>
                                    <span>深睡<span id="sleep-summary-deep">1h40m</span></span>
                                    <span>浅睡<span id="sleep-summary-light">1h02m</span></span>
                                </div>
                                <!-- 8天堆叠睡眠柱状图 -->
                                <div class="sleep-bars-grid" id="sleepStackedChart">
                                    <!-- JS 动态渲染 -->
                                </div>
                            </div>
                            
                            <!-- 运动分析 -->
                            <div class="screen-panel" style="padding: 10px 12px;">
                                <div class="panel-title-bar" style="margin-bottom: 4px;">
                                    <div class="panel-title-box">
                                        <h3><span class="panel-title-indicator"></span>运动分析</h3>
                                        <p class="panel-subtitle">今日 · 每小时步数</p>
                                    </div>
                                    <span style="font-size: 10px; color: var(--screen-muted);">
                                        总步数 <span class="font-mono text-sm tone-accent" style="font-weight:600;" id="motion-total-steps">--</span>
                                    </span>
                                </div>
                                <!-- 24小时柱状图 -->
                                <div class="motion-bars-grid" id="motionChartBars">
                                    <!-- JS 动态渲染 -->
                                </div>
                                <div class="motion-labels-row">
                                    <span>00:00</span>
                                    <span>06:00</span>
                                    <span>12:00</span>
                                    <span>18:00</span>
                                    <span>24:00</span>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <!-- ==================== 第二排 ==================== -->
                    <div class="grid-row-bottom">
                        
                        <!-- 用户生理数据趋势 -->
                        <div class="screen-panel">
                            <div class="panel-title-bar" style="margin-bottom: 4px;">
                                <div class="panel-title-box">
                                    <h3><span class="panel-title-indicator"></span>用户生理数据</h3>
                                    <p class="panel-subtitle" id="trend-subtitle">心率 · 24h 趋势</p>
                                </div>
                            </div>
                            <!-- 指标 Tab 切换 -->
                            <div class="trend-tabs-row">
                                <span class="trend-tab-btn active" data-type="heart">心率</span>
                                <span class="trend-tab-btn" data-type="bp">血压</span>
                                <span class="trend-tab-btn" data-type="o2">血氧</span>
                                <span class="trend-tab-btn" data-type="sleep">睡眠</span>
                                <span class="trend-tab-btn" data-type="step">步数</span>
                            </div>
                            <!-- SVG折线图 -->
                            <div class="trend-svg-wrapper">
                                <svg id="trendChart" viewBox="0 0 400 160" style="width:100%; height:100%;">
                                    <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" stroke-dasharray="2,2" />
                                    <line x1="40" y1="55" x2="380" y2="55" stroke="rgba(255,255,255,0.03)" stroke-dasharray="2,2" />
                                    <line x1="40" y1="90" x2="380" y2="90" stroke="rgba(255,255,255,0.03)" stroke-dasharray="2,2" />
                                    <line x1="40" y1="125" x2="380" y2="125" stroke="rgba(255,255,255,0.03)" stroke-dasharray="2,2" />
                                    <line x1="40" y1="135" x2="380" y2="135" stroke="rgba(255,255,255,0.1)" />
                                    
                                    <text x="32" y="24" fill="var(--screen-muted)" font-size="8" text-anchor="end" class="y-label-1">140</text>
                                    <text x="32" y="59" fill="var(--screen-muted)" font-size="8" text-anchor="end" class="y-label-2">105</text>
                                    <text x="32" y="94" fill="var(--screen-muted)" font-size="8" text-anchor="end" class="y-label-3">70</text>
                                    <text x="32" y="129" fill="var(--screen-muted)" font-size="8" text-anchor="end" class="y-label-4">35</text>
                                    <text x="32" y="139" fill="var(--screen-muted)" font-size="8" text-anchor="end">0</text>
                                    
                                    <text x="40" y="152" fill="var(--screen-muted)" font-size="8">00:00</text>
                                    <text x="108" y="152" fill="var(--screen-muted)" font-size="8" text-anchor="middle">04:00</text>
                                    <text x="176" y="152" fill="var(--screen-muted)" font-size="8" text-anchor="middle">08:00</text>
                                    <text x="244" y="152" fill="var(--screen-muted)" font-size="8" text-anchor="middle">12:00</text>
                                    <text x="312" y="152" fill="var(--screen-muted)" font-size="8" text-anchor="middle">16:00</text>
                                    <text x="380" y="152" fill="var(--screen-muted)" font-size="8" text-anchor="end">20:00</text>
                                    
                                    <defs>
                                        <linearGradient id="chartGlowGradV4" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="var(--color-chart-2)" stop-opacity="0.4" />
                                            <stop offset="100%" stop-color="var(--color-chart-2)" stop-opacity="0" />
                                        </linearGradient>
                                    </defs>
                                    
                                    <path id="trendAreaPath" d="" fill="url(#chartGlowGradV4)" />
                                    <path id="trendLinePath" d="" fill="none" stroke="var(--color-chart-2)" stroke-width="2" stroke-linecap="round" />
                                    <g id="trendPoints"></g>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- 未来一个月疾病风险概率 -->
                        <div class="screen-panel" style="padding: 10px 12px;">
                            <div class="panel-title-bar" style="margin-bottom: 4px;">
                                <div class="panel-title-box">
                                    <h3><span class="panel-title-indicator"></span>未来一个月疾病风险概率</h3>
                                    <p class="panel-subtitle">AI 模型预测</p>
                                </div>
                            </div>
                            <ul class="risk-progress-list" id="diseaseRiskListContainer">
                                <!-- JS 动态渲染 8 项疾病概率进度条 -->
                            </ul>
                        </div>
                        
                        <!-- 器官分析 · 子午流注 -->
                        <div class="screen-panel" style="padding: 10px 12px;">
                            <div class="panel-title-bar" style="margin-bottom: 4px;">
                                <div class="panel-title-box">
                                    <h3><span class="panel-title-indicator"></span>器官分析 · 子午流注</h3>
                                    <p class="panel-subtitle" id="tcm-clock-subtitle">加载中...</p>
                                </div>
                            </div>
                            
                            <div class="flex-row" style="display: flex; gap: 12px; align-items: center; margin-top: 4px; width: 100%;">
                                <!-- 罗盘时钟 -->
                                <div class="radial-clock-container" id="tcmClockRingContainer">
                                    <div class="radial-clock-ring"></div>
                                    <div class="radial-clock-ring-dashed"></div>
                                    <div class="radial-clock-pointer" id="tcmClockPointer"></div>
                                    
                                    <!-- 12个时辰脏腑 -->
                                    <span class="organ-node" style="left:50%; top:8.5%;" data-idx="1">心</span>
                                    <span class="organ-node" style="left:70.7%; top:14.2%;" data-idx="5">胃</span>
                                    <span class="organ-node" style="left:87.5%; top:31%;" data-idx="3">肺</span>
                                    <span class="organ-node" style="left:91.5%; top:50%;" data-idx="8">大肠</span>
                                    <span class="organ-node" style="left:87.5%; top:69%;" data-idx="4">肾</span>
                                    <span class="organ-node" style="left:70.7%; top:85.8%;" data-idx="2">脾</span>
                                    <span class="organ-node" style="left:50%; top:91.5%;" data-idx="0">肝</span>
                                    <span class="organ-node" style="left:29.3%; top:85.8%;" data-idx="9">小肠</span>
                                    <span class="organ-node" style="left:12.5%; top:69%;" data-idx="7">膀胱</span>
                                    <span class="organ-node" style="left:8.5%; top:50%;" data-idx="6">胆</span>
                                    <span class="organ-node" style="left:12.5%; top:31%;" data-idx="10">心包</span>
                                    <span class="organ-node" style="left:29.3%; top:14.2%;" data-idx="11">三焦</span>
                                    
                                    <div class="radial-clock-center">
                                        <div class="text-[10px]" style="color: var(--screen-muted);" id="tcmCenterOrgan">--</div>
                                        <div class="text-xs font-semibold tone-warn" style="margin-top:1px;" id="tcmCenterStatus">亚健康</div>
                                    </div>
                                </div>
                                
                                <!-- 中医诊断与体质特征解释 -->
                                <div style="flex-grow:1; display:flex; flex-direction:column; gap:4px; min-width:0;" id="tcmDiagnoseDetails">
                                    <p class="tcm-diagnose-para" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><strong>体质评估：</strong><span id="tcm-val-constitution">${tcmConstitution}</span></p>
                                    <p class="tcm-diagnose-para" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" id="tcm-val-feature-para"><strong>特征：</strong><span id="tcm-val-feature">${tcmFeature.replace('体质特征：', '')}</span></p>
                                    <p class="tcm-diagnose-para" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" id="tcm-val-advice-para"><strong>调理：</strong><span id="tcm-val-advice">${tcmAdvice}</span></p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                </div>
                
            </div>
        </div>
    `;
    
    // 2. 绑定关闭按钮动作，确保销毁全局大屏定时器
    container.querySelectorAll("[data-close='resident-portrait-modal']").forEach(btn => {
        btn.onclick = () => closeModal("resident-portrait-modal");
    });
    
    openModal("resident-portrait-modal");
    
    // 强效防御性数据清洗逻辑 (解决后端返回 "--" 或是 null/0 覆盖默认演示值的问题)
    const cleanVal = (val, defaultVal) => {
        if (val === undefined || val === null || val === "" || val === "--" || val === 0 || val === "0" || val === 0.0) {
            return defaultVal;
        }
        return val;
    };

    const cleanArray = (arr, defaultArr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return defaultArr;
        const hasInvalid = arr.some(x => x === null || x === undefined || x === "" || x === "--" || x === 0 || x === "0");
        if (hasInvalid) return defaultArr;
        return arr;
    };

    // 3. 构建本地大屏居民数据绑定映射 (强效清洗演示数据打底)
    const activePatient = {
        name: maskedName,
        realName: r.name,
        phone: maskedPhone,
        gender: r.gender,
        height: r.height || 170,
        weight: r.weight || 69,
        bmi: parseFloat(bmiVal),
        bmiStatus: parseFloat(bmiVal) >= 28 ? "肥胖" : (parseFloat(bmiVal) >= 24 ? "超重" : "正常"),
        overallAssessment: healthLabel,
        tcmConstitution: tcmConstitution,
        vitals: {
            heartRate: parseInt(cleanVal(r.heart_rate, 80)) || 80,
            heartRateStatus: (parseInt(cleanVal(r.heart_rate, 80)) || 80) >= 100 ? "心律不齐" : ((parseInt(cleanVal(r.heart_rate, 80)) || 80) < 60 ? "偏低" : "正常"),
            spO2: parseInt(cleanVal(r.blood_oxygen, 99)) || 99,
            spO2Status: (parseInt(cleanVal(r.blood_oxygen, 99)) || 99) >= 95 ? "正常" : "偏低",
            sleepHours: parseFloat(cleanVal(r.sleep_hours, (r.health_level === "red" ? 4.2 : (r.health_level === "yellow" ? 5.5 : 7.2)))) || 5.5,
            sleepStatus: r.health_level === "red" ? "严重不足" : (r.health_level === "yellow" ? "睡眠不足" : "健康"),
            bpSystolic: parseInt(cleanVal(String(r.blood_pressure || "").split("/")[0], 128)) || 128,
            bpDiastolic: parseInt(cleanVal(String(r.blood_pressure || "").split("/")[1], 53)) || 53,
            bpStatus: r.health_level === "red" ? "高血压风险" : "正常",
            steps: parseInt(cleanVal(r.steps, 5247)) || 5247
        },
        trends: {
            heart: cleanArray(trends && trends.heart_rate, [72, 75, 84, 88, 92, 80, 76, 81, 79, 83, 85, 78]),
            bp: cleanArray(trends && trends.blood_pressure_systolic, [120, 122, 128, 131, 124, 119, 122, 126, 128, 125, 124, 128]),
            o2: cleanArray(trends && trends.blood_oxygen, [99, 99, 98, 99, 99, 97, 98, 99, 99, 99, 98, 99]),
            sleep: [0.5, 0.4, 1.2, 2.5, 3.4, 2.8, 3.1, 1.5, 0.2, 0.1, 0, 0],
            step: [200, 400, 1200, 1500, 2400, 3100, 4200, 4800, 5200, 6000, 6100, 6200]
        },
        diseaseRisks: [
            { name: "房颤",     v: 0 },
            { name: "心力衰竭", v: 0 },
            { name: "冠心病",   v: 0 },
            { name: "心动过速", v: 5.2 },
            { name: "心动过缓", v: 0.1 },
            { name: "心梗",     v: 0.6 },
            { name: "脑卒中",   v: 1.8 },
            { name: "糖尿病",   v: 3.4 }
        ],
        sleepData: [
            { seg: "1", deep: 80, light: 55, awake: 4 },
            { seg: "2", deep: 95, light: 40, awake: 4 },
            { seg: "3", deep: 75, light: 65, awake: 15 },
            { seg: "4", deep: 100, light: 30, awake: 4 },
            { seg: "5", deep: 85, light: 50, awake: 4 },
            { seg: "6", deep: 90, light: 45, awake: 4 },
            { seg: "7", deep: 65, light: 60, awake: 15 },
            { seg: "8", deep: 100, light: 62, awake: 4 }
        ]
    };
    
    // 4. 定时渲染大屏时钟
    const renderHeaderTime = () => {
        const timeEl = document.getElementById("headerTime");
        if (!timeEl) return;
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };
    renderHeaderTime();
    state.screenClockTimer = setInterval(renderHeaderTime, 1000);
    
    // D01. 同步5个小磁贴数据
    const renderVitalCards = () => {
        const hrVal = document.getElementById("val-heart");
        if (hrVal) hrVal.textContent = activePatient.vitals.heartRate;
        const bpVal = document.getElementById("val-bp");
        if (bpVal) bpVal.textContent = `${activePatient.vitals.bpSystolic}/${activePatient.vitals.bpDiastolic}`;
        const o2Val = document.getElementById("val-o2");
        if (o2Val) o2Val.textContent = activePatient.vitals.spO2;
        const sleepVal = document.getElementById("val-sleep");
        if (sleepVal) sleepVal.textContent = activePatient.vitals.sleepHours.toFixed(1);
        const stepVal = document.getElementById("val-step");
        if (stepVal) stepVal.textContent = activePatient.vitals.steps.toLocaleString();
    };
    
    // D02. 健康评估结论与星级
    const renderOverallAssessment = () => {
        const assessText = document.getElementById("overall-assessment-text");
        const assessStars = document.getElementById("overall-assessment-stars");
        if (assessText && assessStars) {
            assessText.textContent = activePatient.overallAssessment;
            
            let starsHtml = "";
            if (activePatient.overallAssessment === "健康") {
                assessText.className = "assess-val tone-success";
                assessStars.className = "assess-stars tone-success";
                starsHtml = "★★★★★";
            } else if (activePatient.overallAssessment === "风险") {
                assessText.className = "assess-val tone-danger";
                assessStars.className = "assess-stars tone-danger";
                starsHtml = "★☆☆☆☆";
            } else {
                assessText.className = "assess-val tone-warn";
                assessStars.className = "assess-stars tone-warn";
                starsHtml = "★★☆☆•"; // 星星表示法微调
            }
            assessStars.textContent = starsHtml;
        }
    };
    
    // D03. 睡眠 8天堆叠柱状图
    const renderSleepStackedChart = () => {
        const container = document.getElementById("sleepStackedChart");
        const sleepTotalEl = document.getElementById("sleep-summary-total");
        const sleepDeepEl = document.getElementById("sleep-summary-deep");
        const sleepLightEl = document.getElementById("sleep-summary-light");
        
        if (sleepTotalEl && sleepDeepEl && sleepLightEl) {
            if (activePatient.overallAssessment === "风险") {
                sleepTotalEl.textContent = "4.2小时";
                sleepDeepEl.textContent = "1h20m";
                sleepLightEl.textContent = "3h00m";
            } else {
                sleepTotalEl.textContent = `${activePatient.vitals.sleepHours.toFixed(1)}小时`;
                sleepDeepEl.textContent = "1h40m";
                sleepLightEl.textContent = "1h02m";
            }
        }
        
        if (!container) return;
        container.innerHTML = "";
        
        activePatient.sleepData.forEach(day => {
            const barItem = document.createElement("div");
            barItem.className = "sleep-stacked-bar-item";
            
            const total = day.deep + day.light + day.awake;
            const deepPct = (day.deep / total) * 100;
            const lightPct = (day.light / total) * 100;
            const awakePct = (day.awake / total) * 100;
            
            barItem.innerHTML = `
                <div class="sleep-bar-chunk" style="height: ${deepPct}%; background: var(--color-chart-2);" title="深睡: ${day.deep}分钟"></div>
                <div class="sleep-bar-chunk" style="height: ${lightPct}%; background: var(--color-chart-1);" title="浅睡: ${day.light}分钟"></div>
                <div class="sleep-bar-chunk" style="height: ${awakePct}%; background: var(--color-warning);" title="清醒: ${day.awake}分钟"></div>
            `;
            container.appendChild(barItem);
        });
    };
    
    // D04. 运动 24h 柱状图
    const renderMotionChart = () => {
        const container = document.getElementById("motionChartBars");
        const totalStepsEl = document.getElementById("motion-total-steps");
        if (!container) return;
        
        if (totalStepsEl) {
            totalStepsEl.textContent = activePatient.vitals.steps.toLocaleString();
        }
        
        container.innerHTML = "";
        const hourlySteps = [
            0, 0, 0, 0, 0, 0, 40, 180, 1200, 1500, 1100, 300,
            200, 600, 700, 500, 200, 150, 400, 300, 150, 80, 0, 0
        ];
        const maxSteps = Math.max(...hourlySteps);
        
        hourlySteps.forEach((steps, idx) => {
            const col = document.createElement("div");
            col.className = "motion-bar-col";
            const pct = maxSteps > 0 ? (steps / maxSteps) * 100 : 0;
            col.style.height = `${Math.max(pct, 3)}%`;
            
            if (idx === 8 || idx === 9 || idx === 10 || idx === 13 || idx === 14) {
                col.style.backgroundColor = "var(--color-chart-5)";
            } else {
                col.style.backgroundColor = "rgba(168, 85, 247, 0.4)";
            }
            container.appendChild(col);
        });
    };
    
    // D05. 未来疾病风险列表
    const renderDiseaseRisks = () => {
        const container = document.getElementById("diseaseRiskListContainer");
        if (!container) return;
        
        container.innerHTML = "";
        activePatient.diseaseRisks.forEach(item => {
            const tone = item.v >= 5 ? "var(--color-danger)" : (item.v >= 1 ? "var(--color-warning)" : "var(--color-chart-1)");
            
            const li = document.createElement("li");
            li.className = "risk-progress-row";
            li.innerHTML = `
                <span class="risk-lbl-name">${item.name}</span>
                <div class="risk-bar-track">
                    <div class="risk-bar-fill-node" style="width: ${Math.max(item.v * 6, item.v > 0 ? 4 : 0)}%; background: ${tone};"></div>
                </div>
                <span class="risk-bar-percent" style="color: ${tone};">${item.v}%</span>
            `;
            container.appendChild(li);
        });
    };
    
    // D06. SVG 渐变趋势折线图绘制
    const drawTrendChart = (type) => {
        const svg = document.getElementById("trendChart");
        const subtitleEl = document.getElementById("trend-subtitle");
        if (!svg) return;
        
        const startX = 40;
        const endX = 380;
        const startY = 135;
        const endY = 20;
        const chartHeight = startY - endY;
        const chartWidth = endX - startX;
        
        let dataset = [];
        let minVal = 0, maxVal = 100;
        let labelUnits = "";
        
        if (type === "heart") {
            dataset = activePatient.trends.heart;
            minVal = 40; maxVal = 140;
            labelUnits = "";
            if (subtitleEl) subtitleEl.textContent = "心率 · 24h 趋势";
        } else if (type === "bp") {
            dataset = activePatient.trends.bp;
            minVal = 60; maxVal = 160;
            labelUnits = "";
            if (subtitleEl) subtitleEl.textContent = "血压 · 24h 趋势";
        } else if (type === "o2") {
            dataset = activePatient.trends.o2;
            minVal = 90; maxVal = 100;
            labelUnits = "%";
            if (subtitleEl) subtitleEl.textContent = "血氧 · 24h 趋势";
        } else if (type === "sleep") {
            dataset = activePatient.trends.sleep;
            minVal = 0; maxVal = 4;
            labelUnits = "h";
            if (subtitleEl) subtitleEl.textContent = "睡眠 · 24h 趋势";
        } else if (type === "step") {
            dataset = activePatient.trends.step;
            minVal = 0; maxVal = 8000;
            labelUnits = "步";
            if (subtitleEl) subtitleEl.textContent = "步数 · 24h 趋势";
        }
        
        const delta = (maxVal - minVal) / 4;
        const lbl1 = svg.querySelector(".y-label-1");
        const lbl2 = svg.querySelector(".y-label-2");
        const lbl3 = svg.querySelector(".y-label-3");
        const lbl4 = svg.querySelector(".y-label-4");
        
        if (lbl1) lbl1.textContent = Math.round(maxVal) + labelUnits;
        if (lbl2) lbl2.textContent = Math.round(maxVal - delta) + labelUnits;
        if (lbl3) lbl3.textContent = Math.round(minVal + delta * 2) + labelUnits;
        if (lbl4) lbl4.textContent = Math.round(minVal + delta) + labelUnits;
        
        const pointsCount = dataset.length;
        const segmentWidth = chartWidth / (pointsCount - 1);
        
        let pointsCoordinates = [];
        for (let i = 0; i < pointsCount; i++) {
            const val = dataset[i];
            const x = startX + i * segmentWidth;
            const ratio = (val - minVal) / (maxVal - minVal);
            const y = startY - ratio * chartHeight;
            pointsCoordinates.push({ x, y });
        }
        
        const linePath = document.getElementById("trendLinePath");
        const areaPath = document.getElementById("trendAreaPath");
        const pointsGroup = document.getElementById("trendPoints");
        
        if (linePath && areaPath && pointsGroup) {
            let lineD = "";
            let areaD = `M ${startX} ${startY} `;
            
            pointsCoordinates.forEach((pt, idx) => {
                if (idx === 0) {
                    lineD += `M ${pt.x} ${pt.y} `;
                } else {
                    lineD += `L ${pt.x} ${pt.y} `;
                }
                areaD += `L ${pt.x} ${pt.y} `;
            });
            
            areaD += `L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${startY} Z`;
            
            linePath.setAttribute("d", lineD);
            areaPath.setAttribute("d", areaD);
            
            pointsGroup.innerHTML = "";
            pointsCoordinates.forEach((pt, idx) => {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", pt.x);
                circle.setAttribute("cy", pt.y);
                circle.setAttribute("r", "1.5");
                circle.setAttribute("fill", "var(--color-chart-2)");
                pointsGroup.appendChild(circle);
            });
        }
    };
    
    // D07. 子午流注时辰圆盘与内脏器官联动
    const updateTcmClock = () => {
        const subtitle = document.getElementById("tcm-clock-subtitle");
        const pointer = document.getElementById("tcmClockPointer");
        const organNodes = container.querySelectorAll(".organ-node");
        
        const valXu = document.getElementById("tcm-val-constitution");
        const valSym = document.getElementById("tcm-val-feature");
        const valExp = document.getElementById("tcm-val-advice");
        
        const centerOrgan = document.getElementById("tcmCenterOrgan");
        
        if (!pointer || !subtitle || !valXu || !valSym || !valExp || !centerOrgan) return;
        
        const tcmList = [
            { name: "肝", hourStart: 1,  hourEnd: 3,  shichen: "丑时", jingluo: "肝经", angle: 180, xu: "面色青暗、易倦、目干涩、易惊醒、肢体麻木。", sym: "胁肋胀痛、胸闷不舒、烦躁易怒、头痛目眩、月经不调。", exp: "丑时肝经当令，主藏血排毒。建议此时保持熟睡，忌熬夜。" },
            { name: "肺", hourStart: 3,  hourEnd: 5,  shichen: "寅时", jingluo: "肺经", angle: 0, xu: "气短自汗、易感冒、面色苍白、皮肤干燥。", sym: "咳嗽气喘、痰多、咯血、胸痛、畏寒易感。", exp: "寅时肺经当令，将气血输送全身。宜熟睡以利肺气肃降。" },
            { name: "大肠", hourStart: 5,  hourEnd: 7,  shichen: "卯时", jingluo: "大肠经", angle: 30, xu: "肠鸣腹泄、易冷痛、大便稀溏、皮肤暗淡。", sym: "便秘、痔疮、口干、咽喉肿痛、面部痤疮。", exp: "卯时大肠经当令，大肠开始蠕动。建议此时起床排便、喝温水。" },
            { name: "胃", hourStart: 7,  hourEnd: 9,  shichen: "辰时", jingluo: "胃经", angle: -30, xu: "食欲不振、消化不良、易冷痛、胃下垂。", sym: "胃痛、嗳气、反酸、口臭、牙龈肿痛。", exp: "辰时胃经当令，胃气最旺。建议此时吃早餐，补充全天能量。" },
            { name: "脾", hourStart: 9,  hourEnd: 11, shichen: "巳时", jingluo: "脾经", angle: 150, xu: "神疲乏力、肌肉消瘦、腹胀便溏、食后欲睡。", sym: "脘腹胀满、大便溏稀、水肿、身体沉重。", exp: "巳时脾经当令，运化水谷精微。宜温饮，避免久坐。" },
            { name: "心", hourStart: 11, hourEnd: 13, shichen: "午时", jingluo: "心经", angle: -60, xu: "心悸气短、易惊、健忘、面色无华、四肢厥冷。", sym: "失眠多梦、心烦、口舌生疮、胸闷心痛。", exp: "午时心经当令，气血最盛。建议午饭后静养小憩15-30分钟。" },
            { name: "小肠", hourStart: 13, hourEnd: 15, shichen: "未时", jingluo: "小肠经", angle: 90, xu: "腹胀、易便秘、易患痔疮、肩与后背疼痛、指痛、内火旺、口干舌燥。", sym: "小腹绕脐前痛、心烦气闷、头顶痛、容易腹泻、手脚寒凉、吸收不良、虚肥、肩周炎。", exp: "未时小肠经当令，主分清泌浊。建议此时段饭后小憩，忌饮浓茶，宜温饮以助消化。" },
            { name: "膀胱", hourStart: 15, hourEnd: 17, shichen: "申时", jingluo: "膀胱经", angle: 120, xu: "记忆力减退、多尿、遗尿、后背酸痛、发冷。", sym: "尿频尿急、后头痛、颈项强痛、腰脊酸痛。", exp: "申时膀胱经当令，津液输布。建议多喝水，适度活动。" },
            { name: "肾", hourStart: 17, hourEnd: 19, shichen: "酉时", jingluo: "肾经", angle: 60, xu: "腰膝酸软、潮热盗汗、耳鸣、脱发、牙齿松动。", sym: "水肿、腰痛、畏寒肢冷、夜尿频多。", exp: "酉时肾经当令，肾脏藏精。建议晚餐宜清淡，切忌剧烈运动。" },
            { name: "心包", hourStart: 19, hourEnd: 21, shichen: "戌时", jingluo: "心包经", angle: -120, xu: "心烦、胸闷、心悸、易惊、健忘。", sym: "胸痛、掌心发热、腋下肿胀、失眠、面红。", exp: "戌时心包经当令，护卫心神. 建议保持心情舒畅，可散步静养。" },
            { name: "三焦", hourStart: 21, hourEnd: 23, shichen: "亥时", jingluo: "三焦经", angle: -150, xu: "听力减退、面色萎黄、易疲劳、畏寒。", sym: "腹胀、小便不利、水肿、耳鸣、咽喉肿痛。", exp: "亥时三焦经当令，百脉休养生息. 宜静心入睡，忌熬夜。" },
            { name: "胆", hourStart: 23, hourEnd: 1,  shichen: "子时", jingluo: "胆经", angle: -90, xu: "胆怯易惊、头晕目眩、易叹气、口苦。", sym: "偏头痛、口苦、胁痛、易失眠、多梦。", exp: "子时胆经当令，胆汁新陈代谢。建议在子时前入睡，养足胆气。" }
        ];
        
        const nowHour = new Date().getHours();
        let activeTcm = tcmList.find(t => {
            if (t.hourStart < t.hourEnd) {
                return nowHour >= t.hourStart && nowHour < t.hourEnd;
            } else {
                return nowHour >= 23 || nowHour < 1;
            }
        });
        
        if (!activeTcm) activeTcm = tcmList[6];
        
        subtitle.textContent = `${activeTcm.shichen} ${String(activeTcm.hourStart).padStart(2,'0')}:00 – ${String(activeTcm.hourEnd).padStart(2,'0')}:00 · ${activeTcm.jingluo}`;
        
        // 渲染中医体质或诊断
        valXu.textContent = activePatient.tcmConstitution;
        valSym.textContent = tcmFeature.replace('体质特征：', '');
        valExp.textContent = tcmAdvice;
        
        centerOrgan.textContent = activeTcm.name;
        pointer.style.transform = `rotate(${activeTcm.angle}deg)`;
        
        organNodes.forEach(node => {
            node.classList.remove("active");
            if (node.textContent.trim() === activeTcm.name) {
                node.classList.add("active");
            }
        });
        
        // D08. 物理联动：让数字人内的对应 SVG 器官高亮呼吸
        const heartEl = document.getElementById("svg-organ-heart");
        const liverEl = document.getElementById("svg-organ-liver");
        const kidneyLEl = document.getElementById("svg-organ-kidney-l");
        const kidneyREl = document.getElementById("svg-organ-kidney-r");
        const intestinesEl = document.getElementById("svg-organ-intestines");
        
        // 先还原全部脏腑状态
        [heartEl, liverEl, kidneyLEl, kidneyREl, intestinesEl].forEach(el => {
            if (el) {
                el.style.opacity = "0.5";
                el.style.transform = "scale(1)";
            }
        });
        
        // 对应当令高亮
        if (activeTcm.name === "心" || activeTcm.name === "心包") {
            if (heartEl) {
                heartEl.style.opacity = "1";
                heartEl.style.transform = "scale(1.15)";
            }
        } else if (activeTcm.name === "肝" || activeTcm.name === "胆") {
            if (liverEl) {
                liverEl.style.opacity = "1";
                liverEl.style.transform = "scale(1.15)";
            }
        } else if (activeTcm.name === "肾" || activeTcm.name === "膀胱") {
            if (kidneyLEl) { kidneyLEl.style.opacity = "1"; kidneyLEl.style.transform = "scale(1.15)"; }
            if (kidneyREl) { kidneyREl.style.opacity = "1"; kidneyREl.style.transform = "scale(1.15)"; }
        } else if (["脾", "胃", "小肠", "大肠", "三焦"].includes(activeTcm.name)) {
            if (intestinesEl) {
                intestinesEl.style.opacity = "1";
                intestinesEl.style.transform = "scale(1.1)";
            }
        }
    };
    
    // 6. 执行全模块首次同步渲染
    requestAnimationFrame(() => {
        renderVitalCards();
        renderOverallAssessment();
        renderSleepStackedChart();
        renderMotionChart();
        renderDiseaseRisks();
        updateTcmClock();
        
        drawTrendChart("heart");
        
        // 7. 绑定生理数据趋势 Tab 切换
        const tabButtons = container.querySelectorAll(".trend-tab-btn");
        tabButtons.forEach(btn => {
            btn.onclick = (e) => {
                const type = e.currentTarget.getAttribute("data-type");
                tabButtons.forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                drawTrendChart(type);
            };
        });
    });
    
    // 8. 5 秒动态微幅扰动模拟
    state.screenPerturbTimer = setInterval(() => {
        const hrDiff = Math.random() > 0.5 ? 1 : -1;
        let newHr = activePatient.vitals.heartRate + hrDiff;
        if (newHr < 65) newHr = 70;
        if (newHr > 105) newHr = 92;
        activePatient.vitals.heartRate = newHr;
        
        const bpDiff = Math.random() > 0.5 ? 1 : -1;
        let newBpSys = activePatient.vitals.bpSystolic + bpDiff;
        if (newBpSys < 110) newBpSys = 118;
        if (newBpSys > 140) newBpSys = 132;
        activePatient.vitals.bpSystolic = newBpSys;
        
        const stepAdd = Math.floor(Math.random() * 3) + 1;
        activePatient.vitals.steps += stepAdd;
        
        renderVitalCards();
        renderMotionChart();
        
        activePatient.trends.heart[activePatient.trends.heart.length - 1] = newHr;
        activePatient.trends.bp[activePatient.trends.bp.length - 1] = newBpSys;
        
        const activeTab = container.querySelector(".trend-tab-btn.active");
        if (activeTab) {
            const activeType = activeTab.getAttribute("data-type");
            if (["heart", "bp"].includes(activeType)) {
                drawTrendChart(activeType);
            }
        }
    }, 5000);
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
        if (document.getElementById("doctor-schemes-table-body")) {
            renderDoctorSchemesModule();
        }
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
    if (id === "resident-portrait-modal") {
        if (state.screenClockTimer) {
            clearInterval(state.screenClockTimer);
            state.screenClockTimer = null;
        }
        if (state.screenPerturbTimer) {
            clearInterval(state.screenPerturbTimer);
            state.screenPerturbTimer = null;
        }
    }
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
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }
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

// ☯ 初始化中医经络子午流注罗盘及研判 (高保真 12 经络旋转圆环对齐版)
function initOrganClock() {
    const hand = document.getElementById("organ-clock-hand-ptr");
    const titleEl = document.getElementById("organ-clock-time-title");
    const descEl = document.getElementById("organ-clock-verdict-desc");
    
    if (!hand) return;
    
    // 获取当前系统的实际小时数
    const now = new Date();
    const hrs = now.getHours();
    
    // 中医子午流注时辰、值日器官与虚证实证诊断信息 (12 经络完全对齐)
    const organDetails = [
        {
            name: "子时 23:00 - 01:00 · 胆经",
            labelId: "lbl-organ-dan",
            angle: 180,
            xu: "头晕目眩、易惊多疑、口苦多痰、下肢冰凉、消化不良。",
            symptom: "偏头痛、失眠多梦、叹气、面色暗沉、两肋胀痛、胆怯不安。",
            explain: "子时胆经最旺，胆汁推陈出新。中医提倡子时前必须入睡，以利于胆经排毒、骨髓造血，促进机体新陈代谢。"
        },
        {
            name: "丑时 01:00 - 03:00 · 肝经",
            labelId: "lbl-organ-gan",
            angle: 210,
            xu: "目涩眼花、面色苍白、指甲干枯、易疲劳、情绪低落。",
            symptom: "脾气急躁易怒、头痛头晕、女性月经不调、乳房胀痛、视力减退。",
            explain: "丑时肝经当令，肝藏血、主疏泄。此阶段必须深度睡眠，才能使血液回流滋养肝脏，排除体内的多余毒素。"
        },
        {
            name: "寅时 03:00 - 05:00 · 肺经",
            labelId: "lbl-organ-fei",
            angle: 240,
            xu: "气短自汗、声音低怯、易感冒、面色无华、畏寒怕冷。",
            symptom: "清晨易咳咯痰、胸闷、鼻塞流涕、皮肤干燥、大便干结。",
            explain: "寅时肺经当令，将全身气血输布于百脉。此时宜保持呼吸深沉缓和，让气血顺畅流转全身器官。"
        },
        {
            name: "卯时 05:00 - 07:00 · 大肠经",
            labelId: "lbl-organ-dachang",
            angle: 270,
            xu: "肠燥便秘、腹胀肠鸣、口干咽燥、皮肤粗糙无光泽。",
            symptom: "排便无力、便稀带黏液、腹泻、肛门坠胀、牙痛或咽喉肿痛。",
            explain: "卯时大肠经最旺，主宣导传送。建议此阶段起床空腹饮温开水，促进大肠蠕动，及时排出体内浊气和代谢废弃物。"
        },
        {
            name: "辰时 07:00 - 09:00 · 胃经",
            labelId: "lbl-organ-wei",
            angle: 300,
            xu: "胃纳不佳、食欲减退、消化不良、神疲乏力、口淡无味。",
            symptom: "胃痛反酸、口臭、牙龈肿痛、嘴角长疮、消谷易饥、大便酸臭。",
            explain: "辰时胃经当令，消化能力极强。必须摄入营养丰富的热早餐，以提供一整天充沛的气血与运化动力。"
        },
        {
            name: "巳时 09:00 - 11:00 · 脾经",
            labelId: "lbl-organ-pi",
            angle: 330,
            xu: "神疲乏力、餐后易困、多涎腹胀、面黄肌瘦、舌淡苔白。",
            symptom: "大便溏薄、四肢浮肿、畏寒怕冷、肌肉松弛、湿气重、口淡不渴。",
            explain: "巳时脾经最旺，主运化水谷精微。这是大脑运化和身体吸收的第一个黄金高峰段，适宜处理高效的脑力与体力工作。"
        },
        {
            name: "午时 11:00 - 13:00 · 心经",
            labelId: "lbl-organ-xin",
            angle: 0,
            xu: "心悸气短、易健忘、神疲多汗、面色苍白无华、畏寒。",
            symptom: "失眠多梦、心烦气躁、舌尖红痛、面色潮红、口舌生疮、尿黄涩痛。",
            explain: "午时心经当令，心主神明，主血脉。建议此阶段静心午休15-30分钟，可以养护心气，极大地缓解下午的疲劳感。"
        },
        {
            name: "未时 13:00 - 15:00 · 小肠经",
            labelId: "lbl-organ-xiaochang",
            angle: 30,
            xu: "腹胀、易便秘、易患痔疮、肩与前臂后背疼痛、指痛、内火旺、口干舌燥。",
            symptom: "小腹绕脐脐痛、心烦气闷、头顶痛、容易腹泻、手脚寒凉、吸收不良、齿肥、肩周炎。",
            explain: "未时小肠经当令，主分清泌浊。建议此时段后忌小憩，忌饮浓茶咖啡，宜温饮以助消化。"
        },
        {
            name: "申时 15:00 - 17:00 · 膀胱经",
            labelId: "lbl-organ-pangguang",
            angle: 60,
            xu: "后头痛、项背强痛、腰痛难弯、下肢麻木、排尿无力。",
            symptom: "小便频急涩痛、尿赤、遗尿、目痛流泪、小腿胀痛、畏寒发热。",
            explain: "申时膀胱经当令，主津液代谢与排毒。这是多喝水、促进新陈代谢的绝佳时机，也是一天中工作学习的第二个高峰期。"
        },
        {
            name: "酉时 17:00 - 19:00 · 肾经",
            labelId: "lbl-organ-shen",
            angle: 90,
            xu: "腰膝酸软、潮热盗汗、头晕耳鸣、脱发齿松、失眠健忘。",
            symptom: "畏寒肢冷、夜尿频多、小腹冷痛、水肿、足跟痛、精力减退。",
            explain: "酉时肾经最旺，主藏精纳气。此时气血流注肾脏蓄积，不宜做剧烈运动，宜保持心态平和、静养并吃温热晚膳。"
        },
        {
            name: "戌时 19:00 - 21:00 · 心包经",
            labelId: "lbl-organ-xinbao",
            angle: 120,
            xu: "胸闷、心烦、心悸、失眠、手掌发热、情绪波动易怒。",
            symptom: "腋下肿痛、手臂酸痛麻木、心痛、面色潮红、喜笑无常、心气郁结。",
            explain: "戌时心包经当令，保护心肌，阻挡外邪。此时宜保持心情愉悦，适宜晚间慢步走、温水泡脚，释放一天累积的压力。"
        },
        {
            name: "亥时 21:00 - 23:00 · 三焦经",
            labelId: "lbl-organ-sanjiao",
            angle: 150,
            xu: "畏寒怕冷、免疫力低下、胸闷腹胀、易浮肿、耳鸣、情绪郁闷。",
            symptom: "面色晦暗、偏头痛、咽喉痛、食欲不振、小便不利、浑身沉重。",
            explain: "亥时三焦经当令，通调百脉、运行元气。此时人体的气血修整归元，最佳状态为静心闭目、准备入睡，切忌熬夜操劳。"
        }
    ];
    
    // 定位当前的时辰索引 (24小时制转化为12时辰)
    const idx = Math.floor(hrs / 2) % 12;
    const current = organDetails[idx];
    
    // 旋转雷达时针
    hand.style.transform = `rotate(${current.angle}deg)`;
    
    // 动态在圆形表盘周围点亮当前经络圆圈 active 状态
    document.querySelectorAll(".organ-radial-label").forEach(lbl => lbl.classList.remove("active"));
    const activeLabel = document.getElementById(current.labelId);
    if (activeLabel) activeLabel.classList.add("active");
    
    // 渲染右侧中医辩证文本
    if (titleEl) titleEl.textContent = current.name;
    if (descEl) {
        descEl.innerHTML = `
            <div style="margin-bottom:6px;"><strong style="color:#ef4444;">【虚证表现】</strong>：${current.xu}</div>
            <div style="margin-bottom:6px;"><strong style="color:#f59e0b;">【常见症状】</strong>：${current.symptom}</div>
            <div><strong style="color:#10b981;">【中医解释】</strong>：${current.explain}</div>
        `;
    }
}

// 居民趋势图 (心率、血氧、呼吸、血压等多指标动态切换)
function renderResidentTrendChart(trends, type = "heart") {
    const el = document.getElementById("residentTrendChart");
    if (!el) return;
    
    destroyChart("residentTrend");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    let dataset = [];
    let labels = trends.labels || ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
    
    const createGradient = (color1, color2) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 120);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        return grad;
    };
    
    if (type === "heart") {
        dataset.push({
            label: '心率(bpm)',
            data: trends.heart_rate || [72, 75, 80, 78, 85, 76, 80],
            borderColor: '#00f0ff',
            backgroundColor: createGradient('rgba(0, 240, 255, 0.25)', 'rgba(0, 240, 255, 0)'),
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#00f0ff'
        });
    } else if (type === "oxygen") {
        dataset.push({
            label: '血氧(%)',
            data: trends.blood_oxygen || [98, 98, 97, 99, 98, 99, 98],
            borderColor: '#ef4444',
            backgroundColor: createGradient('rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0)'),
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#ef4444'
        });
    } else if (type === "breath") {
        dataset.push({
            label: '呼吸率(次/分)',
            data: [18, 19, 18, 20, 19, 18, 19],
            borderColor: '#f59e0b',
            backgroundColor: createGradient('rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0)'),
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#f59e0b'
        });
    } else if (type === "temp") {
        dataset.push({
            label: '体温(℃)',
            data: [36.4, 36.5, 36.6, 36.5, 36.7, 36.5, 36.4],
            borderColor: '#a855f7',
            backgroundColor: createGradient('rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 0)'),
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#a855f7'
        });
    } else if (type === "pressure") {
        dataset.push({
            label: '收缩压(mmHg)',
            data: [122, 125, 128, 130, 126, 124, 128],
            borderColor: '#0066ff',
            backgroundColor: 'transparent',
            fill: false,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#0066ff'
        }, {
            label: '舒张压(mmHg)',
            data: [75, 78, 80, 82, 79, 76, 78],
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            fill: false,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#10b981'
        });
    } else if (type === "sugar") {
        dataset.push({
            label: '血糖(mmol/L)',
            data: [5.2, 5.4, 6.1, 5.0, 5.5, 5.3, 5.4],
            borderColor: '#84cc16',
            backgroundColor: createGradient('rgba(132, 204, 22, 0.2)', 'rgba(132, 204, 22, 0)'),
            fill: true,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#84cc16'
        });
    }

    state.charts.residentTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: dataset
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: 'rgba(255, 255, 255, 0.45)', font: { size: 8 } } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: 'rgba(255, 255, 255, 0.45)', font: { size: 8 } } }
            }
        }
    });
}

// 渲染多色睡眠分析堆叠图 (对齐设计图颜色)
function renderResidentSleepChart() {
    const el = document.getElementById("residentSleepChart");
    if (!el) return;
    
    destroyChart("residentSleep");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    state.charts.residentSleep = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [
                {
                    label: '深睡',
                    data: [1.8, 2.0, 1.5, 2.2, 2.5, 1.0, 1.6],
                    backgroundColor: '#10b981',
                    borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
                },
                {
                    label: '浅睡',
                    data: [4.2, 3.8, 4.5, 4.0, 3.5, 5.0, 4.1],
                    backgroundColor: '#00f0ff',
                    borderRadius: 0
                },
                {
                    label: '清醒',
                    data: [0.8, 0.5, 1.0, 0.6, 0.8, 1.2, 0.9],
                    backgroundColor: '#f59e0b',
                    borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } } },
                y: { stacked: true, grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } } }
            }
        }
    });
}

// 渲染今日运动小时监测柱状图 (高饱和紫色)
function renderResidentSportChart() {
    const el = document.getElementById("residentSportChart");
    if (!el) return;
    
    destroyChart("residentSport");
    
    const ctx = el.getContext("2d");
    if (!ctx) return;
    
    state.charts.residentSport = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [{
                data: [0, 50, 1500, 800, 2100, 600, 197],
                backgroundColor: '#a855f7',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } } }
            }
        }
    });
}


// ☯ 初始化中医经络子午流注罗盘及研判
function initOrganClock() {
    const hand = document.getElementById("organ-clock-hand-ptr");
    const titleEl = document.getElementById("organ-clock-time-title");
    const descEl = document.getElementById("organ-clock-verdict-desc");
    
    if (!hand) return;
    
    // 获取当前系统的实际小时数
    const now = new Date();
    const hrs = now.getHours();
    
    // 子午流注指针偏转角
    // 24小时分为12个时辰，每2小时一个刻度，一个时辰占罗盘的 30 度
    const angle = ((hrs / 24) * 360) + 180; // 加 180 做表盘朝上的对齐校准
    hand.style.transform = `rotate(${angle}deg)`;
    
    // 中医子午流注时辰、值日器官与虚证实证诊断信息
    const organDetails = [
        { name: "子时 (23:00-01:00) 胆经值日", desc: "气血注于胆。胆汁推陈出新。胆虚则易惊、多疑、偏头痛。建议熟睡以养胆气。" },
        { name: "丑时 (01:00-03:00) 肝经值日", desc: "气血注于肝。肝藏血排毒。肝虚则目涩眼花、多梦易醒。此阶段必须深度睡眠以利血液归肝。" },
        { name: "寅时 (03:00-05:00) 肺经值日", desc: "气血注于肺。肺朝百脉，分配气血。肺虚则气短、清晨易咳。此时宜保持呼吸平缓深睡。" },
        { name: "卯时 (05:00-07:00) 大肠经值日", desc: "气血流注大肠。大肠虚则腹痛、便溏或便秘。宜起床空腹饮温水，促进大肠排毒排便。" },
        { name: "辰时 (07:00-09:00) 胃经值日", desc: "气血注于胃。胃虚则消化不良、纳差。此时为胃经最旺时间，必须进食高营养早餐以运化身体。" },
        { name: "巳时 (09:00-11:00) 脾经值日", desc: "气血注于脾。脾主运化精微。脾虚则神疲乏力、餐后易困、腹胀。此时宜处理高效脑力工作。" },
        { name: "午时 (11:00-13:00) 心经值日", desc: "气血流注心经。心虚则心悸、失眠、神志不宁。宜午睡 15-30 分钟，以静养心神，补足心气。" },
        { name: "未时 (13:00-15:00) 小肠经值日", desc: "小肠分清泌浊。小肠虚则腹胀、易便秘、口干舌燥、肩背沉重酸痛。建议多饮水利于代谢。" },
        { name: "申时 (15:00-17:00) 膀胱经值日", desc: "气血注于膀胱。膀胱经运行排毒。膀胱虚则小便异常、腰痛。此时为第二个学习工作高峰，应多喝水。" },
        { name: "酉时 (17:00-19:00) 肾经值日", desc: "气血流注肾经。肾藏精气。肾虚则腰膝酸软、潮热盗汗。此时气血收敛，宜保持情绪安静平稳。" },
        { name: "戌时 (19:00-21:00) 心包经值日", desc: "气血注于心包。保护心脏免受外邪。心包虚则胸闷、心烦。宜保持情绪愉悦舒缓，进行散步。" },
        { name: "亥时 (21:00-23:00) 三焦经值日", desc: "三焦通百脉。气血流注三焦。三焦虚则畏寒、免疫力差。此时人体百脉修整，建议准备入睡。" }
    ];
    
    // 定位当前的 2 小时时段
    const idx = Math.floor(hrs / 2) % 12;
    const current = organDetails[idx];
    
    if (titleEl) titleEl.textContent = current.name;
    if (descEl) descEl.textContent = current.desc;
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
// --- D03. 我的在管病人 ---
function renderPatientsModule() {
    const tbody = document.getElementById("doctor-patients-table-body");
    if (!tbody) return;
    
    // 获取检索和筛选参数
    const searchVal = document.getElementById("patient-search-input")?.value.trim().toLowerCase() || "";
    const filterLevel = document.getElementById("patient-level-filter")?.value || "";
    
    // 过滤在管病人
    let filtered = state.residents.filter(r => {
        const matchesSearch = searchVal ? r.name.toLowerCase().includes(searchVal) : true;
        const matchesLevel = filterLevel ? r.health_level === filterLevel : true;
        return matchesSearch && matchesLevel;
    });
    
    // 按照健康危害等级置顶排序 (高危红色 -> 警告黄色 -> 正常绿色)
    const levelMap = { "red": 0, "yellow": 1, "green": 2 };
    filtered.sort((a, b) => levelMap[a.health_level] - levelMap[b.health_level]);
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--semi-color-text-2); padding:24px;">无匹配的在管病人数据</td></tr>`;
        return;
    }
    
    tbody.innerHTML = filtered.map(r => {
        let levelBadge = "";
        if (r.health_level === "red") levelBadge = `<span class="badge badge-danger" style="animation: bounce-anim 1s infinite alternate;">🔴 高危红色</span>`;
        else if (r.health_level === "yellow") levelBadge = `<span class="badge badge-warning">🟡 黄色预警</span>`;
        else levelBadge = `<span class="badge badge-success" style="background:#e6fcf5; color:#0ca678;">🟢 正常绿色</span>`;
        
        return `
            <tr>
                <td><input type="checkbox"></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${getFormalAvatar(r.gender, r.age, r.name)}
                        <div>
                            <span style="font-weight:600; color:var(--semi-color-text-0);">${r.name}</span>
                            <div style="font-size:11px; color:var(--semi-color-text-2);">ID_${r.id}</div>
                        </div>
                    </div>
                </td>
                <td>${r.gender} / ${r.age}岁</td>
                <td>${levelBadge}</td>
                <td class="font-mono">${r.steps ? r.steps.toLocaleString() : '0'} 步</td>
                <td class="font-mono">${r.heart_rate} bpm</td>
                <td class="font-mono">${r.blood_pressure} mmHg</td>
                <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                        <button class="btn btn-secondary btn-sm" onclick="openResidentModal('${r.id}')" style="font-size:12px; padding: 4px 10px;">🧬 健康画像</button>
                        <button class="btn btn-primary btn-sm" onclick="openDoctorImModal('${r.id}', '${r.name}', '${r.health_level}')" style="font-size:12px; padding: 4px 10px;">💬 发起 IM</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
    
    // 监听搜索输入与筛选切换
    const searchInput = document.getElementById("patient-search-input");
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = "true";
        searchInput.addEventListener("input", renderPatientsModule);
    }
    const levelFilter = document.getElementById("patient-level-filter");
    if (levelFilter && !levelFilter.dataset.bound) {
        levelFilter.dataset.bound = "true";
        levelFilter.addEventListener("change", renderPatientsModule);
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
    const tbody = document.getElementById("doctor-schemes-table-body");
    if (!tbody) return;
    
    if (state.schemes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--semi-color-text-2); padding: 24px;">暂无调理方案模板</td></tr>`;
        return;
    }
    
    tbody.innerHTML = state.schemes.map(s => {
        const typeMap = {
            "sleep": "💤 睡眠健康指导",
            "cardio": "❤️ 心血管主动干预",
            "pressure": "🧠 情绪与心理调理"
        };
        const direction = typeMap[s.report_type] || "🧬 主动健康调理";
        const nodeCount = s.nodes ? s.nodes.length : 0;
        
        // 随机一个 mock 累计下发套用次数
        const mockCount = (s.name.length * 7) % 40 + 5;
        const updatedAt = s.updated_at || "2026-06-30";
        
        return `
            <tr>
                <td class="font-mono" style="font-weight:700; color:var(--semi-color-text-2);">SCH_${s.id.substring(0, 5).toUpperCase()}</td>
                <td><span style="font-weight:600; color:var(--semi-color-text-0);">${s.name}</span></td>
                <td><span class="badge" style="background:rgba(0,102,255,0.08); color:#0066ff;">${nodeCount} 个步骤节点</span></td>
                <td>${direction}</td>
                <td class="font-mono">${mockCount} 次</td>
                <td style="color:var(--semi-color-text-2); font-size:12px;">${updatedAt}</td>
                <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; align-items:center; gap:12px;">
                        <span class="badge ${s.status === 'published' ? 'badge-primary' : 'badge-warning'}">
                            ${s.status === 'published' ? '已启用' : '草稿暂存'}
                        </span>
                        <label class="switch" style="margin:0;">
                            <input type="checkbox" ${s.status === 'published' ? 'checked' : ''} onchange="toggleSchemeStatus('${s.id}', this.checked)">
                            <span class="slider"></span>
                        </label>
                        <button class="btn btn-secondary btn-sm" onclick="openSchemeEditorModal('${s.id}')" style="font-size:12px; padding: 4px 10px;">⚙️ 定制编辑</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
    
    // 绑定顶部新建按钮
    const btnCreate = document.getElementById("btn-doc-create-scheme");
    if (btnCreate && !btnCreate.dataset.bound) {
        btnCreate.dataset.bound = "true";
        btnCreate.onclick = () => openSchemeEditorModal("NEW");
    }
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
