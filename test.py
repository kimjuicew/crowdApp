from ultralytics import YOLO
import cv2
import time
import threading
import numpy as np
from supabase import create_client

# ================== SUPABASE ==================
url = "https://xqogrrdeepicusvryfud.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxb2dycmRlZXBpY3VzdnJ5ZnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjYwNzIsImV4cCI6MjA5MTU0MjA3Mn0.2xl8graz0jfXG1pTsRQezQxfPmhgYAlhuTejdwGwHgw"
supabase = create_client(url, key)

# ================== LOCATION CONFIG ==================
location_map = {
    "Zone A - Silent Study": {"id": 1, "total": 50},
    "Zone B - Group Study":  {"id": 2, "total": 100}
}

lock = threading.Lock()
turn = "Zone A - Silent Study"


def update_data(location, sit, stand, available):
    global turn
    try:
        while turn != location:
            time.sleep(0.05)
        with lock:
            data = location_map[location]
            supabase.table("seat_status").insert({
                "location_id":      data["id"],
                "location":         location,
                "total_seats":      data["total"],
                "sitting_count":    sit,
                "standing_count":   stand,
                "available_chairs": available
            }).execute()
            print(f"✅ [{location}] sit={sit}, stand={stand}, avail={available}")
            turn = ("Zone B - Group Study"
                    if location == "Zone A - Silent Study"
                    else "Zone A - Silent Study")
    except Exception as e:
        print(f"❌ [{location}] Supabase error: {e}")


# ================== DETECTION HELPERS ==================

def iou(boxA, boxB):
    xA = max(boxA[0], boxB[0]);  yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2]);  yB = min(boxA[3], boxB[3])
    inter = max(0, xB - xA) * max(0, yB - yA)
    areaA = (boxA[2]-boxA[0]) * (boxA[3]-boxA[1])
    areaB = (boxB[2]-boxB[0]) * (boxB[3]-boxB[1])
    union = areaA + areaB - inter
    return inter / union if union > 0 else 0

def get_aspect_ratio(box):
    x1, y1, x2, y2 = box
    return max(y2-y1, 1) / max(x2-x1, 1)

