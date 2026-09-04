"""Generate Excalidraw architecture diagrams for portfolio projects following skill rules."""
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
        self.add_text("main_title", 40, 24, 800, 28, self.title, size=20, color="#00f3ff")
        self.add_text("sub_title", 40, 54, 950, 18, self.subtitle, size=12, color="#64748b")

    def add_rect(self, id_, x, y, w, h, stroke, bg, text=None, text_size=11, text_color="#ffffff", roundness=3):
        r = {
            "type": "rectangle",
            "id": id_,
            "x": x, "y": y, "width": w, "height": h,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": "solid",
            "strokeWidth": 2,
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
            for idx, line in enumerate(lines):
                t_id = f"{id_}_text_{idx}"
                r["boundElements"].append({"id": t_id, "type": "text"})
                t = {
                    "type": "text",
                    "id": t_id,
                    "x": x + 8, "y": start_y + idx * line_h,
                    "width": w - 16, "height": line_h,
                    "text": line,
                    "originalText": line,
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

    def add_arrow(self, id_, start_id, end_id, points, stroke="#00f2fe", label=None):
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
            "strokeWidth": 2,
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
            mid_x = (start_pt[0] + end_pt[0]) / 2 - 35
            mid_y = (start_pt[1] + end_pt[1]) / 2 - 16
            self.add_text(f"{id_}_lbl", mid_x, mid_y, 90, 15, label, size=10, color=stroke, align="center")

    def add_code_artifact(self, id_, x, y, w, h, title, lines, stroke="#334155", title_color="#38bdf8"):
        self.add_rect(id_, x, y, w, h, stroke=stroke, bg="#0b0f19", roundness=2)
        self.add_text(f"{id_}_title", x + 12, y + 10, w - 24, 16, title, size=11, color=title_color)
        self.elements.append({
            "type": "line",
            "id": f"{id_}_div",
            "x": x + 8, "y": y + 30,
            "width": w - 16, "height": 0,
            "strokeColor": "#21262d",
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
        curr_y = y + 38
        for idx, (line_text, color) in enumerate(lines):
            self.add_text(f"{id_}_ln_{idx}", x + 12, curr_y, w - 24, 15, line_text, size=10, color=color)
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

# -------------------------------------------------------------
# 1. ELITE PERFORMANCE
# -------------------------------------------------------------
def build_elite_performance():
    b = DiagramBuilder(
        "ELITE PERFORMANCE // BIO-TELEMETRY & CLINICAL PIPELINE",
        "Continuous ingestion from wearables (Whoop/Garmin) into Supabase RLS vault and 60FPS React 19 UI."
    )
    # Sec 1: Wearables Ingestion
    b.add_rect("sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("s1_t", 55, 108, 200, 16, "[01] WEARABLE TELEMETRY", size=12, color="#f857a6")
    b.add_rect("whoop", 60, 140, 190, 42, stroke="#f857a6", bg="#161b26", text="Whoop 4.0 (HRV/Strain)", text_size=11, text_color="#f857a6")
    b.add_rect("garmin", 60, 195, 190, 42, stroke="#fbbf24", bg="#161b26", text="Garmin Edge (VO2 Max)", text_size=11, text_color="#fbbf24")
    b.add_rect("apple", 60, 250, 190, 42, stroke="#38bdf8", bg="#161b26", text="Apple Health (Biometrics)", text_size=11, text_color="#38bdf8")
    b.add_code_artifact(
        "payload1", 55, 310, 200, 185,
        "// WEARABLE INGEST PACKET",
        [
            ('{', "#94a3b8"),
            ('  "athlete_id": "ep_u982",', "#94a3b8"),
            ('  "hrv_rmssd": 78.4,', "#22c55e"),
            ('  "vo2_current": 56.2,', "#22c55e"),
            ('  "strain_score": 14.8,', "#fbbf24"),
            ('  "auth_token": "Bearer..."', "#64748b"),
            ('}', "#94a3b8")
        ],
        stroke="#f857a6", title_color="#f857a6"
    )

    # Sec 2: Backend Gateway & Isolation
    b.add_rect("sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("s2_t", 320, 108, 240, 16, "[02] EXPRESS API & RLS VAULT", size=12, color="#10b981")
    b.add_rect("api", 325, 145, 230, 48, stroke="#10b981", bg="#13231e", text="Express / TS Gateway\nRate Limiter & Validator", text_size=11, text_color="#10b981")
    b.add_rect("db", 325, 240, 230, 48, stroke="#00f3ff", bg="#0c2328", text="Supabase PostgreSQL\nAtomic Upsert (Timeseries)", text_size=11, text_color="#00f3ff")
    b.add_code_artifact(
        "sql1", 320, 310, 240, 185,
        "// POSTGRESQL RLS SECURITY",
        [
            ("CREATE POLICY isolate_biometrics", "#38bdf8"),
            ("ON athlete_telemetry", "#f1f5f9"),
            ("FOR SELECT USING (", "#94a3b8"),
            ("  auth.uid() = athlete_id", "#a855f7"),
            ("); -- Zero data leak guarantee", "#64748b"),
            ("LOCK MODE = ROW EXCLUSIVE;", "#10b981")
        ],
        stroke="#10b981", title_color="#10b981"
    )

    # Sec 3: Realtime Pub/Sub & Client
    b.add_rect("sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("s3_t", 625, 108, 240, 16, "[03] REALTIME & REACT 19 UI", size=12, color="#fbbf24")
    b.add_rect("rt", 630, 145, 230, 48, stroke="#a855f7", bg="#20152b", text="Supabase Realtime\nWebSocket Live Channel", text_size=11, text_color="#a855f7")
    b.add_rect("client", 630, 240, 230, 48, stroke="#fbbf24", bg="#262013", text="React 19 / Motion SPA\n60 FPS Hardware Telemetry", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "event1", 625, 310, 240, 185,
        "// CLIENT SYNC BENCHMARK",
        [
            ("channel.on('broadcast', {", "#a855f7"),
            ("  event: 'TELEMETRY_TICK',", "#fbbf24"),
            ("  delta_latency: '< 2.4ms',", "#22c55e"),
            ("  render_cycle: '16.6ms 60fps',", "#00f3ff"),
            ("  css_footprint: '18KB (v4)'", "#f857a6"),
            ("});", "#a855f7")
        ],
        stroke="#fbbf24", title_color="#fbbf24"
    )

    # Sec 4: Coach Radar & Fan-Out
    b.add_rect("sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("s4_t", 925, 108, 165, 16, "[04] COACH RADAR", size=12, color="#00f3ff")
    b.add_rect("coach", 925, 145, 165, 54, stroke="#00f3ff", bg="#0f2229", text="Coach Live HUD\nReal-time alerts", text_size=11, text_color="#00f3ff")
    b.add_rect("rpe", 925, 235, 165, 54, stroke="#f857a6", bg="#261220", text="RPE Load Calculator\nOvertraining alert", text_size=11, text_color="#f857a6")
    b.add_rect("export", 925, 325, 165, 54, stroke="#10b981", bg="#12241b", text="HL7 / FHIR Export\nEncrypted sync", text_size=11, text_color="#10b981")

    # Arrows
    b.add_arrow("a_wh", "whoop", "api", [[250, 161], [325, 161]], stroke="#f857a6", label="Bluetooth")
    b.add_arrow("a_ga", "garmin", "api", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#fbbf24")
    b.add_arrow("a_ap", "apple", "api", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#38bdf8")
    b.add_arrow("a_api_db", "api", "db", [[440, 193], [440, 240]], stroke="#10b981", label="RLS Check")
    b.add_arrow("a_db_rt", "db", "rt", [[555, 264], [590, 264], [590, 169], [630, 169]], stroke="#00f3ff", label="CDC WAL")
    b.add_arrow("a_rt_cl", "rt", "client", [[745, 193], [745, 240]], stroke="#a855f7", label="WebSocket")
    b.add_arrow("a_cl_co", "client", "coach", [[860, 255], [890, 255], [890, 172], [925, 172]], stroke="#00f3ff")
    b.add_arrow("a_cl_rp", "client", "rpe", [[860, 264], [925, 264]], stroke="#f857a6")
    b.add_arrow("a_cl_ex", "client", "export", [[860, 275], [890, 275], [890, 352], [925, 352]], stroke="#10b981")

    return b.save("01-elite-performance.excalidraw")

# -------------------------------------------------------------
# 2. BANCO DE SANGRE (Clinical ERP & ACID Concurrency)
# -------------------------------------------------------------
def build_banco_sangre():
    b = DiagramBuilder(
        "BANCO DE SANGRE // ACID TRANSACTION & COLD-CHAIN PIPELINE",
        "Zero race-condition blood allocation under 200 req/s concurrency with PostgreSQL SERIALIZABLE isolation."
    )
    # Sec 1: Clinical Ingress & Triage
    b.add_rect("bs_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("bs_s1_t", 55, 108, 200, 16, "[01] CLINIC DISPATCH & TRIAGE", size=12, color="#00f3ff")
    b.add_rect("bs_er", 60, 140, 190, 42, stroke="#ff3300", bg="#281111", text="Emergency Room (OR)", text_size=11, text_color="#ff3300")
    b.add_rect("bs_icu", 60, 195, 190, 42, stroke="#fbbf24", bg="#261e12", text="ICU Trauma Unit", text_size=11, text_color="#fbbf24")
    b.add_rect("bs_ext", 60, 250, 190, 42, stroke="#38bdf8", bg="#101c2b", text="External Regional Clinic", text_size=11, text_color="#38bdf8")
    b.add_code_artifact(
        "bs_art1", 55, 310, 200, 185,
        "// BLOOD DISPATCH REQ",
        [
            ('{', "#94a3b8"),
            ('  "unit_type": "O_NEG",', "#ff3300"),
            ('  "volume_ml": 450,', "#22c55e"),
            ('  "priority": "CRITICAL_CODE_1",', "#fbbf24"),
            ('  "cold_chain_max_c": 4.0,', "#00f3ff"),
            ('  "req_timestamp": 1725400231', "#64748b"),
            ('}', "#94a3b8")
        ],
        stroke="#ff3300", title_color="#ff3300"
    )

    # Sec 2: Reverse Proxy & Laravel API
    b.add_rect("bs_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("bs_s2_t", 320, 108, 240, 16, "[02] NGINX & LARAVEL CORE", size=12, color="#a855f7")
    b.add_rect("bs_nginx", 325, 145, 230, 48, stroke="#00f3ff", bg="#0d242a", text="Nginx Reverse Proxy\nSSL & Rate-Limiter", text_size=11, text_color="#00f3ff")
    b.add_rect("bs_api", 325, 240, 230, 48, stroke="#a855f7", bg="#23132e", text="Laravel 11 REST Engine\nPessimistic Lock & Service", text_size=11, text_color="#a855f7")
    b.add_code_artifact(
        "bs_art2", 320, 310, 240, 185,
        "// CONCURRENCY LOCK QUERY",
        [
            ("DB::transaction(function() {", "#a855f7"),
            ("  $unit = BloodUnit::where('type','O-')", "#f1f5f9"),
            ("    ->where('status', 'READY')", "#22c55e"),
            ("    ->lockForUpdate() // PESSIMISTIC", "#ff3300"),
            ("    ->firstOrFail();", "#fbbf24"),
            ("  $unit->update(['status'=>'ALLOC']);", "#00f3ff"),
            ("}, 5); // 5 retries on deadlock", "#64748b")
        ],
        stroke="#a855f7", title_color="#a855f7"
    )

    # Sec 3: Cluster DB & Redis Queue
    b.add_rect("bs_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("bs_s3_t", 625, 108, 240, 16, "[03] CLUSTER STORAGE & QUEUES", size=12, color="#fbbf24")
    b.add_rect("bs_redis", 630, 145, 230, 48, stroke="#ff3300", bg="#2a1212", text="Redis 7 Queue Worker\nCold-Chain Alerts & Audit", text_size=11, text_color="#ff3300")
    b.add_rect("bs_pg", 630, 240, 230, 48, stroke="#fbbf24", bg="#262112", text="PostgreSQL DB Cluster\nSERIALIZABLE Isolation", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "bs_art3", 625, 310, 240, 185,
        "// POSTGRES LATENCY BENCHMARK",
        [
            ("SELECT query_time, concurrency", "#38bdf8"),
            ("FROM pg_stat_activity", "#f1f5f9"),
            ("WHERE state = 'active';", "#94a3b8"),
            ("Result: 0.08ms avg latency", "#22c55e"),
            ("Zero race conditions detected", "#00f3ff"),
            ("Index scan: idx_blood_units_type", "#a855f7")
        ],
        stroke="#fbbf24", title_color="#fbbf24"
    )

    # Sec 4: Traceability & Cold-Chain Output
    b.add_rect("bs_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("bs_s4_t", 925, 108, 165, 16, "[04] COLD TRACEABILITY", size=12, color="#10b981")
    b.add_rect("bs_iot", 925, 145, 165, 54, stroke="#00f3ff", bg="#0d242a", text="Reefer IoT Sensor\n2°C to 6°C Monitor", text_size=11, text_color="#00f3ff")
    b.add_rect("bs_label", 925, 235, 165, 54, stroke="#10b981", bg="#12251a", text="ISBT 128 Barcode\nRFID Unit Labeler", text_size=11, text_color="#10b981")
    b.add_rect("bs_audit", 925, 325, 165, 54, stroke="#fbbf24", bg="#262013", text="Clinical Audit Log\nLegal compliance trace", text_size=11, text_color="#fbbf24")

    # Arrows
    b.add_arrow("bs_a1", "bs_er", "bs_nginx", [[250, 161], [325, 161]], stroke="#ff3300", label="HTTPS REST")
    b.add_arrow("bs_a2", "bs_icu", "bs_nginx", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#fbbf24")
    b.add_arrow("bs_a3", "bs_ext", "bs_nginx", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#38bdf8")
    b.add_arrow("bs_a4", "bs_nginx", "bs_api", [[440, 193], [440, 240]], stroke="#00f3ff", label="FPM Sock")
    b.add_arrow("bs_a5", "bs_api", "bs_redis", [[555, 255], [590, 255], [590, 169], [630, 169]], stroke="#ff3300", label="Queue Job")
    b.add_arrow("bs_a6", "bs_api", "bs_pg", [[555, 264], [630, 264]], stroke="#fbbf24", label="lockForUpdate")
    b.add_arrow("bs_a7", "bs_pg", "bs_iot", [[860, 255], [890, 255], [890, 172], [925, 172]], stroke="#00f3ff")
    b.add_arrow("bs_a8", "bs_pg", "bs_label", [[860, 264], [925, 264]], stroke="#10b981")
    b.add_arrow("bs_a9", "bs_redis", "bs_audit", [[860, 169], [890, 169], [890, 352], [925, 352]], stroke="#fbbf24")

    return b.save("02-banco-de-sangre.excalidraw")

# -------------------------------------------------------------
# 3. AD2N CLOUD (Corporate Cloud & NGFW Perimeter)
# -------------------------------------------------------------
def build_ad2n_cloud():
    b = DiagramBuilder(
        "AD2N CLOUD // NGFW PERIMETER & KINETIC GSAP ARCHITECTURE",
        "Multi-layered cybersecurity edge with sub-0.8s Time-To-Interactive and animated vector path rendering."
    )
    # Sec 1: Edge & Threat Defense
    b.add_rect("ad_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ad_s1_t", 55, 108, 200, 16, "[01] PERIMETER & NGFW SHIELD", size=12, color="#00f2fe")
    b.add_rect("ad_ddos", 60, 140, 190, 42, stroke="#00f2fe", bg="#0d242a", text="Cloudflare DDoS / WAF", text_size=11, text_color="#00f2fe")
    b.add_rect("ad_ngfw", 60, 195, 190, 42, stroke="#10b981", bg="#12251a", text="Fortinet NGFW Rule Base", text_size=11, text_color="#10b981")
    b.add_rect("ad_ssl", 60, 250, 190, 42, stroke="#38bdf8", bg="#101c2b", text="TLS 1.3 Strict SNI", text_size=11, text_color="#38bdf8")
    b.add_code_artifact(
        "ad_art1", 55, 310, 200, 185,
        "// NGFW PACKET FILTER",
        [
            ("rule 101: allow established", "#10b981"),
            ("rule 102: drop bad-actor IPs", "#ff3300"),
            ("proto: TCP 443 / HTTPS", "#00f2fe"),
            ("geo_filter: whitelist valid", "#fbbf24"),
            ("bot_score: < 30 blocked", "#a855f7"),
            ("status: 0 drops on legitimate", "#22c55e")
        ],
        stroke="#00f2fe", title_color="#00f2fe"
    )

    # Sec 2: PHP 8.2 Modular Engine & Redis
    b.add_rect("ad_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ad_s2_t", 320, 108, 240, 16, "[02] PHP 8.2 & IN-MEMORY CACHE", size=12, color="#38bdf8")
    b.add_rect("ad_php", 325, 145, 230, 48, stroke="#38bdf8", bg="#101f2f", text="PHP 8.2 JIT Core\nModular Component Loader", text_size=11, text_color="#38bdf8")
    b.add_rect("ad_red", 325, 240, 230, 48, stroke="#ff3300", bg="#2a1212", text="Redis In-Memory Tier\nSession & Dynamic Cache", text_size=11, text_color="#ff3300")
    b.add_code_artifact(
        "ad_art2", 320, 310, 240, 185,
        "// SERVER RUNTIME METRIC",
        [
            ("opcache.jit = 1255;", "#38bdf8"),
            ("memory_consumption: 64MB", "#22c55e"),
            ("Time-To-Interactive: 0.78s", "#00f2fe"),
            ("gzip_compression: ratio 78%", "#fbbf24"),
            ("static_webp_deliver: async", "#10b981"),
            ("zero_thread_lock: TRUE", "#a855f7")
        ],
        stroke="#38bdf8", title_color="#38bdf8"
    )

    # Sec 3: Kinetic UI & GSAP Vector Engine
    b.add_rect("ad_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ad_s3_t", 625, 108, 240, 16, "[03] GSAP 3 & LENIS KINETIC", size=12, color="#a855f7")
    b.add_rect("ad_gsap", 630, 145, 230, 48, stroke="#a855f7", bg="#22132e", text="GSAP 3 ScrollTrigger\nAccelerated SVG paths", text_size=11, text_color="#a855f7")
    b.add_rect("ad_lenis", 630, 240, 230, 48, stroke="#fbbf24", bg="#262112", text="Lenis Inertial Engine\nFluid 60 FPS delta scroll", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "ad_art3", 625, 310, 240, 185,
        "// GSAP VECTOR TIMELINE",
        [
            ("gsap.timeline({ scrollTrigger: {", "#a855f7"),
            ("  trigger: '#cyber-canvas',", "#f1f5f9"),
            ("  scrub: 1.2,", "#fbbf24"),
            ("  start: 'top 80%',", "#64748b"),
            ("}}).to('.neon-circuit', {", "#00f2fe"),
            ("  strokeDashoffset: 0, ease:'power2'", "#22c55e"),
            ("});", "#a855f7")
        ],
        stroke="#a855f7", title_color="#a855f7"
    )

    # Sec 4: Cloud DRaaS & Virtualization Targets
    b.add_rect("ad_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ad_s4_t", 925, 108, 165, 16, "[04] CLOUD INFRA", size=12, color="#10b981")
    b.add_rect("ad_vm", 925, 145, 165, 54, stroke="#10b981", bg="#12251a", text="VMware / Hyper-V\nCloud Virtual Clusters", text_size=11, text_color="#10b981")
    b.add_rect("ad_draas", 925, 235, 165, 54, stroke="#00f2fe", bg="#0d242a", text="DRaaS Disaster Rec\n3-2-1 Immutability", text_size=11, text_color="#00f2fe")
    b.add_rect("ad_sdr", 925, 325, 165, 54, stroke="#fbbf24", bg="#262013", text="SOC 2 Compliance\n24/7 Security Operations", text_size=11, text_color="#fbbf24")

    # Arrows
    b.add_arrow("ad_a1", "ad_ddos", "ad_php", [[250, 161], [325, 161]], stroke="#00f2fe", label="WAF Filter")
    b.add_arrow("ad_a2", "ad_ngfw", "ad_php", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#10b981")
    b.add_arrow("ad_a3", "ad_ssl", "ad_php", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#38bdf8")
    b.add_arrow("ad_a4", "ad_php", "ad_red", [[440, 193], [440, 240]], stroke="#ff3300", label="Cache Key")
    b.add_arrow("ad_a5", "ad_php", "ad_gsap", [[555, 169], [630, 169]], stroke="#38bdf8", label="DOM Render")
    b.add_arrow("ad_a6", "ad_red", "ad_lenis", [[555, 264], [630, 264]], stroke="#fbbf24", label="State Sync")
    b.add_arrow("ad_a7", "ad_gsap", "ad_vm", [[860, 169], [925, 169]], stroke="#10b981")
    b.add_arrow("ad_a8", "ad_lenis", "ad_draas", [[860, 264], [925, 264]], stroke="#00f2fe")
    b.add_arrow("ad_a9", "ad_lenis", "ad_sdr", [[860, 275], [890, 275], [890, 352], [925, 352]], stroke="#fbbf24")

    return b.save("03-ad2n-cloud.excalidraw")

# -------------------------------------------------------------
# 4. LOGÍSTICA CARNES SAN MARTÍN (Cold-Chain Dispatch & Routing)
# -------------------------------------------------------------
def build_logistica_san_martin():
    b = DiagramBuilder(
        "LOGISTICA SAN MARTIN // REAL-TIME DISPATCH & VRP ENGINE",
        "Dynamic cold-chain vehicle routing problem (VRP) with real-time GPS & IoT reefer telemetry via Socket.io."
    )
    # Sec 1: Orders & Fleet GPS
    b.add_rect("sm_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sm_s1_t", 55, 108, 200, 16, "[01] FLEET & TELEMETRY", size=12, color="#a855f7")
    b.add_rect("sm_truck", 60, 140, 190, 42, stroke="#a855f7", bg="#20132b", text="Reefer Trucks (Fleet IoT)", text_size=11, text_color="#a855f7")
    b.add_rect("sm_temp", 60, 195, 190, 42, stroke="#00f2fe", bg="#0d242a", text="Thermal Sensor (-18°C)", text_size=11, text_color="#00f2fe")
    b.add_rect("sm_gps", 60, 250, 190, 42, stroke="#fbbf24", bg="#262112", text="GPS Telemetry (5s Ping)", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "sm_art1", 55, 310, 200, 185,
        "// TRUCK IOT PACKET",
        [
            ('{', "#94a3b8"),
            ('  "vehicle_id": "CSM-T42",', "#a855f7"),
            ('  "temp_c": -18.4,', "#00f2fe"),
            ('  "lat": 12.1364, "lng": -86.2514,', "#22c55e"),
            ('  "speed_kmh": 68.2,', "#fbbf24"),
            ('  "door_status": "LOCKED"', "#10b981"),
            ('}', "#94a3b8")
        ],
        stroke="#a855f7", title_color="#a855f7"
    )

    # Sec 2: Dispatch Engine & VRP Solver
    b.add_rect("sm_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sm_s2_t", 320, 108, 240, 16, "[02] DISPATCH & VRP ENGINE", size=12, color="#ff5f6d")
    b.add_rect("sm_vrp", 325, 145, 230, 48, stroke="#ff5f6d", bg="#2a1216", text="VRP Optimization Solver\nTraffic & Capacity Algos", text_size=11, text_color="#ff5f6d")
    b.add_rect("sm_laravel", 325, 240, 230, 48, stroke="#fbbf24", bg="#262013", text="Laravel Core API\nMySQL Order Matrix & Plan", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "sm_art2", 320, 310, 240, 185,
        "// VRP ROUTE COMPUTATION",
        [
            ("function solveVRP($orders, $fleet) {", "#ff5f6d"),
            ("  $matrix = computeDistanceMatrix();", "#f1f5f9"),
            ("  $optimal = dijkstraWithCapacity(", "#fbbf24"),
            ("    $matrix, $fleet, maxHours: 8", "#38bdf8"),
            ("  ); -- Min fuel & cold loss", "#64748b"),
            ("  return $optimal->routes;", "#22c55e"),
            ("}", "#ff5f6d")
        ],
        stroke="#ff5f6d", title_color="#ff5f6d"
    )

    # Sec 3: Realtime Socket Server & Geo Radar
    b.add_rect("sm_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sm_s3_t", 625, 108, 240, 16, "[03] SOCKET.IO & RADAR HUD", size=12, color="#00f2fe")
    b.add_rect("sm_sock", 630, 145, 230, 48, stroke="#00f2fe", bg="#0d242a", text="Node.js Socket.io Server\nBi-directional Broadcast", text_size=11, text_color="#00f2fe")
    b.add_rect("sm_hud", 630, 240, 230, 48, stroke="#10b981", bg="#12251a", text="Dispatcher Live Radar HUD\nMapbox GL Real-time Layers", text_size=11, text_color="#10b981")
    b.add_code_artifact(
        "sm_art3", 625, 310, 240, 185,
        "// SOCKET.IO FLEET RADAR",
        [
            ("io.on('connection', (socket) => {", "#00f2fe"),
            ("  socket.on('TRUCK_PING', (telemetry) => {", "#f1f5f9"),
            ("    if (telemetry.temp_c > -15) {", "#ff3300"),
            ("      alertDispatcherColdChain(telemetry);", "#ff3300"),
            ("    }", "#f1f5f9"),
            ("    io.emit('RADAR_UPDATE', telemetry);", "#22c55e"),
            ("  });", "#00f2fe"),
            ("});", "#00f2fe")
        ],
        stroke="#00f2fe", title_color="#00f2fe"
    )

    # Sec 4: Client Proof of Delivery & Warehouse
    b.add_rect("sm_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sm_s4_t", 925, 108, 165, 16, "[04] FULFILLMENT", size=12, color="#10b981")
    b.add_rect("sm_pod", 925, 145, 165, 54, stroke="#10b981", bg="#12251a", text="Digital Signature\nInstant Proof of Delivery", text_size=11, text_color="#10b981")
    b.add_rect("sm_hub", 925, 235, 165, 54, stroke="#fbbf24", bg="#262112", text="Cold Storage Hub\nPallet Weight Check", text_size=11, text_color="#fbbf24")
    b.add_rect("sm_erp", 925, 325, 165, 54, stroke="#a855f7", bg="#20132b", text="ERP Billing Auto-Sync\nFacturación Electrónica", text_size=11, text_color="#a855f7")

    # Arrows
    b.add_arrow("sm_a1", "sm_truck", "sm_vrp", [[250, 161], [325, 161]], stroke="#a855f7", label="IoT Ingest")
    b.add_arrow("sm_a2", "sm_temp", "sm_vrp", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#00f2fe")
    b.add_arrow("sm_a3", "sm_gps", "sm_vrp", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#fbbf24")
    b.add_arrow("sm_a4", "sm_vrp", "sm_laravel", [[440, 193], [440, 240]], stroke="#ff5f6d", label="Route Plan")
    b.add_arrow("sm_a5", "sm_vrp", "sm_sock", [[555, 169], [630, 169]], stroke="#00f2fe", label="Pub Sub")
    b.add_arrow("sm_a6", "sm_laravel", "sm_hud", [[555, 264], [630, 264]], stroke="#10b981", label="Radar GeoJSON")
    b.add_arrow("sm_a7", "sm_sock", "sm_pod", [[860, 169], [925, 169]], stroke="#10b981")
    b.add_arrow("sm_a8", "sm_hud", "sm_hub", [[860, 264], [925, 264]], stroke="#fbbf24")
    b.add_arrow("sm_a9", "sm_hud", "sm_erp", [[860, 275], [890, 275], [890, 352], [925, 352]], stroke="#a855f7")

    return b.save("08-logistica-san-martin.excalidraw")

# -------------------------------------------------------------
# 5. SISTEMA FOTOS (Cloudflare R2, WebP Worker & Stripe)
# -------------------------------------------------------------
def build_sistema_fotos():
    b = DiagramBuilder(
        "SISTEMA FOTOS // R2 DIRECT INGEST & WEBP PIPELINE",
        "Presigned zero-server uploads to Cloudflare R2, asynchronous Redis WebP watermark queues, and Stripe HMAC hooks."
    )
    # Sec 1: Client Direct Ingest (Zero Server Load)
    b.add_rect("sf_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sf_s1_t", 55, 108, 200, 16, "[01] CLIENT DIRECT UPLOAD", size=12, color="#c084fc")
    b.add_rect("sf_raw", 60, 140, 190, 42, stroke="#c084fc", bg="#20132b", text="RAW 45MB Photos", text_size=11, text_color="#c084fc")
    b.add_rect("sf_vue", 60, 195, 190, 42, stroke="#10b981", bg="#12251a", text="Vue 3 Chunked Uploader", text_size=11, text_color="#10b981")
    b.add_rect("sf_presign", 60, 250, 190, 42, stroke="#00f2fe", bg="#0d242a", text="Presigned S3 PUT URL", text_size=11, text_color="#00f2fe")
    b.add_code_artifact(
        "sf_art1", 55, 310, 200, 185,
        "// R2 PRESIGNED PUT REQ",
        [
            ("PUT /photos/raw/d9812.arw", "#00f2fe"),
            ("Host: r2.cloudflarestorage.com", "#94a3b8"),
            ("x-amz-expires: 900", "#fbbf24"),
            ("x-amz-signature: e98f12...", "#22c55e"),
            ("Content-Type: image/x-raw", "#64748b"),
            ("Status: 200 (0 server load)", "#10b981")
        ],
        stroke="#c084fc", title_color="#c084fc"
    )

    # Sec 2: Storage & Queue Workers
    b.add_rect("sf_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sf_s2_t", 320, 108, 240, 16, "[02] CLOUDFLARE R2 & WORKERS", size=12, color="#fbbf24")
    b.add_rect("sf_r2", 325, 145, 230, 48, stroke="#fbbf24", bg="#262112", text="Cloudflare R2 Storage\nZero Egress Fee Vault", text_size=11, text_color="#fbbf24")
    b.add_rect("sf_worker", 325, 240, 230, 48, stroke="#ff5f6d", bg="#2a1216", text="Asynchronous Image Worker\nWebP AVIF & Dynamic Watermark", text_size=11, text_color="#ff5f6d")
    b.add_code_artifact(
        "sf_art2", 320, 310, 240, 185,
        "// RESIZING BENCHMARK",
        [
            ("Original RAW: 48.2 MB", "#ff3300"),
            ("Processed WebP: 1.4 MB", "#22c55e"),
            ("Compression Ratio: 97.1%", "#00f2fe"),
            ("Dynamic Watermark: Burned", "#fbbf24"),
            ("Processing Latency: 420ms", "#10b981"),
            ("Queue workers: 16 threads", "#a855f7")
        ],
        stroke="#fbbf24", title_color="#fbbf24"
    )

    # Sec 3: Stripe E-Commerce & Webhook Security
    b.add_rect("sf_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sf_s3_t", 625, 108, 240, 16, "[03] STRIPE & HMAC WEBHOOK", size=12, color="#10b981")
    b.add_rect("sf_stripe", 630, 145, 230, 48, stroke="#a855f7", bg="#20132b", text="Stripe Checkout Engine\nCredit Card & Apple Pay", text_size=11, text_color="#a855f7")
    b.add_rect("sf_hook", 630, 240, 230, 48, stroke="#10b981", bg="#12251a", text="Laravel Webhook Receiver\nHMAC sha256 Verify", text_size=11, text_color="#10b981")
    b.add_code_artifact(
        "sf_art3", 625, 310, 240, 185,
        "// STRIPE WEBHOOK VERIFY",
        [
            ("Webhook::constructEvent(", "#a855f7"),
            ("  $payload, $sigHeader, $secret", "#f1f5f9"),
            (");", "#a855f7"),
            ("if ($event->type === 'checkout.completed') {", "#10b981"),
            ("  generateExpiringToken($order);", "#00f2fe"),
            ("}", "#10b981")
        ],
        stroke="#10b981", title_color="#10b981"
    )

    # Sec 4: Expiring Crypted Delivery
    b.add_rect("sf_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("sf_s4_t", 925, 108, 165, 16, "[04] SECURE DELIVERY", size=12, color="#00f2fe")
    b.add_rect("sf_token", 925, 145, 165, 54, stroke="#00f2fe", bg="#0d242a", text="Temporary Token\n12-Hour HMAC Expiry", text_size=11, text_color="#00f2fe")
    b.add_rect("sf_stream", 925, 235, 165, 54, stroke="#10b981", bg="#12251a", text="Full-Res Download\nEncrypted stream buffer", text_size=11, text_color="#10b981")
    b.add_rect("sf_audit", 925, 325, 165, 54, stroke="#c084fc", bg="#20132b", text="Fraud Protection\nMax 3 downloads / IP", text_size=11, text_color="#c084fc")

    # Arrows
    b.add_arrow("sf_a1", "sf_raw", "sf_r2", [[250, 161], [325, 161]], stroke="#c084fc", label="Direct S3 PUT")
    b.add_arrow("sf_a2", "sf_vue", "sf_r2", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#10b981")
    b.add_arrow("sf_a3", "sf_presign", "sf_r2", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#00f2fe")
    b.add_arrow("sf_a4", "sf_r2", "sf_worker", [[440, 193], [440, 240]], stroke="#fbbf24", label="Event Trigger")
    b.add_arrow("sf_a5", "sf_worker", "sf_stripe", [[555, 255], [590, 255], [590, 169], [630, 169]], stroke="#a855f7", label="Catalog Sync")
    b.add_arrow("sf_a6", "sf_stripe", "sf_hook", [[745, 193], [745, 240]], stroke="#10b981", label="Webhook Event")
    b.add_arrow("sf_a7", "sf_hook", "sf_token", [[860, 255], [890, 255], [890, 172], [925, 172]], stroke="#00f2fe")
    b.add_arrow("sf_a8", "sf_hook", "sf_stream", [[860, 264], [925, 264]], stroke="#10b981")
    b.add_arrow("sf_a9", "sf_hook", "sf_audit", [[860, 275], [890, 275], [890, 352], [925, 352]], stroke="#c084fc")

    return b.save("10-sistema-fotos.excalidraw")

# (remaining builders continue below)

# -------------------------------------------------------------
# 6. CAPITAL MARKETING (3D Showroom & GSAP WebGL)
# -------------------------------------------------------------
def build_capital_marketing():
    b = DiagramBuilder(
        "CAPITAL MARKETING // THREE.JS 3D SHOWROOM & GSAP PIPELINE",
        "Hardware-accelerated WebGL scene with InstancedMesh geometry, custom GLSL shaders, and Lenis scroll coordination."
    )
    # Sec 1: 3D Assets & Shaders
    b.add_rect("cm_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("cm_s1_t", 55, 108, 200, 16, "[01] 3D ASSETS & SHADERS", size=12, color="#e879f9")
    b.add_rect("cm_gltf", 60, 140, 190, 42, stroke="#e879f9", bg="#241329", text="DRACO Compressed GLTF", text_size=11, text_color="#e879f9")
    b.add_rect("cm_glsl", 60, 195, 190, 42, stroke="#00f2fe", bg="#0d242a", text="Custom GLSL Shaders", text_size=11, text_color="#00f2fe")
    b.add_rect("cm_tex", 60, 250, 190, 42, stroke="#fbbf24", bg="#262112", text="4K KTX2 Texture Atlas", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "cm_art1", 55, 310, 200, 185,
        "// GLSL FRAGMENT SHADER",
        [
            ("uniform float uTime;", "#e879f9"),
            ("varying vec2 vUv;", "#f1f5f9"),
            ("void main() {", "#94a3b8"),
            ("  vec3 color = mix(cyan, purple,", "#00f2fe"),
            ("    sin(vUv.x * 10.0 + uTime));", "#22c55e"),
            ("  gl_FragColor = vec4(color, 1.0);", "#fbbf24"),
            ("}", "#94a3b8")
        ],
        stroke="#e879f9", title_color="#e879f9"
    )

    # Sec 2: WebGL Engine & Instancing
    b.add_rect("cm_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("cm_s2_t", 320, 108, 240, 16, "[02] THREE.JS WEBGL CORE", size=12, color="#00f2fe")
    b.add_rect("cm_three", 325, 145, 230, 48, stroke="#00f2fe", bg="#0d242a", text="Three.js WebGLRenderer\nInstancedMesh (1 Draw Call)", text_size=11, text_color="#00f2fe")
    b.add_rect("cm_fx", 325, 240, 230, 48, stroke="#e879f9", bg="#241329", text="EffectComposer Post-FX\nUnrealBloom & Chromatic Aberr", text_size=11, text_color="#e879f9")
    b.add_code_artifact(
        "cm_art2", 320, 310, 240, 185,
        "// WEBGL DRAW BENCHMARK",
        [
            ("Draw Calls: 1 (Instanced)", "#22c55e"),
            ("Triangles: 124,000 polys", "#00f2fe"),
            ("VRAM Footprint: 48MB", "#fbbf24"),
            ("FPS: Steady 60fps (16.6ms)", "#10b981"),
            ("DRACO decode time: 28ms", "#e879f9"),
            ("Antialias: FXAA pass active", "#94a3b8")
        ],
        stroke="#00f2fe", title_color="#00f2fe"
    )

    # Sec 3: GSAP Scroll Coordination
    b.add_rect("cm_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("cm_s3_t", 625, 108, 240, 16, "[03] GSAP SCROLL & LENIS", size=12, color="#fbbf24")
    b.add_rect("cm_gsap", 630, 145, 230, 48, stroke="#fbbf24", bg="#262112", text="GSAP ScrollTrigger\nCamera Orbit Scrubbing", text_size=11, text_color="#fbbf24")
    b.add_rect("cm_lenis", 630, 240, 230, 48, stroke="#10b981", bg="#12251a", text="Lenis Smooth Scroll\nInertial Velocity Coupling", text_size=11, text_color="#10b981")
    b.add_code_artifact(
        "cm_art3", 625, 310, 240, 185,
        "// CAMERA ORBIT TIMELINE",
        [
            ("gsap.timeline({ scrollTrigger: {", "#fbbf24"),
            ("  trigger: '#showroom-stage',", "#f1f5f9"),
            ("  scrub: 1.0, pin: true", "#00f2fe"),
            ("}}).to(camera.position, {", "#e879f9"),
            ("  x: 12, y: 4, z: 20, ease: 'none'", "#22c55e"),
            ("});", "#fbbf24")
        ],
        stroke="#fbbf24", title_color="#fbbf24"
    )

    # Sec 4: Output Showroom
    b.add_rect("cm_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("cm_s4_t", 925, 108, 165, 16, "[04] IMMERSIVE SHOWROOM", size=12, color="#10b981")
    b.add_rect("cm_canvas", 925, 145, 165, 54, stroke="#10b981", bg="#12251a", text="Interactive 3D Canvas\nFull-bleed 4K viewport", text_size=11, text_color="#10b981")
    b.add_rect("cm_card", 925, 235, 165, 54, stroke="#00f2fe", bg="#0d242a", text="Agency Showcase SPA\nSeamless chapter routing", text_size=11, text_color="#00f2fe")
    b.add_rect("cm_seo", 925, 325, 165, 54, stroke="#e879f9", bg="#241329", text="Lighthouse 98 Perf\nZero main-thread jank", text_size=11, text_color="#e879f9")

    # Arrows
    b.add_arrow("cm_a1", "cm_gltf", "cm_three", [[250, 161], [325, 161]], stroke="#e879f9", label="GLTF Buffer")
    b.add_arrow("cm_a2", "cm_glsl", "cm_three", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#00f2fe")
    b.add_arrow("cm_a3", "cm_tex", "cm_three", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#fbbf24")
    b.add_arrow("cm_a4", "cm_three", "cm_fx", [[440, 193], [440, 240]], stroke="#e879f9", label="Render Pass")
    b.add_arrow("cm_a5", "cm_three", "cm_gsap", [[555, 169], [630, 169]], stroke="#00f2fe", label="Scrub RAF")
    b.add_arrow("cm_a6", "cm_fx", "cm_lenis", [[555, 264], [630, 264]], stroke="#10b981", label="Inertia Sync")
    b.add_arrow("cm_a7", "cm_gsap", "cm_canvas", [[860, 169], [925, 169]], stroke="#10b981")
    b.add_arrow("cm_a8", "cm_lenis", "cm_card", [[860, 264], [925, 264]], stroke="#00f2fe")
    b.add_arrow("cm_a9", "cm_lenis", "cm_seo", [[860, 275], [890, 275], [890, 352], [925, 352]], stroke="#e879f9")

    return b.save("04-capital-marketing.excalidraw")

# -------------------------------------------------------------
# 7. JULIE (Pastel 3D Realm & Kinetic GSAP Experience)
# -------------------------------------------------------------
def build_julie():
    b = DiagramBuilder(
        "JULIE // PASTEL 3D REALM & KINETIC GSAP EXPERIENCE",
        "Physics-driven Three.js particle field with pointer vector integration and synchronized kinetic typography."
    )
    # Sec 1: User Input & Pointer
    b.add_rect("ju_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ju_s1_t", 55, 108, 200, 16, "[01] USER VECTORS & AUDIO", size=12, color="#fb7185")
    b.add_rect("ju_mouse", 60, 140, 190, 42, stroke="#fb7185", bg="#261318", text="Pointer Coordinates (x,y)", text_size=11, text_color="#fb7185")
    b.add_rect("ju_audio", 60, 195, 190, 42, stroke="#38bdf8", bg="#101f2f", text="Web Audio API (FFT Frequency)", text_size=11, text_color="#38bdf8")
    b.add_rect("ju_gyro", 60, 250, 190, 42, stroke="#f472b6", bg="#261220", text="DeviceOrientation Gyro", text_size=11, text_color="#f472b6")
    b.add_code_artifact(
        "ju_art1", 55, 310, 200, 185,
        "// POINTER FORCE PACKET",
        [
            ('{\n  "norm_x": 0.421,', "#fb7185"),
            ('  "norm_y": -0.188,', "#fb7185"),
            ('  "velocity": 1.84,', "#22c55e"),
            ('  "audio_energy_hz": 420,', "#38bdf8"),
            ('  "color_mix_ratio": 0.85', "#f472b6"),
            ('}', "#94a3b8")
        ],
        stroke="#fb7185", title_color="#fb7185"
    )

    # Sec 2: Particle Field Physics
    b.add_rect("ju_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ju_s2_t", 320, 108, 240, 16, "[02] PARTICLE PHYSICS CORE", size=12, color="#f472b6")
    b.add_rect("ju_phys", 325, 145, 230, 48, stroke="#f472b6", bg="#261220", text="Verlet Integration Engine\nAttraction & Repulsion Vector", text_size=11, text_color="#f472b6")
    b.add_rect("ju_cloud", 325, 240, 230, 48, stroke="#fb7185", bg="#261318", text="Three.js Points Cloud\n15,000 Pastel Particles", text_size=11, text_color="#fb7185")
    b.add_code_artifact(
        "ju_art2", 320, 310, 240, 185,
        "// PHYSICS FORCE COMPUTE",
        [
            ("function updateParticles(dt) {", "#f472b6"),
            ("  vec3 diff = target - pos;", "#f1f5f9"),
            ("  float dist = length(diff);", "#94a3b8"),
            ("  vel += normalize(diff) * (1.0/dist);", "#22c55e"),
            ("  pos += vel * damping * dt;", "#fb7185"),
            ("}", "#f472b6")
        ],
        stroke="#f472b6", title_color="#f472b6"
    )

    # Sec 3: Kinetic Typography & GSAP
    b.add_rect("ju_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ju_s3_t", 625, 108, 240, 16, "[03] KINETIC GSAP STAGE", size=12, color="#38bdf8")
    b.add_rect("ju_gsap", 630, 145, 230, 48, stroke="#38bdf8", bg="#101f2f", text="GSAP 3 Kinetic Text\nCharacter Stagger Waveform", text_size=11, text_color="#38bdf8")
    b.add_rect("ju_bloom", 630, 240, 230, 48, stroke="#fbbf24", bg="#262112", text="Soft Pastel Bloom Filter\nLuminance threshold pass", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "ju_art3", 625, 310, 240, 185,
        "// KINETIC TEXT WAVE",
        [
            ("gsap.from('.kinetic-char', {", "#38bdf8"),
            ("  y: '100%', rotateZ: 8,", "#f1f5f9"),
            ("  stagger: 0.04,", "#fbbf24"),
            ("  duration: 1.2, ease: 'expo.out',", "#22c55e"),
            ("  color: '#fb7185'", "#fb7185"),
            ("});", "#38bdf8")
        ],
        stroke="#38bdf8", title_color="#38bdf8"
    )

    # Sec 4: Pastel 3D Realm Experience
    b.add_rect("ju_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ju_s4_t", 925, 108, 165, 16, "[04] PASTEL REALM", size=12, color="#fb7185")
    b.add_rect("ju_realm", 925, 145, 165, 54, stroke="#fb7185", bg="#261318", text="Interactive Realm\nPlayful micro-actions", text_size=11, text_color="#fb7185")
    b.add_rect("ju_audio_out", 925, 235, 165, 54, stroke="#38bdf8", bg="#101f2f", text="Spatial Audio\nBinaural soundscape", text_size=11, text_color="#38bdf8")
    b.add_rect("ju_fps", 925, 325, 165, 54, stroke="#22c55e", bg="#12251a", text="60 FPS Sustained\nMobile optimized", text_size=11, text_color="#22c55e")

    # Arrows
    b.add_arrow("ju_a1", "ju_mouse", "ju_phys", [[250, 161], [325, 161]], stroke="#fb7185", label="Vector xy")
    b.add_arrow("ju_a2", "ju_audio", "ju_phys", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#38bdf8")
    b.add_arrow("ju_a3", "ju_gyro", "ju_phys", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#f472b6")
    b.add_arrow("ju_a4", "ju_phys", "ju_cloud", [[440, 193], [440, 240]], stroke="#f472b6", label="Position Array")
    b.add_arrow("ju_a5", "ju_phys", "ju_gsap", [[555, 169], [630, 169]], stroke="#38bdf8", label="Trigger Hit")
    b.add_arrow("ju_a6", "ju_cloud", "ju_bloom", [[555, 264], [630, 264]], stroke="#fbbf24", label="Luma Buffer")
    b.add_arrow("ju_a7", "ju_gsap", "ju_realm", [[860, 169], [925, 169]], stroke="#fb7185")
    b.add_arrow("ju_a8", "ju_bloom", "ju_audio_out", [[860, 264], [925, 264]], stroke="#38bdf8")
    b.add_arrow("ju_a9", "ju_bloom", "ju_fps", [[860, 275], [890, 275], [890, 352], [925, 352]], stroke="#22c55e")

    return b.save("05-julie.excalidraw")

# -------------------------------------------------------------
# 8. CEMED HUB (Medical Dashboards & High-Volume Analytics)
# -------------------------------------------------------------
def build_cemed_hub():
    b = DiagramBuilder(
        "CEMED HUB // MEDICAL INFRASTRUCTURE & CLINICAL DASHBOARD",
        "Multi-tenant clinical EHR processing with RBAC permission shields, high-concurrency SQL views and Vue 3 dashboards."
    )
    # Sec 1: Clinical EHR Ingestion
    b.add_rect("ce_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ce_s1_t", 55, 108, 200, 16, "[01] CLINICAL EHR INGEST", size=12, color="#10b981")
    b.add_rect("ce_doctor", 60, 140, 190, 42, stroke="#10b981", bg="#12251a", text="Doctor Clinical Station", text_size=11, text_color="#10b981")
    b.add_rect("ce_lab", 60, 195, 190, 42, stroke="#00f2fe", bg="#0d242a", text="Biochemical Lab Results", text_size=11, text_color="#00f2fe")
    b.add_rect("ce_triage", 60, 250, 190, 42, stroke="#fbbf24", bg="#262112", text="Patient Triage Ingest", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "ce_art1", 55, 310, 200, 185,
        "// EHR CLINICAL RECORD",
        [
            ('{', "#94a3b8"),
            ('  "patient_id": "MED-8491",', "#10b981"),
            ('  "blood_pressure": "120/80",', "#22c55e"),
            ('  "glucose_mg_dl": 94.2,', "#fbbf24"),
            ('  "triage_code": "GREEN",', "#00f2fe"),
            ('  "encrypted_hash": "a98f1..."', "#64748b"),
            ('}', "#94a3b8")
        ],
        stroke="#10b981", title_color="#10b981"
    )

    # Sec 2: RBAC Guard & Backend Core
    b.add_rect("ce_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ce_s2_t", 320, 108, 240, 16, "[02] RBAC SECURITY VAULT", size=12, color="#00f2fe")
    b.add_rect("ce_rbac", 325, 145, 230, 48, stroke="#00f2fe", bg="#0d242a", text="Laravel 11 RBAC Guard\nHIPAA Role Matrix Permission", text_size=11, text_color="#00f2fe")
    b.add_rect("ce_pg", 325, 240, 230, 48, stroke="#10b981", bg="#12251a", text="PostgreSQL Clustered DB\nEncrypted Medical Data Views", text_size=11, text_color="#10b981")
    b.add_code_artifact(
        "ce_art2", 320, 310, 240, 185,
        "// SQL AGGREGATION VIEW",
        [
            ("CREATE MATERIALIZED VIEW", "#00f2fe"),
            ("clinic_kpi_hourly AS", "#f1f5f9"),
            ("SELECT clinic_id, avg(wait_min),", "#fbbf24"),
            ("       count(patient_id) as total", "#22c55e"),
            ("FROM emergency_admissions", "#94a3b8"),
            ("GROUP BY clinic_id; -- Sub-ms", "#10b981")
        ],
        stroke="#00f2fe", title_color="#00f2fe"
    )

    # Sec 3: Vue 3 / Vuetify Analytics Engine
    b.add_rect("ce_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ce_s3_t", 625, 108, 240, 16, "[03] VUETIFY 3 & PINIA", size=12, color="#a855f7")
    b.add_rect("ce_pinia", 630, 145, 230, 48, stroke="#a855f7", bg="#20132b", text="Pinia Store Reactive State\nModular Clinic Compartments", text_size=11, text_color="#a855f7")
    b.add_rect("ce_dash", 630, 240, 230, 48, stroke="#fbbf24", bg="#262112", text="Vuetify 3 Dynamic HUD\nApexCharts Clinical Gauges", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "ce_art3", 625, 310, 240, 185,
        "// CLINICAL AUDIT METRIC",
        [
            ("Active Clinics: 12 hubs", "#10b981"),
            ("Data Isolation: 100% tenant", "#22c55e"),
            ("Query Latency: 0.12ms", "#00f2fe"),
            ("HIPAA Compliance: Verified", "#a855f7"),
            ("Concurrent Doctors: 450 active", "#fbbf24")
        ],
        stroke="#a855f7", title_color="#a855f7"
    )

    # Sec 4: Medical Dispatch & Reporting
    b.add_rect("ce_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("ce_s4_t", 925, 108, 165, 16, "[04] CLINICAL OUTPUTS", size=12, color="#10b981")
    b.add_rect("ce_pdf", 925, 145, 165, 54, stroke="#10b981", bg="#12251a", text="Signed Medical PDF\nCryptographic SHA-256", text_size=11, text_color="#10b981")
    b.add_rect("ce_pharm", 925, 235, 165, 54, stroke="#00f2fe", bg="#0d242a", text="Pharmacy Dispatch\nPrescription Barcode", text_size=11, text_color="#00f2fe")
    b.add_rect("ce_audit", 925, 325, 165, 54, stroke="#fbbf24", bg="#262013", text="Regulatory Archive\n7-Year Legal Retention", text_size=11, text_color="#fbbf24")

    # Arrows
    b.add_arrow("ce_a1", "ce_doctor", "ce_rbac", [[250, 161], [325, 161]], stroke="#10b981", label="Auth JWT")
    b.add_arrow("ce_a2", "ce_lab", "ce_rbac", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#00f2fe")
    b.add_arrow("ce_a3", "ce_triage", "ce_rbac", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#fbbf24")
    b.add_arrow("ce_a4", "ce_rbac", "ce_pg", [[440, 193], [440, 240]], stroke="#00f2fe", label="Permission Check")
    b.add_arrow("ce_a5", "ce_rbac", "ce_pinia", [[555, 169], [630, 169]], stroke="#a855f7", label="REST State")
    b.add_arrow("ce_a6", "ce_pg", "ce_dash", [[555, 264], [630, 264]], stroke="#fbbf24", label="KPI Stream")
    b.add_arrow("ce_a7", "ce_pinia", "ce_pdf", [[860, 169], [925, 169]], stroke="#10b981")
    b.add_arrow("ce_a8", "ce_dash", "ce_pharm", [[860, 264], [925, 264]], stroke="#00f2fe")
    b.add_arrow("ce_a9", "ce_dash", "ce_audit", [[860, 275], [890, 275], [890, 352], [925, 352]], stroke="#fbbf24")

    return b.save("06-cemed-hub.excalidraw")

# -------------------------------------------------------------
# 9. LETSGO APP (Mobility & Geo-Spatial Dispatch Engine)
# -------------------------------------------------------------
def build_letsgo_app():
    b = DiagramBuilder(
        "LETSGO APP // MOBILITY & GEO-SPATIAL DISPATCH ENGINE",
        "Sub-second Haversine taxi dispatching, Socket.io bi-directional telemetry mesh, and React Native mobile clients."
    )
    # Sec 1: Mobile Apps
    b.add_rect("lg_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("lg_s1_t", 55, 108, 200, 16, "[01] MOBILE APPS", size=12, color="#38bdf8")
    b.add_rect("lg_rider", 60, 140, 190, 42, stroke="#38bdf8", bg="#101f2f", text="Passenger App (React Native)", text_size=11, text_color="#38bdf8")
    b.add_rect("lg_driver", 60, 195, 190, 42, stroke="#10b981", bg="#12251a", text="Driver App (Background GPS)", text_size=11, text_color="#10b981")
    b.add_rect("lg_geo", 60, 250, 190, 42, stroke="#fbbf24", bg="#262112", text="Haversine Geolocation Request", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "lg_art1", 55, 310, 200, 185,
        "// RIDE REQUEST PAYLOAD",
        [
            ('{', "#94a3b8"),
            ('  "rider_id": "usr_9918",', "#38bdf8"),
            ('  "pickup": [12.132, -86.250],', "#22c55e"),
            ('  "dest": [12.150, -86.230],', "#fbbf24"),
            ('  "fare_tier": "COMFORT",', "#00f2fe"),
            ('  "payment_method": "STRIPE"', "#a855f7"),
            ('}', "#94a3b8")
        ],
        stroke="#38bdf8", title_color="#38bdf8"
    )

    # Sec 2: Dispatch Engine & Geo-Index
    b.add_rect("lg_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("lg_s2_t", 320, 108, 240, 16, "[02] DISPATCH & GEOSPATIAL", size=12, color="#00f2fe")
    b.add_rect("lg_mesh", 325, 145, 230, 48, stroke="#00f2fe", bg="#0d242a", text="Socket.io WebSocket Mesh\nSub-50ms Telemetry Broadcast", text_size=11, text_color="#00f2fe")
    b.add_rect("lg_redis", 325, 240, 230, 48, stroke="#ff5f6d", bg="#2a1216", text="Redis Geospatial Engine\nGEOSEARCH BYRADIUS (3km)", text_size=11, text_color="#ff5f6d")
    b.add_code_artifact(
        "lg_art2", 320, 310, 240, 185,
        "// REDIS GEO SEARCH",
        [
            ("GEOSEARCH drivers_active", "#ff5f6d"),
            ("FROMLONLAT -86.250 12.132", "#f1f5f9"),
            ("BYRADIUS 3 km ASC", "#fbbf24"),
            ("COUNT 5 WITHDIST WITHCOORD;", "#22c55e"),
            ("Latency: 0.4ms execution", "#00f2fe"),
            ("Matched driver: drv_44 (1.2km)", "#10b981")
        ],
        stroke="#00f2fe", title_color="#00f2fe"
    )

    # Sec 3: State Machine & Payment Escrow
    b.add_rect("lg_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("lg_s3_t", 625, 108, 240, 16, "[03] TRIP STATE MACHINE", size=12, color="#a855f7")
    b.add_rect("lg_fsm", 630, 145, 230, 48, stroke="#a855f7", bg="#20132b", text="Trip FSM (State Guard)\nREQUESTED ➔ ACCEPT ➔ TRIP", text_size=11, text_color="#a855f7")
    b.add_rect("lg_mongo", 630, 240, 230, 48, stroke="#10b981", bg="#12251a", text="MongoDB Timeseries Cluster\nTurn-by-Turn GPS Coordinate Trace", text_size=11, text_color="#10b981")
    b.add_code_artifact(
        "lg_art3", 625, 310, 240, 185,
        "// TRIP STATE MACHINE",
        [
            ("state_transition = {", "#a855f7"),
            ("  'REQUESTED': ['ACCEPTED','TIMEOUT'],", "#f1f5f9"),
            ("  'ACCEPTED': ['ARRIVED','CANCELLED'],", "#fbbf24"),
            ("  'IN_TRANSIT': ['COMPLETED'],", "#22c55e"),
            ("  'COMPLETED': ['PAYMENT_SETTLED']", "#00f2fe"),
            ("};", "#a855f7")
        ],
        stroke="#a855f7", title_color="#a855f7"
    )

    # Sec 4: Settlement & Feedback
    b.add_rect("lg_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("lg_s4_t", 925, 108, 165, 16, "[04] SETTLEMENT", size=12, color="#10b981")
    b.add_rect("lg_stripe", 925, 145, 165, 54, stroke="#10b981", bg="#12251a", text="Stripe Escrow Split\nInstant Driver Payout", text_size=11, text_color="#10b981")
    b.add_rect("lg_rate", 925, 235, 165, 54, stroke="#fbbf24", bg="#262112", text="Two-Way Rating\nFraud Protection Guard", text_size=11, text_color="#fbbf24")
    b.add_rect("lg_notif", 925, 325, 165, 54, stroke="#38bdf8", bg="#101f2f", text="FCM Push Notification\nTrip Receipts & Alerts", text_size=11, text_color="#38bdf8")

    # Arrows
    b.add_arrow("lg_a1", "lg_rider", "lg_mesh", [[250, 161], [325, 161]], stroke="#38bdf8", label="WebSocket")
    b.add_arrow("lg_a2", "lg_driver", "lg_mesh", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#10b981")
    b.add_arrow("lg_a3", "lg_geo", "lg_mesh", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#fbbf24")
    b.add_arrow("lg_a4", "lg_mesh", "lg_redis", [[440, 193], [440, 240]], stroke="#ff5f6d", label="GEOSEARCH")
    b.add_arrow("lg_a5", "lg_mesh", "lg_fsm", [[555, 169], [630, 169]], stroke="#a855f7", label="Dispatch Match")
    b.add_arrow("lg_a6", "lg_redis", "lg_mongo", [[555, 264], [630, 264]], stroke="#10b981", label="Trace GPS")
    b.add_arrow("lg_a7", "lg_fsm", "lg_stripe", [[860, 169], [925, 169]], stroke="#10b981")
    b.add_arrow("lg_a8", "lg_fsm", "lg_rate", [[860, 190], [890, 190], [890, 262], [925, 262]], stroke="#fbbf24")
    b.add_arrow("lg_a9", "lg_mongo", "lg_notif", [[860, 264], [890, 264], [890, 352], [925, 352]], stroke="#38bdf8")

    return b.save("07-letsgo-app.excalidraw")

# -------------------------------------------------------------
# 10. SISTEMA PYME (Enterprise ERP & Electronic Invoicing)
# -------------------------------------------------------------
def build_sistema_pyme():
    b = DiagramBuilder(
        "SISTEMA PYME // ENTERPRISE ADMINISTRATIVE ERP & FISCAL INVOICING",
        "Multi-tenant point of sale, DGI/SAT XML fiscal signing with X.509 certs, and double-entry accounting ledger."
    )
    # Sec 1: Multi-Tenant POS
    b.add_rect("py_sec1", 40, 95, 230, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("py_s1_t", 55, 108, 200, 16, "[01] POS & STORE TERMINAL", size=12, color="#ff5f6d")
    b.add_rect("py_pos", 60, 140, 190, 42, stroke="#ff5f6d", bg="#2a1216", text="Vue 3 Offline POS Terminal", text_size=11, text_color="#ff5f6d")
    b.add_rect("py_scan", 60, 195, 190, 42, stroke="#00f2fe", bg="#0d242a", text="Barcode & RFID Inventory", text_size=11, text_color="#00f2fe")
    b.add_rect("py_order", 60, 250, 190, 42, stroke="#fbbf24", bg="#262112", text="Multi-Currency Sale Ingest", text_size=11, text_color="#fbbf24")
    b.add_code_artifact(
        "py_art1", 55, 310, 200, 185,
        "// FISCAL SALE INGEST",
        [
            ('{', "#94a3b8"),
            ('  "tenant_id": "pyme_corp9",', "#ff5f6d"),
            ('  "subtotal": 1420.50,', "#22c55e"),
            ('  "tax_iva": 213.08,', "#fbbf24"),
            ('  "currency": "USD",', "#00f2fe"),
            ('  "fiscal_stamp": "PENDING"', "#a855f7"),
            ('}', "#94a3b8")
        ],
        stroke="#ff5f6d", title_color="#ff5f6d"
    )

    # Sec 2: Fiscal Engine & XML Signing
    b.add_rect("py_sec2", 305, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("py_s2_t", 320, 108, 240, 16, "[02] FISCAL INVOICING CORE", size=12, color="#fbbf24")
    b.add_rect("py_xml", 325, 145, 230, 48, stroke="#fbbf24", bg="#262112", text="XML Generator (UBL 2.1)\nX.509 Cryptographic Digital Signature", text_size=11, text_color="#fbbf24")
    b.add_rect("py_sat", 325, 240, 230, 48, stroke="#10b981", bg="#12251a", text="DGI / Tax Authority Web Service\nSynchronous Stamp Validation", text_size=11, text_color="#10b981")
    b.add_code_artifact(
        "py_art2", 320, 310, 240, 185,
        "// XML SIGNATURE VALIDATE",
        [
            ("<ds:Signature xmlns:ds='...'>", "#fbbf24"),
            ("  <ds:SignedInfo>", "#f1f5f9"),
            ("    <ds:DigestValue>e98f1...</ds:DigestValue>", "#22c55e"),
            ("  </ds:SignedInfo>", "#f1f5f9"),
            ("  Status: FISCAL_STAMP_APPROVED", "#10b981"),
            ("  Auth Code: CUFE-98218-DGI", "#00f2fe"),
            ("</ds:Signature>", "#fbbf24")
        ],
        stroke="#fbbf24", title_color="#fbbf24"
    )

    # Sec 3: Double-Entry Ledger & Inventory
    b.add_rect("py_sec3", 610, 95, 270, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("py_s3_t", 625, 108, 240, 16, "[03] DOUBLE-ENTRY ACCOUNTING", size=12, color="#00f2fe")
    b.add_rect("py_ledger", 630, 145, 230, 48, stroke="#00f2fe", bg="#0d242a", text="Double-Entry Ledger\nDebit = Credit Reconciliation", text_size=11, text_color="#00f2fe")
    b.add_rect("py_pg", 630, 240, 230, 48, stroke="#a855f7", bg="#20132b", text="PostgreSQL 16 Multi-Tenant DB\nPartitioned Financial Records", text_size=11, text_color="#a855f7")
    b.add_code_artifact(
        "py_art3", 625, 310, 240, 185,
        "// ATOMIC LEDGER TX",
        [
            ("BEGIN TRANSACTION;", "#00f2fe"),
            ("INSERT INTO journal_entries", "#f1f5f9"),
            ("(debit_acc, credit_acc, amount)", "#94a3b8"),
            ("VALUES ('1105_CASH', '4135_SALES', 1633.58);", "#22c55e"),
            ("UPDATE warehouse_stock SET qty = qty - 2;", "#ff5f6d"),
            ("COMMIT; -- 100% ACID Guaranteed", "#10b981")
        ],
        stroke="#00f2fe", title_color="#00f2fe"
    )

    # Sec 4: Financial Statements & Dispatch
    b.add_rect("py_sec4", 915, 95, 185, 420, stroke="#1e293b", bg="#080c16")
    b.add_text("py_s4_t", 925, 108, 165, 16, "[04] REPORTS & COMPLIANCE", size=12, color="#10b981")
    b.add_rect("py_rep", 925, 145, 165, 54, stroke="#10b981", bg="#12251a", text="Balance Sheet & P&L\nReal-time calculation", text_size=11, text_color="#10b981")
    b.add_rect("py_wa", 925, 235, 165, 54, stroke="#22c55e", bg="#0d2419", text="WhatsApp / Email Invoicing\nInstant PDF Dispatch", text_size=11, text_color="#22c55e")
    b.add_rect("py_tax", 925, 325, 165, 54, stroke="#fbbf24", bg="#262112", text="Monthly Tax Declaration\nPre-calculated filings", text_size=11, text_color="#fbbf24")

    # Arrows
    b.add_arrow("py_a1", "py_pos", "py_xml", [[250, 161], [325, 161]], stroke="#ff5f6d", label="HTTPS Order")
    b.add_arrow("py_a2", "py_scan", "py_xml", [[250, 216], [285, 216], [285, 172], [325, 172]], stroke="#00f2fe")
    b.add_arrow("py_a3", "py_order", "py_xml", [[250, 271], [295, 271], [295, 183], [325, 183]], stroke="#fbbf24")
    b.add_arrow("py_a4", "py_xml", "py_sat", [[440, 193], [440, 240]], stroke="#fbbf24", label="SOAP XML")
    b.add_arrow("py_a5", "py_xml", "py_ledger", [[555, 169], [630, 169]], stroke="#00f2fe", label="Fiscal Stamp")
    b.add_arrow("py_a6", "py_sat", "py_pg", [[555, 264], [630, 264]], stroke="#a855f7", label="CUFE Code")
    b.add_arrow("py_a7", "py_ledger", "py_rep", [[860, 169], [925, 169]], stroke="#10b981")
    b.add_arrow("py_a8", "py_ledger", "py_wa", [[860, 190], [890, 190], [890, 262], [925, 262]], stroke="#22c55e")
    b.add_arrow("py_a9", "py_pg", "py_tax", [[860, 264], [890, 264], [890, 352], [925, 352]], stroke="#fbbf24")

    return b.save("09-sistema-pyme.excalidraw")


def main():
    files = [
        build_elite_performance(),
        build_banco_sangre(),
        build_ad2n_cloud(),
        build_capital_marketing(),
        build_julie(),
        build_cemed_hub(),
        build_letsgo_app(),
        build_logistica_san_martin(),
        build_sistema_pyme(),
        build_sistema_fotos()
    ]
    print(f"\n=======================================================")
    print(f"Successfully generated all {len(files)} Excalidraw diagrams!")
    print(f"=======================================================\n")

    for f in files:
        print(f"--- Rendering {f.name} ---")
        res = subprocess.run([
            "uv", "--directory", str(SKILL_DIR),
            "run", "python", str(RENDER_SCRIPT), str(f)
        ], capture_output=True, text=True)
        if res.returncode == 0:
            print(f"Rendered: {res.stdout.strip()}")
            svg_src = f.with_suffix(".svg")
            png_src = f.with_suffix(".png")
            if svg_src.exists():
                (PUBLIC_DIR / svg_src.name).write_text(svg_src.read_text(encoding="utf-8"), encoding="utf-8")
            if png_src.exists():
                (PUBLIC_DIR / png_src.name).write_bytes(png_src.read_bytes())
        else:
            print(f"Error rendering {f.name}: {res.stderr}")

if __name__ == "__main__":
    main()
