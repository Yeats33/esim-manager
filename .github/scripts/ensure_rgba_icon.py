from pathlib import Path
try:
    from PIL import Image
except ImportError:
    import sys, subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image


def main():
    src = Path("src-tauri/icons/icon.png")
    if not src.exists():
        fallback = Path("public/logo.png")
        if fallback.exists():
            src = fallback
        else:
            raise SystemExit("No icon found to convert")
    dst = Path("src-tauri/icons/icon.png")
    dst.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(src).convert("RGBA")
    img.save(dst, format="PNG")
    print(f"Icon converted to RGBA and saved to {dst}")


if __name__ == "__main__":
    main()
