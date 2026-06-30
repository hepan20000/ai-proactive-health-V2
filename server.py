import http.server
import socketserver
import json
import urllib.parse
import os
import datetime

PORT = 8888
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
os.chdir(DIRECTORY)

# ==================== 内存数据存储 (Mock Data) ====================

# 1. 医生数据
doctors = [
    {
        "id": "doc_001",
        "name": "张仲景",
        "department": "中医内科",
        "title": "主任医师",
        "tags": ["体质调理", "脾胃调理", "经方调理"],
        "status": "approved",  # pending, approved, rejected, disabled
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
        "is_recommended": True
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
        "is_recommended": True
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
        "is_recommended": False
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
        "bio": "擅长四诊合参、望闻问切，专注亚健康主动筛查与干预。",
        "phone": "13800000004",
        "wechat": "bq_lookpulse",
        "privacy": {"phone": "self", "wechat": "self"},
        "weight": 5,
        "recommend_intro": "神医扁鹊，深谙治未病之理",
        "gender": "男",
        "age": 50,
        "source": "admin",
        "is_recommended": False
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
        "is_recommended": False
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
        "is_recommended": False
    }
]

# 2. 居民数据
residents = [
    {
        "id": "res_001",
        "name": "苏东坡",
        "age": 45,
        "gender": "男",
        "phone": "186****1089",
        "health_level": "red",  # green, yellow, red
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
        "device_power": 18,  # <20% 低电量
        "device_online": True
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
        "device_online": True
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
        "device_online": False  # 离线
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
        "device_power": 12,  # 低电量 + 在线
        "device_online": True
    }
]

