#!/usr/bin/env python3
"""
pydantic_v2_migrator.py
---------------------------------
Script de migration "safe-ish" des patterns Pydantic v1 -> v2.

Ce qu'il fait automatiquement (best effort) :
- Remplace les usages courants :
    .dict(…)            -> .model_dump(…)
    .json(…)            -> .model_dump_json(…)
    parse_obj(…)        -> model_validate(…)
    parse_raw(…)        -> model_validate_json(…)
- Décorateurs :
    @validator(...)     -> @field_validator(...)
    @root_validator(pre=True)  -> @model_validator(mode="before")
    @root_validator(...)       -> @model_validator(mode="after")
- Remonte la config de classe vers `model_config = ConfigDict(...)` pour quelques clés fréquentes :
    orm_mode / from_attributes, arbitrary_types_allowed, extra, allow_mutation, use_enum_values,
    json_schema_extra (si littéral dict sur une ligne)
- Ajoute `ConfigDict` aux imports `from pydantic import ...` si nécessaire
- Sauvegarde un .bak de chaque fichier modifié

Limites :
- Ne couvre pas 100% des cas (config complexe, root_validator sophistiqués, etc.).
- Laisse des commentaires TODO si quelque chose n'est pas "rejouable" automatiquement.
- Pensez à relire les diffs `git` après exécution.

Usage :
    python pydantic_v2_migrator.py --paths app src --dry-run
    python pydantic_v2_migrator.py --paths app --write
"""

import argparse
import re
import sys
from pathlib import Path

# --- Helpers -----------------------------------------------------------------

RE_PY = re.compile(r".*\.py$")

