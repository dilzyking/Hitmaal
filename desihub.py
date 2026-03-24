import requests
from bs4 import BeautifulSoup
import re
import urllib.parse
import json
import time

BASE_URL = "https://desihub.org"
TOTAL_PAGES = 10   # 🔥 number of pages

# 🔹 Clean title
def clean_title(text):
    banned = [
        "fucked", "sex", "pussy", "blowjob",
        "xxx", "porn", "nude", "adult", "explicit"
    ]
    for word in banned:
        text = re.sub(word, "video", text, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", text).strip()

# 🔹 Decode Next.js image URL
def get_real_image(src):
    try:
        match = re.search(r"url=(.*?)&", src)
        if match:
            return urllib.parse.unquote(match.group(1))
        return src
    except:
        return src

# 🔹 Get embed link
def get_embed(page_url):
    try:
        res = requests.get(page_url, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(res.text, "html.parser")

        iframe = soup.find("iframe")
        if iframe and iframe.get("src"):
            return iframe["src"]

        video = soup.find("video")
        if video:
            source = video.find("source")
            if source and source.get("src"):
                return source["src"]

        return None
    except:
        return None

# 🔹 Scrape one page
def scrape_page(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")

    results = []

    for img in soup.find_all("img"):
        alt = img.get("alt")
        src = img.get("src")

        if not alt or not src:
            continue

        title = clean_title(alt)
        image = get_real_image(src)

        parent = img.find_parent("a")
        if parent and parent.get("href"):
            page_url = BASE_URL + parent.get("href")

            embed = get_embed(page_url)

            results.append({
                "title": title,
                "image": image,
                "page": page_url,
                "embed": embed
            })

            print("✅", title)

            # 🔥 small delay (avoid blocking)
            time.sleep(0.5)

    return results


# 🔥 Main scraper with pagination
def scrape_all():
    all_data = []

    for page in range(1, TOTAL_PAGES + 1):
        print(f"\n📄 Scraping Page {page}...\n")

        if page == 1:
            url = BASE_URL
        else:
            url = f"{BASE_URL}/page/{page}"

        try:
            page_data = scrape_page(url)
            all_data.extend(page_data)
        except Exception as e:
            print("❌ Error on page", page, ":", e)

    return all_data


# ▶️ Run
if __name__ == "__main__":
    data = scrape_all()

    print("\n🔥 Final JSON Output:\n")
    print(json.dumps(data, indent=2))

    # 💾 Save file
    with open("output.json", "w") as f:
        json.dump(data, f, indent=2)

    print("\n💾 Saved to output.json")
