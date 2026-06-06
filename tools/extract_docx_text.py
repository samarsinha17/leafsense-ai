from pathlib import Path
from zipfile import ZipFile
import sys
import xml.etree.ElementTree as ET


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def text_from_element(element: ET.Element) -> str:
    parts = []
    for node in element.iter():
        if node.tag == f"{{{NS['w']}}}t" and node.text:
            parts.append(node.text)
        elif node.tag == f"{{{NS['w']}}}tab":
            parts.append("\t")
        elif node.tag == f"{{{NS['w']}}}br":
            parts.append("\n")
    return "".join(parts).strip()


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if len(sys.argv) != 2:
        print("Usage: extract_docx_text.py <docx-path>", file=sys.stderr)
        return 2

    docx_path = Path(sys.argv[1])
    with ZipFile(docx_path) as archive:
        xml = archive.read("word/document.xml")

    root = ET.fromstring(xml)
    body = root.find("w:body", NS)
    if body is None:
        return 0

    for child in body:
        if child.tag == f"{{{NS['w']}}}p":
            text = text_from_element(child)
            if text:
                print(text)
                print()
        elif child.tag == f"{{{NS['w']}}}tbl":
            rows = []
            for row in child.findall("w:tr", NS):
                cells = [text_from_element(cell) for cell in row.findall("w:tc", NS)]
                if any(cells):
                    rows.append(" | ".join(cells))
            if rows:
                print("[TABLE]")
                print("\n".join(rows))
                print("[/TABLE]")
                print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