def bottom_center(box):
    x1, y1, x2, y2 = box
    return ((x1+x2)//2, y2)

def point_in_box(point, box, margin=20):
    px, py = point
    x1, y1, x2, y2 = box
    return (x1-margin) <= px <= (x2+margin) and (y1-margin) <= py <= (y2+margin)

def is_sitting(pbox, chairs, iou_thresh=0.8, ar_thresh=0.5, proximity_margin=9):
    ar = get_aspect_ratio(pbox)
    bc = bottom_center(pbox)
    for idx, cbox in enumerate(chairs):
        if iou(pbox, cbox) > iou_thresh:
            return True, idx
        if point_in_box(bc, cbox, margin=proximity_margin):
            return True, idx
    if ar < ar_thresh:
        return True, -1
    return False, -1


# ================== UI HELPERS ==================

# ---- Palette ----
C_BG        = (15,  17,  22)       # almost-black navy
C_PANEL     = (22,  27,  38)       # dark panel
C_ACCENT    = (0,   210, 255)      # electric cyan
C_GREEN     = (0,   230, 120)      # vivid mint
C_ORANGE    = (255, 140,  40)      # warm amber
C_RED       = (60,  40,  230)      # BGR red
C_WHITE     = (240, 240, 245)
C_SUBTEXT   = (120, 130, 150)
C_CHAIR_BOX = (0,   200, 255)
C_CHAIR_OCC = (40,   40, 220)      # BGR red for occupied chair

FONT        = cv2.FONT_HERSHEY_DUPLEX
FONT_MONO   = cv2.FONT_HERSHEY_PLAIN


def draw_alpha_rect(frame, x1, y1, x2, y2, color, alpha=0.55):
    """วาดสี่เหลี่ยมโปร่งแสง"""
    sub = frame[y1:y2, x1:x2]
    rect = np.full(sub.shape, color, dtype=np.uint8)
    cv2.addWeighted(rect, alpha, sub, 1-alpha, 0, sub)
    frame[y1:y2, x1:x2] = sub


def draw_corner_box(frame, x1, y1, x2, y2, color, thickness=2, length=14):
    """วาดกรอบแบบ corner-only (ดูทันสมัยกว่า rectangle เต็ม)"""
    pts = [
        ((x1, y1+length), (x1, y1), (x1+length, y1)),
        ((x2-length, y1), (x2, y1), (x2, y1+length)),
        ((x2, y2-length), (x2, y2), (x2-length, y2)),
        ((x1+length, y2), (x1, y2), (x1, y2-length)),
    ]
    for p in pts:
        cv2.line(frame, p[0], p[1], color, thickness)
        cv2.line(frame, p[1], p[2], color, thickness)


def draw_label_tag(frame, text, x, y, color, bg_alpha=0.7, font_scale=0.45, thickness=1):
    """วาด label พร้อม background pill"""
    (tw, th), _ = cv2.getTextSize(text, FONT, font_scale, thickness)
    pad = 5
    draw_alpha_rect(frame, x-pad, y-th-pad, x+tw+pad, y+pad, C_PANEL, alpha=bg_alpha)
    cv2.rectangle(frame, (x-pad, y-th-pad), (x+tw+pad, y+pad), color, 1)
    cv2.putText(frame, text, (x, y), FONT, font_scale, color, thickness, cv2.LINE_AA)


def draw_sidebar(frame, location, sitting, standing, available, total, last_sync):
    """วาด sidebar ด้านซ้ายแบบ HUD"""
    h, w = frame.shape[:2]
    sw = 210   # sidebar width

    # พื้นหลัง sidebar
    draw_alpha_rect(frame, 0, 0, sw, h, C_BG, alpha=0.82)
    # เส้น accent ด้านขวา sidebar
    cv2.line(frame, (sw, 0), (sw, h), C_ACCENT, 1)

    y = 20

    # ---- Zone Title ----
    short = location.split(" - ")[0]          # "Zone A"
    sub   = location.split(" - ")[1] if " - " in location else ""
    cv2.putText(frame, short, (12, y+18), FONT, 0.75, C_ACCENT, 1, cv2.LINE_AA)
    y += 30
    cv2.putText(frame, sub, (12, y+12), FONT_MONO, 1.1, C_SUBTEXT, 1, cv2.LINE_AA)
    y += 20

    # เส้นคั่น
    cv2.line(frame, (12, y), (sw-12, y), C_ACCENT, 1)
    y += 18

    # ---- Stats ----
    stats = [
        ("SITTING",   str(sitting),   C_GREEN),
        ("STANDING",  str(standing),  C_ORANGE),
        ("AVAILABLE", str(available), C_ACCENT),
        ("TOTAL",     str(total),     C_WHITE),
    ]

    for label, val, color in stats:
        cv2.putText(frame, label, (12, y+10), FONT_MONO, 0.95, C_SUBTEXT, 1, cv2.LINE_AA)
        y += 16
        cv2.putText(frame, val, (12, y+22), FONT, 1.1, color, 2, cv2.LINE_AA)
        y += 32

        # mini progress bar สำหรับ SITTING
        if label == "SITTING" and total > 0:
            bar_w = sw - 24
            fill  = int(bar_w * sitting / total)
            cv2.rectangle(frame, (12, y), (12+bar_w, y+4), C_PANEL, -1)
            cv2.rectangle(frame, (12, y), (12+fill,  y+4), C_GREEN, -1)
            y += 12

        # mini progress bar สำหรับ AVAILABLE
        if label == "AVAILABLE" and total > 0:
            bar_w = sw - 24
            fill  = int(bar_w * available / total)
            cv2.rectangle(frame, (12, y), (12+bar_w, y+4), C_PANEL, -1)
            cv2.rectangle(frame, (12, y), (12+fill,  y+4), C_ACCENT, -1)
            y += 12

    # เส้นคั่น
    cv2.line(frame, (12, y+4), (sw-12, y+4), C_SUBTEXT, 1)
    y += 18

    # ---- Timestamp + sync countdown ----
    now_str = time.strftime("%H:%M:%S")
    elapsed = int(time.time() - last_sync)
    next_sync = max(0, 30 - elapsed)

    cv2.putText(frame, now_str, (12, y+12), FONT_MONO, 1.1, C_WHITE, 1, cv2.LINE_AA)
    y += 20
    sync_color = C_GREEN if next_sync > 10 else C_ORANGE
    cv2.putText(frame, f"SYNC in {next_sync:02d}s", (12, y+12), FONT_MONO, 1.0, sync_color, 1, cv2.LINE_AA)
    y += 20

    # ---- Live indicator (กระพริบ) ----
    blink = int(time.time() * 2) % 2 == 0
    dot_color = (0, 230, 80) if blink else C_SUBTEXT
    cv2.circle(frame, (20, h-20), 6, dot_color, -1)
    cv2.putText(frame, "LIVE", (32, h-14), FONT_MONO, 1.1, dot_color, 1, cv2.LINE_AA)


def draw_hud_frame(frame):
    """วาด corner bracket ที่มุมหน้าต่างหลัก"""
    h, w = frame.shape[:2]
    L = 30
    T = 2
    col = C_ACCENT
    # มุม top-left (เว้น sidebar)
    sx = 215
    for (x1,y1),(x2,y2) in [
        ((sx, 5),(sx+L, 5)), ((sx, 5),(sx, 5+L)),
        ((w-5-L, 5),(w-5, 5)), ((w-5, 5),(w-5, 5+L)),
        ((sx, h-5),(sx+L, h-5)), ((sx, h-5-L),(sx, h-5)),
        ((w-5-L, h-5),(w-5, h-5)), ((w-5, h-5-L),(w-5, h-5)),
    ]:
        cv2.line(frame, (x1,y1), (x2,y2), col, T)


# ================== MAIN WORKER ==================

def run_video(video_path, location, human_model, chair_model, window_name):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ [{location}] Cannot open video")
        return

    total_seats = location_map[location]["total"]
    last_time   = 0

    # ตั้งค่าหน้าต่าง
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 960, 560)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # ===== Detect Chairs =====
        chair_results = chair_model(frame, conf=0.45, verbose=False)
        chairs = []
        for box in chair_results[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            chairs.append((x1, y1, x2, y2))

        # ===== Detect Humans =====
        human_results = human_model(frame, conf=0.18, verbose=False)
        people = []
        for box in human_results[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            people.append((x1, y1, x2, y2))

        # ===== Classify =====
        occupied_chairs = set()
        sitting_count   = 0
        standing_count  = 0

        for pbox in people:
            sitting, chair_idx = is_sitting(pbox, chairs)
            if sitting:
                sitting_count += 1
                if chair_idx >= 0:
                    occupied_chairs.add(chair_idx)

        available = len(chairs) - len(occupied_chairs)

        # ===== Draw Chairs =====
        for idx, (x1, y1, x2, y2) in enumerate(chairs):
            if idx in occupied_chairs:
                draw_corner_box(frame, x1, y1, x2, y2, C_CHAIR_OCC, thickness=2, length=12)
            else:
                draw_corner_box(frame, x1, y1, x2, y2, C_CHAIR_BOX, thickness=1, length=10)

        # ===== Draw People =====
        for pbox in people:
            sitting, _ = is_sitting(pbox, chairs)
            x1, y1, x2, y2 = pbox
            if sitting:
                draw_corner_box(frame, x1, y1, x2, y2, C_GREEN, thickness=2)
                draw_label_tag(frame, "SIT", x1, y1-2, C_GREEN)
            else:
                draw_corner_box(frame, x1, y1, x2, y2, C_ORANGE, thickness=2)
                draw_label_tag(frame, "STAND", x1, y1-2, C_ORANGE)

        # ===== Sidebar + HUD =====
        draw_sidebar(frame, location, sitting_count, standing_count,
                     available, total_seats, last_time)
        draw_hud_frame(frame)

        # ===== Sync DB every 30 sec =====
        if time.time() - last_time > 30:
            threading.Thread(
                target=update_data,
                args=(location, sitting_count, standing_count, available),
                daemon=True
            ).start()
            last_time = time.time()

        cv2.imshow(window_name, frame)
        if cv2.waitKey(1) == 27:
            break

    cap.release()
    cv2.destroyWindow(window_name)


# ================== MAIN ==================
if __name__ == "__main__":

    human_model_1 = YOLO(r"C:\Users\user\Desktop\introvertapp\best3.pt")
    chair_model_1  = YOLO(r"C:\Users\user\Desktop\introvertapp\best .pt")

    human_model_2 = YOLO(r"C:\Users\user\Desktop\introvertapp\best3.pt")
    chair_model_2  = YOLO(r"C:\Users\user\Desktop\introvertapp\best .pt")

    t1 = threading.Thread(target=run_video, args=(
        r"C:\Users\user\Desktop\introvertapp\vid4.mp4",
        "Zone A - Silent Study",
        human_model_1, chair_model_1,
        "Zone A"
    ))

    t2 = threading.Thread(target=run_video, args=(
        r"C:\Users\user\Desktop\introvertapp\vid5.mp4",
        "Zone B - Group Study",
        human_model_2, chair_model_2,
        "Zone B"
    ))

    t1.start()
    t2.start()
    t1.join()
    t2.join()

    print("✅ All done.")