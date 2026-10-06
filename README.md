# VT6 House & Restaurant (Penzion Znojmo) — návrh webu

Návrh nového webu pro VT6 – asijská restaurace a ubytování ve Znojmě (Zámečnická 322/6 + Penzion Znojmo, Hakenova 688/29; info@penzion-znojmo.cz, IČO 01293451). Statický web generovaný z dat.

- **Obsah** je v `_data/*.json` (site, menu = stálý lístek z Meníčka id 8371, denni_menu, ubytovani, okoli) — formát kompatibilní se společnou administrací `~/webhunter-admin` (zatím nenapojená).
- **Šablona** `src/index.html` (Jinja), styly `src/style.css`, skripty `src/main.js` (bez knihoven, nativní scroll), logo VT6 vektorizované potrace v `brand/`.
- `python3 build.py` → `site/` (s `?v=` hashi proti cache GitHub Pages, noindex + robots.txt).
- Push do `main` → GitHub Actions sestaví a nasadí Pages.
- Fotky jsou klientovy (penzion-znojmo.cz, vt6.cz, Trevlix). Zdroje v `_research/` (mimo git).
- Rezervace pokojů odkazují na jejich Trevlix (cid 6229926 Zámečnická, 9954544 Hakenova). Polední menu je statická ukázka z 6. 10. 2026 (dá se napojit na Meníčka).
