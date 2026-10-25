"""API tests against the seeded data from the Flyway migrations."""
from decimal import Decimal


def ids(items, key):
    return [item[key] for item in items]


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_categories_in_display_order(client):
    r = client.get("/categories")
    assert r.status_code == 200
    orders = ids(r.json(), "sort_order")
    assert len(orders) == 5
    assert orders == sorted(orders)


def test_attributes_scoped_to_category(client):
    drinks = ids(client.get("/attributes", params={"category_id": "C001"}).json(), "attribute_id")
    assert drinks == ["A001", "A002"]  # Alcoholic, Non-Alcoholic; every drink has one

    food = ids(client.get("/attributes", params={"category_id": "C003"}).json(), "attribute_id")
    assert food == ["A003", "A004"]  # Vegan, Non-Vegan


def test_attributes_na_when_products_have_none(client):
    rides = client.get("/attributes", params={"category_id": "C004"}).json()
    assert ids(rides, "attribute_id") == ["none"]
    assert rides[0]["attribute_name"] == "N/A"


def test_products_without_attribute_filter_keep_null_attributes(client):
    rides = client.get("/products", params={"category_id": "C004"}).json()
    assert len(rides) > 0
    assert all(p["attribute_id"] is None for p in rides)


def test_products_na_filter(client):
    rides_na = client.get("/products", params={"category_id": "C004", "attribute_id": "none"}).json()
    rides_all = client.get("/products", params={"category_id": "C004"}).json()
    assert ids(rides_na, "product_id") == ids(rides_all, "product_id")

    food_na = client.get("/products", params={"category_id": "C003", "attribute_id": "none"}).json()
    assert food_na == []


def test_products_attribute_filter(client):
    vegan = client.get("/products", params={"category_id": "C003", "attribute_id": "A003"}).json()
    assert len(vegan) > 0
    assert all(p["attribute_id"] == "A003" for p in vegan)


def test_price_range_matches_search(client):
    params = {"category_id": "C001"}
    price = client.get("/price", params=params).json()
    search = client.get("/search", params={**params, "limit": 200}).json()

    assert price["count"] == search["count"] > 0
    prices = [Decimal(o["price_eur"]) for o in search["offerings"]]
    assert Decimal(price["min_price"]) == min(prices)
    assert Decimal(price["max_price"]) == max(prices)


def test_search_respects_price_bounds_and_sorts_cheapest_first(client):
    r = client.get("/search", params={"min_price": 5, "max_price": 15, "limit": 200})
    assert r.status_code == 200
    prices = [Decimal(o["price_eur"]) for o in r.json()["offerings"]]
    assert prices, "expected some offerings between 5 and 15 EUR"
    assert all(Decimal(5) <= p <= Decimal(15) for p in prices)
    assert prices == sorted(prices)


def test_search_returns_joined_details(client):
    offering = client.get("/search", params={"category_id": "C001", "limit": 1}).json()["offerings"][0]
    assert offering["vendor"]["area"]["area_name"]
    assert offering["product"]["category"]["category_id"] == "C001"


def test_search_rejects_min_above_max(client):
    r = client.get("/search", params={"min_price": 20, "max_price": 10})
    assert r.status_code == 400
