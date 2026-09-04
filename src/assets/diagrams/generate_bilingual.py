"""Generate bilingual architecture diagrams (EN & ES) for portfolio projects.
Formal, minimalist, non-neon styling following visual argument design principles.
Zero '//' slashes, zero neon glow, zero skill branding.
Accurate to real project codebases in XAMPP_BACKUP.
"""
import json
import subprocess
from pathlib import Path

DIAGRAMS_DIR = Path("/home/cantarero/Proyectos/XAMPP_BACKUP/Portfolio Edu/src/assets/diagrams")
PUBLIC_DIR = Path("/home/cantarero/Proyectos/XAMPP_BACKUP/Portfolio Edu/public/diagrams")
SKILL_DIR = Path("/home/cantarero/.gemini/config/skills/excalidraw-diagram/references")
RENDER_SCRIPT = SKILL_DIR / "render_excalidraw.py"

class DiagramBuilder:
    def __init__(self, title, subtitle):
        self.elements = []
        self.seed_counter = 10000
        self.title = title
        self.subtitle = subtitle
        self.setup_header()

    def seed(self):
        self.seed_counter += 1
        return self.seed_counter

    def setup_header(self):
        self.add_text("main_title", 20, 20, 980, 28, self.title, size=17, color="#f8fafc", align="center")
        self.add_text("sub_title", 20, 50, 980, 18, self.subtitle, size=11.5, color="#94a3b8", align="center")

    def add_rect(self, id_, x, y, w, h, stroke="#334155", bg="#131b2c", text=None, text_size=11, text_color="#f1f5f9", roundness=2, stroke_width=1):
        r = {
            "type": "rectangle",
            "id": id_,
            "x": x, "y": y, "width": w, "height": h,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": "solid",
            "strokeWidth": stroke_width,
            "strokeStyle": "solid",
            "roughness": 0,
            "opacity": 100,
            "angle": 0,
            "seed": self.seed(),
            "version": 1,
            "versionNonce": self.seed(),
            "isDeleted": False,
            "groupIds": [],
            "boundElements": [],
            "link": None,
            "locked": False,
            "roundness": {"type": roundness}
        }
        self.elements.append(r)
        if text:
            lines = text.split("\n")
            line_h = text_size * 1.35
            total_text_h = len(lines) * line_h
            start_y = y + (h - total_text_h) / 2
            t_id = f"{id_}_text"
            r["boundElements"] = [{"id": t_id, "type": "text"}]
            t = {
                "type": "text",
                "id": t_id,
                "x": x + 6,
                "y": start_y,
                "width": w - 12,
                "height": total_text_h,
                "text": text,
                "originalText": text,
                "fontSize": text_size,
                "fontFamily": 3,
                "textAlign": "center",
                "verticalAlign": "middle",
                "strokeColor": text_color,
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "strokeStyle": "solid",
                "roughness": 0,
                "opacity": 100,
                "angle": 0,
                "seed": self.seed(),
                "version": 1,
                "versionNonce": self.seed(),
                "isDeleted": False,
                "groupIds": [],
                "boundElements": None,
                "link": None,
                "locked": False,
                "containerId": id_,
                "lineHeight": 1.25
            }
            self.elements.append(t)

    def add_text(self, id_, x, y, w, h, text, size=13, color="#94a3b8", align="left"):
        t = {
            "type": "text",
            "id": id_,
            "x": x, "y": y,
            "width": w, "height": h,
            "text": text,
            "originalText": text,
            "fontSize": size,
            "fontFamily": 3,
            "textAlign": align,
            "verticalAlign": "top",
            "strokeColor": color,
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeStyle": "solid",
            "roughness": 0,
            "opacity": 100,
            "angle": 0,
            "seed": self.seed(),
            "version": 1,
            "versionNonce": self.seed(),
            "isDeleted": False,
            "groupIds": [],
            "boundElements": None,
            "link": None,
            "locked": False,
            "containerId": None,
            "lineHeight": 1.25
        }
        self.elements.append(t)

    def add_arrow(self, id_, start_id, end_id, points, stroke="#475569", label=None):
        start_pt = points[0]
        end_pt = points[-1]
        a = {
            "type": "arrow",
            "id": id_,
            "x": start_pt[0], "y": start_pt[1],
            "width": end_pt[0] - start_pt[0], "height": end_pt[1] - start_pt[1],
            "strokeColor": stroke,
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 1.5,
            "strokeStyle": "solid",
            "roughness": 0,
            "opacity": 100,
            "angle": 0,
            "seed": self.seed(),
            "version": 1,
            "versionNonce": self.seed(),
            "isDeleted": False,
            "groupIds": [],
            "boundElements": None,
            "link": None,
            "locked": False,
            "points": [[p[0] - start_pt[0], p[1] - start_pt[1]] for p in points],
            "startBinding": {"elementId": start_id, "focus": 0, "gap": 4} if start_id else None,
            "endBinding": {"elementId": end_id, "focus": 0, "gap": 4} if end_id else None,
            "startArrowhead": None,
            "endArrowhead": "arrow"
        }
        self.elements.append(a)
        if label:
            dx = abs(end_pt[0] - start_pt[0])
            dy = abs(end_pt[1] - start_pt[1])
            if dx > 40:
                mid_x = (start_pt[0] + end_pt[0]) / 2 - 45
                mid_y = min(start_pt[1], end_pt[1]) - 16
                self.add_text(f"{id_}_lbl", mid_x, mid_y, 90, 15, label, size=9.5, color="#94a3b8", align="center")

    def add_code_artifact(self, id_, x, y, w, h, title, lines, stroke="#1e293b", title_color="#38bdf8"):
        self.add_rect(id_, x, y, w, h, stroke=stroke, bg="#0a0e17", roundness=2, stroke_width=1)
        self.add_text(f"{id_}_title", x, y + 10, w, 16, title, size=10, color=title_color, align="center")
        self.elements.append({
            "type": "line",
            "id": f"{id_}_div",
            "x": x + 8, "y": y + 28,
            "width": w - 16, "height": 0,
            "strokeColor": "#1e293b",
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeStyle": "solid",
            "roughness": 0,
            "opacity": 100,
            "angle": 0,
            "seed": self.seed(),
            "version": 1,
            "versionNonce": self.seed(),
            "isDeleted": False,
            "groupIds": [],
            "boundElements": None,
            "link": None,
            "locked": False,
            "points": [[0, 0], [w - 16, 0]]
        })
        curr_y = y + 36
        for idx, (line_text, color) in enumerate(lines):
            self.add_text(f"{id_}_ln_{idx}", x + 12, curr_y, w - 24, 15, line_text, size=9.5, color=color)
            curr_y += 18

    def save(self, filename):
        data = {
            "type": "excalidraw",
            "version": 2,
            "source": "https://excalidraw.com",
            "elements": self.elements,
            "appState": {
                "viewBackgroundColor": "#0b0f19",
                "gridSize": 20
            },
            "files": {}
        }
        dest = DIAGRAMS_DIR / filename
        dest.write_text(json.dumps(data, indent=2), encoding="utf-8")
        pub_dest = PUBLIC_DIR / filename
        pub_dest.write_text(json.dumps(data, indent=2), encoding="utf-8")
        print(f"Saved: {dest} ({len(self.elements)} elements)")
        return dest

