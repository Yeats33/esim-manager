import sys


def parse(ver: str):
    parts = [int(x) for x in (ver or "0.0.0").split(".")]
    parts += [0] * (3 - len(parts))
    return parts[:3]


def main():
    if len(sys.argv) < 3:
        print("skip")
        return
    pkg, latest = sys.argv[1], sys.argv[2]
    if not latest:
        print("release")
        return
    if parse(pkg) > parse(latest):
        print("release")
    else:
        print("skip")


if __name__ == "__main__":
    main()
