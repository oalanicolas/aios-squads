#!/usr/bin/env python3
"""Z-Library downloader integration for ETL Data Collector.

This module exposes a thin CLI used by the Node.js `ZLibraryCollector` to
authenticate on Z-Library, search for titles and download files using the
official JSON endpoints.  All configuration is passed via CLI arguments and
environment variables so the script can run inside orchestrated pipelines.

Environment variables:
    ZLIB_EMAIL:    Account e-mail registered on Z-Library.
    ZLIB_PASSWORD: Account password.

CLI usage (see --help for details):
    python zlibrary_downloader.py download --query "thinking fast and slow" \
        --output /tmp/books/source_001 --max-results 1

The script prints a JSON payload to STDOUT describing the outcome of the
operation so the caller can parse progress programmatically.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import requests


LOGGER = logging.getLogger("zlibrary")


DEFAULT_TWITTER_URL = "https://x.com/Z_Lib_official"
DEFAULT_PRIMARY_URL = "https://z-library.sk"


@dataclass
class DownloadResult:
    source_id: str
    status: str
    downloaded_files: List[str]
    metadata_path: Optional[str]
    message: Optional[str] = None
    success: bool = True

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False)


class ZLibraryError(RuntimeError):
    """Base exception for Z-Library integration."""


class AuthenticationError(ZLibraryError):
    """Raised when login fails."""


class ZLibraryClient:
    """Minimal Z-Library API wrapper."""

    def __init__(
        self,
        email: str,
        password: str,
        twitter_url: str = DEFAULT_TWITTER_URL,
        base_url: Optional[str] = None,
        timeout: int = 30,
    ) -> None:
        if not email or not password:
            raise AuthenticationError(
                "Z-Library credentials not configured. Set ZLIB_EMAIL and ZLIB_PASSWORD."
            )

        self.email = email
        self.password = password
        self.timeout = timeout
        self.twitter_url = twitter_url
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36"
            }
        )

        self.base_url = base_url or self._resolve_working_url()
        LOGGER.debug("Using Z-Library base URL: %s", self.base_url)
        self._logged_in = False

    # ------------------------------------------------------------------
    def _resolve_working_url(self) -> str:
        """Try to discover a working base URL for Z-Library."""

        candidates: List[str] = []

        twitter_url = self._fetch_url_from_twitter()
        if twitter_url:
            candidates.append(twitter_url)

        candidates.extend(
            [DEFAULT_PRIMARY_URL]
        )

        for url in candidates:
            if self._is_url_valid(url):
                LOGGER.info("Detected working URL: %s", url)
                return url.rstrip("/")

        LOGGER.warning("No URL validated, falling back to default domain %s", DEFAULT_PRIMARY_URL)
        return DEFAULT_PRIMARY_URL

    def _fetch_url_from_twitter(self) -> Optional[str]:
        """Extract first candidate URL from the official Twitter page."""

        try:
            LOGGER.debug("Checking Twitter for official URL (%s)", self.twitter_url)
            response = requests.get(
                self.twitter_url,
                timeout=self.timeout,
                headers=self.session.headers,
            )
            response.raise_for_status()

            urls = re.findall(
                r"https?://[a-z0-9.-]+/(?:[^\\s\"'<>\)]+)",
                response.text,
                re.IGNORECASE,
            )
            zlib_urls = [url for url in urls if "zlib" in url.lower() or "z-library" in url.lower()]
            if zlib_urls:
                LOGGER.info("Official URL found on Twitter: %s", zlib_urls[0])
                return zlib_urls[0]
        except Exception as exc:  # noqa: BLE001
            LOGGER.debug("Failed to check Twitter: %s", exc)
        return None

    def _is_url_valid(self, url: str) -> bool:
        try:
            response = requests.get(
                url,
                timeout=self.timeout,
                headers=self.session.headers,
                allow_redirects=True,
            )
            return response.status_code == 200
        except Exception as exc:  # noqa: BLE001
            LOGGER.debug("Error validating URL %s: %s", url, exc)
            return False

    # ------------------------------------------------------------------
    def login(self) -> None:
        if self._logged_in:
            return

        payload = {
            "email": self.email,
            "password": self.password,
            "site_mode": "books",
            "remember_me": True,
        }

        LOGGER.debug("Logging into Z-Library…")
        response = self.session.post(
            f"{self.base_url}/eapi/user/login",
            json=payload,
            timeout=self.timeout,
        )

        if response.status_code != 200:
            LOGGER.warning(
                "Login endpoint returned status %s. Response: %s",
                response.status_code,
                response.text[:200],
            )
            raise AuthenticationError(
                "Authentication failed: status {status}. If this response contains 'Just a moment...' you "
                "must solve the Cloudflare challenge manually via browser and copy valid cookies (zlib-session, "
                "zlib-access) to .env.".format(status=response.status_code)
            )

        result = response.json()
        if not result.get("success"):
            raise AuthenticationError(result.get("message", "Authentication failed"))

        self._logged_in = True
        LOGGER.info("Authentication successful")

    # ------------------------------------------------------------------
    def search(self, query: str, limit: int = 10) -> List[Dict]:
        self.login()
        params = {
            "message": query,
            "page": 1,
            "limit": max(1, limit),
        }
        LOGGER.info("Searching books: %s", query)
        response = self.session.get(
            f"{self.base_url}/eapi/book/search", params=params, timeout=self.timeout
        )
        if response.status_code != 200:
            raise ZLibraryError(f"Search request failed: status {response.status_code}")
        data = response.json()
        return data.get("books", [])

    def download(self, book_id: str, destination_dir: Path, book_info: Optional[Dict] = None) -> Path:
        self.login()
        LOGGER.info("Starting download for book %s", book_id)
        response = self.session.get(
            f"{self.base_url}/eapi/book/{book_id}/download",
            timeout=self.timeout,
        )
        if response.status_code != 200:
            raise ZLibraryError(f"Failed to obtain download link: status {response.status_code}")

        download_url = response.json().get("download_url")
        if not download_url:
            raise ZLibraryError("Invalid response: download_url missing")

        file_response = self.session.get(download_url, stream=True, timeout=self.timeout * 2)
        if file_response.status_code != 200:
            raise ZLibraryError(
                f"Failed to download file: status {file_response.status_code}"
            )

        filename = self._build_filename(book_id, book_info, file_response.headers)
        destination_dir.mkdir(parents=True, exist_ok=True)
        file_path = destination_dir / filename

        with open(file_path, "wb") as file_handle:
            for chunk in file_response.iter_content(chunk_size=8192):
                file_handle.write(chunk)

        LOGGER.info("Book saved to %s", file_path)
        return file_path

    @staticmethod
    def _build_filename(book_id: str, book_info: Optional[Dict], headers: Dict) -> str:
        if book_info:
            title = book_info.get("title") or f"book_{book_id}"
            author = book_info.get("author") or "unknown"
            ext = (book_info.get("extension") or "pdf").lower()
            base = f"{title} - {author}.{ext}"
        else:
            disposition = headers.get("content-disposition", "")
            match = re.search(r'filename="?(?P<filename>[^";]+)"?', disposition)
            base = match.group("filename") if match else f"book_{book_id}.pdf"

        sanitized = re.sub(r"[^a-zA-Z0-9()\-_. ]+", "", base).strip()
        return sanitized or f"book_{book_id}.pdf"


# --------------------------------------------------------------------------
def build_metadata(book: Dict, file_path: Path) -> Dict:
    metadata = {
        "id": book.get("id"),
        "title": book.get("title"),
        "author": book.get("author"),
        "year": book.get("year"),
        "extension": book.get("extension"),
        "language": book.get("language"),
        "publisher": book.get("publisher"),
        "pages": book.get("pages"),
        "isbn": book.get("isbn"),
        "filesize": book.get("filesize"),
        "category": book.get("category"),
        "download_timestamp": datetime.utcnow().isoformat() + "Z",
        "file_path": str(file_path),
    }
    return metadata


def save_metadata(metadata: Iterable[Dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(list(metadata), handle, indent=2, ensure_ascii=False)


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Z-Library downloader CLI")
    parser.add_argument("action", choices=["download"], help="Action to execute")
    parser.add_argument("--output", required=True, help="Output directory for downloaded files")
    parser.add_argument(
        "--query",
        help="Search term. Used together with --max-results. Ignored when --id is provided.",
    )
    parser.add_argument("--id", help="Specific Z-Library book ID")
    parser.add_argument(
        "--max-results",
        type=int,
        default=1,
        help="Maximum number of search results to download",
    )
    parser.add_argument(
        "--twitter-url",
        default=DEFAULT_TWITTER_URL,
        help="Official Twitter URL monitored to detect active domains",
    )
    parser.add_argument(
        "--base-url",
        default=None,
        help="Explicit base URL (skips Twitter discovery when provided)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.0,
        help="Delay between downloads to avoid throttling (seconds)",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Desired log level",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="HTTP timeout in seconds",
    )
    parser.add_argument(
        "--source-id",
        default="unknown_source",
        help="Source identifier used for tracking",
    )
    return parser.parse_args(argv)


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )


def handle_download(args: argparse.Namespace) -> DownloadResult:
    output_dir = Path(args.output).expanduser().resolve()

    client = ZLibraryClient(
        email=os.getenv("ZLIB_EMAIL", ""),
        password=os.getenv("ZLIB_PASSWORD", ""),
        twitter_url=args.twitter_url,
        base_url=args.base_url,
        timeout=args.timeout,
    )

    metadata_items: List[Dict] = []
    downloaded_files: List[str] = []

    if args.id:
        LOGGER.info("Direct download using ID %s", args.id)
        book_info = {"id": args.id, "title": args.query} if args.query else {"id": args.id}
        file_path = client.download(args.id, output_dir, book_info)
        downloaded_files.append(str(file_path))
        metadata_items.append(build_metadata(book_info, file_path))
    else:
        if not args.query:
            raise ZLibraryError("Provide --query or --id to trigger downloads")

        books = client.search(args.query, limit=args.max_results)
        if not books:
            return DownloadResult(
                source_id=args.source_id,
                status="no_results",
                downloaded_files=[],
                metadata_path=None,
                message="No books found for the given query",
            )

        for index, book in enumerate(books[: args.max_results]):
            file_path = client.download(book.get("id"), output_dir, book)
            downloaded_files.append(str(file_path))
            metadata_items.append(build_metadata(book, file_path))
            if args.delay:
                time.sleep(args.delay)

    metadata_path = None
    if metadata_items:
        metadata_path = str(output_dir / "metadata.json")
        save_metadata(metadata_items, Path(metadata_path))

    return DownloadResult(
        source_id=args.source_id,
        status="success" if downloaded_files else "no_results",
        downloaded_files=downloaded_files,
        metadata_path=metadata_path,
        success=bool(downloaded_files)
    )


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    configure_logging(args.log_level)

    try:
        if args.action == "download":
            result = handle_download(args)
        else:  # pragma: no cover - defensive
            raise ZLibraryError(f"Unsupported action: {args.action}")

        print(result.to_json())
        return 0
    except AuthenticationError as auth_err:
        LOGGER.error("Invalid or missing credentials: %s", auth_err)
        print(
            DownloadResult(
                source_id=args.source_id,
                status="authentication_failed",
                downloaded_files=[],
                metadata_path=None,
                message=str(auth_err),
                success=False,
            ).to_json(),
            file=sys.stdout,
        )
        return 1
    except ZLibraryError as z_err:
        LOGGER.error("Download execution error: %s", z_err)
        print(
            DownloadResult(
                source_id=args.source_id,
                status="error",
                downloaded_files=[],
                metadata_path=None,
                message=str(z_err),
                success=False,
            ).to_json(),
            file=sys.stdout,
        )
        return 1
    except Exception as exc:  # noqa: BLE001
        LOGGER.exception("Unexpected error")
        print(
            DownloadResult(
                source_id=args.source_id,
                status="error",
                downloaded_files=[],
                metadata_path=None,
                message=str(exc),
                success=False,
            ).to_json(),
            file=sys.stdout,
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())