def build_elite_performance(lang="en"):
    if lang == "es":
        title = "ELITE PERFORMANCE — TELEMETRÍA BIOMÉTRICA & COACHING IA"
        sub = "Ingesta de wearables hacia Supabase RLS, inferencia Gemini AI y panel concurrente React 19 a 60 FPS."
        s1 = "[01] INGESTA DE WEARABLES"
        s2 = "[02] API EXPRESS & BÓVEDA RLS"
        s3 = "[03] GEMINI AI & UI REACT 19"
        code1_title = "[PAQUETE DE INGESTA WEARABLE]"
        code2_title = "[POLÍTICA RLS POSTGRESQL]"
        code3_title = "[PROMPT DE COACHING GEMINI]"
        api_text = "Gateway Express / TypeScript\nValidación y Limitador de Tasa"
        db_text = "Supabase PostgreSQL\nUpsert Atómico y Series Temporales"
        ai_text = "Google Gemini API\nAnálisis y Recomendaciones de Carga"
        ui_text = "React 19 / Motion Client\nDashboard Biométrico a 60 FPS"
    else:
        title = "ELITE PERFORMANCE — BIO-TELEMETRY & AI COACHING PIPELINE"
        sub = "Wearable ingestion into Supabase RLS vault, Gemini AI inference, and 60 FPS React 19 concurrent dashboard."
        s1 = "[01] WEARABLE INGESTION"
        s2 = "[02] EXPRESS API & RLS VAULT"
        s3 = "[03] GEMINI AI & REACT 19 UI"
        code1_title = "[WEARABLE INGEST PACKET]"
        code2_title = "[POSTGRESQL RLS POLICY]"
        code3_title = "[GEMINI COACHING PROMPT]"
        api_text = "Express / TypeScript Gateway\nRate Limiter & Schema Validator"
        db_text = "Supabase PostgreSQL\nAtomic Timeseries Upsert"
        ai_text = "Google Gemini API\nRecovery & Biometric Conditioning"
        ui_text = "React 19 / Motion Client\n60 FPS Biometric Dashboard"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("whoop", 60, 140, 190, 42, stroke="#334155", bg="#131b2c", text="Whoop 4.0 (HRV & Strain)", text_size=10.5, text_color="#f1f5f9")
    b.add_rect("garmin", 60, 195, 190, 42, stroke="#334155", bg="#131b2c", text="Garmin Edge (VO2 & Power)", text_size=10.5, text_color="#f1f5f9")
    b.add_rect("apple", 60, 250, 190, 42, stroke="#334155", bg="#131b2c", text="Apple Health (Daily Activity)", text_size=10.5, text_color="#f1f5f9")
    b.add_code_artifact(
        "payload1", 55, 310, 200, 185,
        code1_title,
        [
            ("{", "#94a3b8"),
            ("  athlete_id: \"ep_u982\",", "#94a3b8"),
            ("  hrv_rmssd: 78.4,", "#10b981"),
            ("  vo2_current: 56.2,", "#38bdf8"),
            ("  strain_score: 14.8,", "#fbbf24"),
            ("  rpe_session: 8.5", "#cbd5e1"),
            ("}", "#94a3b8")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#10b981", align="center")
    b.add_rect("api", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=api_text, text_size=10.5, text_color="#f1f5f9")
    b.add_rect("db", 325, 240, 230, 48, stroke="#334155", bg="#131b2c", text=db_text, text_size=10.5, text_color="#f1f5f9")
    b.add_code_artifact(
        "sql1", 320, 310, 240, 185,
        code2_title,
        [
            ("CREATE POLICY isolate_biometrics", "#38bdf8"),
            ("ON athlete_telemetry", "#f1f5f9"),
            ("FOR SELECT USING (", "#94a3b8"),
            ("  auth.uid() = athlete_id", "#6366f1"),
            ("); -- Absolute privacy isolation", "#64748b"),
            ("LOCK MODE = ROW EXCLUSIVE;", "#10b981")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#6366f1", align="center")
    b.add_rect("gemini", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=ai_text, text_size=10.5, text_color="#f1f5f9")
    b.add_rect("client", 630, 240, 230, 48, stroke="#334155", bg="#131b2c", text=ui_text, text_size=10.5, text_color="#f1f5f9")
    b.add_code_artifact(
        "client_code", 625, 310, 240, 185,
        code3_title,
        [
            ("const model = genAI.getModel({", "#38bdf8"),
            ("  model: \"gemini-2.5-flash\"", "#10b981"),
            ("});", "#38bdf8"),
            ("const plan = await model.generate({", "#f1f5f9"),
            ("  prompt: buildCoachPrompt(stats)", "#fbbf24"),
            ("}); -- Instant athletic insights", "#64748b")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("perf_card", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("perf_t", 925, 108, 105, 16, "[MÉTRICAS KPI]" if lang == "es" else "[KPI METRICS]", size=11, color="#94a3b8")
    b.add_rect("kpi1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="60 FPS\nUI Steady\nState", text_size=10, text_color="#10b981")
    b.add_rect("kpi2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="< 3ms\nClient State\nLatency", text_size=10, text_color="#38bdf8")
    b.add_rect("kpi3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="100%\nRLS Vault\nIsolated", text_size=10, text_color="#6366f1")
    b.add_rect("kpi4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="18 KB\nTailwind v4\nBundle", text_size=10, text_color="#fbbf24")

    b.add_arrow("a1", "whoop", "api", [[250, 161], [325, 161]], stroke="#475569")
    b.add_arrow("a2", "garmin", "api", [[250, 216], [285, 216], [285, 175], [325, 175]], stroke="#475569")
    b.add_arrow("a3", "apple", "api", [[250, 271], [295, 271], [295, 185], [325, 185]], stroke="#475569")
    b.add_arrow("a4", "api", "db", [[440, 193], [440, 240]], stroke="#38bdf8", label="INSERT")
    b.add_arrow("a5", "db", "gemini", [[555, 264], [590, 264], [590, 169], [630, 169]], stroke="#6366f1", label="AI Context")
    b.add_arrow("a6", "gemini", "client", [[745, 193], [745, 240]], stroke="#10b981", label="Stream UI")

    suffix = f"-{lang}"
    fn = f"01-elite-performance{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("01-elite-performance.excalidraw")
    return res

def build_banco_sangre(lang="en"):
    if lang == "es":
        title = "BANCO DE SANGRE — CONCURRENCIA ACID & ERP MULTI-ESQUEMA"
        sub = "Aislamiento SERIALIZABLE para hemoderivados, arquitectura de Repositorios Laravel y control de cadena de frío."
        s1 = "[01] CLÍNICA & INGRESO DONANTES"
        s2 = "[02] SERVICIO LARAVEL & REPOSITORIOS"
        s3 = "[03] POSTGRESQL MULTI-ESQUEMA"
        code1_title = "[SOLICITUD DE EMERGENCIA O-]"
        code2_title = "[TRANSACCIÓN SERIALIZABLE]"
        code3_title = "[TRIGGER CADENA DE FRÍO]"
        cli_t = "Clínicas & Hospitales\nSolicitud de Emergencia O-"
        don_t = "Portal Donantes (Vue 3 + CASL)\nTriaje Médico y Agendamiento"
        mon_t = "Sensores de Crioconservación\nTelemetría de Frío a -80°C"
        ngx_t = "Nginx Reverse Proxy\nTerminación SSL & Limitador"
        lar_t = "Laravel 10 Core API\nPatrón Service & Repository"
        red_t = "Redis Queue Worker\nAlertas y Despacho Asíncrono"
        pg_t = "PostgreSQL Multi-Esquema\ninventario, ventas, rrhh, contab."
        val_t = "Control de Caducidad & Kardex\nCero Doble Asignación"
    else:
        title = "BANCO DE SANGRE — ACID CONCURRENCY & MULTI-SCHEMA ERP"
        sub = "SERIALIZABLE isolation for blood components, Laravel Repository architecture, and cold-chain monitoring."
        s1 = "[01] CLINICAL & DONOR INTAKE"
        s2 = "[02] LARAVEL CORE & REPOSITORIES"
        s3 = "[03] MULTI-SCHEMA POSTGRESQL"
        code1_title = "[EMERGENCY O- BLOOD REQUEST]"
        code2_title = "[SERIALIZABLE TRANSACTION]"
        code3_title = "[COLD-CHAIN TRIGGER]"
        cli_t = "Emergency Clinics\nSimultaneous O- Negative Demands"
        don_t = "Donor Portal (Vue 3 + CASL)\nTriage & Medical Appointments"
        mon_t = "Cryo-Sensors Telemetry\n-80°C Cold Chain Tracking"
        ngx_t = "Nginx Reverse Proxy\nSSL Termination & Rate Limit"
        lar_t = "Laravel 10 Core API\nService & Repository Layer"
        red_t = "Redis Queue Worker\nAsync Email & Medical Dispatch"
        pg_t = "Multi-Schema PostgreSQL\ninventario, ventas, rrhh, contab."
        val_t = "Kardex & Expiration Trigger\nZero Double-Allocation Guard"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("c1", 60, 140, 190, 42, stroke="#334155", bg="#131b2c", text=cli_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("c2", 60, 195, 190, 42, stroke="#334155", bg="#131b2c", text=don_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("c3", 60, 250, 190, 42, stroke="#334155", bg="#131b2c", text=mon_t, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "payload2", 55, 310, 200, 185,
        code1_title,
        [
            ("{", "#94a3b8"),
            ("  \"blood_group\": \"O-\",", "#f43f5e"),
            ("  \"units_req\": 2,", "#fbbf24"),
            ("  \"hospital_id\": \"hosp_99\",", "#38bdf8"),
            ("  \"priority\": \"CRITICAL_STAT\"", "#ef4444"),
            ("}", "#94a3b8")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("nginx", 325, 138, 230, 40, stroke="#334155", bg="#131b2c", text=ngx_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("laravel", 325, 195, 230, 45, stroke="#334155", bg="#131b2c", text=lar_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("redis", 325, 255, 230, 40, stroke="#334155", bg="#131b2c", text=red_t, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "sql2", 320, 310, 240, 185,
        code2_title,
        [
            ("BEGIN TRANSACTION ISOLATION LEVEL", "#6366f1"),
            ("  SERIALIZABLE; -- No phantoms", "#64748b"),
            ("SELECT * FROM inventario.blood_units", "#38bdf8"),
            ("WHERE group='O-' AND status='AVAIL'", "#f1f5f9"),
            ("FOR UPDATE NOWAIT; -- Lock unit", "#ef4444"),
            ("UPDATE blood_units SET status='RSVD';", "#10b981"),
            ("COMMIT;", "#6366f1")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("pg", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=pg_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("trigger", 630, 240, 230, 48, stroke="#334155", bg="#131b2c", text=val_t, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "trig_code", 625, 310, 240, 185,
        code3_title,
        [
            ("CREATE TRIGGER check_freshness", "#38bdf8"),
            ("BEFORE UPDATE ON inventario.units", "#f1f5f9"),
            ("FOR EACH ROW EXECUTE FUNCTION", "#fbbf24"),
            ("validate_expiration_window();", "#10b981"),
            ("-- Rejects expired platelets", "#64748b"),
            ("-- Sub-millisecond execution", "#38bdf8")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box2", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi2_t", 925, 108, 105, 16, "[SPECS ACID]", size=11, color="#94a3b8")
    b.add_rect("kp2_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="0.1ms\nQuery Latency\n@ 200 req/s", text_size=10, text_color="#10b981")
    b.add_rect("kp2_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="0%\nRace Condition\nIncidents", text_size=10, text_color="#38bdf8")
    b.add_rect("kp2_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="64%\nCPU Reduction\nvia Redis", text_size=10, text_color="#6366f1")
    b.add_rect("kp2_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="184 MB\nRAM Footprint\nClustered", text_size=10, text_color="#fbbf24")

    b.add_arrow("bs_a1", "c1", "nginx", [[250, 161], [325, 158]], stroke="#475569")
    b.add_arrow("bs_a2", "nginx", "laravel", [[440, 178], [440, 195]], stroke="#475569")
    b.add_arrow("bs_a3", "laravel", "redis", [[440, 240], [440, 255]], stroke="#38bdf8", label="Async")
    b.add_arrow("bs_a4", "laravel", "pg", [[555, 217], [590, 217], [590, 169], [630, 169]], stroke="#6366f1", label="ACID Lock")
    b.add_arrow("bs_a5", "pg", "trigger", [[745, 193], [745, 240]], stroke="#10b981")

    suffix = f"-{lang}"
    fn = f"02-banco-de-sangre{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("02-banco-de-sangre.excalidraw")
    return res

def build_ad2n_cloud(lang="en"):
    if lang == "es":
        title = "AD2N CLOUD — SEGURIDAD NGFW & INFRAESTRUCTURA DE VIRTUALIZACIÓN"
        sub = "Perímetro de ciberseguridad multicapa para servicios empresariales con clústeres VMware HA y navegación fluida."
        s1 = "[01] PERÍMETRO Y FIREWALL (NGFW)"
        s2 = "[02] VIRTUALIZACIÓN CORE & DRaaS"
        s3 = "[03] MONITOREO TOPOLOGÍA & UI LENIS"
        code1_title = "[POLÍTICA DE REGLAS NGFW]"
        code2_title = "[RUNTIME DE NODO VIRTUAL]"
        code3_title = "[LÍNEA DE TIEMPO VECTORIAL GSAP]"
        p1 = "Cloudflare WAF / DDoS\nProtección de Borde y Cache"
        p2 = "Fortinet NGFW Rule Base\nInspección Profunda de Paquetes"
        p3 = "Terminación TLS 1.3\nSNI Estricto y Certificados"
        c1 = "Clúster VMware / Hyper-V\nBalanceo de Nodos y Cargas"
        c2 = "Nivel Redis en Memoria\nSesiones y Cache Dinámica"
        c3 = "DRaaS y Respaldo Inmutable\nEstrategia de Almacén 3-2-1"
        u1 = "Trazado Vectorial GSAP 3\nRutas SVG Aceleradas por GPU"
        u2 = "Motor Inercial Lenis\nScroll Fluido a 60 FPS"
    else:
        title = "AD2N CLOUD — NGFW SECURITY & VIRTUALIZATION INFRASTRUCTURE"
        sub = "Multi-layered cybersecurity edge hosting enterprise services with VMware HA clusters and smooth kinetic navigation."
        s1 = "[01] PERIMETER & FIREWALL (NGFW)"
        s2 = "[02] CORE VIRTUALIZATION & DRaaS"
        s3 = "[03] TOPOLOGY MONITOR & LENIS UI"
        code1_title = "[NGFW RULE POLICY]"
        code2_title = "[VIRTUAL NODE RUNTIME]"
        code3_title = "[GSAP VECTOR TIMELINE]"
        p1 = "Cloudflare DDoS / WAF\nEdge Shield & Dynamic Cache"
        p2 = "Fortinet NGFW Rule Base\nDeep Packet Inspection"
        p3 = "TLS 1.3 Termination\nStrict SNI & Certificate Proxy"
        c1 = "VMware / Hyper-V Cluster\nNode Balancing & High Availability"
        c2 = "Redis In-Memory Tier\nSession & Dynamic Cache"
        c3 = "DRaaS Immutable Backup\n3-2-1 Storage Architecture"
        u1 = "GSAP 3 Vector Tracing\nHardware Accelerated SVG Paths"
        u2 = "Lenis Inertial Engine\n60 FPS Fluid Delta Scroll"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("p1", 60, 140, 190, 42, stroke="#334155", bg="#131b2c", text=p1, text_size=10, text_color="#f1f5f9")
    b.add_rect("p2", 60, 195, 190, 42, stroke="#334155", bg="#131b2c", text=p2, text_size=10, text_color="#f1f5f9")
    b.add_rect("p3", 60, 250, 190, 42, stroke="#334155", bg="#131b2c", text=p3, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "ngfw_code", 55, 310, 200, 185,
        code1_title,
        [
            ("rule 101: allow established", "#10b981"),
            ("rule 102: drop bad-actor IPs", "#ef4444"),
            ("proto: TCP 443 / HTTPS", "#38bdf8"),
            ("geo_filter: whitelist valid", "#fbbf24"),
            ("bot_score: < 30 blocked", "#6366f1"),
            ("status: 0 drops legitimate", "#10b981")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("c1", 325, 138, 230, 40, stroke="#334155", bg="#131b2c", text=c1, text_size=10, text_color="#f1f5f9")
    b.add_rect("c2", 325, 195, 230, 45, stroke="#334155", bg="#131b2c", text=c2, text_size=10, text_color="#f1f5f9")
    b.add_rect("c3", 325, 255, 230, 40, stroke="#334155", bg="#131b2c", text=c3, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "vm_code", 320, 310, 240, 185,
        code2_title,
        [
            ("opcache.jit = 1255;", "#38bdf8"),
            ("memory_consumption: 64MB", "#10b981"),
            ("Time-To-Interactive: 0.78s", "#38bdf8"),
            ("gzip_compression: 78%", "#fbbf24"),
            ("static_webp_deliver: async", "#10b981"),
            ("zero_thread_lock: TRUE", "#6366f1")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("u1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=u1, text_size=10, text_color="#f1f5f9")
    b.add_rect("u2", 630, 240, 230, 48, stroke="#334155", bg="#131b2c", text=u2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "gsap_code", 625, 310, 240, 185,
        code3_title,
        [
            ("gsap.timeline({ scrollTrigger: {", "#6366f1"),
            ("  trigger: '#cloud-canvas',", "#f1f5f9"),
            ("  scrub: 1.2,", "#fbbf24"),
            ("  start: 'top 80%',", "#64748b"),
            ("}}).to('.topology-line', {", "#38bdf8"),
            ("  strokeDashoffset: 0", "#10b981"),
            ("});", "#6366f1")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box3", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi3_t", 925, 108, 105, 16, "[EDGE SPECS]", size=11, color="#94a3b8")
    b.add_rect("kp3_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="99.99%\nUptime SLA\nGuaranteed", text_size=10, text_color="#10b981")
    b.add_rect("kp3_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="< 1ms\nEdge RTT\nProxy Hop", text_size=10, text_color="#38bdf8")
    b.add_rect("kp3_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="0\nZero-Day\nData Leaks", text_size=10, text_color="#6366f1")
    b.add_rect("kp3_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="100%\nImmutable\nSnapshots", text_size=10, text_color="#fbbf24")

    b.add_arrow("ad_a1", "p1", "c1", [[250, 161], [325, 158]], stroke="#475569")
    b.add_arrow("ad_a2", "p2", "c1", [[250, 216], [285, 216], [285, 165], [325, 165]], stroke="#475569")
    b.add_arrow("ad_a3", "c1", "c2", [[440, 178], [440, 195]], stroke="#38bdf8", label="Cache")
    b.add_arrow("ad_a4", "c1", "u1", [[555, 158], [630, 169]], stroke="#6366f1", label="Telemetry")
    b.add_arrow("ad_a5", "u1", "u2", [[745, 193], [745, 240]], stroke="#10b981")

    suffix = f"-{lang}"
    fn = f"03-ad2n-cloud{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("03-ad2n-cloud.excalidraw")
    return res

def build_capital_marketing(lang="en"):
    if lang == "es":
        title = "CAPITAL MARKETING — SPA MODULAR & SHOWROOM 3D WEBGL"
        sub = "Arquitectura SPA sin recarga, showroom interactivo Three.js y API de contactos PHP con asistente IA."
        s1 = "[01] CLIENTE SPA MODULAR"
        s2 = "[02] SHOWROOM THREE.JS 3D"
        s3 = "[03] API CONTACTO & ASISTENTE IA"
        code1_title = "[ENRUTADOR CLIENTE SPA]"
        code2_title = "[ORQUESTADOR ESCENA THREE.JS]"
        code3_title = "[TRIAJE DE LEADS & IA]"
        u1_t = "Enrutador SPA Vanilla JS\nNavegación Fluida sin Recarga"
        u2_t = "Motor GSAP 3 & Lenis\nScrollTrigger y Microinteracciones"
        t1_t = "Canvas WebGL Three.js\nCarga Diferida de Modelos GLTF"
        t2_t = "Controles Inerciales & Orbit\nInteracción Suave de Productos"
        p1_t = "API PHP 8 & PHPMailer\nValidación CSRF y Envío de Correo"
        p2_t = "Asistente IA Concierge\nRespuestas en Tiempo Real"
    else:
        title = "CAPITAL MARKETING — MODULAR SPA & 3D WEBGL SHOWROOM"
        sub = "Zero-reload client architecture with Three.js product showroom, GSAP 3 reveals, and PHP contact API."
        s1 = "[01] MODULAR CLIENT SPA"
        s2 = "[02] THREE.JS 3D SHOWROOM"
        s3 = "[03] CONTACT API & AI CONCIERGE"
        code1_title = "[SPA CLIENT ROUTER]"
        code2_title = "[THREE.JS SCENE ORCHESTRATOR]"
        code3_title = "[LEAD TRIAGE & AI HANDLER]"
        u1_t = "Vanilla JS SPA Router\nFluid Zero-Reload Navigation"
        u2_t = "GSAP 3 & Lenis Engine\nScrollTrigger & Micro-Interactions"
        t1_t = "Three.js WebGL Canvas\nLazy-Loaded GLTF 3D Models"
        t2_t = "Inertial Orbit Controls\nSmooth Hardware Product Inspection"
        p1_t = "PHP 8 Contact API\nCSRF Token & PHPMailer Pipeline"
        p2_t = "AI Sales Concierge\nAutomated Smart Lead Triage"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("u1", 60, 145, 190, 48, stroke="#334155", bg="#131b2c", text=u1_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("u2", 60, 235, 190, 48, stroke="#334155", bg="#131b2c", text=u2_t, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "spa_code", 55, 310, 200, 185,
        code1_title,
        [
            ("router.register('/showroom', () => {", "#38bdf8"),
            ("  loadSceneAsync('deck.glb');", "#10b981"),
            ("  transitionView('showroom');", "#fbbf24"),
            ("});", "#38bdf8"),
            ("-- Zero page reloads guaranteed", "#64748b"),
            ("window.onpopstate = syncState;", "#cbd5e1")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("t1", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=t1_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("t2", 325, 235, 230, 48, stroke="#334155", bg="#131b2c", text=t2_t, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "three_code", 320, 310, 240, 185,
        code2_title,
        [
            ("const scene = new THREE.Scene();", "#38bdf8"),
            ("const loader = new GLTFLoader();", "#f1f5f9"),
            ("loader.load('showroom.glb', (g) => {", "#6366f1"),
            ("  scene.add(g.scene);", "#10b981"),
            ("  renderer.compile(scene, cam);", "#fbbf24"),
            ("}); -- 60 FPS hardware accelerated", "#64748b")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("p1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=p1_t, text_size=10, text_color="#f1f5f9")
    b.add_rect("p2", 630, 235, 230, 48, stroke="#334155", bg="#131b2c", text=p2_t, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "lead_code", 625, 310, 240, 185,
        code3_title,
        [
            ("if (!verifyCSRFToken($req)) exit;", "#ef4444"),
            ("$lead = validateSanitize($payload);", "#38bdf8"),
            ("$mail->sendNotification($lead);", "#10b981"),
            ("$aiBot->queueContextResponse($lead);", "#6366f1"),
            ("echo json_encode(['ok' => true]);", "#fbbf24")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box4", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi4_t", 925, 108, 105, 16, "[RENDIMIENTO]" if lang == "es" else "[PERFORMANCE]", size=11, color="#94a3b8")
    b.add_rect("kp4_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="0s\nHard Reloads\nFull SPA", text_size=10, text_color="#10b981")
    b.add_rect("kp4_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="60 FPS\nThree.js 3D\nSmoothness", text_size=10, text_color="#38bdf8")
    b.add_rect("kp4_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="< 1.2s\nFirst Paint\nSpeed Index", text_size=10, text_color="#6366f1")
    b.add_rect("kp4_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="100%\nCSRF Valid\nSecure Leads", text_size=10, text_color="#fbbf24")

    b.add_arrow("cm_a1", "u1", "t1", [[250, 169], [325, 169]], stroke="#475569")
    b.add_arrow("cm_a2", "u2", "t1", [[250, 259], [285, 259], [285, 180], [325, 180]], stroke="#475569")
    b.add_arrow("cm_a3", "t1", "t2", [[440, 193], [440, 235]], stroke="#6366f1")
    b.add_arrow("cm_a4", "t2", "p1", [[555, 259], [590, 259], [590, 169], [630, 169]], stroke="#38bdf8", label="Lead CTA")
    b.add_arrow("cm_a5", "p1", "p2", [[745, 193], [745, 235]], stroke="#10b981")

    suffix = f"-{lang}"
    fn = f"04-capital-marketing{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("04-capital-marketing.excalidraw")
    return res

def build_julie(lang="en"):
    if lang == "es":
        title = "JULIE — SHOWCASE EDITORIAL & MOTOR DE PARTÍCULAS"
        sub = "Experiencia digital de lujo con Vue 3, preloader numérico, tipografía escalonada y enjambre Three.js."
        s1 = "[01] PRELOADER & TIPOGRAFÍA"
        s2 = "[02] ENJAMBRE THREE.JS 3D"
        s3 = "[03] PANELES EDITORIALES GSAP"
        code1_title = "[PRELOADER NUMÉRICO 0-100%]"
        code2_title = "[DISPERSIÓN SHADER GLSL]"
        code3_title = "[SCROLLTRIGGER EDITORIAL]"
        j1 = "Contador Numérico 0% a 100%\nPrecarga de Texturas & Audio"
        j2 = "Motor SplitType\nRevelación Carácter por Carácter"
        j3 = "Soundscape Web Audio\nAtmósfera Sonora Inmersiva"
        w1 = "Buffer de 12,000 Partículas\nDispersión de Luz WebGL"
        w2 = "Shader Vertex Personalizado\nOndas Senoidales en Tiempo Real"
        g1 = "Apilado de Paneles GSAP\nFijación y Transiciones Suaves"
        g2 = "Scroll Inercial Lenis\nRitmo Editorial sin Fricción"
    else:
        title = "JULIE — EDITORIAL LUXURY SHOWCASE & PARTICLE ENGINE"
        sub = "High-fashion narrative built with Vue 3, rolling preloader, staggered typography, and Three.js particle swarm."
        s1 = "[01] PRELOADER & KINETIC TYPO"
        s2 = "[02] THREE.JS PARTICLE SWARM"
        s3 = "[03] GSAP EDITORIAL PANELS"
        code1_title = "[0-100% ROLLING PRELOADER]"
        code2_title = "[GLSL DISPERSION SHADER]"
        code3_title = "[EDITORIAL SCROLLTRIGGER]"
        j1 = "0% to 100% Rolling Counter\nTexture & Audio Preloading"
        j2 = "SplitType Typography Engine\nCharacter-by-Character Stagger"
        j3 = "Web Audio Soundscape\nAmbient Harmonic Responsive Drone"
        w1 = "12,000 Particle Buffer\nInteractive WebGL Light Swarm"
        w2 = "Custom GLSL Vertex Shader\nReal-time Sine Wave Displacement"
        g1 = "GSAP Panel Pinning Engine\nSection Layer Stacking Transition"
        g2 = "Lenis Inertial Scroll\nFrictionless Editorial Pacing"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("j1", 60, 140, 190, 42, stroke="#334155", bg="#131b2c", text=j1, text_size=10, text_color="#f1f5f9")
    b.add_rect("j2", 60, 195, 190, 42, stroke="#334155", bg="#131b2c", text=j2, text_size=10, text_color="#f1f5f9")
    b.add_rect("j3", 60, 250, 190, 42, stroke="#334155", bg="#131b2c", text=j3, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "pre_code", 55, 310, 200, 185,
        code1_title,
        [
            ("gsap.to(counter, {", "#38bdf8"),
            ("  value: 100,", "#10b981"),
            ("  duration: 2.2,", "#fbbf24"),
            ("  ease: 'expo.inOut',", "#f1f5f9"),
            ("  onUpdate: renderCount", "#6366f1"),
            ("}); -- Zero FOUC guarantee", "#64748b")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("w1", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=w1, text_size=10, text_color="#f1f5f9")
    b.add_rect("w2", 325, 235, 230, 48, stroke="#334155", bg="#131b2c", text=w2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "glsl_code", 320, 310, 240, 185,
        code2_title,
        [
            ("vec3 pos = position;", "#38bdf8"),
            ("pos.z += sin(uTime + pos.x * 2.0)", "#f1f5f9"),
            ("       * 0.15;", "#fbbf24"),
            ("gl_Position = proj * view * vec4(pos, 1.0);", "#6366f1"),
            ("gl_PointSize = 2.0 * (1.0 / -mvPos.z);", "#10b981")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("g1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=g1, text_size=10, text_color="#f1f5f9")
    b.add_rect("g2", 630, 235, 230, 48, stroke="#334155", bg="#131b2c", text=g2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "pin_code", 625, 310, 240, 185,
        code3_title,
        [
            ("ScrollTrigger.create({", "#38bdf8"),
            ("  trigger: sectionEl,", "#f1f5f9"),
            ("  pin: true,", "#10b981"),
            ("  scrub: 1,", "#fbbf24"),
            ("  onEnter: () => activatePanel(idx)", "#6366f1"),
            ("});", "#38bdf8")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box5", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi5_t", 925, 108, 105, 16, "[LUX METRICS]", size=11, color="#94a3b8")
    b.add_rect("kp5_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="60 FPS\nStable WebGL\nViewport", text_size=10, text_color="#10b981")
    b.add_rect("kp5_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="12K\nHardware Point\nParticles", text_size=10, text_color="#38bdf8")
    b.add_rect("kp5_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="0ms\nWeb Audio\nLatency", text_size=10, text_color="#6366f1")
    b.add_rect("kp5_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="100%\nEditorial\nPacing", text_size=10, text_color="#fbbf24")

    b.add_arrow("jl_a1", "j1", "w1", [[250, 161], [325, 169]], stroke="#475569")
    b.add_arrow("jl_a2", "w1", "w2", [[440, 193], [440, 235]], stroke="#6366f1")
    b.add_arrow("jl_a3", "w2", "g1", [[555, 259], [590, 259], [590, 169], [630, 169]], stroke="#38bdf8", label="Sync Scroll")
    b.add_arrow("jl_a4", "g1", "g2", [[745, 193], [745, 235]], stroke="#10b981")

    suffix = f"-{lang}"
    fn = f"05-julie{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("05-julie.excalidraw")
    return res

def build_cemed_hub(lang="en"):
    if lang == "es":
        title = "CEMED HUB — ERP CLÍNICO & EXPEDIENTE MÉDICO MULTI-ESPECIALIDAD"
        sub = "Seguridad médica con Vue 3 CASL RBAC, API Laravel 10 con JWT y emisión cifrada de recetas DomPDF."
        s1 = "[01] SPA MÉDICO & CASL RBAC"
        s2 = "[02] NÚCLEO CLÍNICO LARAVEL 10"
        s3 = "[03] EXPEDIENTE POSTGRESQL & PDF"
        code1_title = "[PERMISOS DE ESPECIALIDAD CASL]"
        code2_title = "[SERVICIO DE CONSULTA MÉDICA]"
        code3_title = "[TRANSACCIÓN DE HISTORIA CLÍNICA]"
        u1 = "Portal Médico (Vue 3 + Pinia)\nHistoria Clínica y Triaje de Consultas"
        u2 = "Matriz de Permisos CASL\nAislamiento Estricto por Especialidad"
        l1 = "Laravel 10 API & Tymon JWT\nTokens de Sesión Cifrados y Seguros"
        l2 = "Capa de Servicios de Salud\nValidación y Asignación de Turnos"
        p1 = "PostgreSQL Base Relacional\nPacientes, Citas, Diagnósticos CIE-10"
        p2 = "Motor de Reportes DomPDF\nRecetas Médicas y Órdenes Firmadas"
    else:
        title = "CEMED HUB — CLINICAL ERP & MULTI-SPECIALTY EHR"
        sub = "Clinical security with Vue 3 CASL RBAC, Laravel 10 JWT API, and encrypted DomPDF medical order emission."
        s1 = "[01] MEDICAL SPA & CASL RBAC"
        s2 = "[02] LARAVEL 10 CLINICAL CORE"
        s3 = "[03] POSTGRESQL EHR & PDF VAULT"
        code1_title = "[CASL SPECIALTY ABILITY GATES]"
        code2_title = "[CLINICAL CONSULTATION SERVICE]"
        code3_title = "[EHR TRANSACTION COMMIT]"
        u1 = "Physician Portal (Vue 3 + Pinia)\nPatient Health Records & Triage"
        u2 = "CASL Role Permission Matrix\nStrict Specialty-Level Isolation"
        l1 = "Laravel 10 API & Tymon JWT\nEncrypted High-Security Sessions"
        l2 = "Clinical Health Service Layer\nAppointment Schedules & Diagnosis"
        p1 = "PostgreSQL Relational DB\nPatients, Appointments, ICD-10 Codes"
        p2 = "DomPDF Generation Engine\nTamper-Proof Prescriptions & Labs"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("u1", 60, 145, 190, 48, stroke="#334155", bg="#131b2c", text=u1, text_size=10, text_color="#f1f5f9")
    b.add_rect("u2", 60, 235, 190, 48, stroke="#334155", bg="#131b2c", text=u2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "casl_code", 55, 310, 200, 185,
        code1_title,
        [
            ("can('read', 'MedicalRecord', {", "#38bdf8"),
            ("  specialty_id: user.specialty", "#10b981"),
            ("});", "#38bdf8"),
            ("cannot('delete', 'ClinicalHistory');", "#ef4444"),
            ("can('sign', 'PrescriptionOrder');", "#fbbf24"),
            ("-- HIPAA strict permission lock", "#64748b")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("l1", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=l1, text_size=10, text_color="#f1f5f9")
    b.add_rect("l2", 325, 235, 230, 48, stroke="#334155", bg="#131b2c", text=l2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "serv_code", 320, 310, 240, 185,
        code2_title,
        [
            ("$data = $request->validated();", "#38bdf8"),
            ("$record = $this->consultationRepo", "#f1f5f9"),
            ("  ->createWithDiagnosis($data);", "#10b981"),
            ("$this->labService->dispatch($record);", "#6366f1"),
            ("$pdf = $this->pdfService->sign($record);", "#fbbf24")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("p1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=p1, text_size=10, text_color="#f1f5f9")
    b.add_rect("p2", 630, 235, 230, 48, stroke="#334155", bg="#131b2c", text=p2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "ehr_code", 625, 310, 240, 185,
        code3_title,
        [
            ("DB::transaction(function() use ($dto) {", "#38bdf8"),
            ("  $ehr = PatientRecord::create($dto);", "#f1f5f9"),
            ("  AuditLog::recordMedicalAccess($dto);", "#10b981"),
            ("  PrescriptionVault::encrypt($ehr);", "#fbbf24"),
            ("}); -- Full medical auditability", "#64748b")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box6", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi6_t", 925, 108, 105, 16, "[SPECS CLÍNICAS]", size=11, color="#94a3b8")
    b.add_rect("kp6_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="< 50ms\nClinical Record\nFetch Time", text_size=10, text_color="#10b981")
    b.add_rect("kp6_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="100%\nHIPAA/CASL\nRole Isolated", text_size=10, text_color="#38bdf8")
    b.add_rect("kp6_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="0\nDouble-Booking\nIncidents", text_size=10, text_color="#6366f1")
    b.add_rect("kp6_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="100%\nEncrypted PDF\nPrescriptions", text_size=10, text_color="#fbbf24")

    b.add_arrow("cm_a1", "u1", "l1", [[250, 169], [325, 169]], stroke="#475569")
    b.add_arrow("cm_a2", "u2", "l1", [[250, 259], [285, 259], [285, 180], [325, 180]], stroke="#475569")
    b.add_arrow("cm_a3", "l1", "l2", [[440, 193], [440, 235]], stroke="#6366f1")
    b.add_arrow("cm_a4", "l2", "p1", [[555, 259], [590, 259], [590, 169], [630, 169]], stroke="#38bdf8", label="Commit")
    b.add_arrow("cm_a5", "p1", "p2", [[745, 193], [745, 235]], stroke="#10b981")

    suffix = f"-{lang}"
    fn = f"06-cemed-hub{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("06-cemed-hub.excalidraw")
    return res

def build_letsgo_app(lang="en"):
    if lang == "es":
        title = "LETSGO APP — ENRUTADO DE FLOTA GEOPESPACIAL & POSTGIS"
        sub = "Motor de asignación de conductores en tiempo real con Laravel Sanctum, indexado espacial PostGIS y cliente Vue 3."
        s1 = "[01] CLIENTES PASAJERO & CONDUCTOR"
        s2 = "[02] LARAVEL SANCTUM & COLA DE ASIGNACIÓN"
        s3 = "[03] CLÚSTER ESPACIAL POSTGIS"
        code1_title = "[DESPACHO DE GEOLOCALIZACIÓN]"
        code2_title = "[MÁQUINA DE ESTADOS DE VIAJE]"
        code3_title = "[CONSULTA DE PROXIMIDAD POSTGIS]"
        u1 = "PWA Pasajero & Conductor (Vue 3)\nGeolocalización Pinia y Cálculo de Ruta"
        u2 = "Mapa Reactivo con Leaflet\nCapas Vectoriales y Posición en Vivo"
        l1 = "Laravel API & Tokens Sanctum\nAutenticación Aislada por Rol"
        l2 = "Máquina de Estados de Viaje\nSOLICITADO -> ASIGNADO -> EN_RUTA"
        p1 = "PostGIS Índices Espaciales GiST\nBúsqueda Vecina con ST_DWithin"
        p2 = "Validador de Geocercas Urbanas\nCálculo Dinámico de Tarifas"
    else:
        title = "LETSGO APP — GEOSPATIAL FLEET ROUTING & POSTGIS"
        sub = "Real-time driver-matching engine built with Laravel Sanctum, PostGIS spatial indexing, and Vue 3 responsive client."
        s1 = "[01] RIDER & DRIVER CLIENTS"
        s2 = "[02] SANCTUM & DISPATCH QUEUE"
        s3 = "[03] POSTGIS SPATIAL CLUSTER"
        code1_title = "[GEOLOCATION DISPATCH PAYLOAD]"
        code2_title = "[TRIP STATE MACHINE]"
        code3_title = "[POSTGIS PROXIMITY QUERY]"
        u1 = "Rider & Driver PWA (Vue 3)\nPinia Geolocation & Route Pricing"
        u2 = "Reactive Map with Leaflet\nVector Tile Layers & Live Vehicle Icon"
        l1 = "Laravel API & Sanctum Tokens\nIsolated Role-Based Authentication"
        l2 = "Trip State Transition Machine\nREQUESTED -> ASSIGNED -> IN_ROUTE"
        p1 = "PostGIS GiST Spatial Indexes\nHigh-Speed ST_DWithin Lookups"
        p2 = "Urban Geofence Validator\nDynamic Fare & Zone Matrix"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("u1", 60, 145, 190, 48, stroke="#334155", bg="#131b2c", text=u1, text_size=10, text_color="#f1f5f9")
    b.add_rect("u2", 60, 235, 190, 48, stroke="#334155", bg="#131b2c", text=u2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "geo_code", 55, 310, 200, 185,
        code1_title,
        [
            ("navigator.geolocation.watchPosition(", "#38bdf8"),
            ("  (pos) => emitCoordinates({", "#f1f5f9"),
            ("    lat: pos.coords.latitude,", "#10b981"),
            ("    lng: pos.coords.longitude,", "#10b981"),
            ("    heading: pos.coords.heading", "#fbbf24"),
            ("  })", "#f1f5f9"),
            (");", "#38bdf8")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("l1", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=l1, text_size=10, text_color="#f1f5f9")
    b.add_rect("l2", 325, 235, 230, 48, stroke="#334155", bg="#131b2c", text=l2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "trip_code", 320, 310, 240, 185,
        code2_title,
        [
            ("$trip = Trip::findOrFail($id);", "#38bdf8"),
            ("$trip->transitionTo(Assigned::class);", "#10b981"),
            ("$driver = $this->matchNearest($trip);", "#6366f1"),
            ("DriverAssignedEvent::dispatch($driver);", "#fbbf24"),
            ("-- Instant push notification", "#64748b")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("p1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=p1, text_size=10, text_color="#f1f5f9")
    b.add_rect("p2", 630, 235, 230, 48, stroke="#334155", bg="#131b2c", text=p2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "gis_code", 625, 310, 240, 185,
        code3_title,
        [
            ("SELECT id, ST_Distance(geom,", "#38bdf8"),
            ("  ST_MakePoint($lng, $lat)::geography", "#f1f5f9"),
            (") AS dist FROM drivers", "#38bdf8"),
            ("WHERE status='AVAILABLE'", "#10b981"),
            ("  AND ST_DWithin(geom, $pt, 3000)", "#fbbf24"),
            ("ORDER BY dist ASC LIMIT 1;", "#6366f1")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box7", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi7_t", 925, 108, 105, 16, "[GEO SPECS]", size=11, color="#94a3b8")
    b.add_rect("kp7_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="< 2.4s\nDriver Match\nResolution", text_size=10, text_color="#10b981")
    b.add_rect("kp7_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="15ms\nPostGIS Spatial\nQuery Index", text_size=10, text_color="#38bdf8")
    b.add_rect("kp7_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="99.8%\nGeofence Match\nAccuracy", text_size=10, text_color="#6366f1")
    b.add_rect("kp7_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="100%\nSanctum Auth\nSecurity", text_size=10, text_color="#fbbf24")

    b.add_arrow("lg_a1", "u1", "l1", [[250, 169], [325, 169]], stroke="#475569")
    b.add_arrow("lg_a2", "u2", "l1", [[250, 259], [285, 259], [285, 180], [325, 180]], stroke="#475569")
    b.add_arrow("lg_a3", "l1", "l2", [[440, 193], [440, 235]], stroke="#6366f1")
    b.add_arrow("lg_a4", "l2", "p1", [[555, 259], [590, 259], [590, 169], [630, 169]], stroke="#38bdf8", label="Spatial GiST")
    b.add_arrow("lg_a5", "p1", "p2", [[745, 193], [745, 235]], stroke="#10b981")

    suffix = f"-{lang}"
    fn = f"07-letsgo-app{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("07-letsgo-app.excalidraw")
    return res

def build_logistica_san_martin(lang="en"):
    if lang == "es":
        title = "LOGÍSTICA SAN MARTÍN — CADENA DE SUMINISTRO GANADERA & IA GEMINI"
        sub = "ERP de transporte ganadero para Carnes San Martín con arquitectura Laravel 4 capas y asistente operativo Gemini."
        s1 = "[01] PORTAL LOGÍSTICO (VUE 3)"
        s2 = "[02] NÚCLEO 4 CAPAS LARAVEL 10"
        s3 = "[03] POSTGRESQL & IA GEMINI"
        code1_title = "[FORMULARIO REMISIÓN DE GANADO]"
        code2_title = "[PIPELINE SERVICIO 4 CAPAS]"
        code3_title = "[OPTIMIZACIÓN DE RUTA GEMINI]"
        u1 = "Portal Operativo (Vue 3 + Vuetify)\nControl de Jaulas, Choferes y Fincas"
        u2 = "Validación de Capacidad y Peso\nTrazabilidad de Acopio a Planta"
        l1 = "Controllers & Form Requests\nValidación y Reglas de Negocio Estrictas"
        l2 = "Capa de Servicios & Repositorios\nTrait DatosEmpresa Multi-Empresa"
        p1 = "PostgreSQL db_sm_logistica\nDespachos, Pesajes, Trazabilidad Bovina"
        p2 = "Google Gemini Logistics AI\nCálculo Óptimo de Carga y Combustible"
    else:
        title = "LOGÍSTICA SAN MARTÍN — LIVESTOCK SUPPLY CHAIN & GEMINI AI"
        sub = "Cattle transport ERP for Carnes San Martín with 4-layer Laravel architecture and Google Gemini operational assistant."
        s1 = "[01] LOGISTICS PORTAL (VUE 3)"
        s2 = "[02] 4-LAYER LARAVEL CORE"
        s3 = "[03] POSTGRESQL & GEMINI AI"
        code1_title = "[LIVESTOCK DISPATCH FORM]"
        code2_title = "[4-LAYER SERVICE PIPELINE]"
        code3_title = "[GEMINI ROUTE OPTIMIZER]"
        u1 = "Logistics Dashboard (Vue 3 + Vuetify)\nLivestock Trucks, Drivers & Ranch Registry"
        u2 = "Weight & Capacity Gate\nTraceability from Ranches to Processing Plant"
        l1 = "Controllers & Form Requests\nStrict Multi-Tenant Parameter Validation"
        l2 = "Services & Repositories Layer\nDatosEmpresa Enterprise Scoping Trait"
        p1 = "PostgreSQL db_sm_logistica\nBatches, Remisiones, Livestock Weight Audit"
        p2 = "Google Gemini Logistics AI\nOptimal Truck Load & Fuel Route Estimation"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("u1", 60, 145, 190, 48, stroke="#334155", bg="#131b2c", text=u1, text_size=10, text_color="#f1f5f9")
    b.add_rect("u2", 60, 235, 190, 48, stroke="#334155", bg="#131b2c", text=u2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "rem_code", 55, 310, 200, 185,
        code1_title,
        [
            ("{", "#94a3b8"),
            ("  \"ranch_id\": \"SM-884\",", "#38bdf8"),
            ("  \"truck_cage\": \"JAULA-12\",", "#f1f5f9"),
            ("  \"cattle_heads\": 38,", "#10b981"),
            ("  \"avg_weight_kg\": 460,", "#fbbf24"),
            ("  \"dest\": \"Planta Nandaime\"", "#6366f1"),
            ("}", "#94a3b8")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("l1", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=l1, text_size=10, text_color="#f1f5f9")
    b.add_rect("l2", 325, 235, 230, 48, stroke="#334155", bg="#131b2c", text=l2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "lay_code", 320, 310, 240, 185,
        code2_title,
        [
            ("class RemisionService {", "#6366f1"),
            ("  use DatosEmpresa;", "#38bdf8"),
            ("  public function dispatchBatch($dto) {", "#f1f5f9"),
            ("    $this->validator->checkCapacity($dto);", "#10b981"),
            ("    return $this->repo->create($dto);", "#fbbf24"),
            ("  }", "#6366f1"),
            ("}", "#6366f1")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("p1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=p1, text_size=10, text_color="#f1f5f9")
    b.add_rect("p2", 630, 235, 230, 48, stroke="#334155", bg="#131b2c", text=p2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "gem_code", 625, 310, 240, 185,
        code3_title,
        [
            ("const prompt = `Analiza remision:", "#38bdf8"),
            ("  38 reses, 17.5 toneladas.", "#f1f5f9"),
            ("  Calcula paradas y consumo:`;", "#fbbf24"),
            ("const res = await gemini.generate({", "#10b981"),
            ("  prompt: prompt + routeCoordinates", "#6366f1"),
            ("}); -- 18% fuel cost reduction", "#64748b")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box8", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi8_t", 925, 108, 105, 16, "[KPI LOGÍSTICA]", size=11, color="#94a3b8")
    b.add_rect("kp8_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="42ms\nDispatch Batch\nAPI Response", text_size=10, text_color="#10b981")
    b.add_rect("kp8_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="100%\nCattle Origin\nTraceability", text_size=10, text_color="#38bdf8")
    b.add_rect("kp8_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="18%\nFuel Reduction\nvia AI Routing", text_size=10, text_color="#6366f1")
    b.add_rect("kp8_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="0\nOverweight Trips\nStrict Compliance", text_size=10, text_color="#fbbf24")

    b.add_arrow("sm_a1", "u1", "l1", [[250, 169], [325, 169]], stroke="#475569")
    b.add_arrow("sm_a2", "u2", "l1", [[250, 259], [285, 259], [285, 180], [325, 180]], stroke="#475569")
    b.add_arrow("sm_a3", "l1", "l2", [[440, 193], [440, 235]], stroke="#6366f1")
    b.add_arrow("sm_a4", "l2", "p1", [[555, 259], [590, 259], [590, 169], [630, 169]], stroke="#38bdf8", label="Commit")
    b.add_arrow("sm_a5", "p1", "p2", [[745, 193], [745, 235]], stroke="#10b981", label="AI Route")

    suffix = f"-{lang}"
    fn = f"08-logistica-san-martin{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("08-logistica-san-martin.excalidraw")
    return res

def build_sistema_pyme(lang="en"):
    if lang == "es":
        title = "SISTEMA PYME — POS MULTI-SUCURSAL & KARDEX DE CAJA ATÓMICO"
        sub = "ERP comercial con sesiones de caja, valuación Kardex en tiempo real, Laravel 12 y frontend Vue 3 con Pinia."
        s1 = "[01] POS DE CAJA & TIENDA PINIA"
        s2 = "[02] NÚCLEO SERVICIOS LARAVEL 12"
        s3 = "[03] LIBRO KARDEX POSTGRESQL"
        code1_title = "[DESPACHO CHECKOUT POS]"
        code2_title = "[TRANSACCIÓN DE VENTA ATÓMICA]"
        code3_title = "[VALUACIÓN DE INVENTARIO KARDEX]"
        u1 = "Terminal POS de Caja (Vue 3)\nLector de Códigos de Barra y Atajos"
        u2 = "Control de Sesión de Caja\nApertura, Arqueos y Cierre de Caja"
        l1 = "16 Servicios de Negocio (Laravel 12)\nVentas, Compras, Gastos, Inventario"
        l2 = "14 Repositorios & Form Requests\nValidación Atómica de Existencias"
        p1 = "PostgreSQL Libro Mayor Kardex\nValuación por Costo Promedio Ponderado"
        p2 = "Motor de Reportes Fiscales\nExportaciones DomPDF y PhpSpreadsheet"
    else:
        title = "SISTEMA PYME — MULTI-BRANCH POS & ATOMIC CASH KARDEX"
        sub = "Commercial ERP with cash register sessions, real-time Kardex inventory valuation, Laravel 12, and Vue 3 Pinia."
        s1 = "[01] CASHIER POS & PINIA STORE"
        s2 = "[02] LARAVEL 12 SERVICE CORE"
        s3 = "[03] POSTGRESQL KARDEX LEDGER"
        code1_title = "[POS CHECKOUT DISPATCH]"
        code2_title = "[ATOMIC SALE SERVICE]"
        code3_title = "[KARDEX VALUATION QUERY]"
        u1 = "Cashier POS Terminal (Vue 3)\nHigh-Speed Barcode Scanning & Hotkeys"
        u2 = "Cash Register Session Gate\nCash Opening, Mid-Day Tally, and Closing"
        l1 = "16 Business Services (Laravel 12)\nSales, Purchases, Expenses, Inventory"
        l2 = "14 Repositories & Form Requests\nAtomic Stock Deduction Validation"
        p1 = "PostgreSQL Kardex Ledger\nWeighted Average Cost Inventory Valuation"
        p2 = "Fiscal & Sales Report Engine\nDomPDF & PhpSpreadsheet Automation"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("u1", 60, 145, 190, 48, stroke="#334155", bg="#131b2c", text=u1, text_size=10, text_color="#f1f5f9")
    b.add_rect("u2", 60, 235, 190, 48, stroke="#334155", bg="#131b2c", text=u2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "pos_code", 55, 310, 200, 185,
        code1_title,
        [
            ("cartStore.checkout({", "#38bdf8"),
            ("  cash_session_id: activeSession.id,", "#f1f5f9"),
            ("  scanned_barcode: '74410018',", "#10b981"),
            ("  payment_method: 'CASH',", "#fbbf24"),
            ("  total_amount: 1450.00", "#6366f1"),
            ("});", "#38bdf8")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("l1", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=l1, text_size=10, text_color="#f1f5f9")
    b.add_rect("l2", 325, 235, 230, 48, stroke="#334155", bg="#131b2c", text=l2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "sale_code", 320, 310, 240, 185,
        code2_title,
        [
            ("DB::transaction(function() use ($dto) {", "#38bdf8"),
            ("  $sale = $this->saleRepo->create($dto);", "#f1f5f9"),
            ("  $this->kardexRepo->deductStock($dto);", "#10b981"),
            ("  $this->cashSessionRepo->addCash($dto);", "#fbbf24"),
            ("}); -- Zero ghost stock or cash leaks", "#64748b")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("p1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=p1, text_size=10, text_color="#f1f5f9")
    b.add_rect("p2", 630, 235, 230, 48, stroke="#334155", bg="#131b2c", text=p2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "kardex_code", 625, 310, 240, 185,
        code3_title,
        [
            ("INSERT INTO kardex (", "#38bdf8"),
            ("  product_id, type, qty, unit_cost", "#f1f5f9"),
            (") VALUES ($pId, 'SALE', -2, $cost);", "#10b981"),
            ("UPDATE branch_stock SET qty = qty - 2", "#fbbf24"),
            ("WHERE product_id = $pId;", "#6366f1")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box9", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi9_t", 925, 108, 105, 16, "[POS SPECS]", size=11, color="#94a3b8")
    b.add_rect("kp9_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="0.1ms\nScan-to-Cart\nLatency", text_size=10, text_color="#10b981")
    b.add_rect("kp9_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="100%\nCash Tally\nMatch", text_size=10, text_color="#38bdf8")
    b.add_rect("kp9_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="0\nGhost Stock\nIncidents", text_size=10, text_color="#6366f1")
    b.add_rect("kp9_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="112\nOptimized API\nRoute Endpoints", text_size=10, text_color="#fbbf24")

    b.add_arrow("py_a1", "u1", "l1", [[250, 169], [325, 169]], stroke="#475569")
    b.add_arrow("py_a2", "u2", "l1", [[250, 259], [285, 259], [285, 180], [325, 180]], stroke="#475569")
    b.add_arrow("py_a3", "l1", "l2", [[440, 193], [440, 235]], stroke="#6366f1")
    b.add_arrow("py_a4", "l2", "p1", [[555, 259], [590, 259], [590, 169], [630, 169]], stroke="#38bdf8", label="Kardex")
    b.add_arrow("py_a5", "p1", "p2", [[745, 193], [745, 235]], stroke="#10b981")

    suffix = f"-{lang}"
    fn = f"09-sistema-pyme{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("09-sistema-pyme.excalidraw")
    return res

def build_sistema_fotos(lang="en"):
    if lang == "es":
        title = "SISTEMA FOTOS — PORTAFOLIO E-COMMERCE & BÓVEDA SEGURA S3"
        sub = "Portafolio fotográfico protegido con marcas de agua dinámicas, pagos Stripe y URLs temporales firmadas S3."
        s1 = "[01] CLIENTE GALERÍA DE LUJO"
        s2 = "[02] NÚCLEO LARAVEL 12 & STRIPE"
        s3 = "[03] ALMACÉN PRIVADO S3 & TOKEN"
        code1_title = "[MONTAJE LIGHTBOX GALERÍA]"
        code2_title = "[PROCESAMIENTO DE IMÁGENES]"
        code3_title = "[GENERADOR URL FIRMADA S3]"
        u1 = "Showcase de Fotos (Vue 3 + GSAP)\nZoom Suave y Visualización Lightbox"
        u2 = "Navegación Inercial Lenis\nSelección de Licencias y Checkout"
        l1 = "Intervention Image Service\nMarcas de Agua y Extracción EXIF"
        l2 = "Webhook de Pagos Stripe\nConfirmación Criptográfica de Compra"
        p1 = "Bóveda Privada S3 / Almacén\nArchivos RAW Originales y TIFF HD"
        p2 = "URLs Firmadas con Expiración 24h\nDescargas Seguras contra Piratería"
    else:
        title = "SISTEMA FOTOS — SECURE GALLERY E-COMMERCE & S3 VAULT"
        sub = "Protected photography showcase with dynamic watermarks, Stripe checkout, and 24h temporary signed S3 URLs."
        s1 = "[01] LUXURY GALLERY CLIENT"
        s2 = "[02] LARAVEL 12 & STRIPE ENGINE"
        s3 = "[03] PRIVATE S3 VAULT & TOKEN"
        code1_title = "[GALLERY LIGHTBOX MOUNT]"
        code2_title = "[IMAGE WATERMARK PIPELINE]"
        code3_title = "[SIGNED S3 URL GENERATOR]"
        u1 = "Photo Showcase (Vue 3 + GSAP)\nFluid Lightbox Pan & High-Res Zoom"
        u2 = "Lenis Inertial Navigation\nLicense Selection & Cart Checkout"
        l1 = "Intervention Image Service\nAutomated Watermarking & EXIF Data"
        l2 = "Stripe Checkout Webhook\nCryptographic Payment Confirmation"
        p1 = "Private S3 / Local Storage Vault\nOriginal RAW Masters & High-Res TIFF"
        p2 = "24h Cryptographic Signed URLs\nAnti-Theft Secure Asset Stream"

    b = DiagramBuilder(title, sub)
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s1_t", 40, 108, 230, 16, s1, size=11, color="#38bdf8", align="center")
    b.add_rect("u1", 60, 145, 190, 48, stroke="#334155", bg="#131b2c", text=u1, text_size=10, text_color="#f1f5f9")
    b.add_rect("u2", 60, 235, 190, 48, stroke="#334155", bg="#131b2c", text=u2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "gal_code", 55, 310, 200, 185,
        code1_title,
        [
            ("gsap.from('.photo-tile', {", "#38bdf8"),
            ("  opacity: 0,", "#f1f5f9"),
            ("  y: 30,", "#fbbf24"),
            ("  stagger: 0.08,", "#10b981"),
            ("  ease: 'power2.out'", "#6366f1"),
            ("});", "#38bdf8")
        ],
        stroke="#1e293b", title_color="#38bdf8"
    )

    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s2_t", 305, 108, 270, 16, s2, size=11, color="#6366f1", align="center")
    b.add_rect("l1", 325, 145, 230, 48, stroke="#334155", bg="#131b2c", text=l1, text_size=10, text_color="#f1f5f9")
    b.add_rect("l2", 325, 235, 230, 48, stroke="#334155", bg="#131b2c", text=l2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "img_code", 320, 310, 240, 185,
        code2_title,
        [
            ("$img = Image::make($rawPath)", "#38bdf8"),
            ("  ->resize(1400, null)", "#f1f5f9"),
            ("  ->insert('watermark.png', 'center')", "#10b981"),
            ("  ->save($previewPath, 82);", "#fbbf24"),
            ("-- Tamper-proof preview stream", "#64748b")
        ],
        stroke="#1e293b", title_color="#6366f1"
    )

    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("s3_t", 610, 108, 270, 16, s3, size=11, color="#10b981", align="center")
    b.add_rect("p1", 630, 145, 230, 48, stroke="#334155", bg="#131b2c", text=p1, text_size=10, text_color="#f1f5f9")
    b.add_rect("p2", 630, 235, 230, 48, stroke="#334155", bg="#131b2c", text=p2, text_size=10, text_color="#f1f5f9")
    b.add_code_artifact(
        "s3_code", 625, 310, 240, 185,
        code3_title,
        [
            ("$url = Storage::disk('s3')->temporaryUrl(", "#38bdf8"),
            ("  $photo->vault_path,", "#f1f5f9"),
            ("  now()->addHours(24)", "#10b981"),
            (");", "#38bdf8"),
            ("return response()->json(['url' => $url]);", "#fbbf24")
        ],
        stroke="#1e293b", title_color="#10b981"
    )

    b.add_rect("kpi_box10", 915, 95, 125, 420, stroke="#1e293b", bg="#0d131f", stroke_width=1)
    b.add_text("kpi10_t", 925, 108, 105, 16, "[SPECS FOTO]", size=11, color="#94a3b8")
    b.add_rect("kp10_1", 925, 140, 105, 75, stroke="#1e293b", bg="#131b2c", text="< 0.4s\nWatermarking\nProcessing Time", text_size=10, text_color="#10b981")
    b.add_rect("kp10_2", 925, 230, 105, 75, stroke="#1e293b", bg="#131b2c", text="100%\nAnti-Theft\nWatermark Guard", text_size=10, text_color="#38bdf8")
    b.add_rect("kp10_3", 925, 320, 105, 75, stroke="#1e293b", bg="#131b2c", text="24h\nSigned URL\nCryptographic TTL", text_size=10, text_color="#6366f1")
    b.add_rect("kp10_4", 925, 410, 105, 85, stroke="#1e293b", bg="#131b2c", text="0\nDirect RAW Leaks\n100% S3 Vault", text_size=10, text_color="#fbbf24")

    b.add_arrow("ft_a1", "u1", "l1", [[250, 169], [325, 169]], stroke="#475569")
    b.add_arrow("ft_a2", "u2", "l2", [[250, 259], [325, 259]], stroke="#475569", label="Checkout")
    b.add_arrow("ft_a3", "l2", "p1", [[555, 259], [590, 259], [590, 169], [630, 169]], stroke="#6366f1", label="Grant")
    b.add_arrow("ft_a4", "p1", "p2", [[745, 193], [745, 235]], stroke="#10b981", label="Sign")

    suffix = f"-{lang}"
    fn = f"10-sistema-fotos{suffix}.excalidraw"
    res = b.save(fn)
    if lang == "en":
        b.save("10-sistema-fotos.excalidraw")
    return res

def main():
    builders = [
        build_elite_performance,
        build_banco_sangre,
        build_ad2n_cloud,
        build_capital_marketing,
        build_julie,
        build_cemed_hub,
        build_letsgo_app,
        build_logistica_san_martin,
        build_sistema_pyme,
        build_sistema_fotos
    ]

    all_files = []
    print("Generating bilingual diagram files...")
    for builder in builders:
        f_en = builder("en")
        f_es = builder("es")
        all_files.extend([f_en, f_es])

    print(f"Generated {len(all_files)} diagram source files.")

if __name__ == "__main__":
    main()
