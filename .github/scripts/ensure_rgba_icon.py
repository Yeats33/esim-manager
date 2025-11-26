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
    try:
        img = Image.open(src).convert("RGBA")
    except Exception as e:
        # fallback: create a simple 64x64 transparent RGBA to avoid broken stream
        print(f"Failed to read {src} ({e}), generating blank RGBA icon instead")
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    img.save(dst, format="PNG")
    print(f"Icon converted to RGBA and saved to {dst}")


if __name__ == "__main__":
    main()
