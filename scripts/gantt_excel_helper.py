# /// script
# requires-python = ">=3.10"
# dependencies = ["pandas>=2.2.0", "openpyxl>=3.1.0", "python-dateutil>=2.9.0.post0"]
# ///

"""
Gantt JSON <-> Excel helper

Usage (with Astral's uv):
  # Export JSON -> Excel
  uv run scripts/gantt_excel_helper.py to-xlsx --in docs/gantt-project-2025-08-21.json --out out.xlsx

  # Import Excel -> JSON
  uv run scripts/gantt_excel_helper.py to-json --in out.xlsx --out out.json --project-name "My Plan"
  # Optionally override timeline
  uv run scripts/gantt_excel_helper.py to-json --in out.xlsx --out out.json \
      --timeline-start 2025-08-10T00:00:00Z --timeline-end 2025-09-30T00:00:00Z

Notes:
- The Excel file uses two sheets: "Tasks" and "Links".
- Timezone mapping: JSON times are UTC (Z). When exporting to Excel, times are written as naive datetimes with the same UTC wall clock (no local offset applied). When importing from Excel, naive datetimes are interpreted as UTC and converted to ISO 8601 Z in JSON.
- Only a practical subset of task fields are round-tripped (others are ignored).
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from dateutil import parser as dateparser

# Defaults for Gantt viewer arrays reused on import (Excel -> JSON)
DEFAULT_SCALES = [
    {"unit": "month", "step": 1, "format": "MMMM yyy"},
    {"unit": "day", "step": 1, "format": "d"},
]

DEFAULT_COLUMNS = [
    {"id": "text", "header": "Task name", "flexgrow": 2, "editor": "text"},
    {"id": "url", "header": "Url", "flexgrow": 1, "align": "left"},
    {"id": "start", "header": "Start date", "flexgrow": 1, "align": "center"},
    {"id": "duration", "header": "Duration", "align": "center", "flexgrow": 1},
    {"id": "resources", "header": "Resources", "flexgrow": 1, "align": "center", "editor": "text"},
]

DEFAULT_TASK_TYPES = [
    {"id": "task", "label": "Task"},
    {"id": "summary", "label": "Summary task"},
    {"id": "milestone", "label": "Milestone"},
    {"id": "critical", "label": "Critical"},
    {"id": "narrow", "label": "Narrow"},
    {"id": "progress", "label": "Progress"},
    {"id": "buffer", "label": "Buffer"},
]

# --------------------
# Helpers
# --------------------

DATE_COLS_TASKS = [
    "start",
    "end",
    "base_start",
    "base_end",
]

TASK_FIELDS_ORDER = [
    "id",
    "parent",
    "text",
    "type",
    "start",
    "end",
    "duration",
    "optimistic",
    "pessimistic",
    "progress",
    "resources",
    "url",
    "details",
    "open",
    "unscheduled",
    "base_start",
    "base_end",
]

LINK_FIELDS_ORDER = [
    "id",
    "source",
    "target",
    "type",
]


def to_iso_z(dt: Any) -> Optional[str]:
    """Convert various datetime-like values to ISO 8601 with trailing Z.
    Returns None if value is empty.
    """
    if dt is None or (isinstance(dt, float) and pd.isna(dt)):
        return None

    # If it's already a string, try to parse
    if isinstance(dt, str):
        s = dt.strip()
        if not s:
            return None
        try:
            d = dateparser.parse(s)
        except Exception:
            # Keep as-is but ensure Z if it looks like ISO
            return s
        return to_iso_z(d)

    # pandas Timestamp or datetime
    if isinstance(dt, (pd.Timestamp, datetime)):
        d: datetime = pd.to_datetime(dt).to_pydatetime()
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        else:
            d = d.astimezone(timezone.utc)
        # Trim microseconds to milliseconds for brevity (optional)
        iso = d.isoformat().replace("+00:00", "Z")
        return iso

    return None


def to_int(x: Any) -> Optional[int]:
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return None
    try:
        return int(x)
    except Exception:
        try:
            return int(float(x))
        except Exception:
            return None


def to_float(x: Any) -> Optional[float]:
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return None
    try:
        return float(x)
    except Exception:
        return None


def to_bool(x: Any) -> Optional[bool]:
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return None
    if isinstance(x, bool):
        return x
    if isinstance(x, (int, float)):
        return bool(int(x))
    s = str(x).strip().lower()
    if s in {"true", "t", "yes", "y", "1"}:
        return True
    if s in {"false", "f", "no", "n", "0"}:
        return False
    return None


@dataclass
class Project:
    metadata: Dict[str, Any]
    tasks: List[Dict[str, Any]]
    links: List[Dict[str, Any]]


def load_json(path: Path) -> Project:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return Project(
        metadata=data.get("metadata", {}),
        tasks=list(data.get("tasks", [])),
        links=list(data.get("links", [])),
    )


def export_to_excel(project: Project, out_path: Path) -> None:
    # Prepare tasks DataFrame
    tasks = []
    for t in project.tasks:
        row = {k: t.get(k) for k in TASK_FIELDS_ORDER}
        # Date columns to pandas datetime (for proper Excel dates)
        for dc in DATE_COLS_TASKS:
            if row.get(dc) is not None:
                try:
                    # Preserve UTC wall time in Excel (naive, no TZ). We interpret JSON UTC
                    # datetimes as naive UTC in Excel and vice versa.
                    _ts = pd.to_datetime(row[dc], utc=True).tz_convert('UTC').tz_localize(None)
                    row[dc] = _ts
                except Exception:
                    # Leave as-is if not parseable
                    pass
        # Ensure numeric types where reasonable
        for k in ("id", "parent", "duration", "optimistic", "pessimistic", "progress"):
            if row.get(k) is not None:
                row[k] = to_float(row[k]) if k == "progress" else to_int(row[k])
        tasks.append(row)

    df_tasks = pd.DataFrame(tasks, columns=TASK_FIELDS_ORDER)

    # Prepare links DataFrame
    links = []
    for l in project.links:
        row = {k: l.get(k) for k in LINK_FIELDS_ORDER}
        for k in ("id", "source", "target"):
            if row.get(k) is not None:
                row[k] = to_int(row[k])
        if row.get("type") is None:
            row["type"] = "e2s"
        links.append(row)

    df_links = pd.DataFrame(links, columns=LINK_FIELDS_ORDER)

    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        df_tasks.to_excel(writer, index=False, sheet_name="Tasks")
        df_links.to_excel(writer, index=False, sheet_name="Links")


def import_from_excel(xlsx_path: Path, project_name: Optional[str], timeline_start: Optional[str], timeline_end: Optional[str]) -> Project:
    xls = pd.ExcelFile(xlsx_path)

    # Resolve sheet names case-insensitively and handle missing sheets gracefully
    sheet_map = {name.lower(): name for name in xls.sheet_names}
    tasks_sheet = sheet_map.get("tasks")
    links_sheet = sheet_map.get("links")

    if not tasks_sheet:
        raise ValueError("Excel file must contain a 'Tasks' sheet")

    df_tasks = pd.read_excel(xls, sheet_name=tasks_sheet)
    df_links = pd.read_excel(xls, sheet_name=links_sheet) if links_sheet else pd.DataFrame(columns=LINK_FIELDS_ORDER)

    # Normalize column names (strip spaces, lower?) -> keep exact expected names
    def norm_date(val: Any) -> Optional[str]:
        return to_iso_z(val)

    tasks: List[Dict[str, Any]] = []
    for _, r in df_tasks.iterrows():
        t: Dict[str, Any] = {}
        # Pull fields in order, but accept missing columns
        for k in TASK_FIELDS_ORDER:
            if k in df_tasks.columns:
                v = r[k]
                if k in ("id", "parent", "duration", "optimistic", "pessimistic"):
                    v2 = to_int(v)
                    if v2 is not None:
                        t[k] = v2
                elif k == "progress":
                    v2 = to_float(v)
                    if v2 is not None:
                        t[k] = v2
                elif k in ("open", "unscheduled"):
                    v2 = to_bool(v)
                    if v2 is not None:
                        t[k] = v2
                elif k in DATE_COLS_TASKS:
                    v2 = norm_date(v)
                    if v2 is not None:
                        t[k] = v2
                else:
                    if pd.notna(v):
                        t[k] = v
        # Derive end if missing but start+duration present
        if "start" in t and "duration" in t and "end" not in t:
            try:
                s = dateparser.parse(t["start"])  # aware
                e = (pd.to_datetime(s) + pd.to_timedelta(int(t["duration"]), unit="D")).to_pydatetime()
                t["end"] = to_iso_z(e)
            except Exception:
                pass
        # Default type
        if "type" not in t:
            t["type"] = "task"
        # Default text
        if "text" not in t:
            t["text"] = f"Task {t.get('id', '')}".strip()
        tasks.append(t)

    links: List[Dict[str, Any]] = []
    for _, r in df_links.iterrows():
        l: Dict[str, Any] = {}
        for k in LINK_FIELDS_ORDER:
            if k in df_links.columns:
                v = r[k]
                if k in ("id", "source", "target"):
                    v2 = to_int(v)
                    if v2 is not None:
                        l[k] = v2
                else:
                    if pd.notna(v):
                        l[k] = v
        if "type" not in l:
            l["type"] = "e2s"
        # Skip links with missing endpoints
        if l.get("source") is None or l.get("target") is None or l["source"] == l["target"]:
            continue
        links.append(l)

    # Metadata
    now_iso = to_iso_z(datetime.now(timezone.utc))
    # Compute timeline if not provided
    def compute_timeline(ts: List[Dict[str, Any]]):
        min_start: Optional[datetime] = None
        max_end: Optional[datetime] = None
        for t in ts:
            s = t.get("start")
            e = t.get("end")
            try:
                if s:
                    sd = dateparser.parse(s)
                    min_start = sd if min_start is None or sd < min_start else min_start
                if e:
                    ed = dateparser.parse(e)
                    max_end = ed if max_end is None or ed > max_end else max_end
            except Exception:
                continue
        if min_start and max_end:
            pad_start = (pd.to_datetime(min_start) - pd.Timedelta(days=3)).to_pydatetime()
            pad_end = (pd.to_datetime(max_end) + pd.Timedelta(days=7)).to_pydatetime()
            return to_iso_z(pad_start), to_iso_z(pad_end)
        # default around now
        today = datetime.now(timezone.utc)
        return to_iso_z(today), to_iso_z(today)

    tl_start = timeline_start or None
    tl_end = timeline_end or None
    if not tl_start or not tl_end:
        comp_s, comp_e = compute_timeline(tasks)
        tl_start = tl_start or comp_s
        tl_end = tl_end or comp_e

    metadata = {
        "projectName": project_name or "Imported Plan",
        "exportDate": now_iso,
        "version": "1.0.0",
        "normalizedIds": True,
        "timelineStart": tl_start,
        "timelineEnd": tl_end,
    }

    return Project(metadata=metadata, tasks=tasks, links=links)


# --------------------
# CLI
# --------------------

def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Gantt JSON <-> Excel helper")
    sub = ap.add_subparsers(dest="cmd", required=True)

    ap_x = sub.add_parser("to-xlsx", help="Export JSON to Excel")
    ap_x.add_argument("--in", dest="in_path", required=True, help="Input JSON path")
    ap_x.add_argument("--out", dest="out_path", required=True, help="Output Excel path")

    ap_j = sub.add_parser("to-json", help="Import Excel to JSON")
    ap_j.add_argument("--in", dest="in_path", required=True, help="Input Excel path")
    ap_j.add_argument("--out", dest="out_path", required=True, help="Output JSON path")
    ap_j.add_argument("--project-name", dest="project_name", default=None, help="Project name for metadata")
    ap_j.add_argument("--timeline-start", dest="timeline_start", default=None, help="Override timelineStart (ISO)")
    ap_j.add_argument("--timeline-end", dest="timeline_end", default=None, help="Override timelineEnd (ISO)")

    ns = ap.parse_args(argv)

    if ns.cmd == "to-xlsx":
        proj = load_json(Path(ns.in_path))
        export_to_excel(proj, Path(ns.out_path))
        print(f"Wrote Excel: {ns.out_path}")
        return 0

    if ns.cmd == "to-json":
        proj = import_from_excel(Path(ns.in_path), ns.project_name, ns.timeline_start, ns.timeline_end)
        out = {
            "metadata": proj.metadata,
            "tasks": proj.tasks,
            "links": proj.links,
            "scales": DEFAULT_SCALES,
            "columns": DEFAULT_COLUMNS,
            "taskTypes": DEFAULT_TASK_TYPES,
            # markers omitted; app will still load fine
        }
        Path(ns.out_path).write_text(json.dumps(out, indent=2), encoding="utf-8")
        print(f"Wrote JSON: {ns.out_path}")
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())

