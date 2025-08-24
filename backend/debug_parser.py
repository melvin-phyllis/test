#!/usr/bin/env python3
"""
Script de débogage pour tester l'extraction de la description
"""

import re

# Test avec le texte exact de la campagne 8
test_text = """1. **Crédit Lyonnais**
   - **Description**: Historically significant, maintains a strong presence in Lyon.
   - **Market Relevance**: 5
   - **Innovation Potential**: 3
   - **Accessibility**: 4
   - **Total Score**: 12/15"""

print("Texte de test:")
print(test_text)
print("\n" + "="*50)

# Test du pattern actuel
pattern = r'\*\*Description\*\*[:\s-]*([^.\n]+)'
match = re.search(pattern, test_text, re.IGNORECASE)

print(f"Pattern: {pattern}")
print(f"Match trouvé: {match is not None}")

if match:
    print(f"Groupe 1: '{match.group(1)}'")
    description = match.group(1).strip()
    description = re.sub(r'^\s*[-–]\s*', '', description)
    print(f"Description nettoyée: '{description}'")
else:
    print("Aucun match trouvé")

# Test avec un pattern plus simple
print("\n" + "="*50)
simple_pattern = r'Description[:\s-]*([^.\n]+)'
simple_match = re.search(simple_pattern, test_text, re.IGNORECASE)

print(f"Pattern simple: {simple_pattern}")
print(f"Match trouvé: {simple_match is not None}")

if simple_match:
    print(f"Groupe 1: '{simple_match.group(1)}'")
    description = simple_match.group(1).strip()
    description = re.sub(r'^\s*[-–]\s*', '', description)
    print(f"Description nettoyée: '{description}'")
else:
    print("Aucun match trouvé")