# 3. 调理方案模板
schemes = [
    {
        "id": "sch_001",
        "name": "酸枣仁百合舒眠调理方案（基础版）",
        "report_type": "sleep",  # sleep, cardio, pressure
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
]

# 4. 服务包数据
service_packages = [
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
]

# 5. 药食同源商品
products = [
    {
        "id": "prod_001",
        "name": "野生酸枣仁茯苓百合安神茶 (20袋/盒)",
        "category": "茶类",
        "price": 68.00,
        "stock": 140,
        "status": "published",
        "desc": "优选太行山酸枣仁，茯苓，百合，科学配比，开水冲泡5分钟，助眠安神。",
        "image": "mock_assets/product_tea.png",
        "log": [
            {"time": "2026-06-24 09:30:00", "change": "+50", "operator": "管理员李明"}
        ]
    },
    {
        "id": "prod_002",
        "name": "低钠深海木耳片天然食疗款 (250g/袋)",
        "category": "膳类",
        "price": 38.00,
        "stock": 15,  # 低于20报警阈值
        "status": "published",
        "desc": "极低钠盐，含有丰富的多糖，适合脑血管病理人群和高血压膳食干预。",
        "image": "mock_assets/product_tea.png",
        "log": [
            {"time": "2026-06-23 11:20:00", "change": "-30", "operator": "管理员李明"}
        ]
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
]

# 6. CMS Banners
banners = [
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
]

# 7. 系统审计日志 (不可篡改)
audit_logs = [
    {"time": "2026-06-24 14:30:00", "user": "Admin(李明)", "action": "导出居民档案健康报表", "ip": "192.168.1.45"},
    {"time": "2026-06-24 14:10:00", "user": "Admin(李明)", "action": "修改方案模版 [情绪焦虑及高压自主调息方案] 保存草稿", "ip": "192.168.1.45"},
    {"time": "2026-06-24 12:00:00", "user": "Admin(李明)", "action": "发布新方案模版 [酸枣仁百合舒眠调理方案（基础版）]", "ip": "192.168.1.45"},
    {"time": "2026-06-24 10:00:00", "user": "Admin(李明)", "action": "设置医生 [张仲景] 推荐名医权重为 95", "ip": "192.168.1.45"},
    {"time": "2026-06-24 09:30:00", "user": "Admin(李明)", "action": "录入药食同源商品 [野生酸枣仁茯苓百合安神茶] 库存 +50", "ip": "192.168.1.45"}
]

# 8. 子账号管理 (客服与运营账号)
sub_accounts = [
    {"username": "kefu_01", "nickname": "小雅", "role": "kefu", "status": "active", "created_at": "2026-06-10"},
    {"username": "kefu_02", "nickname": "阿杰", "role": "kefu", "status": "active", "created_at": "2026-06-12"},
    {"username": "ops_01", "nickname": "运营张三", "role": "ops", "status": "active", "created_at": "2026-06-15"},
    {"username": "ops_02", "nickname": "运营李四", "role": "ops", "status": "active", "created_at": "2026-06-18"}
]

# 9. 机构资料
agency_info = {
    "name": "益康智慧主动健康管理中心",
    "logo": "mock_assets/agency_logo.png",
    "phone": "400-888-9999",
    "area": "广东省深圳市南山区高新园",
    "desc": "致力于将智能穿戴大数据与现代中医主动干预完美融合的健康服务机构。"
}

# 10. 费率与分佣配置 (多机构支持)
agencies_commissions = [
    {"id": "ag_001", "name": "益康智慧主动健康管理中心", "subscription_fee": 9800.00, "product_commission": 15.0, "service_commission": 20.0},
    {"id": "ag_002", "name": "杏林春暖慢病调理诊所", "subscription_fee": 8500.00, "product_commission": 12.0, "service_commission": 18.0},
    {"id": "ag_003", "name": "智慧社区治未病服务驿站", "subscription_fee": 5000.00, "product_commission": 10.0, "service_commission": 15.0}
]

# ==================== 请求处理器 ====================

class MockAPIRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 允许跨域
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # 静默后台请求输出，使控制台清爽
        return

    def write_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        payload = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def read_post_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length)
        return json.loads(body.decode('utf-8'))

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        # -------------------- API 路由 --------------------
        if path.startswith('/api/'):
            self.handle_api_get(path, query)
        else:
            # -------------------- 静态文件分发 --------------------
            # 默认为 index.html
            if path == '/':
                self.path = '/index.html'
            
            # 手动控制 Content-Type，避免某些操作系统 mime 类型错误导致解析异常
            super().do_GET()

    def handle_api_get(self, path, query):
        global doctors, residents, schemes, service_packages, products, banners, audit_logs, sub_accounts, agency_info

        # 1. 业务大屏接口 (M07)
        if path == '/api/dashboard':
            # 近7日警情趋势数据
            chart_7days = {
                "labels": ["6-18", "6-19", "6-20", "6-21", "6-22", "6-23", "6-24"],
                "sleep": [12, 19, 15, 8, 22, 10, 14],
                "cardio": [8, 12, 18, 24, 15, 20, 25],
                "pressure": [15, 10, 14, 18, 9, 12, 8]
            }
            # 医生绩效榜
            doc_perf = []
            for doc in [d for d in doctors if d["status"] == "approved"]:
                # 简单计算或返回一些假数据
                doc_perf.append({
                    "name": doc["name"],
                    "title": doc["title"],
                    "interventions": doc["residents_count"] * 3 + 12,
                    "schemes_sent": doc["residents_count"] * 2 + 5,
                    "avg_response": "8.5分钟" if doc["name"] == "张仲景" else "12.2分钟",
                    "rating": 4.9 if doc["name"] == "张仲景" else 4.7
                })
            
            # 汇总核心数据
            total_residents = len(residents)
            online_devices = len([r for r in residents if r["device_online"]])
            low_power_devices = len([r for r in residents if r["device_power"] < 20])
            active_warnings = len([r for r in residents if r["health_level"] == "red"])

            dashboard_data = {
                "kpis": {
                    "residents_total": total_residents,
                    "residents_growth": "+12.5%",
                    "online_devices": online_devices,
                    "active_warnings": active_warnings,
                    "sales_total": sum([s["sales"] for s in service_packages]),
                    "revenue_total": sum([s["revenue"] for s in service_packages])
                },
                "warnings_ratio": {
                    "sleep": 35,
                    "cardio": 45,
                    "pressure": 20
                },
                "chart_7days": chart_7days,
                "doctors_performance": sorted(doc_perf, key=lambda x: x["interventions"], reverse=True),
                "device_status": {
                    "online": online_devices,
                    "offline": total_residents - online_devices,
                    "low_power": low_power_devices
                }
            }
            self.write_json(dashboard_data)

        # 2. 医生审批与已入驻医生 (M01 & M06权重)
        elif path == '/api/doctors':
            status_filter = query.get('status', [None])[0]
            if status_filter:
                filtered_docs = [d for d in doctors if d["status"] == status_filter]
            else:
                filtered_docs = doctors
            
            # 按权重降序排序（以便名医推荐联动）
            sorted_docs = sorted(filtered_docs, key=lambda x: x.get("weight", 0), reverse=True)
            self.write_json(sorted_docs)

        # 3. 居民队列及画像 (M02)
        elif path == '/api/residents':
            # 返回所有居民，高危(red)置顶，然后按最后联系时间降序
            level_map = {"red": 0, "yellow": 1, "green": 2}
            sorted_res = sorted(residents, key=lambda x: (level_map.get(x["health_level"], 3), x["last_contact"]), reverse=True)
            self.write_json(sorted_res)

        elif path == '/api/residents/portrait':
            res_id = query.get('id', [None])[0]
            resident_obj = next((r for r in residents if r["id"] == res_id), None)
            if resident_obj:
                # 模拟产生30天体征趋势折线图数据
                trend_labels = [f"6-{(i+24-30):02d}" for i in range(30)] if datetime.datetime.now().day >= 24 else [f"6-{i:02d}" for i in range(1, 25)]
                # 为心率和血氧生成一些波动值
                hr_trend = [resident_obj["heart_rate"] + (i % 5 - 2) for i in range(30)]
                ox_trend = [resident_obj["blood_oxygen"] if i % 6 != 0 else resident_obj["blood_oxygen"] - 1 for i in range(30)]
                
                portrait_data = {
                    "resident": resident_obj,
                    "trends": {
                        "labels": trend_labels,
                        "heart_rate": hr_trend,
                        "blood_oxygen": ox_trend
                    },
                    "warning_history": [
                        {"time": "2026-06-24 08:30:00", "type": "心脑血管风险", "detail": f"瞬时心率达 {resident_obj['heart_rate']}次/分，伴血压高位波动", "status": "未处理"},
                        {"time": "2026-06-22 23:45:00", "type": "重度睡眠呼吸暂停", "detail": "血氧饱和度持续3分钟低于 90%", "status": "已处理"}
                    ]
                }
                self.write_json(portrait_data)
            else:
                self.write_json({"error": "Resident not found"}, 404)

        # 4. 方案维护列表 (M03)
        elif path == '/api/schemes':
            self.write_json(schemes)

        # 5. 调理服务包 (M04)
        elif path == '/api/service-packages':
            self.write_json(service_packages)

        # 6. 商品列表 (M05)
        elif path == '/api/products':
            self.write_json(products)

        # 7. Banner (M06)
        elif path == '/api/cms/banners':
            self.write_json(banners)

        # 8. 操作审计日志 (M09)
        elif path == '/api/system/logs':
            search_query = query.get('q', [None])[0]
            if search_query:
                filtered_logs = [l for l in audit_logs if search_query in l["action"] or search_query in l["user"]]
            else:
                filtered_logs = audit_logs
            self.write_json(filtered_logs)

        # 9. 客服账号与机构资料 (M09)
        elif path == '/api/system/settings':
            self.write_json({
                "agency": agency_info,
                "sub_accounts": sub_accounts,
                "commissions": agencies_commissions
            })
        else:
            self.write_json({"error": "Endpoint not found"}, 404)

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path.startswith('/api/'):
            try:
                body = self.read_post_body()
                self.handle_api_post(path, body)
            except Exception as e:
                self.write_json({"error": f"Bad Request: {str(e)}"}, 400)
        else:
            self.write_json({"error": "Method Not Allowed"}, 405)

    def handle_api_post(self, path, body):
        global doctors, residents, schemes, service_packages, products, banners, audit_logs, sub_accounts, agency_info

        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. 医生审核及禁用控制 (M01)
        if path == '/api/doctors/approve':
            doc_id = body.get("id")
            action = body.get("action")  # approved, rejected, disabled
            reason = body.get("reason", "")

            doc = next((d for d in doctors if d["id"] == doc_id), None)
            if doc:
                old_status = doc["status"]
                doc["status"] = action
                action_text = "审批通过" if action == "approved" else ("审批驳回" if action == "rejected" else "账户禁用/启用变更")
                
                # 记录审计日志
                log_entry = {
                    "time": current_time,
                    "user": "Admin(李明)",
                    "action": f"{action_text} 医生 [{doc['name']}] (原因: {reason if reason else '无'})",
                    "ip": "192.168.1.45"
                }
                audit_logs.insert(0, log_entry)
                self.write_json({"success": True, "doctor": doc})
            else:
                self.write_json({"error": "Doctor not found"}, 404)

        # 2. 直加医生 (M01)
        elif path == '/api/doctors/add':
            new_id = f"doc_{len(doctors) + 1:03d}"
            new_doc = {
                "id": new_id,
                "name": body.get("name", "未命名"),
                "department": body.get("department", "治未病科"),
                "title": body.get("title", "主治医师"),
                "tags": body.get("tags", []),
                "status": "approved",
                "residents_count": 0,
                "last_intervention": "",
                "avatar": f"https://api.dicebear.com/7.x/adventurer/svg?seed={new_id}",
                "bio": body.get("bio", "暂无简介。"),
                "phone": body.get("phone", ""),
                "wechat": body.get("wechat", ""),
                "privacy": {"phone": "admin", "wechat": "admin"},
                "weight": 50,
                "recommend_intro": body.get("recommend_intro", "优秀入驻医师"),
                "gender": body.get("gender", "男"),
                "age": int(body.get("age", 40)),
                "source": "admin"
            }
            doctors.append(new_doc)

            # 审计日志
            log_entry = {
                "time": current_time,
                "user": "Admin(李明)",
                "action": f"机构直加并激活医生 [{new_doc['name']}] 账号 (来源: 后台添加)",
                "ip": "192.168.1.45"
            }
            audit_logs.insert(0, log_entry)
            self.write_json({"success": True, "doctor": new_doc})

        # 3. 方案维护 (M03)
        elif path == '/api/schemes/save':
            scheme_id = body.get("id")
            name = body.get("name")
            report_type = body.get("report_type")
            nodes = body.get("nodes", [])
            associated_products = body.get("products", [])
            status = body.get("status", "draft")

            # 区分编辑和创建
            if scheme_id:
                scheme = next((s for s in schemes if s["id"] == scheme_id), None)
                if scheme:
                    scheme.update({
                        "name": name,
                        "report_type": report_type,
                        "nodes": nodes,
                        "products": associated_products,
                        "status": status,
                        "updated_at": current_time
                    })
                    action_txt = f"修改方案模版 [{name}] 并标记为 {status}"
                else:
                    self.write_json({"error": "Scheme not found"}, 404)
                    return
            else:
                scheme_id = f"sch_{len(schemes) + 1:03d}"
                scheme = {
                    "id": scheme_id,
                    "name": name,
                    "report_type": report_type,
                    "nodes": nodes,
                    "products": associated_products,
                    "status": status,
                    "updated_at": current_time
                }
                schemes.append(scheme)
                action_txt = f"新建方案模版 [{name}] 状态为 {status}"

            # 审计日志
            log_entry = {
                "time": current_time,
                "user": "Admin(李明)",
                "action": action_txt,
                "ip": "192.168.1.45"
            }
            audit_logs.insert(0, log_entry)
            self.write_json({"success": True, "scheme": scheme})

        # 4. 服务包维护 (M04)
        elif path == '/api/service-packages/save':
            pkg_id = body.get("id")
            name = body.get("name")
            period = body.get("period")
            price = float(body.get("price", 0))
            desc = body.get("desc", "")
            status = body.get("status", "draft")

            if pkg_id:
                pkg = next((p for p in service_packages if p["id"] == pkg_id), None)
                if pkg:
                    pkg.update({
                        "name": name,
                        "period": period,
                        "price": price,
                        "desc": desc,
                        "status": status
                    })
                    action_txt = f"修改服务包 [{name}] 状态为 {status}"
                else:
                    self.write_json({"error": "Package not found"}, 404)
                    return
            else:
                pkg_id = f"pkg_{len(service_packages) + 1:03d}"
                pkg = {
                    "id": pkg_id,
                    "name": name,
                    "period": period,
                    "price": price,
                    "desc": desc,
                    "status": status,
                    "products_count": 0,
                    "sales": 0,
                    "revenue": 0.00,
                    "conv_rate": 0.0
                }
                service_packages.append(pkg)
                action_txt = f"新建服务包 [{name}]"

            log_entry = {
                "time": current_time,
                "user": "Admin(李明)",
                "action": action_txt,
                "ip": "192.168.1.45"
            }
            audit_logs.insert(0, log_entry)
            self.write_json({"success": True, "package": pkg})

        # 5. 商品库存与信息修改 (M05)
        elif path == '/api/products/save':
            prod_id = body.get("id")
            name = body.get("name")
            category = body.get("category")
            price = float(body.get("price", 0))
            stock = int(body.get("stock", 0))
            status = body.get("status", "published")

            prod = next((p for p in products if p["id"] == prod_id), None)
            if prod:
                stock_diff = stock - prod["stock"]
                old_name = prod["name"]
                
                prod.update({
                    "name": name,
                    "category": category,
                    "price": price,
                    "stock": stock,
                    "status": status
                })
                
                if stock_diff != 0:
                    diff_sign = f"+{stock_diff}" if stock_diff > 0 else f"{stock_diff}"
                    prod["log"].insert(0, {
                        "time": current_time,
                        "change": diff_sign,
                        "operator": "管理员李明"
                    })
                    action_txt = f"调整商品 [{name}] 库存: {diff_sign} (当前库存 {stock})"
                else:
                    action_txt = f"修改商品 [{name}] 信息与状态"
                
                log_entry = {
                    "time": current_time,
                    "user": "Admin(李明)",
                    "action": action_txt,
                    "ip": "192.168.1.45"
                }
                audit_logs.insert(0, log_entry)
                self.write_json({"success": True, "product": prod})
            else:
                self.write_json({"error": "Product not found"}, 404)

        # 6. CMS Banners / 推荐权重 (M06)
        elif path == '/api/cms/recommend-doctors':
            doc_id = body.get("id")
            weight = int(body.get("weight", 0))
            intro = body.get("recommend_intro", "")
            is_recommended = body.get("is_recommended", True)

            doc = next((d for d in doctors if d["id"] == doc_id), None)
            if doc:
                old_rec = doc.get("is_recommended", False)
                doc["weight"] = weight
                doc["recommend_intro"] = intro
                doc["is_recommended"] = is_recommended
                
                if not is_recommended:
                    action_txt = f"取消医生 [{doc['name']}] 的主页推荐"
                elif not old_rec:
                    action_txt = f"添加医生 [{doc['name']}] 至主页推荐列表并设定权重为 {weight}"
                else:
                    action_txt = f"调整名医 [{doc['name']}] 推荐权重分至 {weight}，宣传语: {intro}"

                log_entry = {
                    "time": current_time,
                    "user": "Admin(李明)",
                    "action": action_txt,
                    "ip": "192.168.1.45"
                }
                audit_logs.insert(0, log_entry)
                self.write_json({"success": True, "doctor": doc})
            else:
                self.write_json({"error": "Doctor not found"}, 404)

        elif path == '/api/cms/banners/save':
            ban_id = body.get("id")
            title = body.get("title", "未命名广告")
            url = body.get("url", "")
            status = body.get("status", "on")
            image = body.get("image", "mock_assets/banner_health.png")

            if ban_id:
                ban = next((b for b in banners if b["id"] == ban_id), None)
                if ban:
                    ban.update({
                        "title": title,
                        "url": url,
                        "status": status
                    })
                    action_txt = f"更新 Banner 广告位 [{title}] 状态为 {status}"
                else:
                    self.write_json({"error": "Banner not found"}, 404)
                    return
            else:
                ban_id = f"ban_{len(banners) + 1:03d}"
                ban = {
                    "id": ban_id,
                    "title": title,
                    "image": image,
                    "url": url,
                    "status": status,
                    "sort": len(banners) + 1,
                    "start_time": datetime.datetime.now().strftime("%Y-%m-%d"),
                    "end_time": (datetime.datetime.now() + datetime.timedelta(days=90)).strftime("%Y-%m-%d")
                }
                banners.append(ban)
                action_txt = f"新增 Banner 广告位 [{title}]"

            log_entry = {
                "time": current_time,
                "user": "Admin(李明)",
                "action": action_txt,
                "ip": "192.168.1.45"
            }
            audit_logs.insert(0, log_entry)
            self.write_json({"success": True, "banner": ban})

        # 7. 设备绑定与离线告警 (M08)
        elif path == '/api/devices/change':
            imei = body.get("imei")
            action = body.get("action")  # e.g., restart, ping
            
            res_obj = next((r for r in residents if r["device_imei"] == imei), None)
            if res_obj:
                action_txt = f"对设备 [{imei}] 发起 {action} 指令"
                log_entry = {
                    "time": current_time,
                    "user": "Admin(李明)",
                    "action": action_txt,
                    "ip": "192.168.1.45"
                }
                audit_logs.insert(0, log_entry)
                self.write_json({"success": True, "imei": imei})
            else:
                self.write_json({"error": "Device not found"}, 404)

        # 8. 机构资料及子账号 (M09)
        elif path == '/api/system/settings/save-agency':
            agency_info.update({
                "name": body.get("name", agency_info["name"]),
                "phone": body.get("phone", agency_info["phone"]),
                "area": body.get("area", agency_info["area"]),
                "desc": body.get("desc", agency_info["desc"])
            })
            log_entry = {
                "time": current_time,
                "user": "Admin(李明)",
                "action": "修改并保存机构基础信息",
                "ip": "192.168.1.45"
            }
            audit_logs.insert(0, log_entry)
            self.write_json({"success": True, "agency": agency_info})

        elif path == '/api/system/settings/save-commission':
            agency_id = body.get("id")
            agency = next((a for a in agencies_commissions if a["id"] == agency_id), None)
            if agency:
                agency.update({
                    "subscription_fee": float(body.get("subscription_fee", agency["subscription_fee"])),
                    "product_commission": float(body.get("product_commission", agency["product_commission"])),
                    "service_commission": float(body.get("service_commission", agency["service_commission"]))
                })
                log_entry = {
                    "time": current_time,
                    "user": "Admin(李明)",
                    "action": f"修改机构 [{agency['name']}] 费率配置：年费 {agency['subscription_fee']} 元/年，商品分佣 {agency['product_commission']}%，服务分佣 {agency['service_commission']}%",
                    "ip": "192.168.1.45"
                }
                audit_logs.insert(0, log_entry)
                self.write_json({"success": True, "agency": agency})
            else:
                self.write_json({"error": "Agency not found"}, 404)

        elif path == '/api/system/settings/add-account':
            username = body.get("username")
            nickname = body.get("nickname")
            role = body.get("role", "kefu")
            phone = body.get("phone", "")
            email = body.get("email", "")
            password = body.get("password", "123456")
            
            if any(a["username"] == username for a in sub_accounts):
                self.write_json({"error": "Username already exists"}, 400)
                return
            
            new_acc = {
                "username": username,
                "nickname": nickname,
                "role": role,
                "phone": phone,
                "email": email,
                "password": password,
                "status": "active",
                "created_at": datetime.datetime.now().strftime("%Y-%m-%d")
            }
            sub_accounts.append(new_acc)
            role_text = "客服" if role == "kefu" else "运营"
            log_entry = {
                "time": current_time,
                "user": "Admin(李明)",
                "action": f"创建子账号 [{username}] (角色: {role_text}, 手机: {phone})",
                "ip": "192.168.1.45"
            }
            audit_logs.insert(0, log_entry)
            self.write_json({"success": True, "account": new_acc})

        else:
            self.write_json({"error": "Endpoint not found"}, 404)

# ==================== 启动服务器 ====================

def run():
    # 强制切换当前路径为 server.py 所在目录，保证静态文件定位准确
    os.chdir(DIRECTORY)
    
    # 开启重用端口，防止频繁调试出现端口占用错误
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), MockAPIRequestHandler) as httpd:
        print(f"🚀 主动健康管理机构端 API & 静态服务已启动")
        print(f"🔗 本地地址: http://localhost:{PORT}")
        print(f"📂 根目录: {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 服务已停止。")

if __name__ == '__main__':
    run()
