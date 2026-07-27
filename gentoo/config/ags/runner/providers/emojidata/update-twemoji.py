#!/usr/bin/env python3

from __future__ import annotations

import io
import os
import shutil
import tarfile
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen


VERSION = "17.0.3"
ARCHIVE_URL = (
    "https://github.com/jdecked/twemoji/" f"archive/refs/tags/v{VERSION}.tar.gz"
)


def download(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "ags-emoji-data-updater"})
    with urlopen(request) as response:
        return response.read()


def svg_filename_candidates(emoji: str) -> list[str]:
    codepoints = [f"{ord(character):x}" for character in emoji]
    without_variation_selectors = [
        codepoint for codepoint in codepoints if codepoint != "fe0f"
    ]
    candidates = (
        [codepoints, without_variation_selectors]
        if "200d" in codepoints
        else [without_variation_selectors]
    )
    return ["-".join(candidate) + ".svg" for candidate in candidates]


def referenced_svg_filenames(
    data_file: Path,
    available_filenames: set[str],
) -> set[str]:
    referenced: set[str] = set()
    missing: list[str] = []

    for line in data_file.read_text(encoding="utf-8").splitlines():
        if not line:
            continue

        emoji = line.split(maxsplit=1)[0]
        filename = next(
            (
                candidate
                for candidate in svg_filename_candidates(emoji)
                if candidate in available_filenames
            ),
            None,
        )
        if filename is None:
            missing.append(emoji)
        else:
            referenced.add(filename)

    if missing:
        preview = " ".join(missing[:10])
        raise RuntimeError(f"twemoji has no SVG for: {preview} (shouldn't happen)")

    return referenced


def main() -> None:
    data_dir = Path(__file__).resolve().parent
    emoji_data_file = data_dir / "emoji-data.generated"
    svg_dir = data_dir / "svg"
    license_file = data_dir / "TWEMOJI-LICENSE-GRAPHICS"
    archive_data = download(ARCHIVE_URL)
    archive_prefix = f"twemoji-{VERSION}/assets/svg/"
    license_name = f"twemoji-{VERSION}/LICENSE-GRAPHICS"

    with tempfile.TemporaryDirectory(prefix=".twemoji-", dir=data_dir) as temporary:
        temporary_dir = Path(temporary)
        staged_svg_dir = temporary_dir / "svg"
        staged_svg_dir.mkdir()
        staged_license = temporary_dir / "LICENSE-GRAPHICS"

        with tarfile.open(fileobj=io.BytesIO(archive_data), mode="r:gz") as archive:
            svg_members: dict[str, tarfile.TarInfo] = {}
            for member in archive.getmembers():
                if not member.isfile() or not member.name.startswith(archive_prefix):
                    continue

                filename = member.name.removeprefix(archive_prefix)
                if "/" in filename or not filename.endswith(".svg"):
                    continue
                svg_members[filename] = member

            wanted = referenced_svg_filenames(emoji_data_file, set(svg_members))
            if not wanted:
                raise RuntimeError("no Twemoji SVG assets were referenced")

            for filename in sorted(wanted):
                member = svg_members[filename]
                source = archive.extractfile(member)
                assert source is not None
                (staged_svg_dir / filename).write_bytes(source.read())

            license_member = archive.getmember(license_name)
            license_source = archive.extractfile(license_member)
            assert license_source is not None
            staged_license.write_bytes(license_source.read())

        if svg_dir.exists():
            shutil.rmtree(svg_dir)
        os.replace(staged_svg_dir, svg_dir)
        os.replace(staged_license, license_file)

    print(f"synced {len(wanted)} referenced Twemoji {VERSION} svgs to {svg_dir}")


if __name__ == "__main__":
    main()
