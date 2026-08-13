from html.parser import HTMLParser
from pathlib import Path
import unittest


class PricingParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.classes = []
        self.capture_class = None
        self.values = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = (attrs.get("class") or "").split()
        self.classes.append(classes)
        if "pname" in classes:
            self.capture_class = "pname"
        elif "pnum" in classes:
            self.capture_class = "pnum"

    def handle_endtag(self, tag):
        if self.classes:
            classes = self.classes.pop()
            if "pname" in classes or "pnum" in classes:
                self.capture_class = None

    def handle_data(self, data):
        if self.capture_class and data.strip():
            self.values.append((self.capture_class, data.strip()))


class PricingPageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = Path("index.html").read_text(encoding="utf-8")
        parser = PricingParser()
        parser.feed(cls.html)
        cls.values = parser.values

    def test_three_confirmed_plans_and_prices_are_shown(self):
        names = [value for kind, value in self.values if kind == "pname"]
        prices = [value for kind, value in self.values if kind == "pnum"]
        self.assertEqual(names, ["베이스", "필드", "아레나"])
        self.assertEqual(prices, ["24,900", "37,900", "49,900"])

    def test_old_price_and_unconfirmed_discount_are_removed(self):
        self.assertNotIn("14,900", self.html)
        self.assertNotIn("첫 3개월 50%", self.html)
        self.assertNotIn("7,450", self.html)

    def test_installation_fee_notice_is_shown(self):
        self.assertIn("현장 설치비는 별도", self.html)


if __name__ == "__main__":
    unittest.main()