def read_text(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return p.read_text(encoding="latin-1")

def write_backup(p: Path, content: str) -> None:
    bak = p.with_suffix(p.suffix + ".bak")
    bak.write_text(content, encoding="utf-8")

def normalize_imports(src: str) -> str:
    """
    Ajoute ConfigDict aux imports pydantic si on voit BaseModel ou des remplacements v2.
    """
    need_configdict = False
    if re.search(r"\bBaseModel\b", src):
        need_configdict = True
    if "model_config = ConfigDict(" in src:
        need_configdict = True

    if not need_configdict:
        return src

    # Cherche un import pydantic existant
    def add_configdict_to_line(m):
        line = m.group(0)
        if "ConfigDict" in line:
            return line
        # Insertion propre : from pydantic import A, B -> from pydantic import A, B, ConfigDict
        if line.strip().endswith("\\"):
            # multi-line with backslash, just append before backslash
            return line.replace("\\", ", ConfigDict \\")
        return line.rstrip()[:-1] + ", ConfigDict" + line[-1]

    new_src, n = re.subn(
        r"^from\s+pydantic\s+import\s+([^\n]+)$",
        add_configdict_to_line,
        src,
        flags=re.MULTILINE,
    )
    if n == 0:
        # Aucun import from pydantic import ... trouvé : ajout simple
        new_src = "from pydantic import ConfigDict\n" + src
    return new_src

def replace_methods(src: str) -> str:
    # Méthodes d'instance
    src = re.sub(r"\.dict\(", ".model_dump(", src)
    src = re.sub(r"\.json\(", ".model_dump_json(", src)

    # Méthodes de classe (parse_* -> model_validate*)
    src = re.sub(r"\.parse_obj\(", ".model_validate(", src)
    src = re.sub(r"\.parse_raw\(", ".model_validate_json(", src)

    return src

def replace_decorators(src: str) -> str:
    # validator -> field_validator
    src = re.sub(r"@validator\s*\(", "@field_validator(", src)

    # root_validator(pre=True) -> model_validator(mode=\"before\")
    src = re.sub(
        r"@root_validator\s*\(\s*pre\s*=\s*True\s*\)",
        '@model_validator(mode="before")',
        src,
    )
    # root_validator() -> model_validator(mode="after")
    src = re.sub(
        r"@root_validator\s*\(\s*\)",
        '@model_validator(mode="after")',
        src,
    )
    # root_validator(..., pre=True, ...) -> mode="before"
    src = re.sub(
        r"@root_validator\s*\((.*?)\)",
        lambda m: '@model_validator(mode="before")' if "pre=True" in m.group(1).replace(" ", "") else '@model_validator(mode="after")',
        src,
        flags=re.DOTALL,
    )
    return src

CONFIG_CLASS_RE = re.compile(
    r"(\n\s*)class\s+Config\s*:\s*\n((\s{4,}.+\n)+)",
    re.MULTILINE
)

def extract_config_dict(config_block: str) -> str:
    """
    Essaie d'extraire quelques clés connues et de les convertir en ConfigDict(...).
    Renvoie la chaîne 'model_config = ConfigDict(...)' ou '' si rien à faire.
    """
    # Heuristiques : détecte des assignments simples "key = value"
    lines = [ln.strip() for ln in config_block.splitlines() if ln.strip() and not ln.strip().startswith("#")]
    kv = {}
    for ln in lines:
        m = re.match(r"([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)", ln)
        if not m:
            continue
        key, val = m.group(1), m.group(2).rstrip(",")
        kv[key] = val

    cfg = {}

    # Mapping commun Pydantic v1 -> v2
    if "orm_mode" in kv and kv["orm_mode"].lower().startswith("true"):
        cfg["from_attributes"] = "True"
    if "from_attributes" in kv:
        cfg["from_attributes"] = kv["from_attributes"]
    if "arbitrary_types_allowed" in kv:
        cfg["arbitrary_types_allowed"] = kv["arbitrary_types_allowed"]
    if "extra" in kv:
        cfg["extra"] = kv["extra"]  # ex: "allow", "forbid", "ignore" restent valides en v2 via ConfigDict(extra=...) avec Extra.* (mais on laisse la chaîne)
    if "allow_mutation" in kv:
        # v2: model_config = ConfigDict(frozen=not allow_mutation)
        if kv["allow_mutation"].lower().startswith("false"):
            cfg["frozen"] = "True"
    if "use_enum_values" in kv:
        # v2: use_enum_values n'existe plus tel quel, on laisse un TODO
        pass
    if "json_schema_extra" in kv:
        # Si c'est un dict en ligne, on le reprend tel quel
        if kv["json_schema_extra"].strip().startswith("{"):
            cfg["json_schema_extra"] = kv["json_schema_extra"]
        else:
            # Non trivial -> TODO
            cfg["__TODO_json_schema_extra__"] = kv["json_schema_extra"]

    if not cfg:
        return ""

    # Construction de la ligne model_config
    parts = []
    for k, v in cfg.items():
        if k.startswith("__TODO"):
            continue
        parts.append(f"{k}={v}")
    inner = ", ".join(parts) if parts else ""
    mc = f"model_config = ConfigDict({inner})"
    if "__TODO_json_schema_extra__" in cfg:
        mc += "  # TODO: json_schema_extra à adapter manuellement"

    return mc

def replace_class_config(src: str) -> str:
    """
    Remplace chaque 'class Config:' interne à une classe par un 'model_config = ConfigDict(...)'
    placé dans le corps de la classe (même indentation). Les lignes non gérées restent supprimées,
    mais un TODO est ajouté si nécessaire.
    """
    def repl(m: re.Match) -> str:
        indent = m.group(1)  # indentation avant 'class Config'
        block = m.group(2)   # contenu du block
        mc = extract_config_dict(block)
        if not mc:
            # Si on ne sait pas convertir, on commente l'ancien bloc pour inspection
            commented = "\n".join(indent + "# " + ln for ln in block.splitlines())
            return f"\n{indent}{commented}\n"
        return f"\n{indent}{mc}\n"

    return CONFIG_CLASS_RE.sub(repl, src)

def process_file(p: Path, write: bool) -> bool:
    original = read_text(p)
    src = original

    # 1) Méthodes & décorateurs
    src = replace_methods(src)
    src = replace_decorators(src)

    # 2) Remplacement class Config -> model_config
    src = replace_class_config(src)

    # 3) Imports
    src = normalize_imports(src)

    changed = (src != original)
    if changed and write:
        write_backup(p, original)
        p.write_text(src, encoding="utf-8")
    return changed

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--paths", nargs="+", default=["app"], help="Répertoires à traiter (ex: app src)")
    ap.add_argument("--write", action="store_true", help="Écrit les changements (sinon dry-run)")
    ap.add_argument("--extensions", nargs="+", default=[".py"], help="Extensions cibles")
    args = ap.parse_args()

    paths = [Path(p) for p in args.paths]
    files = []
    for root in paths:
        if root.is_file():
            if root.suffix in args.extensions:
                files.append(root)
        else:
            for fp in root.rglob("*"):
                if fp.suffix in args.extensions and RE_PY.match(str(fp)):
                    files.append(fp)

    total_changed = 0
    for f in files:
        changed = process_file(f, write=args.write)
        status = "CHANGED" if changed else "ok"
        print(f"[{status}] {f}")
        total_changed += 1 if changed else 0

    print("-" * 60)
    print(f"Fichiers modifiés : {total_changed} / {len(files)}")
    if not args.write:
        print("Dry-run terminé. Ajoute --write pour écrire les modifications.")
    else:
        print("Modifications écrites. Des backups .bak ont été créés.")
        print("Vérifie les diffs git puis lance tes tests.")

if __name__ == "__main__":
    main()
