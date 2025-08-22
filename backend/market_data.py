import time
from dataclasses import dataclass
from typing import Dict, Any, List, Tuple

import yfinance as yf


_CACHE: Dict[str, Any] = {
    "data": None,
    "ts": 0.0,
}


@dataclass
class Sector:
    name: str
    ticker: str
    description: str
    risk_level: str


SECTORS: List[Sector] = [
    Sector("Technology ETFs", "XLK", "Diversified large-cap technology exposure", "Medium"),
    Sector("S&P 500 Index", "VOO", "Broad U.S. market exposure", "Medium"),
    Sector("Government Bonds (7-10y)", "IEF", "Lower-risk U.S. treasury exposure", "Low"),
    Sector("REITs", "VNQ", "Real estate investment trusts with dividends", "Medium"),
    Sector("Emerging Markets", "EEM", "Developing economies with higher growth potential", "High"),
]


def _compute_cagr_and_volatility(ticker: str, years: int = 5) -> Tuple[float, float]:
    """Return CAGR% and annualized volatility% based on daily history."""
    try:
        ticker_obj = yf.Ticker(ticker)
        hist = ticker_obj.history(period=f"{years}y")
        if hist is None or hist.empty:
            return 0.0, 0.0

        start_price = float(hist["Close"].iloc[0])
        end_price = float(hist["Close"].iloc[-1])
        if start_price <= 0 or end_price <= 0:
            return 0.0, 0.0

        cagr = (end_price / start_price) ** (1 / years) - 1

        # Daily returns -> annualized volatility (sqrt(252))
        daily_returns = hist["Close"].pct_change().dropna()
        if daily_returns.empty:
            vol = 0.0
        else:
            vol = float(daily_returns.std() * (252 ** 0.5))

        return round(cagr * 100, 2), round(vol * 100, 2)
    except Exception:
        return 0.0, 0.0


def _build_live_recommendations(monthly_income: float, current_savings_rate: float) -> Dict[str, Any]:
    sectors_out = []
    for s in SECTORS:
        cagr, vol = _compute_cagr_and_volatility(s.ticker)
        # Minimum investment is a heuristic here; could be broker-specific
        min_inv = 100.0 if s.risk_level != "Low" else 500.0
        sectors_out.append({
            "name": s.name,
            "ticker": s.ticker,
            "description": s.description,
            "risk_level": s.risk_level,
            "expected_return": cagr or (4.0 if s.risk_level == "Low" else 9.0),
            "volatility": vol,
            "min_investment": min_inv,
        })

    # Sort by expected return desc while avoiding extreme risk for conservative savers
    if current_savings_rate < 0.1:
        sectors_out = sorted(sectors_out, key=lambda x: (x["risk_level"] == "Low", x["expected_return"]), reverse=True)
    else:
        sectors_out = sorted(sectors_out, key=lambda x: x["expected_return"], reverse=True)

    # Expected returns bands derived from blended sector results
    avg_return = sum(s["expected_return"] for s in sectors_out[:3]) / max(1, len(sectors_out[:3]))
    conservative = max(3.0, round(avg_return * 0.55, 1))
    balanced = max(conservative + 1.0, round(avg_return * 0.8, 1))
    aggressive = max(balanced + 1.0, round(avg_return * 1.05, 1))

    annual_savings = max(0.0, float(monthly_income) * float(current_savings_rate) * 12.0)

    def future_value(rate_pct: float, years: int = 5) -> float:
        r = rate_pct / 100.0
        # FV of a yearly contribution at end of each year, approximate
        fv = 0.0
        for _ in range(years):
            fv = (fv + annual_savings) * (1 + r)
        return round(fv, 2)

    return {
        "top_sectors": sectors_out,
        "strategies": [
            {
                "name": "Dollar-Cost Averaging",
                "description": "Invest fixed amounts at regular intervals to reduce timing risk",
                "time_horizon": "5-10 years",
                "success_rate": 85,
            },
            {
                "name": "Portfolio Rebalancing",
                "description": "Rebalance quarterly to maintain target allocations and risk",
                "time_horizon": "Quarterly",
                "success_rate": 78,
            },
            {
                "name": "Dividend Reinvestment",
                "description": "Automatically reinvest dividends to compound returns",
                "time_horizon": "Long-term",
                "success_rate": 88,
            },
        ],
        "expected_returns": {
            "conservative": conservative,
            "balanced": balanced,
            "aggressive": aggressive,
            "conservative_amount": future_value(conservative),
            "balanced_amount": future_value(balanced),
            "aggressive_amount": future_value(aggressive),
        },
    }


def get_market_recommendations(monthly_income: float, current_savings_rate: float, refresh: bool = False) -> Dict[str, Any]:
    """Return cached or fresh market-backed recommendations."""
    cache_ttl = 60 * 60  # 1 hour
    now = time.time()
    if not refresh and _CACHE["data"] and now - _CACHE["ts"] < cache_ttl:
        data = dict(_CACHE["data"])  # shallow copy
        data["last_updated"] = _CACHE["ts"]
        return data

    try:
        data = _build_live_recommendations(monthly_income, current_savings_rate)
    except Exception:
        # Fallback minimal static data if live fetch fails
        data = {
            "top_sectors": [
                {"name": "S&P 500 Index", "ticker": "VOO", "description": "Broad U.S. market", "risk_level": "Medium", "expected_return": 9.0, "volatility": 18.0, "min_investment": 50.0},
                {"name": "Government Bonds (7-10y)", "ticker": "IEF", "description": "Lower-risk bonds", "risk_level": "Low", "expected_return": 4.0, "volatility": 6.0, "min_investment": 500.0},
            ],
            "strategies": [],
            "expected_returns": {
                "conservative": 5.0,
                "balanced": 7.0,
                "aggressive": 10.0,
                "conservative_amount": 0.0,
                "balanced_amount": 0.0,
                "aggressive_amount": 0.0,
            },
        }

    _CACHE["data"] = data
    _CACHE["ts"] = now
    out = dict(data)
    out["last_updated"] = now
    return out



