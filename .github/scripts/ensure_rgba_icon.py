from pathlib import Path
import subprocess
import sys

def ensure_icon():
    src = Path("src-tauri/icons/icon.png")
    if not src.exists():
        fallback = Path("public/logo.png")
        if fallback.exists():
            src = fallback
        else:
            raise SystemExit("No icon source found")

    try:
        from PIL import Image
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image

    dst = Path("src-tauri/icons/icon.png")
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        img = Image.open(src).convert("RGBA")
    except Exception as e:
        print(f"Failed to read {src} ({e}), generating blank 512x512 RGBA")
        img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    # ensure size >= 512x512
    if min(img.size) < 256:
        print(f"Icon too small {img.size}, using blank 512x512")
        img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    img.save(dst, format="PNG")
    print(f"Icon saved to {dst} with size {img.size}")

    # generate platform icons via tauri cli if available
    try:
        subprocess.check_call(["npx", "@tauri-apps/cli@2.9.4", "icon", str(dst)])
        print("Generated platform icons via tauri icon command")
    except Exception as e:
        print(f"tauri icon generation skipped/failed: {e}")

def main():
    ensure_icon()

if __name__ == "__main__":
    main()
