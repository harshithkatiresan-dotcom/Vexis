from services.scoring import compute_jrs, validity_score, overclaim_amount


def test_perfect_match_is_one():
    assert validity_score([0.8, 0.8, 0.8], [0.8, 0.8, 0.8]) > 0.99


def test_overclaim_is_penalized_even_when_direction_matches():
    # Same direction (cosine = 1) but claimed far above verified: the penalty must bite.
    honest = validity_score([0.4, 0.4, 0.4], [0.4, 0.4, 0.4])
    inflated = validity_score([0.9, 0.9, 0.9], [0.3, 0.3, 0.3])
    assert inflated < honest * 0.6


def test_underclaim_is_not_penalized():
    assert overclaim_amount([0.3, 0.3, 0.3], [0.9, 0.9, 0.9]) == 0.0


def test_zero_vectors_do_not_crash():
    assert validity_score([0, 0, 0], [0, 0, 0]) == 0.0


def test_jrs_range_and_flags():
    skills = [
        {"name": "React", "w": 0.5, "C": [0.9, 0.9, 0.9], "V": [0.3, 0.3, 0.3], "R": 1.0},
        {"name": "Git",   "w": 0.5, "C": [0.7, 0.7, 0.7], "V": [0.7, 0.7, 0.7], "R": 1.0},
    ]
    out = compute_jrs(skills, T=0.9)
    assert 0 <= out["jrs"] <= 100
    flags = {r["skill"]: r["overclaimed"] for r in out["breakdown"]}
    assert flags == {"React": True, "Git": False}