# SPEC — Crown of Ages

> Documento mestre do projeto. Fonte única de verdade. Números de unidades, construções, tecnologias, upgrades e civilizações vêm **do dataset `data/aoe4/` (aoe4world/data)**, gerados por script de agregação (ver §9). Itens sem dado no dataset estão marcados **NAO VERIFICADO** e listados em §9.

## 0. Patch de referência e proveniência dos dados

- **Fonte primária:** dataset aoe4world (`data/aoe4/`), com JSONs de `units`, `buildings`, `technologies`, `upgrades` e `civilizations`, em `english` e `french`.
- **Versão / commit:** o arquivo `data/aoe4/README.upstream.md` **NÃO EXISTE** no repositório. A versão do upstream (commit e patch) está **NAO VERIFICADO**. Proveniência local: o commit do repositório que adicionou o dataset é `29b2fe40e1c4249347874a18c96637e09d42da4d` ("fase 0: scaffold … dataset aoe4 english/french").
- **Contagem do dataset:** unidades EN 43 / FR 40; construções EN 30 / FR 30; tecnologias EN 69 / FR 72; upgrades EN 11 / FR 11; civilizações EN e FR (1 arquivo cada).
- **Prioridade:** dataset > `docs/spec-parts/*` (pesquisa anterior, parcial). As partes anteriores só completam onde o dataset não cobre; nenhuma delas sobrepõe um número do dataset.
- **Diferenças EN × FR** no dataset (custos e tempos de unidades, construções e techs) estão listadas em §2.15 e §5.9. Quando não especificado, valem os números EN.

Convenções de tabela: custos em **Comida / Madeira / Ouro / Pedra**; "T" = tempo de treino/construção em segundos (`costs.time`); dano = `weapons[].damage`; cadência = `durations.cooldown` (segundos); alcance em unidades de jogo do dataset (`range.min`–`range.max`).

## 1. Civilizações

### 1.1 English (english)

_Descrição:_ Exceptional early infantry provide the English with a powerful punch backed up by reliable Food production from the fields.

_Classes:_ Defense, Longbows, Farming

| Bônus / unidade / mecânica (PT-BR tradução direta; EN do dataset) | Texto original (dataset) |
|---|---|
| Civilization Bonuses | Town Centers, Outposts, Towers, and Keeps increase attack speed of nearby units by +20% when enemies are in range. |
| Civilization Bonuses | Farms are -50% cheaper to construct — Farms near mills gather +20/25/30/30% faster by Age. |
| Civilization Bonuses | Vanguard Man-at-Arms in the Dark Age (I). |
| Civilization Bonuses | Produce Man-at-Arms +40% faster than other civilizations. |
| Civilization Bonuses | Villagers wield short bows when attacking enemy units. |
| Civilization Bonuses | Keeps can produce all military units. |
| Civilization Bonuses | Ships are -10% cheaper to produce. |
| Civilization Bonuses | Scouts and Men-at-Arms can setup campfires to increase line-of-sight and improve nearby hunting by +10%. |
| Network of Castles | Protect the frontier with Town Centers, Outposts, Stone Wall Towers, and Keeps that increase attack speed of nearby units by +20% when enemies are in range. Research the Network of Citadels technology from Keeps to further increase attack speed by +30%. |
| Keep Production | Keeps have the unique ability to produce all military units. |
| Call to Arms | Vanguard Man-at-Arms available in the Dark Age (I) — English Man-at-Arms produce +40% faster. |
| Defensive Byrig | Capital Town Center fires an extra arrow and Villagers wield short bows when attacking enemy units. |
| Island of Agriculture | Farms are -50% cheaper to construct. Research the Enclosures technology in the Imperial Age (IV) to allow Villagers to generate +1 Gold every 6 seconds when working Farms. |
| Shipwrights | Naval conditioning increases Dock efficiency, reducing ship construction costs by -10%. |
| Influence | Farm harvest rates increase within the influence of a Mill by +20/25/30/30% after each age up. |
| Kingswood | Scouts and Men-at-Arms can create a Campfire, which increases the sight range of nearby units by +30% and the gather rate of nearby hunters by +10%. |
| Unique Units | Longbowman: Archer with +2 range and +1 damage that comes with the Defensive Paling ability to stun and damage enemy cavalry. |

### 1.2 French (french)

_Descrição:_ The French deploy powerful cavalry units and can boost production in fortified positions. Enemies must be prepared to withstand the charges of powerful Royal Knights and other armored units.

_Classes:_ Trade, Cavalry, Keeps

| Bônus / unidade / mecânica (PT-BR tradução direta; EN do dataset) | Texto original (dataset) |
|---|---|
| Civilization Bonuses | Royal Knights in the Feudal Age (II). |
| Civilization Bonuses | Town Centers work rate increased per age up +15%, +15%, +20%, +25%. |
| Civilization Bonuses | Resource drop off buildings -50% cheaper. |
| Civilization Bonuses | Economic technologies are -35% cheaper. |
| Civilization Bonuses | Trade Posts are revealed on the minimap. |
| Civilization Bonuses | Traders can return Food, Wood, or Gold to Markets. |
| Civilization Bonuses | Trade Ships return +20% resources. |
| Civilization Bonuses | Blacksmiths grant melee damage technologies for free after each age up. |
| Royal Stallions | Deploy the Royal Knight in the Feudal Age (II) and research powerful unique technologies for cavalry. |
| Mainland Economy | Wield a superior economy with -50% cheaper resource drop-offs and -35% cheaper economic technologies. Town Center production speed increased per age +15%, +15%, +20%, +25%. |
| Trade Economy | Choose to return Food, Wood, or Gold to Markets with Traders and Trade Ships. Trade Ships return +20% more resources. Trade Posts are revealed on the minimap at the start of the game. Docks provide populations space. |
| Smithy's Grace | Blacksmiths grant melee damage technologies for free after each age up. |
| Influence | Maintain offensives with -10% cheaper Keeps that reduce the cost of units produced from Archery Ranges and Stables within their influence by -20%. |
| Unique Units | Royal Knight: Heavy Cavalry that gains +3 bonus damage for 5 seconds after completing a charge. Arbalétrier: Crossbowman with +1 melee armor that can deploy a defensive Pavise to provide +5 ranged armor and +1 weapon range for 30 seconds. Cannon: Bombard replacement with more damage, mobility and no setup time. Galleass: Large war galley that has a long range forward mounted bombard. War Cog: Unique Springald Ship with reduced cost and increased ranged armor. |

Nota: os textos são o overview do dataset (EN) e não traduções oficiais. Os números exatos aparecem literalmente no texto do dataset.

## 2. Unidades

Cada linha contém os números do JSON. A velocidade é `movement.speed`. Armadura lida de `armor[]`. Alcance máximo = maior `range.max` entre as armas. Quando a unidade tem mais de uma arma, o dano lista cada arma separadamente.

### 2.1 Aldeão (Villager)

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Villager [EN] | 1 | 50 | 0 | 0 | 0 | 20 s | 50 | 5 (Bow, cd 2 s, alc 0–5); 10 (Torch, cd 1.25 s, alc 0–1) | 5 | — | 1.125 | capital-town-center, kings-palace, town-center | Worker |

Taxas de coleta, capacidade de carga e tempo de construção/reparo do aldeão: **NAO VERIFICADO** no dataset (ver §6). O dataset traz apenas os efeitos de tecnologia (§5).

### 2.2 Lanceiro (Spearman) e evoluções

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Spearman [FR] | 1 | 60 | 20 | 0 | 0 | 15 s | 80 | 7 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks | Light Melee Infantry |
| Hardened Spearman [EN] | 2 | 60 | 20 | 0 | 0 | 15 s | 90 | 8 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks, berkshire-palace, keep, the-white-tower | Light Melee Infantry |
| Veteran Spearman [EN] | 3 | 60 | 20 | 0 | 0 | 15 s | 110 | 9 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks, berkshire-palace, keep, the-white-tower | Light Melee Infantry |
| Elite Spearman [EN] | 4 | 60 | 20 | 0 | 0 | 15 s | 140 | 11 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.3 | barracks, berkshire-palace, keep, the-white-tower | Light Melee Infantry |

Upgrades de lanceiro (EN e FR): ver §5 (upgrades). Custos/tempo de upgrade vêm de `upgrades/*.json`.

### 2.3 Homem de armas (Man-at-Arms) e evoluções

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Vanguard Man-at-Arms [EN] | 1 | 90 | 0 | 20 | 0 | 14.65 s | 100 | 8 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 2, ranged 3 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |
| Early Man-at-Arms [EN] | 2 | 90 | 0 | 20 | 0 | 14.65 s | 120 | 10 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 3, ranged 3 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |
| Man-at-Arms [EN] | 3 | 90 | 0 | 20 | 0 | 14.65 s | 155 | 12 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 4, ranged 4 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |
| Elite Man-at-Arms [EN] | 4 | 90 | 0 | 20 | 0 | 14.65 s | 180 | 14 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 5, ranged 6 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |

Nota EN×FR: `man-at-arms-3` e `man-at-arms-4` têm tempo de treino 14.65 s (EN) e 20.5 s (FR). Ver §2.15.

### 2.4 Arqueiro (Archer) e evoluções

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Archer [FR] | 2 | 30 | 50 | 0 | 0 | 15 s | 70 | 5 (Bow, cd 0 s, alc 0–5) | 5 | — | 1.25 | archery-range | Light Ranged Infantry |
| Veteran Archer [FR] | 3 | 30 | 50 | 0 | 0 | 15 s | 80 | 7 (Bow, cd 0 s, alc 0–5) | 5 | — | 1.25 | archery-range | Light Ranged Infantry |
| Elite Archer [FR] | 4 | 30 | 50 | 0 | 0 | 15 s | 95 | 8 (Bow, cd 0 s, alc 0–5) | 5 | — | 1.25 | archery-range | Light Ranged Infantry |

Arqueiro (`archer-*`) existe **apenas no dataset FR**. Para EN, ver §2.5 (Longbowman / Besteiro).

### 2.5 Besteiro (Crossbowman) e evoluções — EN

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Crossbowman [EN] | 3 | 80 | 0 | 40 | 0 | 22.5 s | 80 | 11 (Crossbow, cd 0 s, alc 0–5) | 5 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry |
| Elite Crossbowman [EN] | 4 | 80 | 0 | 40 | 0 | 22.5 s | 95 | 14 (Crossbow, cd 0 s, alc 0–5) | 5 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry |

### 2.6 Arbalétrier (FR, única) e evoluções

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Arbalétrier [FR] | 3 | 80 | 0 | 40 | 0 | 22.5 s | 80 | 11 (Crossbow, cd 0 s, alc 0–5) | 5 | melee 1 | 1.125 | archery-range | Light Ranged Infantry; unica |
| Elite Arbalétrier [FR] | 4 | 80 | 0 | 40 | 0 | 22.5 s | 95 | 14 (Crossbow, cd 0 s, alc 0–5) | 5 | melee 2 | 1.125 | archery-range | Light Ranged Infantry; unica |

Arbalétrier (dataset): "High damage ranged unit with a defensive pavise shield... Anti-heavy specialist; Comes with melee armor; Low health; Countered by Horsemen." Pavise (+armadura/alcance temporários) está no overview FR (civ bônus Arbalétrier): valores exatos = NAO VERIFICADO.

### 2.7 Arqueiro longo / Longbowman (EN, única) e evoluções

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Longbowman [EN] | 2 | 40 | 50 | 0 | 0 | 15 s | 70 | 6 (Longbow, cd 0 s, alc 0–7) | 7 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry; unica |
| Veteran Longbowman [EN] | 3 | 40 | 50 | 0 | 0 | 15 s | 80 | 8 (Longbow, cd 0 s, alc 0–7) | 7 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry; unica |
| Elite Longbowman [EN] | 4 | 40 | 50 | 0 | 0 | 15 s | 95 | 9 (Longbow, cd 0 s, alc 0–7) | 7 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry; unica |

### 2.8 Cavalaria leve (Scout, Horseman, Knight e Royal Knight)

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Scout [EN] | 1 | 65 | 0 | 0 | 0 | 23 s | 110 | 1 (Short Sword, cd 1.5 s, alc 0–0.288) | 0.288 | — | 1.625 | capital-town-center, kings-palace, stable, town-center | Light Melee Cavalry |
| Horseman [EN] | 2 | 100 | 20 | 0 | 0 | 22.5 s | 125 | 9 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 2 | 1.875 | berkshire-palace, keep, stable, the-white-tower | Light Melee Cavalry |
| Veteran Horseman [EN] | 3 | 100 | 20 | 0 | 0 | 22.5 s | 155 | 11 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 3 | 1.875 | berkshire-palace, keep, stable, the-white-tower | Light Melee Cavalry |
| Elite Horseman [EN] | 4 | 100 | 20 | 0 | 0 | 22.5 s | 180 | 13 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 5 | 1.875 | berkshire-palace, keep, stable, the-white-tower | Light Melee Cavalry |
| Knight [EN] | 3 | 140 | 0 | 100 | 0 | 35 s | 230 | 24 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 4, ranged 4 | 1.625 | berkshire-palace, keep, stable, the-white-tower | Heavy Melee Cavalry |
| Elite Knight [EN] | 4 | 140 | 0 | 100 | 0 | 35 s | 270 | 29 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 5, ranged 5 | 1.625 | berkshire-palace, keep, stable, the-white-tower | Heavy Melee Cavalry |
| Royal Knight [FR] | 2 | 140 | 0 | 100 | 0 | 35 s | 190 | 19 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 3, ranged 3 | 1.625 | school-of-cavalry, stable | Heavy Melee Cavalry; unica |
| Veteran Royal Knight [FR] | 3 | 140 | 0 | 100 | 0 | 35 s | 230 | 24 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 4, ranged 4 | 1.625 | school-of-cavalry, stable | Heavy Melee Cavalry; unica |
| Elite Royal Knight [FR] | 4 | 140 | 0 | 100 | 0 | 35 s | 270 | 29 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 5, ranged 5 | 1.625 | school-of-cavalry, stable | Heavy Melee Cavalry; unica |

Royal Knight é única FR (`unique: true`). Dados de Royal Knight vêm de FR.

### 2.9 Monge (Monk)

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Monk [EN] | 3 | 0 | 0 | 150 | 0 | 30 s | 90 | — | — | — | 1.125 | monastery | Religious |

Mecânicas do monge: "Pode pegar Relíquias, converter unidades inimigas e capturar Locais Sagrados. Cura unidades amigas. Movimento lento." (dataset). Taxa de conversão, duração de cura e capacidade de carregar relíquia: **NAO VERIFICADO**.

### 2.10 Cerco

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mangonel [EN] | 3 | 0 | 400 | 200 | 0 | 40 s | 130 | 10 (Mangonel, cd 0 s, alc 3–8); 2 (Incendiary, cd 0 s, alc 3–8); 10 (Adjustable Crossbars, cd 0 s, alc 3–9) | 9 | — | 0.75 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Springald [EN] | 3 | 0 | 150 | 100 | 0 | 20 s | 85 | 15 (Springald, cd 0 s, alc 0–7.5) | 7.5 | melee 3 | 0.875 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Counterweight Trebuchet [EN] | 3 | 0 | 400 | 150 | 0 | 30 s | 140 | 40 (Trebuchet, cd 0 s, alc 2.75–16) | 16 | — | 0.625 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Bombard [EN] | 4 | 0 | 350 | 500 | 0 | 45 s | 210 | 55 (Cannon, cd 0 s, alc 3.75–10) | 10 | — | 0.75 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege, Gunpowder |
| Ribauldequin [EN] | 4 | 0 | 350 | 500 | 0 | 45 s | 215 | 42 (Ribauldequin, cd 0 s, alc 0–3.75) | 3.75 | melee 10 | 0.875 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege, Gunpowder |
| Battering Ram [EN] | 2 | 0 | 200 | 0 | 0 | 35 s | 370 | 200 (Ram, cd 4 s, alc 0–0.538) | 0.538 | — | 0.75 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Siege Tower [EN] | 2 | 0 | 125 | 0 | 0 | 30 s | 480 | — | — | — | 0.813 | wynguard-army, wynguard-footmen, wynguard-raiders, wynguard-rangers | Siege |
| Cannon [FR] | 4 | 0 | 300 | 600 | 0 | 45 s | 190 | 60 (Cannon, cd 0 s, alc 3.75–10) | 10 | — | 0.875 | siege-workshop | Siege, Gunpowder; unica |
| Royal Cannon [FR] | 3 | 0 | 300 | 600 | 0 | 45 s | 190 | 60 (Cannon, cd 0 s, alc 3.75–10) | 10 | — | 0.875 | college-of-artillery | Siege, Gunpowder; unica |
| Royal Culverin [FR] | 3 | 0 | 325 | 550 | 0 | 45 s | 200 | 40 (Cannon, cd 0 s, alc 1.25–10.5) | 10.5 | — | 0.625 | college-of-artillery | Siege, Gunpowder |
| Royal Ribauldequin [FR] | 3 | 0 | 350 | 500 | 0 | 45 s | 215 | 42 (Ribauldequin, cd 0 s, alc 0–3.75) | 3.75 | melee 10 | 0.875 | college-of-artillery | Siege, Gunpowder |

Nota: "Ribauldequin" é EN (ribauldequin-4); FR tem "royal-ribauldequin-3" e "royal-culverin-3". Não há "Trebuchet" FR com id próprio; o Counterweight Trebuchet é EN (`counterweight-trebuchet-3`).

### 2.11 Naval (dataset)

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fishing Boat [EN] | 2 | 0 | 68 | 0 | 0 | 30 s | 100 | — | — | — | 1.5 | dock | Worker, Ship |
| Transport Ship [EN] | 2 | 0 | 90 | 0 | 0 | 20 s | 400 | — | — | — | 1.625 | dock | Ship |
| Trade Ship [EN] | 2 | 0 | 90 | 90 | 0 | 30 s | 225 | — | — | — | 1.5 | dock | Worker, Ship |
| Galley [EN] | 2 | 72 | 135 | 0 | 0 | 25 s | 300 | 6 (Bow, cd 0 s, alc 0–6.5) | 6.5 | ranged 1 | 1.75 | dock | Archer Ship |
| Hulk [EN] | 2 | 99 | 180 | 27 | 0 | 30 s | 450 | 35 (Ballista, cd 0 s, alc 0–6) | 6 | ranged 3 | 1.375 | dock | Springald Ship |
| Carrack [EN] | 4 | 180 | 180 | 180 | 0 | 45 s | 700 | 45 (Cannon, cd 0 s, alc 0–9) | 9 | ranged 5 | 1.25 | dock | Warship |
| Demolition Ship [EN] | 2 | 0 | 72 | 72 | 0 | 15 s | 145 | 95 (Incendiaries, cd 0 s, alc 0–2) | 2 | — | 2 | dock | Incendiary Ship |
| War Cog [FR] | 2 | 75 | 200 | 30 | 0 | 30 s | 450 | 35 (Ballista, cd 0 s, alc 0–6); 40 (Cannon, cd 0 s, alc 0–8) | 8 | ranged 4 | 1.375 | dock | Springald Ship; unica |
| Galleass [FR] | 3 | 0 | 360 | 300 | 0 | 50 s | 700 | 130 (Bombard, cd 0 s, alc 0–8) | 8 | ranged 1 | 1 | dock | Gunpowder Ship; unica |

### 2.12 Unidades únicas por civilização (lista do dataset)

| Civilização | Unidade (PT / EN) | Idade | Notas (dataset) |
|---|---|---|---|
| English | King (king-2) | 2 | A mighty King, a powerful heavy cavalry unit. Heals nearby out of combat units by 2 health every 1 seconds. |
| English | Longbowman (longbowman-2) | 2 | Cheap long-ranged infantry with good damage vs. unarmored targets. |
| English | Veteran Longbowman (longbowman-3) | 3 | Cheap long-ranged infantry with good damage vs. unarmored targets. |
| English | Elite Longbowman (longbowman-4) | 4 | Cheap long-ranged infantry with good damage vs. unarmored targets. |
| English | Wynguard Ranger (wynguard-ranger-4) | 4 | Master longbowmen with increased range and damage, good vs. unarmored targets. |
| French | Arbalétrier (arbaletrier-3) | 3 | High damage ranged unit with a defensive pavise shield. Best used when supported by others. |
| French | Elite Arbalétrier (arbaletrier-4) | 4 | High damage ranged unit with a defensive pavise shield. Best used when supported by others. |
| French | Cannon (cannon-4) | 4 | Most powerful siege cannon. Excellent against buildings or any stubborn targets. |
| French | Galleass (galleass-3) | 3 | Large oared vessel with a powerful forward mounted bombard. |
| French | Royal Cannon (royal-cannon-3) | 3 | Most powerful siege cannon. Excellent against buildings or any stubborn targets. |
| French | Royal Knight (royal-knight-2) | 2 | Gain bonus damage for 5 seconds after charging. Effective against most units. |
| French | Veteran Royal Knight (royal-knight-3) | 3 | Gain bonus damage for 5 seconds after charging. Effective against most units. |
| French | Elite Royal Knight (royal-knight-4) | 4 | Gain bonus damage for 5 seconds after charging. Effective against most units. |
| French | War Cog (war-cog-2) | 2 | Ship equipped with broadside ballistae. |

Únicas EN (flag `unique: true`): King, Longbowman (e evoluções Veteran/Elite), Wynguard Ranger. Únicas FR: Arbalétrier (e Elite), Cannon, Royal Cannon, Galleass, Royal Knight (e evoluções), War Cog.

### 2.13 Contadores (modificadores do dataset)

Modificadores `weapons[].modifiers[]` com `effect: "change"` e `type: "passive"`, por classe-alvo. Valores em unidade de dano bruto:

| Unidade | Arma | Propriedade | Alvo (classes do dataset) | Valor |
|---|---|---|---|---|
| Battering Ram (EN) | Ram | siegeAttack | wall | +300 |
| Bombard (EN) | Cannon | siegeAttack | naval+unit | +410 |
| Bombard (EN) | Cannon | siegeAttack | building | +375 |
| Bombard (EN) | Cannon | siegeAttack | infantry | +50 |
| Bombard (EN) | Cannon | siegeAttack | war+elephant | +50 |
| Carrack (EN) | Cannon | siegeAttack | building | +70 |
| Counterweight Trebuchet (EN) | Trebuchet | siegeAttack | building | +350 |
| Counterweight Trebuchet (EN) | Trebuchet | siegeAttack | naval+unit | +200 |
| Crossbowman (EN) | Crossbow | rangedAttack | heavy | +10 |
| Elite Crossbowman (EN) | Crossbow | rangedAttack | heavy | +12 |
| Demolition Ship (EN) | Incendiaries | siegeAttack | massive | +300 |
| Demolition Ship (EN) | Incendiaries | siegeAttack | building | +300 |
| Galley (EN) | Bow | rangedAttack | naval+fireship | +18 |
| Horseman (EN) | Spear | meleeAttack | ranged | +9 |
| Horseman (EN) | Spear | meleeAttack | siege | +9 |
| Veteran Horseman (EN) | Spear | meleeAttack | ranged | +11 |
| Veteran Horseman (EN) | Spear | meleeAttack | siege | +11 |
| Elite Horseman (EN) | Spear | meleeAttack | ranged | +13 |
| Elite Horseman (EN) | Spear | meleeAttack | siege | +13 |
| Hulk (EN) | Ballista | rangedAttack | archer+ship | +45 |
| Hulk (EN) | Ballista | rangedAttack | building | +55 |
| Longbowman (EN) | Longbow | rangedAttack | light+melee+infantry | +6 |
| Longbowman (EN) | Longbow | rangedAttack | light+gunpowder+infantry | +6 |
| Veteran Longbowman (EN) | Longbow | rangedAttack | light+melee+infantry | +8 |
| Veteran Longbowman (EN) | Longbow | rangedAttack | light+gunpowder+infantry | +8 |
| Elite Longbowman (EN) | Longbow | rangedAttack | light+melee+infantry | +9 |
| Elite Longbowman (EN) | Longbow | rangedAttack | light+gunpowder+infantry | +9 |
| Mangonel (EN) | Mangonel | siegeAttack | building | +30 |
| Mangonel (EN) | Mangonel | siegeAttack | naval+unit | +30 |
| Mangonel (EN) | Mangonel | siegeAttack | ranged | +10 |
| Mangonel (EN) | Incendiary | fireAttack | building | +19 |
| Mangonel (EN) | Incendiary | fireAttack | naval+unit | +19 |
| Mangonel (EN) | Adjustable Crossbars | siegeAttack | building | +30 |
| Mangonel (EN) | Adjustable Crossbars | siegeAttack | naval+unit | +30 |
| Mangonel (EN) | Adjustable Crossbars | siegeAttack | ranged | +10 |
| Scout (EN) | Short Sword | meleeAttack | scout | +10 |
| Scout (EN) | Short Sword | meleeAttack | siege | +10 |
| Hardened Spearman (EN) | Spear | meleeAttack | cavalry | +20 |
| Hardened Spearman (EN) | Spear | meleeAttack | war+elephant | +4 |
| Hardened Spearman (EN) | Spear | meleeAttack | worker+elephant | +24 |
| Veteran Spearman (EN) | Spear | meleeAttack | cavalry | +23 |
| Veteran Spearman (EN) | Spear | meleeAttack | war+elephant | +5 |
| Veteran Spearman (EN) | Spear | meleeAttack | worker+elephant | +28 |
| Elite Spearman (EN) | Spear | meleeAttack | cavalry | +28 |
| Elite Spearman (EN) | Spear | meleeAttack | war+elephant | +6 |
| Elite Spearman (EN) | Spear | meleeAttack | worker+elephant | +34 |
| Springald (EN) | Springald | rangedAttack | melee+infantry | +12 |
| Springald (EN) | Springald | rangedAttack | naval+unit | +65 |
| Wynguard Footman (EN) | Ax | meleeAttack | cavalry | +5 |
| Wynguard Ranger (EN) | Longbow | rangedAttack | light+melee+infantry | +12 |
| Wynguard Ranger (EN) | Longbow | rangedAttack | light+gunpowder+infantry | +12 |
| Arbalétrier (FR) | Crossbow | rangedAttack | heavy | +10 |
| Elite Arbalétrier (FR) | Crossbow | rangedAttack | heavy | +12 |
| Archer (FR) | Bow | rangedAttack | light+melee+infantry | +5 |
| Archer (FR) | Bow | rangedAttack | light+gunpowder+infantry | +5 |
| Veteran Archer (FR) | Bow | rangedAttack | light+melee+infantry | +7 |
| Veteran Archer (FR) | Bow | rangedAttack | light+gunpowder+infantry | +7 |
| Elite Archer (FR) | Bow | rangedAttack | light+melee+infantry | +8 |
| Elite Archer (FR) | Bow | rangedAttack | light+gunpowder+infantry | +8 |
| Battering Ram (FR) | Ram | siegeAttack | wall | +300 |
| Cannon (FR) | Cannon | siegeAttack | naval+unit | +500 |
| Cannon (FR) | Cannon | siegeAttack | building | +450 |
| Cannon (FR) | Cannon | siegeAttack | infantry | +55 |
| Cannon (FR) | Cannon | siegeAttack | war+elephant | +55 |
| Carrack (FR) | Cannon | siegeAttack | building | +70 |
| Counterweight Trebuchet (FR) | Trebuchet | siegeAttack | building | +350 |
| Counterweight Trebuchet (FR) | Trebuchet | siegeAttack | naval+unit | +200 |
| Demolition Ship (FR) | Incendiaries | siegeAttack | massive | +300 |
| Demolition Ship (FR) | Incendiaries | siegeAttack | building | +300 |
| Galley (FR) | Bow | rangedAttack | naval+fireship | +18 |
| Horseman (FR) | Spear | meleeAttack | ranged | +9 |
| Horseman (FR) | Spear | meleeAttack | siege | +9 |
| Veteran Horseman (FR) | Spear | meleeAttack | ranged | +11 |
| Veteran Horseman (FR) | Spear | meleeAttack | siege | +11 |
| Elite Horseman (FR) | Spear | meleeAttack | ranged | +13 |
| Elite Horseman (FR) | Spear | meleeAttack | siege | +13 |
| Mangonel (FR) | Mangonel | siegeAttack | building | +30 |
| Mangonel (FR) | Mangonel | siegeAttack | naval+unit | +30 |
| Mangonel (FR) | Mangonel | siegeAttack | ranged | +10 |
| Mangonel (FR) | Incendiary | fireAttack | building | +19 |
| Mangonel (FR) | Incendiary | fireAttack | naval+unit | +19 |
| Mangonel (FR) | Adjustable Crossbars | siegeAttack | building | +30 |
| Mangonel (FR) | Adjustable Crossbars | siegeAttack | naval+unit | +30 |
| Mangonel (FR) | Adjustable Crossbars | siegeAttack | ranged | +10 |
| Royal Cannon (FR) | Cannon | siegeAttack | naval+unit | +500 |
| Royal Cannon (FR) | Cannon | siegeAttack | building | +450 |
| Royal Cannon (FR) | Cannon | siegeAttack | infantry | +55 |
| Royal Cannon (FR) | Cannon | siegeAttack | war+elephant | +55 |
| Royal Culverin (FR) | Cannon | siegeAttack | naval+unit | +230 |
| Royal Culverin (FR) | Cannon | siegeAttack | building | +215 |
| Royal Culverin (FR) | Cannon | siegeAttack | infantry | +50 |
| Royal Culverin (FR) | Cannon | siegeAttack | war+elephant | +35 |
| Scout (FR) | Ax | meleeAttack | scout | +10 |
| Scout (FR) | Ax | meleeAttack | siege | +10 |
| Spearman (FR) | Spear | meleeAttack | cavalry | +17 |
| Spearman (FR) | Spear | meleeAttack | war+elephant | +3 |
| Spearman (FR) | Spear | meleeAttack | worker+elephant | +20 |
| Hardened Spearman (FR) | Spear | meleeAttack | cavalry | +20 |
| Hardened Spearman (FR) | Spear | meleeAttack | war+elephant | +4 |
| Hardened Spearman (FR) | Spear | meleeAttack | worker+elephant | +24 |
| Veteran Spearman (FR) | Spear | meleeAttack | cavalry | +23 |
| Veteran Spearman (FR) | Spear | meleeAttack | war+elephant | +5 |
| Veteran Spearman (FR) | Spear | meleeAttack | worker+elephant | +28 |
| Elite Spearman (FR) | Spear | meleeAttack | cavalry | +28 |
| Elite Spearman (FR) | Spear | meleeAttack | war+elephant | +6 |
| Elite Spearman (FR) | Spear | meleeAttack | worker+elephant | +34 |
| Springald (FR) | Springald | rangedAttack | melee+infantry | +12 |
| Springald (FR) | Springald | rangedAttack | naval+unit | +65 |
| War Cog (FR) | Ballista | rangedAttack | archer+ship | +45 |
| War Cog (FR) | Ballista | rangedAttack | building | +55 |
| War Cog (FR) | Cannon | siegeAttack | archer+ship | +45 |
| War Cog (FR) | Cannon | siegeAttack | building | +80 |

**Fórmula de dano:** `dano_final = max(1, base + bônus_contador − armadura_alvo)`, onde `base` = `weapons[].damage` (+ bônus de tecnologia), `bônus_contador` = modificador da tabela acima (classe do alvo) e `armadura_alvo` = `armor[].value` do tipo correspondente (`melee`/`ranged`/`fire`). **Nota:** esta fórmula é a convenção do projeto e o jogo oficial pode aplicá-la de forma diferente; a validação de uma partida real está **NAO VERIFICADO** (ver §9).

### 2.14 Dados de cadência e alcance de armas

| Unidade | Arma | Tipo | Dano | Cadência (s) | Alcance min–max |
|---|---|---|---|---|---|
| Battering Ram (EN) | Ram | siege | 200 | 4 | 0–0.538 |
| Bombard (EN) | Cannon | siege | 55 | 0 | 3.75–10 |
| Carrack (EN) | Cannon | siege | 45 | 0 | 0–9 |
| Counterweight Trebuchet (EN) | Trebuchet | siege | 40 | 0 | 2.75–16 |
| Crossbowman (EN) | Crossbow | ranged | 11 | 0 | 0–5 |
| Elite Crossbowman (EN) | Crossbow | ranged | 14 | 0 | 0–5 |
| Demolition Ship (EN) | Incendiaries | siege | 95 | 0 | 0–2 |
| Galley (EN) | Bow | ranged | 6 | 0 | 0–6.5 |
| Handcannoneer (EN) | Handcannon | ranged | 38 | 0 | 0–4 |
| Horseman (EN) | Spear | melee | 9 | 1.125 | 0–0.375 |
| Horseman (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Veteran Horseman (EN) | Spear | melee | 11 | 1.125 | 0–0.375 |
| Veteran Horseman (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Horseman (EN) | Spear | melee | 13 | 1.125 | 0–0.375 |
| Elite Horseman (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Hulk (EN) | Ballista | ranged | 35 | 0 | 0–6 |
| King (EN) | Great Sword | melee | 16 | 1 | 0–0.295 |
| King (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| King (EN) | Lance | melee | 24 | 0.4 | 0–1.038 |
| Knight (EN) | Sword | melee | 24 | 0.875 | 0–0.288 |
| Knight (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Knight (EN) | Sword | melee | 29 | 0.875 | 0–0.288 |
| Elite Knight (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Longbowman (EN) | Longbow | ranged | 6 | 0 | 0–7 |
| Veteran Longbowman (EN) | Longbow | ranged | 8 | 0 | 0–7 |
| Elite Longbowman (EN) | Longbow | ranged | 9 | 0 | 0–7 |
| Vanguard Man-at-Arms (EN) | Sword | melee | 8 | 0 | 0–0.295 |
| Vanguard Man-at-Arms (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Early Man-at-Arms (EN) | Sword | melee | 10 | 0 | 0–0.295 |
| Early Man-at-Arms (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Man-at-Arms (EN) | Sword | melee | 12 | 0 | 0–0.295 |
| Man-at-Arms (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Man-at-Arms (EN) | Sword | melee | 14 | 0 | 0–0.295 |
| Elite Man-at-Arms (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Mangonel (EN) | Mangonel | siege | 10 | 0 | 3–8 |
| Mangonel (EN) | Incendiary | fire | 2 | 0 | 3–8 |
| Mangonel (EN) | Adjustable Crossbars | siege | 10 | 0 | 3–9 |
| Ribauldequin (EN) | Ribauldequin | ranged | 42 | 0 | 0–3.75 |
| Scout (EN) | Short Sword | melee | 1 | 1.5 | 0–0.288 |
| Hardened Spearman (EN) | Spear | melee | 8 | 0.75 | 0–0.295 |
| Hardened Spearman (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Veteran Spearman (EN) | Spear | melee | 9 | 0.75 | 0–0.295 |
| Veteran Spearman (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Spearman (EN) | Spear | melee | 11 | 0.75 | 0–0.295 |
| Elite Spearman (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Springald (EN) | Springald | ranged | 15 | 0 | 0–7.5 |
| Villager (EN) | Bow | ranged | 5 | 2 | 0–5 |
| Villager (EN) | Torch | fire | 10 | 1.25 | 0–1 |
| Wynguard Footman (EN) | Ax | melee | 20 | 0.25 | 0–0.295 |
| Wynguard Footman (EN) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Wynguard Ranger (EN) | Longbow | ranged | 12 | 0 | 0–8 |
| Arbalétrier (FR) | Crossbow | ranged | 11 | 0 | 0–5 |
| Elite Arbalétrier (FR) | Crossbow | ranged | 14 | 0 | 0–5 |
| Archer (FR) | Bow | ranged | 5 | 0 | 0–5 |
| Veteran Archer (FR) | Bow | ranged | 7 | 0 | 0–5 |
| Elite Archer (FR) | Bow | ranged | 8 | 0 | 0–5 |
| Battering Ram (FR) | Ram | siege | 200 | 4 | 0–0.538 |
| Cannon (FR) | Cannon | siege | 60 | 0 | 3.75–10 |
| Carrack (FR) | Cannon | siege | 45 | 0 | 0–9 |
| Counterweight Trebuchet (FR) | Trebuchet | siege | 40 | 0 | 2.75–16 |
| Demolition Ship (FR) | Incendiaries | siege | 95 | 0 | 0–2 |
| Galleass (FR) | Bombard | ranged | 130 | 0 | 0–8 |
| Galley (FR) | Bow | ranged | 6 | 0 | 0–6.5 |
| Handcannoneer (FR) | Handcannon | ranged | 38 | 0 | 0–4 |
| Horseman (FR) | Spear | melee | 9 | 1.125 | 0–0.375 |
| Horseman (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Veteran Horseman (FR) | Spear | melee | 11 | 1.125 | 0–0.375 |
| Veteran Horseman (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Horseman (FR) | Spear | melee | 13 | 1.125 | 0–0.375 |
| Elite Horseman (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Man-at-Arms (FR) | Sword | melee | 12 | 0 | 0–0.295 |
| Man-at-Arms (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Man-at-Arms (FR) | Sword | melee | 14 | 0 | 0–0.295 |
| Elite Man-at-Arms (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Mangonel (FR) | Mangonel | siege | 10 | 0 | 3–8 |
| Mangonel (FR) | Incendiary | fire | 2 | 0 | 3–8 |
| Mangonel (FR) | Adjustable Crossbars | siege | 10 | 0 | 3–9 |
| Ribauldequin (FR) | Ribauldequin | ranged | 42 | 0 | 0–3.75 |
| Royal Cannon (FR) | Cannon | siege | 60 | 0 | 3.75–10 |
| Royal Culverin (FR) | Cannon | siege | 40 | 0 | 1.25–10.5 |
| Royal Knight (FR) | Sword | melee | 19 | 0.875 | 0–0.288 |
| Royal Knight (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Veteran Royal Knight (FR) | Sword | melee | 24 | 0.875 | 0–0.288 |
| Veteran Royal Knight (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Royal Knight (FR) | Sword | melee | 29 | 0.875 | 0–0.288 |
| Elite Royal Knight (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Royal Ribauldequin (FR) | Ribauldequin | ranged | 42 | 0 | 0–3.75 |
| Scout (FR) | Ax | melee | 1 | 1.5 | 0–0.288 |
| Spearman (FR) | Spear | melee | 7 | 0.75 | 0–0.295 |
| Spearman (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Hardened Spearman (FR) | Spear | melee | 8 | 0.75 | 0–0.295 |
| Hardened Spearman (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Veteran Spearman (FR) | Spear | melee | 9 | 0.75 | 0–0.295 |
| Veteran Spearman (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Elite Spearman (FR) | Spear | melee | 11 | 0.75 | 0–0.295 |
| Elite Spearman (FR) | Torch | fire | 10 | 1.25 | 0–1.25 |
| Springald (FR) | Springald | ranged | 15 | 0 | 0–7.5 |
| Villager (FR) | Torch | fire | 10 | 1.25 | 0–1 |
| Villager (FR) | Knife | melee | 6 | 2 | 0–0.288 |
| War Cog (FR) | Ballista | ranged | 35 | 0 | 0–6 |
| War Cog (FR) | Cannon | siege | 40 | 0 | 0–8 |

### 2.16 Anexo: todas as unidades (exaustivo, EN e FR)

Todas as unidades do dataset, uma linha por registro, com rótulo de idioma. Esta é a tabela de verificação completa.

| Unidade (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Dano (corpo a corpo / a distância) | Alcance máx | Armadura | Velocidade | Treinada em | Classe / notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Battering Ram [EN] | 2 | 0 | 200 | 0 | 0 | 35 s | 370 | 200 (Ram, cd 4 s, alc 0–0.538) | 0.538 | — | 0.75 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Bombard [EN] | 4 | 0 | 350 | 500 | 0 | 45 s | 210 | 55 (Cannon, cd 0 s, alc 3.75–10) | 10 | — | 0.75 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege, Gunpowder |
| Carrack [EN] | 4 | 180 | 180 | 180 | 0 | 45 s | 700 | 45 (Cannon, cd 0 s, alc 0–9) | 9 | ranged 5 | 1.25 | dock | Warship |
| Counterweight Trebuchet [EN] | 3 | 0 | 400 | 150 | 0 | 30 s | 140 | 40 (Trebuchet, cd 0 s, alc 2.75–16) | 16 | — | 0.625 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Crossbowman [EN] | 3 | 80 | 0 | 40 | 0 | 22.5 s | 80 | 11 (Crossbow, cd 0 s, alc 0–5) | 5 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry |
| Elite Crossbowman [EN] | 4 | 80 | 0 | 40 | 0 | 22.5 s | 95 | 14 (Crossbow, cd 0 s, alc 0–5) | 5 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry |
| Demolition Ship [EN] | 2 | 0 | 72 | 72 | 0 | 15 s | 145 | 95 (Incendiaries, cd 0 s, alc 0–2) | 2 | — | 2 | dock | Incendiary Ship |
| Fishing Boat [EN] | 2 | 0 | 68 | 0 | 0 | 30 s | 100 | — | — | — | 1.5 | dock | Worker, Ship |
| Galley [EN] | 2 | 72 | 135 | 0 | 0 | 25 s | 300 | 6 (Bow, cd 0 s, alc 0–6.5) | 6.5 | ranged 1 | 1.75 | dock | Archer Ship |
| Handcannoneer [EN] | 4 | 120 | 0 | 120 | 0 | 35 s | 130 | 38 (Handcannon, cd 0 s, alc 0–4) | 4 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Ranged Gunpowder Infantry |
| Horseman [EN] | 2 | 100 | 20 | 0 | 0 | 22.5 s | 125 | 9 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 2 | 1.875 | berkshire-palace, keep, stable, the-white-tower | Light Melee Cavalry |
| Veteran Horseman [EN] | 3 | 100 | 20 | 0 | 0 | 22.5 s | 155 | 11 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 3 | 1.875 | berkshire-palace, keep, stable, the-white-tower | Light Melee Cavalry |
| Elite Horseman [EN] | 4 | 100 | 20 | 0 | 0 | 22.5 s | 180 | 13 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 5 | 1.875 | berkshire-palace, keep, stable, the-white-tower | Light Melee Cavalry |
| Hulk [EN] | 2 | 99 | 180 | 27 | 0 | 30 s | 450 | 35 (Ballista, cd 0 s, alc 0–6) | 6 | ranged 3 | 1.375 | dock | Springald Ship |
| King [EN] | 2 | 100 | 0 | 100 | 0 | 50 s | 220 | 16 (Great Sword, cd 1 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25); 24 (Lance, cd 0.4 s, alc 0–1.038) | 1.25 | melee 2, ranged 2 | 1.688 | abbey-of-kings | Heavy Melee Cavalry; unica |
| Knight [EN] | 3 | 140 | 0 | 100 | 0 | 35 s | 230 | 24 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 4, ranged 4 | 1.625 | berkshire-palace, keep, stable, the-white-tower | Heavy Melee Cavalry |
| Elite Knight [EN] | 4 | 140 | 0 | 100 | 0 | 35 s | 270 | 29 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 5, ranged 5 | 1.625 | berkshire-palace, keep, stable, the-white-tower | Heavy Melee Cavalry |
| Longbowman [EN] | 2 | 40 | 50 | 0 | 0 | 15 s | 70 | 6 (Longbow, cd 0 s, alc 0–7) | 7 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry; unica |
| Veteran Longbowman [EN] | 3 | 40 | 50 | 0 | 0 | 15 s | 80 | 8 (Longbow, cd 0 s, alc 0–7) | 7 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry; unica |
| Elite Longbowman [EN] | 4 | 40 | 50 | 0 | 0 | 15 s | 95 | 9 (Longbow, cd 0 s, alc 0–7) | 7 | — | 1.125 | archery-range, berkshire-palace, council-hall, keep, the-white-tower | Light Ranged Infantry; unica |
| Vanguard Man-at-Arms [EN] | 1 | 90 | 0 | 20 | 0 | 14.65 s | 100 | 8 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 2, ranged 3 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |
| Early Man-at-Arms [EN] | 2 | 90 | 0 | 20 | 0 | 14.65 s | 120 | 10 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 3, ranged 3 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |
| Man-at-Arms [EN] | 3 | 90 | 0 | 20 | 0 | 14.65 s | 155 | 12 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 4, ranged 4 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |
| Elite Man-at-Arms [EN] | 4 | 90 | 0 | 20 | 0 | 14.65 s | 180 | 14 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 5, ranged 6 | 1.125 | barracks, berkshire-palace, keep, the-white-tower | Heavy Melee Infantry |
| Mangonel [EN] | 3 | 0 | 400 | 200 | 0 | 40 s | 130 | 10 (Mangonel, cd 0 s, alc 3–8); 2 (Incendiary, cd 0 s, alc 3–8); 10 (Adjustable Crossbars, cd 0 s, alc 3–9) | 9 | — | 0.75 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Monk [EN] | 3 | 0 | 0 | 150 | 0 | 30 s | 90 | — | — | — | 1.125 | monastery | Religious |
| Ribauldequin [EN] | 4 | 0 | 350 | 500 | 0 | 45 s | 215 | 42 (Ribauldequin, cd 0 s, alc 0–3.75) | 3.75 | melee 10 | 0.875 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege, Gunpowder |
| Scout [EN] | 1 | 65 | 0 | 0 | 0 | 23 s | 110 | 1 (Short Sword, cd 1.5 s, alc 0–0.288) | 0.288 | — | 1.625 | capital-town-center, kings-palace, stable, town-center | Light Melee Cavalry |
| Siege Tower [EN] | 2 | 0 | 125 | 0 | 0 | 30 s | 480 | — | — | — | 0.813 | wynguard-army, wynguard-footmen, wynguard-raiders, wynguard-rangers | Siege |
| Hardened Spearman [EN] | 2 | 60 | 20 | 0 | 0 | 15 s | 90 | 8 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks, berkshire-palace, keep, the-white-tower | Light Melee Infantry |
| Veteran Spearman [EN] | 3 | 60 | 20 | 0 | 0 | 15 s | 110 | 9 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks, berkshire-palace, keep, the-white-tower | Light Melee Infantry |
| Elite Spearman [EN] | 4 | 60 | 20 | 0 | 0 | 15 s | 140 | 11 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.3 | barracks, berkshire-palace, keep, the-white-tower | Light Melee Infantry |
| Springald [EN] | 3 | 0 | 150 | 100 | 0 | 20 s | 85 | 15 (Springald, cd 0 s, alc 0–7.5) | 7.5 | melee 3 | 0.875 | berkshire-palace, keep, siege-workshop, the-white-tower | Siege |
| Trade Ship [EN] | 2 | 0 | 90 | 90 | 0 | 30 s | 225 | — | — | — | 1.5 | dock | Worker, Ship |
| Trader [EN] | 2 | 0 | 60 | 60 | 0 | 30 s | 90 | — | — | — | 1 | market | Worker |
| Transport Ship [EN] | 2 | 0 | 90 | 0 | 0 | 20 s | 400 | — | — | — | 1.625 | dock | Ship |
| Villager [EN] | 1 | 50 | 0 | 0 | 0 | 20 s | 50 | 5 (Bow, cd 2 s, alc 0–5); 10 (Torch, cd 1.25 s, alc 0–1) | 5 | — | 1.125 | capital-town-center, kings-palace, town-center | Worker |
| Wynguard Army [EN] | 4 | 100 | 100 | 200 | 0 | 55 s | — | — | — | — | — | wynguard-palace | Mixed Force Army |
| Wynguard Footman [EN] | 4 | 60 | 0 | 40 | 0 | 35 s | 280 | 20 (Ax, cd 0.25 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 3, ranged 6 | 1.125 | — | Heavy Melee Infantry |
| Wynguard Footmen [EN] | 4 | 300 | 0 | 400 | 0 | 45 s | — | — | — | — | — | wynguard-palace | Mixed Force Army |
| Wynguard Raiders [EN] | 4 | 650 | 0 | 200 | 0 | 25 s | — | — | — | — | — | wynguard-palace | Mixed Force Army |
| Wynguard Ranger [EN] | 4 | 40 | 50 | 0 | 0 | 15 s | 125 | 12 (Longbow, cd 0 s, alc 0–8) | 8 | — | 1.125 | — | Light Ranged Infantry; unica |
| Wynguard Rangers [EN] | 4 | 0 | 450 | 300 | 0 | 45 s | — | — | — | — | — | wynguard-palace | Mixed Force Army |
| Arbalétrier [FR] | 3 | 80 | 0 | 40 | 0 | 22.5 s | 80 | 11 (Crossbow, cd 0 s, alc 0–5) | 5 | melee 1 | 1.125 | archery-range | Light Ranged Infantry; unica |
| Elite Arbalétrier [FR] | 4 | 80 | 0 | 40 | 0 | 22.5 s | 95 | 14 (Crossbow, cd 0 s, alc 0–5) | 5 | melee 2 | 1.125 | archery-range | Light Ranged Infantry; unica |
| Archer [FR] | 2 | 30 | 50 | 0 | 0 | 15 s | 70 | 5 (Bow, cd 0 s, alc 0–5) | 5 | — | 1.25 | archery-range | Light Ranged Infantry |
| Veteran Archer [FR] | 3 | 30 | 50 | 0 | 0 | 15 s | 80 | 7 (Bow, cd 0 s, alc 0–5) | 5 | — | 1.25 | archery-range | Light Ranged Infantry |
| Elite Archer [FR] | 4 | 30 | 50 | 0 | 0 | 15 s | 95 | 8 (Bow, cd 0 s, alc 0–5) | 5 | — | 1.25 | archery-range | Light Ranged Infantry |
| Battering Ram [FR] | 2 | 0 | 200 | 0 | 0 | 35 s | 370 | 200 (Ram, cd 4 s, alc 0–0.538) | 0.538 | — | 0.75 | siege-workshop | Siege |
| Cannon [FR] | 4 | 0 | 300 | 600 | 0 | 45 s | 190 | 60 (Cannon, cd 0 s, alc 3.75–10) | 10 | — | 0.875 | siege-workshop | Siege, Gunpowder; unica |
| Carrack [FR] | 4 | 200 | 200 | 200 | 0 | 45 s | 700 | 45 (Cannon, cd 0 s, alc 0–9) | 9 | ranged 5 | 1.25 | dock | Warship |
| Counterweight Trebuchet [FR] | 3 | 0 | 400 | 150 | 0 | 30 s | 140 | 40 (Trebuchet, cd 0 s, alc 2.75–16) | 16 | — | 0.625 | siege-workshop | Siege |
| Demolition Ship [FR] | 2 | 0 | 80 | 80 | 0 | 15 s | 145 | 95 (Incendiaries, cd 0 s, alc 0–2) | 2 | — | 2 | dock | Incendiary Ship |
| Fishing Boat [FR] | 2 | 0 | 75 | 0 | 0 | 30 s | 100 | — | — | — | 1.5 | dock | Worker, Ship |
| Galleass [FR] | 3 | 0 | 360 | 300 | 0 | 50 s | 700 | 130 (Bombard, cd 0 s, alc 0–8) | 8 | ranged 1 | 1 | dock | Gunpowder Ship; unica |
| Galley [FR] | 2 | 80 | 150 | 0 | 0 | 25 s | 300 | 6 (Bow, cd 0 s, alc 0–6.5) | 6.5 | ranged 1 | 1.75 | dock | Archer Ship |
| Handcannoneer [FR] | 4 | 120 | 0 | 120 | 0 | 35 s | 130 | 38 (Handcannon, cd 0 s, alc 0–4) | 4 | — | 1.125 | archery-range | Ranged Gunpowder Infantry |
| Horseman [FR] | 2 | 100 | 20 | 0 | 0 | 22.5 s | 125 | 9 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 2 | 1.875 | school-of-cavalry, stable | Light Melee Cavalry |
| Veteran Horseman [FR] | 3 | 100 | 20 | 0 | 0 | 22.5 s | 155 | 11 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 3 | 1.875 | school-of-cavalry, stable | Light Melee Cavalry |
| Elite Horseman [FR] | 4 | 100 | 20 | 0 | 0 | 22.5 s | 180 | 13 (Spear, cd 1.125 s, alc 0–0.375); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | ranged 5 | 1.875 | school-of-cavalry, stable | Light Melee Cavalry |
| Man-at-Arms [FR] | 3 | 90 | 0 | 20 | 0 | 20.5 s | 155 | 12 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 4, ranged 4 | 1.125 | barracks | Heavy Melee Infantry |
| Elite Man-at-Arms [FR] | 4 | 90 | 0 | 20 | 0 | 20.5 s | 180 | 14 (Sword, cd 0 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 5, ranged 6 | 1.125 | barracks | Heavy Melee Infantry |
| Mangonel [FR] | 3 | 0 | 400 | 200 | 0 | 40 s | 130 | 10 (Mangonel, cd 0 s, alc 3–8); 2 (Incendiary, cd 0 s, alc 3–8); 10 (Adjustable Crossbars, cd 0 s, alc 3–9) | 9 | — | 0.75 | siege-workshop | Siege |
| Monk [FR] | 3 | 0 | 0 | 150 | 0 | 30 s | 90 | — | — | — | 1.125 | monastery | Religious |
| Ribauldequin [FR] | 4 | 0 | 350 | 500 | 0 | 45 s | 215 | 42 (Ribauldequin, cd 0 s, alc 0–3.75) | 3.75 | melee 10 | 0.875 | siege-workshop | Siege, Gunpowder |
| Royal Cannon [FR] | 3 | 0 | 300 | 600 | 0 | 45 s | 190 | 60 (Cannon, cd 0 s, alc 3.75–10) | 10 | — | 0.875 | college-of-artillery | Siege, Gunpowder; unica |
| Royal Culverin [FR] | 3 | 0 | 325 | 550 | 0 | 45 s | 200 | 40 (Cannon, cd 0 s, alc 1.25–10.5) | 10.5 | — | 0.625 | college-of-artillery | Siege, Gunpowder |
| Royal Knight [FR] | 2 | 140 | 0 | 100 | 0 | 35 s | 190 | 19 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 3, ranged 3 | 1.625 | school-of-cavalry, stable | Heavy Melee Cavalry; unica |
| Veteran Royal Knight [FR] | 3 | 140 | 0 | 100 | 0 | 35 s | 230 | 24 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 4, ranged 4 | 1.625 | school-of-cavalry, stable | Heavy Melee Cavalry; unica |
| Elite Royal Knight [FR] | 4 | 140 | 0 | 100 | 0 | 35 s | 270 | 29 (Sword, cd 0.875 s, alc 0–0.288); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | melee 5, ranged 5 | 1.625 | school-of-cavalry, stable | Heavy Melee Cavalry; unica |
| Royal Ribauldequin [FR] | 3 | 0 | 350 | 500 | 0 | 45 s | 215 | 42 (Ribauldequin, cd 0 s, alc 0–3.75) | 3.75 | melee 10 | 0.875 | college-of-artillery | Siege, Gunpowder |
| Scout [FR] | 1 | 65 | 0 | 0 | 0 | 21 s | 110 | 1 (Ax, cd 1.5 s, alc 0–0.288) | 0.288 | — | 1.625 | capital-town-center, school-of-cavalry, stable, town-center | Light Melee Cavalry |
| Siege Tower [FR] | 2 | 0 | 125 | 0 | 0 | 30 s | 480 | — | — | — | 0.813 | arbaletrier, archer, handcannoneer, man-at-arms, spearman | Siege |
| Spearman [FR] | 1 | 60 | 20 | 0 | 0 | 15 s | 80 | 7 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks | Light Melee Infantry |
| Hardened Spearman [FR] | 2 | 60 | 20 | 0 | 0 | 15 s | 90 | 8 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks | Light Melee Infantry |
| Veteran Spearman [FR] | 3 | 60 | 20 | 0 | 0 | 15 s | 110 | 9 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.25 | barracks | Light Melee Infantry |
| Elite Spearman [FR] | 4 | 60 | 20 | 0 | 0 | 15 s | 140 | 11 (Spear, cd 0.75 s, alc 0–0.295); 10 (Torch, cd 1.25 s, alc 0–1.25) | 1.25 | — | 1.3 | barracks | Light Melee Infantry |
| Springald [FR] | 3 | 0 | 150 | 100 | 0 | 20 s | 85 | 15 (Springald, cd 0 s, alc 0–7.5) | 7.5 | melee 3 | 0.875 | siege-workshop | Siege |
| Trade Ship [FR] | 2 | 0 | 100 | 100 | 0 | 30 s | 225 | — | — | — | 1.5 | dock | Worker, Ship |
| Trader [FR] | 2 | 0 | 60 | 60 | 0 | 30 s | 90 | — | — | — | 1 | chamber-of-commerce, market | Worker |
| Transport Ship [FR] | 2 | 0 | 100 | 0 | 0 | 20 s | 400 | — | — | — | 1.5 | dock | Ship |
| Villager [FR] | 1 | 50 | 0 | 0 | 0 | 19 s | 50 | 10 (Torch, cd 1.25 s, alc 0–1); 6 (Knife, cd 2 s, alc 0–0.288) | 1 | — | 1.125 | capital-town-center, town-center | Worker |
| War Cog [FR] | 2 | 75 | 200 | 30 | 0 | 30 s | 450 | 35 (Ballista, cd 0 s, alc 0–6); 40 (Cannon, cd 0 s, alc 0–8) | 8 | ranged 4 | 1.375 | dock | Springald Ship; unica |

### 2.15 Diferenças de unidades (EN × FR)

| Unidade | Campo | EN | FR |
|---|---|---|---|
| Carrack | food | 180 | 200 |
| Carrack | wood | 180 | 200 |
| Carrack | gold | 180 | 200 |
| Demolition Ship | wood | 72 | 80 |
| Demolition Ship | gold | 72 | 80 |
| Fishing Boat | wood | 68 | 75 |
| Galley | food | 72 | 80 |
| Galley | wood | 135 | 150 |
| Man-at-Arms | time | 14.65 | 20.5 |
| Elite Man-at-Arms | time | 14.65 | 20.5 |
| Scout | time | 23 | 21 |
| Trade Ship | wood | 90 | 100 |
| Trade Ship | gold | 90 | 100 |
| Transport Ship | wood | 90 | 100 |
| Transport Ship | popcap | 1 | 2 |
| Villager | time | 20 | 19 |

## 3. Construções

Custos e tempos de `costs` e `hitpoints` do JSON. "Tempo" = `costs.time` em segundos. As "classes-chave" são as do dataset usadas para identificar a função. Quando o campo `producedBy`/`influences` traz efeito, ele está descrito em "Função".

### 3.1 Econômicas

| Construção (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Classes-chave (dataset) | Única |
|---|---|---|---|---|---|---|---|---|---|
| Town Center [EN] | 1 | 0 | 400 | 0 | 300 | 150 s | 2500 | defensive_structure, production_building, resource_drop_off, siegeable, town_center_or_landmark | não |
| Capital Town Center [EN] | 1 | 0 | 0 | 0 | 0 | 0 s | 7000 | defensive_structure, landmark, production_building, resource_drop_off, siegeable, town_center_or_landmark | não |
| House [EN] | 1 | 0 | 50 | 0 | 0 | 15 s | 750 | house, scar_house, siegeable | não |
| Farm [EN] | 1 | 0 | 37 | 0 | 0 | 6 s | 300 | farm, farm_field, resource, siegeable | não |
| Mill [EN] | 1 | 0 | 50 | 0 | 0 | 20 s | 750 | economy_building, gristmill, mill, resource_drop_off, scar_gristmill, siegeable | não |
| Lumber Camp [EN] | 1 | 0 | 50 | 0 | 0 | 20 s | 750 | economy_building, lumber_camp, resource_drop_off, scar_lumbercamp, siegeable | não |
| Mining Camp [EN] | 1 | 0 | 50 | 0 | 0 | 20 s | 750 | economy_building, gold_mining_camp, mining_camp, resource_drop_off, scar_miningcamp, siegeable | não |
| Market [EN] | 2 | 0 | 100 | 0 | 0 | 20 s | 1000 | economy_building, market_keybinding, scar_market, siegeable | não |

### 3.2 Militares de produção

| Construção (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Classes-chave (dataset) | Única |
|---|---|---|---|---|---|---|---|---|---|
| Barracks [EN] | 1 | 0 | 150 | 0 | 0 | 30 s | 1500 | barracks, military_only_production, military_production_building, production_building, scar_barracks, siegeable | não |
| Archery Range [EN] | 2 | 0 | 150 | 0 | 0 | 30 s | 1500 | archery_range, military_only_production, military_production_building, production_building, scar_archeryrange, siegeable | não |
| Stable [EN] | 2 | 0 | 150 | 0 | 0 | 30 s | 1500 | military_only_production, military_production_building, production_building, scar_stable, siegeable, stable | não |
| Siege Workshop [EN] | 3 | 0 | 250 | 0 | 0 | 45 s | 2100 | military_only_production, military_production_building, production_building, scar_siegeworkshop, siege_workshop, siegeable | não |
| Dock [EN] | 1 | 0 | 150 | 0 | 0 | 30 s | 1750 | military_only_production, naval_production_building, production_building, resource_drop_off, scar_dock, siegeable | não |
| Keep [EN] | 3 | 0 | 0 | 0 | 900 | 180 s | 5000 | castle, defensive_structure, military, military_only_production, military_production_building, scar_keep | não |
| Monastery [EN] | 3 | 0 | 200 | 0 | 0 | 25 s | 2100 | monastery, production_building, scar_monastery, select_all_monastery, siegeable | não |
| Outpost [EN] | 1 | 0 | 100 | 0 | 0 | 60 s | 750 | defensive_structure, military, outpost, scar_outpost, siegeable, tower | não |

### 3.3 Tecnologia / pesquisa

| Construção (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Classes-chave (dataset) | Única |
|---|---|---|---|---|---|---|---|---|---|
| Blacksmith [EN] | 2 | 0 | 150 | 0 | 0 | 25 s | 1500 | blacksmith, research_building, scar_blacksmith, siegeable | não |
| University [EN] | 4 | 0 | 450 | 0 | 0 | 60 s | 2100 | research_building, scar_university, siegeable, university | não |

### 3.4 Muralhas e defesas

| Construção (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Classes-chave (dataset) | Única |
|---|---|---|---|---|---|---|---|---|---|
| Palisade [EN] | 1 | 0 | 7 | 0 | 0 | 8 s | 1350 | defensive_structure, palisade_wall, palisade_wall_section, siegeable, wall | não |
| Palisade Gate [EN] | 1 | 0 | 25 | 0 | 0 | 10 s | 1350 | defensive_structure, gate, palisade_gate, siegeable, wall | não |
| Stone Wall [EN] | 2 | 0 | 0 | 0 | 25 | 16 s | 3000 | defensive_structure, siegeable, stone_wall, stone_wall_section, wall | não |
| Stone Wall Gate [EN] | 2 | 0 | 0 | 0 | 50 | 30 s | 3000 | defensive_structure, gate, siegeable, stone_gate, wall | não |
| Stone Wall Tower [EN] | 2 | 0 | 0 | 0 | 250 | 90 s | 3000 | defensive_structure, military, siegeable, stone_wall_tower, tower | não |

Observação: unidades poderem ficar sobre Stone Wall = NAO VERIFICADO (ver §9).

### 3.5 Landmarks por civilização (era, custo, função)

Lista extraída das construções `unique: true` com `wonder`/`landmark`. Era = `age` do JSON. Custo = `costs`. Função = `description` do dataset (EN).

| Civ | Landmark (PT / EN) | Era | Comida | Ouro | Total | Tempo | HP | Função (dataset) |
|---|---|---|---|---|---|---|---|---|
| English | Abbey of Kings (abbey-of-kings-1) | 1 | 400 | 200 | 600 | 190 s | 5000 | Heals all nearby friendly units that are out of combat by +6 every 1 seconds. May also Crown a King, a powerful cavalry leader with a healing aura. Queues production of a free King upon completion. |
| English | Berkshire Palace (berkshire-palace-3) | 3 | 2400 | 1200 | 3600 | 250 s | 6500 | Acts as a Keep with increased health and powerful incendiary arrows. All weapons have 14.5 tiles of range. |
| English | Cathedral of St. Thomas (cathedral-of-st-thomas-4) | 4 | 5000 | 5000 | 20000 | 600 s | 5000 | Build and defend a Wonder to secure victory. Rival civilizations will be aware of its construction and seek to destroy it. |
| English | Council Hall (council-hall-1) | 1 | 400 | 200 | 600 | 190 s | 5000 | Acts as an Archery Range with all units and technologies. Works +100% faster. Longbowmen produced from this landmark are -5% cheaper. |
| English | King's Palace (kings-palace-2) | 2 | 1200 | 600 | 1800 | 220 s | 5000 | Acts as a Town Center. Produces Villagers +10% faster. |
| English | The White Tower (the-white-tower-2) | 2 | 1200 | 600 | 1800 | 220 s | 5000 | Acts as a Keep with all the behaviors, technologies, and bonuses. Works 75% faster. |
| English | Wynguard Palace (wynguard-palace-3) | 3 | 2400 | 1200 | 3600 | 250 s | 5000 | Allows production of 4 battalions: Wynguard Army, Wynguard Rangers, Wynguard Raiders, and Wynguard Footmen. |
| French | Chamber of Commerce (chamber-of-commerce-1) | 1 | 400 | 200 | 600 | 190 s | 5000 | Acts as a Market. Trains one free Trader for each economic technology researched. |
| French | College of Artillery (college-of-artillery-3) | 3 | 2400 | 1200 | 3600 | 250 s | 5000 | Produces the Royal Artillery versions of the Cannon, Ribauldequin, and Culverin, which do +30% more damage. Unlocks the Artillery ability for all Cannons. Contains Siege and Gunpowder Technologies, trains units and researches technologies 50% faster. |
| French | Guild Hall (guild-hall-2) | 2 | 1200 | 600 | 1800 | 220 s | 5000 | Generates and stores resources over time, the more resources stored the faster they are generated. Select between Food, Wood, Stone, or Gold. Generates stone at half the rate. |
| French | Notre Dame (notre-dame-4) | 4 | 5000 | 5000 | 20000 | 600 s | 5000 | Build and defend a Wonder to secure victory. Rival civilizations will be aware of its construction and seek to destroy it. |
| French | Red Palace (red-palace-3) | 3 | 2400 | 1200 | 3600 | 250 s | 5000 | Acts as a Keep. Features high-damage arbalest emplacements. Each garrisoned unit adds an additional arbalest. Activates an Arbalest emplacement on all Keeps and Town Centers. |
| French | Royal Institute (royal-institute-2) | 2 | 1200 | 600 | 1800 | 220 s | 5000 | Houses all technologies unique to the French. Research is -30% cheaper here and ignores Age requirements. |
| French | School of Cavalry (school-of-cavalry-1) | 1 | 400 | 200 | 600 | 190 s | 5000 | Acts as a Stable. All of your stables produce units +20% faster. |

Landmarks comuns (EN): Abbey of Kings (1), Council Hall (1), King's Palace (2), The White Tower (2), Berkshire Palace (3), Wynguard Palace (3). Landmarks comuns (FR): School of Cavalry (1), Chamber of Commerce (1), Royal Institute (2), Guild Hall (2), Red Palace (3), College of Artillery (3). A Town Center é o landmark inicial da era 1 (`town-center-1`, `capital-town-center-1`).

### 3.6 Maravilha (Wonder)

`cathedral-of-st-thomas-4` (EN) e `notre-dame-4` (FR): era 4, custo 5000 F / 5000 W / 5000 G / 5000 S (total 20000), tempo 600 s, HP 5000. Descrição: "Build and defend a Wonder to secure victory. Rival civilizations will be aware of its construction and seek to destroy it." Regra de vitória exata, timer e restrições: ver §7.

| Maravilha (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Total | Tempo | HP |
|---|---|---|---|---|---|---|---|---|
| Cathedral of St. Thomas (cathedral-of-st-thomas-4) | 4 | 5000 | 5000 | 5000 | 5000 | 20000 | 600 s | 5000 |
| Notre Dame (notre-dame-4) | 4 | 5000 | 5000 | 5000 | 5000 | 20000 | 600 s | 5000 |

### 3.8 Anexo: todas as construções (exaustivo, EN e FR)

Todas as construções do dataset com rótulo de idioma. Esta é a tabela de verificação completa.

| Construção (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Classes-chave (dataset) | Única |
|---|---|---|---|---|---|---|---|---|---|
| Abbey of Kings [EN] | 1 | 400 | 0 | 200 | 0 | 190 s | 5000 | age1_landmark1, audio_production_landmark, landmark, military_only_production, siegeable, town_center_or_landmark | sim |
| Archery Range [EN] | 2 | 0 | 150 | 0 | 0 | 30 s | 1500 | archery_range, military_only_production, military_production_building, production_building, scar_archeryrange, siegeable | não |
| Barracks [EN] | 1 | 0 | 150 | 0 | 0 | 30 s | 1500 | barracks, military_only_production, military_production_building, production_building, scar_barracks, siegeable | não |
| Berkshire Palace [EN] | 3 | 2400 | 0 | 1200 | 0 | 250 s | 6500 | age3_landmark2, audio_production_landmark, castle, cavalry_production_landmark, landmark, military_only_production | sim |
| Blacksmith [EN] | 2 | 0 | 150 | 0 | 0 | 25 s | 1500 | blacksmith, research_building, scar_blacksmith, siegeable | não |
| Capital Town Center [EN] | 1 | 0 | 0 | 0 | 0 | 0 s | 7000 | defensive_structure, landmark, production_building, resource_drop_off, siegeable, town_center_or_landmark | não |
| Cathedral of St. Thomas [EN] | 4 | 5000 | 5000 | 5000 | 5000 | 600 s | 5000 | audio_production_landmark, siegeable, wonder, wonder_imperial_age | sim |
| Council Hall [EN] | 1 | 400 | 0 | 200 | 0 | 190 s | 5000 | age1_landmark2, audio_production_landmark, landmark, military_only_production, siegeable, town_center_or_landmark | sim |
| Dock [EN] | 1 | 0 | 150 | 0 | 0 | 30 s | 1750 | military_only_production, naval_production_building, production_building, resource_drop_off, scar_dock, siegeable | não |
| Farm [EN] | 1 | 0 | 37 | 0 | 0 | 6 s | 300 | farm, farm_field, resource, siegeable | não |
| House [EN] | 1 | 0 | 50 | 0 | 0 | 15 s | 750 | house, scar_house, siegeable | não |
| Keep [EN] | 3 | 0 | 0 | 0 | 900 | 180 s | 5000 | castle, defensive_structure, military, military_only_production, military_production_building, scar_keep | não |
| King's Palace [EN] | 2 | 1200 | 0 | 600 | 0 | 220 s | 5000 | age2_landmark1, audio_production_landmark, landmark, production_building, resource_drop_off, siegeable | sim |
| Lumber Camp [EN] | 1 | 0 | 50 | 0 | 0 | 20 s | 750 | economy_building, lumber_camp, resource_drop_off, scar_lumbercamp, siegeable | não |
| Market [EN] | 2 | 0 | 100 | 0 | 0 | 20 s | 1000 | economy_building, market_keybinding, scar_market, siegeable | não |
| Mill [EN] | 1 | 0 | 50 | 0 | 0 | 20 s | 750 | economy_building, gristmill, mill, resource_drop_off, scar_gristmill, siegeable | não |
| Mining Camp [EN] | 1 | 0 | 50 | 0 | 0 | 20 s | 750 | economy_building, gold_mining_camp, mining_camp, resource_drop_off, scar_miningcamp, siegeable | não |
| Monastery [EN] | 3 | 0 | 200 | 0 | 0 | 25 s | 2100 | monastery, production_building, scar_monastery, select_all_monastery, siegeable | não |
| Outpost [EN] | 1 | 0 | 100 | 0 | 0 | 60 s | 750 | defensive_structure, military, outpost, scar_outpost, siegeable, tower | não |
| Palisade [EN] | 1 | 0 | 7 | 0 | 0 | 8 s | 1350 | defensive_structure, palisade_wall, palisade_wall_section, siegeable, wall | não |
| Palisade Gate [EN] | 1 | 0 | 25 | 0 | 0 | 10 s | 1350 | defensive_structure, gate, palisade_gate, siegeable, wall | não |
| Siege Workshop [EN] | 3 | 0 | 250 | 0 | 0 | 45 s | 2100 | military_only_production, military_production_building, production_building, scar_siegeworkshop, siege_workshop, siegeable | não |
| Stable [EN] | 2 | 0 | 150 | 0 | 0 | 30 s | 1500 | military_only_production, military_production_building, production_building, scar_stable, siegeable, stable | não |
| Stone Wall [EN] | 2 | 0 | 0 | 0 | 25 | 16 s | 3000 | defensive_structure, siegeable, stone_wall, stone_wall_section, wall | não |
| Stone Wall Gate [EN] | 2 | 0 | 0 | 0 | 50 | 30 s | 3000 | defensive_structure, gate, siegeable, stone_gate, wall | não |
| Stone Wall Tower [EN] | 2 | 0 | 0 | 0 | 250 | 90 s | 3000 | defensive_structure, military, siegeable, stone_wall_tower, tower | não |
| The White Tower [EN] | 2 | 1200 | 0 | 600 | 0 | 220 s | 5000 | age2_landmark2, audio_production_landmark, castle, cavalry_production_landmark, landmark, military_only_production | sim |
| Town Center [EN] | 1 | 0 | 400 | 0 | 300 | 150 s | 2500 | defensive_structure, production_building, resource_drop_off, siegeable, town_center_or_landmark | não |
| University [EN] | 4 | 0 | 450 | 0 | 0 | 60 s | 2100 | research_building, scar_university, siegeable, university | não |
| Wynguard Palace [EN] | 3 | 2400 | 0 | 1200 | 0 | 250 s | 5000 | age3_landmark1, audio_production_landmark, cavalry_production_landmark, landmark, military_only_production, siegeable | sim |
| Archery Range [FR] | 2 | 0 | 150 | 0 | 0 | 30 s | 1500 | archery_range, military_only_production, military_production_building, production_building, scar_archeryrange, siegeable | não |
| Barracks [FR] | 1 | 0 | 150 | 0 | 0 | 30 s | 1500 | barracks, military_only_production, military_production_building, production_building, scar_barracks, siegeable | não |
| Blacksmith [FR] | 2 | 0 | 150 | 0 | 0 | 25 s | 1500 | blacksmith, research_building, scar_blacksmith, siegeable | não |
| Capital Town Center [FR] | 1 | 0 | 0 | 0 | 0 | 0 s | 7000 | defensive_structure, landmark, production_building, resource_drop_off, siegeable, town_center_or_landmark | não |
| Chamber of Commerce [FR] | 1 | 400 | 0 | 200 | 0 | 190 s | 5000 | age1_landmark2, audio_production_landmark, economy_building, landmark, market_fre_discount, siegeable | sim |
| College of Artillery [FR] | 3 | 2400 | 0 | 1200 | 0 | 250 s | 5000 | age3_landmark2, audio_production_landmark, landmark, military_only_production, military_production_building, siege_production_landmark | sim |
| Dock [FR] | 1 | 0 | 150 | 0 | 0 | 30 s | 1750 | military_only_production, naval_production_building, production_building, resource_drop_off, scar_dock, siegeable | não |
| Farm [FR] | 1 | 0 | 75 | 0 | 0 | 6 s | 300 | farm, farm_field, resource, siegeable | não |
| Guild Hall [FR] | 2 | 1200 | 0 | 600 | 0 | 220 s | 5000 | age2_landmark2, audio_production_landmark, landmark, military_only_production, siegeable, town_center_or_landmark | sim |
| House [FR] | 1 | 0 | 50 | 0 | 0 | 15 s | 750 | house, scar_house, siegeable | não |
| Keep [FR] | 3 | 0 | 0 | 0 | 810 | 180 s | 5000 | castle, defensive_structure, military, scar_keep, siegeable | não |
| Lumber Camp [FR] | 1 | 0 | 25 | 0 | 0 | 20 s | 750 | economy_building, lumber_camp, resource_drop_off, scar_lumbercamp, siegeable | não |
| Market [FR] | 2 | 0 | 100 | 0 | 0 | 20 s | 1000 | economy_building, market_fre_discount, market_keybinding, scar_market, siegeable | não |
| Mill [FR] | 1 | 0 | 25 | 0 | 0 | 20 s | 750 | economy_building, gristmill, mill, resource_drop_off, scar_gristmill, siegeable | não |
| Mining Camp [FR] | 1 | 0 | 25 | 0 | 0 | 20 s | 750 | economy_building, gold_mining_camp, mining_camp, resource_drop_off, scar_miningcamp, siegeable | não |
| Monastery [FR] | 3 | 0 | 200 | 0 | 0 | 25 s | 2100 | monastery, production_building, scar_monastery, select_all_monastery, siegeable | não |
| Notre Dame [FR] | 4 | 5000 | 5000 | 5000 | 5000 | 600 s | 5000 | audio_production_landmark, siegeable, wonder, wonder_imperial_age | sim |
| Outpost [FR] | 1 | 0 | 100 | 0 | 0 | 60 s | 750 | defensive_structure, military, outpost, scar_outpost, siegeable, tower | não |
| Palisade [FR] | 1 | 0 | 7 | 0 | 0 | 8 s | 1350 | defensive_structure, palisade_wall, palisade_wall_section, siegeable, wall | não |
| Palisade Gate [FR] | 1 | 0 | 25 | 0 | 0 | 10 s | 1350 | defensive_structure, gate, palisade_gate, siegeable, wall | não |
| Red Palace [FR] | 3 | 2400 | 0 | 1200 | 0 | 250 s | 5000 | age3_landmark1, audio_production_landmark, castle, defensive_structure, landmark, siegeable | sim |
| Royal Institute [FR] | 2 | 1200 | 0 | 600 | 0 | 220 s | 5000 | age2_landmark1, audio_production_landmark, landmark, siegeable, town_center_or_landmark, wonder | sim |
| School of Cavalry [FR] | 1 | 400 | 0 | 200 | 0 | 190 s | 5000 | age1_landmark1, audio_production_landmark, landmark, military_only_production, siegeable, stable | sim |
| Siege Workshop [FR] | 3 | 0 | 250 | 0 | 0 | 45 s | 2100 | military_only_production, military_production_building, production_building, scar_siegeworkshop, siege_workshop, siegeable | não |
| Stable [FR] | 2 | 0 | 150 | 0 | 0 | 30 s | 1500 | military_only_production, military_production_building, production_building, scar_stable, siegeable, stable | não |
| Stone Wall [FR] | 2 | 0 | 0 | 0 | 25 | 16 s | 3000 | defensive_structure, siegeable, stone_wall, stone_wall_section, wall | não |
| Stone Wall Gate [FR] | 2 | 0 | 0 | 0 | 50 | 30 s | 3000 | defensive_structure, gate, siegeable, stone_gate, wall | não |
| Stone Wall Tower [FR] | 2 | 0 | 0 | 0 | 250 | 90 s | 3000 | defensive_structure, military, siegeable, stone_wall_tower, tower | não |
| Town Center [FR] | 1 | 0 | 400 | 0 | 300 | 150 s | 2500 | defensive_structure, production_building, resource_drop_off, siegeable, town_center_or_landmark | não |
| University [FR] | 4 | 0 | 450 | 0 | 0 | 60 s | 2100 | research_building, scar_university, siegeable, university | não |

### 3.7 Construções FR exclusivas e diferenças EN × FR

| Construção (PT / EN) | Idade | Comida | Madeira | Ouro | Pedra | Tempo | HP | Classes-chave (dataset) | Única |
|---|---|---|---|---|---|---|---|---|---|
| Chamber of Commerce [FR] | 1 | 400 | 0 | 200 | 0 | 190 s | 5000 | age1_landmark2, audio_production_landmark, economy_building, landmark, market_fre_discount, siegeable | sim |
| School of Cavalry [FR] | 1 | 400 | 0 | 200 | 0 | 190 s | 5000 | age1_landmark1, audio_production_landmark, landmark, military_only_production, siegeable, stable | sim |
| Guild Hall [FR] | 2 | 1200 | 0 | 600 | 0 | 220 s | 5000 | age2_landmark2, audio_production_landmark, landmark, military_only_production, siegeable, town_center_or_landmark | sim |
| Royal Institute [FR] | 2 | 1200 | 0 | 600 | 0 | 220 s | 5000 | age2_landmark1, audio_production_landmark, landmark, siegeable, town_center_or_landmark, wonder | sim |
| Red Palace [FR] | 3 | 2400 | 0 | 1200 | 0 | 250 s | 5000 | age3_landmark1, audio_production_landmark, castle, defensive_structure, landmark, siegeable | sim |
| College of Artillery [FR] | 3 | 2400 | 0 | 1200 | 0 | 250 s | 5000 | age3_landmark2, audio_production_landmark, landmark, military_only_production, military_production_building, siege_production_landmark | sim |
| Notre Dame [FR] | 4 | 5000 | 5000 | 5000 | 5000 | 600 s | 5000 | audio_production_landmark, siegeable, wonder, wonder_imperial_age | sim |

Diferenças EN × FR em construções (custos):

| Construção | Campo | EN | FR |
|---|---|---|---|
| Farm | wood | 37 | 75 |
| Farm | total | 37 | 75 |
| Keep | stone | 900 | 810 |
| Keep | total | 900 | 810 |
| Lumber Camp | wood | 50 | 25 |
| Lumber Camp | total | 50 | 25 |
| Mill | wood | 50 | 25 |
| Mill | total | 50 | 25 |
| Mining Camp | wood | 50 | 25 |
| Mining Camp | total | 50 | 25 |

## 4. Eras

O dataset não traz uma tabela de custo de avanço de era. Ele traz o custo de construção de cada landmark (`costs`, `age`, classe `ageN_landmarkK`). Esta tabela lista esses custos; o custo de avanço em si é NAO VERIFICADO (§9).

| Era (EN) | Era (PT-BR) | Landmarks EN (classe `ageN_landmarkK`) | Landmarks FR (classe `ageN_landmarkK`) | Custo de CONSTRUÇÃO do landmark (F / G; total) — dado do JSON, NÃO é custo de avanço | O que desbloqueia (dataset) |
|---|---|---|---|---|---|
| Dark Age (era 1) | Era Sombria | Abbey of Kings (landmark1), Council Hall (landmark2) | School of Cavalry (landmark1), Chamber of Commerce (landmark2) | 400 F / 200 G (total 600) por landmark | Construções e unidades de `age: 1` |
| Feudal Age (era 2) | Era Feudal | King's Palace (landmark1), The White Tower (landmark2) | Royal Institute (landmark1), Guild Hall (landmark2) | 1200 F / 600 G (total 1800) por landmark | Construções e unidades de `age: 2` |
| Castle Age (era 3) | Era do Castelo | Wynguard Palace (landmark1), Berkshire Palace (landmark2) | Red Palace (landmark1), College of Artillery (landmark2) | 2400 F / 1200 G (total 3600) por landmark | Construções e unidades de `age: 3` |
| Imperial Age (era 4) | Era Imperial | Cathedral of St. Thomas (só Maravilha, sem landmark1/2) | Notre Dame (só Maravilha, sem landmark1/2) | 5000 F / 5000 W / 5000 G / 5000 S (total 20000) | Construções e unidades de `age: 4` |

Observação: o dataset define **dois landmarks por era** (classes `age1_landmark1/2`, `age2_landmark1/2`, `age3_landmark1/2`) e a Maravilha na era 4. A coluna de custo é o custo de CONSTRUÇÃO do landmark, não o custo de avanço. Se o avanço de era cobra o landmark ou outro valor é **NAO VERIFICADO** (ver §9). Landmarks de era 1 (Town Center) não são cobrados (custo 0 em `capital-town-center-1`).

Eras que os landmarks desbloqueiam: `age` de cada construção no dataset (§3). Desbloqueio exato por construção é listado nos `producedBy` de cada unidade e tecnologia (§2 e §5).

## 5. Tecnologias

Tabelas geradas do dataset (`technologies/`). Custos em F / W / G / S e tempo de pesquisa (`costs.time`). O efeito numérico vem de `effects[]` (propriedade, valor, tipo `multiply`/`change`) e da `description`.

### 5.1 Ferraria (blacksmith) — melhorias de armas/armaduras

| Tecnologia (PT / EN, id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Efeito numérico (effects[]) | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|
| Angled Surfaces (angled-surfaces-4) | 4 | 0 | 150 | 350 | 0 | 60 s | rangedArmor +1 | Increase the ranged armor of all non-siege units by +1. |
| Balanced Projectiles (balanced-projectiles-3) | 3 | 0 | 100 | 250 | 0 | 60 s | rangedAttack +1 | Increase the ranged damage of all arrows and bolts by +1. |
| Bloomery (bloomery-2) | 2 | 50 | 0 | 125 | 0 | 60 s | meleeAttack +1 | Increase the melee damage of all non-siege units by +1. |
| Damascus Steel (damascus-steel-4) | 4 | 150 | 0 | 350 | 0 | 60 s | meleeAttack +1 | Increase the melee damage of all non-siege units by +1. |
| Decarbonization (decarbonization-3) | 3 | 100 | 0 | 250 | 0 | 60 s | meleeAttack +1 | Increase the melee damage of all non-siege units by +1. |
| Fitted Leatherwork (fitted-leatherwork-2) | 2 | 50 | 0 | 125 | 0 | 60 s | meleeArmor +1 | Increase the melee armor of all non-siege units by +1. |
| Insulated Helm (insulated-helm-3) | 3 | 100 | 0 | 250 | 0 | 60 s | meleeArmor +1 | Increase the melee armor of all non-siege units by +1. |
| Iron Undermesh (iron-undermesh-2) | 2 | 0 | 50 | 125 | 0 | 60 s | rangedArmor +1 | Increase the ranged armor of all non-siege units by +1. |
| Master Smiths (master-smiths-4) | 4 | 150 | 0 | 350 | 0 | 60 s | meleeArmor +1 | Increase the melee armor of all non-siege units by +1. |
| Military Academy (military-academy-3) | 3 | 0 | 100 | 250 | 0 | 60 s | buildTime ×0.8 | Increase the production speed of infantry, cavalry, siege, and transport units at buildings by 33%. Does not affect religious units or other support units. |
| Platecutter Point (platecutter-point-4) | 4 | 0 | 150 | 350 | 0 | 60 s | rangedAttack +1 | Increase the ranged damage of all arrows and bolts by +1. |
| Siege Engineering (siege-engineering-2) | 2 | 0 | 50 | 125 | 0 | 30 s | unknown +1 | Melee and ranged infantry can construct Siege Towers and Battering Rams in the field. |
| Steeled Arrow (steeled-arrow-2) | 2 | 0 | 50 | 125 | 0 | 60 s | rangedAttack +1 | Increase the ranged damage of all arrows and bolts by +1. |
| Wedge Rivets (wedge-rivets-3) | 3 | 0 | 100 | 250 | 0 | 60 s | rangedArmor +1 | Increase the ranged armor of all non-siege units by +1. |

### 5.2 Universidade (university)

| Tecnologia (PT / EN, id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Efeito numérico (effects[]) | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|
| Biology (biology-4) | 4 | 500 | 0 | 1000 | 0 | 90 s | hitpoints ×1.25 | Investing in natural sciences increases the health of all cavalry by +25%. |
| Chemistry (chemistry-4) | 4 | 200 | 0 | 650 | 0 | 60 s | rangedAttack ×1.25; siegeAttack ×1.25 | Advancements in alchemical research increase the bonus damage of all gunpowder siege weapons by +25%. |
| Court Architects (court-architects-4) | 4 | 0 | 0 | 700 | 300 | 90 s | hitpoints ×1.3 | Patronage of the finest builders increases all building health by +30%. |
| Elite Army Tactics (elite-army-tactics-4) | 4 | 500 | 0 | 1000 | 0 | 90 s | hitpoints ×1.15; meleeAttack ×1.15 | Training elite infantry leads to improved prowess in battle. Melee Infantry gain +15% damage and +15% health. |
| Incendiary Arrows (incendiary-arrows-4) | 4 | 0 | 500 | 1000 | 0 | 90 s | rangedAttack ×1.2 | Flammable munitions grant non-gunpowder ranged units a siege arrow or bolt when attacking buildings and increase their damage by +20%. |
| Serpentine Powder (serpentine-powder-4) | 4 | 300 | 0 | 500 | 0 | 60 s | — | With new gunpowder, Handcannoneers gain +5 damage against melee infantry and gain a brief increase to their movement speed after firing their weapon. |
| Siege Works (siege-works-4) | 4 | 0 | 300 | 600 | 0 | 90 s | hitpoints ×1.2 | New carpentry techniques increase the health of siege units by +20%. |
| Silk Bowstrings (silk-bowstrings-4) | 4 | 0 | 200 | 500 | 0 | 60 s | — | Stringing bows with silk grants Archers +1 range and Mounted Archers +0.5 range. |

### 5.3 Mosteiro (monastery)

| Tecnologia (PT / EN, id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Efeito numérico (effects[]) | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|
| Herbal Medicine (herbal-medicine-3) | 3 | 0 | 0 | 275 | 0 | 45 s | healingRate ×1.6 | Increase the healing rate of religious units and healers by +60%. |
| Piety (piety-4) | 4 | 0 | 0 | 325 | 0 | 45 s | hitpoints +40 | Increase the health of religious units and healers by +40. |
| Tithe Barns (tithe-barns-4) | 4 | 0 | 0 | 500 | 0 | 60 s | unknown +40; unknown +40; unknown +10 | Relics placed in a Monastery provide an income of +40 Food, +40 Wood, and +10 Stone every minute. |

### 5.4 Mercado (market)

| Tecnologia (PT / EN, id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Efeito numérico (effects[]) | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|

### 5.5 Melhorias de aldeão (moinho, acampamento de madeira, mineração, centro da cidade)

| Tecnologia (PT / EN, id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Efeito numérico (effects[]) | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|
| Crosscut Saw (crosscut-saw-4) | 4 | 250 | 0 | 500 | 0 | 75 s | woodGatherRate ×1.15 | Increase Villagers' gathering rate for Wood by 15% and Wood gatherers carry capacity by +5. |
| Cupellation (cupellation-4) | 4 | 0 | 250 | 500 | 0 | 75 s | goldGatherRate ×1.15; stoneGatherRate ×1.15 | Gold gatherers drop off 15% more resources. |
| Double Broadax (double-broadax-2) | 2 | 50 | 0 | 100 | 0 | 45 s | woodGatherRate ×1.15 | Increase Villagers' gathering rate for Wood by 15%. |
| Enclosures (enclosures-4) | 4 | 0 | 150 | 350 | 0 | 60 s | goldGatherRate +0.17 (valor bruto do dataset, type influence; texto diz +1 ouro / 6 s, ≈ 0,167 — arredondamento NAO VERIFICADO) | Each Farm Enclosure being worked by a Villager generates +1 Gold every 6 seconds. |
| Fertilization (fertilization-3) | 3 | 0 | 100 | 250 | 0 | 60 s | foodGatherRate ×1.1 | Increase Villagers' gathering rate for Food by 10%. Does not apply to hunted meat. |
| Forestry (forestry-1) | 1 | 25 | 0 | 50 | 0 | 45 s | unknown ×2 | Double the rate at which Villagers chop down trees. |
| Horticulture (horticulture-2) | 2 | 0 | 50 | 100 | 0 | 45 s | foodGatherRate ×1.1 | Increase Villagers' gathering rate for Food by 10%. Does not apply to hunted meat. |
| Lumber Preservation (lumber-preservation-3) | 3 | 100 | 0 | 250 | 0 | 60 s | woodGatherRate ×1.15 | Increase Villagers' gathering rate for Wood by 15%. |
| Precision Cross-Breeding (precision-cross-breeding-4) | 4 | 0 | 250 | 500 | 0 | 75 s | foodGatherRate ×1.1 | Increase Villagers' gathering rate for Food by 10%. Does not apply to hunted meat. |
| Professional Scouts (professional-scouts-2) | 2 | 0 | 150 | 300 | 0 | 75 s | huntCarryCapacity +1; rangedAttack +2 | Scouts gain the ability to carry animal carcasses and +100% damage against wild animals. Scouts move -55% slower while carrying and cannot pick up Boar. Deer slowly decay while being carried. |
| Shaft Mining (shaft-mining-3) | 3 | 0 | 100 | 250 | 0 | 60 s | — | Increase Villagers' gathering rate for Gold and Stone by 15%. |
| Specialized Pick (specialized-pick-2) | 2 | 0 | 50 | 100 | 0 | 45 s | goldGatherRate ×1.15; stoneGatherRate ×1.15 | Increase Villagers' gathering rate for Gold and Stone by 15%. |
| Survival Techniques (survival-techniques-1) | 1 | 0 | 25 | 75 | 0 | 25 s | huntGatherRate ×1.15 | Increase Villagers' hunted meat gather rate by +15%. |
| Textiles (textiles-2) | 2 | 50 | 0 | 100 | 0 | 20 s | hitpoints +50 | Increase Villagers' health by +50%. |
| Wheelbarrow (wheelbarrow-1) | 1 | 0 | 50 | 150 | 0 | 90 s | carryCapacity +5; moveSpeed ×1.15 | Increase the carry capacity of Villagers by +5 and their movement speed by +15%. |

### 5.6 Militares e navais (quartel, arquearia, estábulo, oficina de cerco, doca, Keep, Torre Branca, Berkshire, Outpost)

| Tecnologia (PT / EN, id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Efeito numérico (effects[]) | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|
| Adjustable Crossbars (adjustable-crossbars-4) | 4 | 0 | 1000 | 1200 | 0 | 90 s | attackSpeed ×0.99 | Increases Mangonel range by +1, blast radius by +75%, and adds +1 projectile to attacks. |
| Admiralty (admiralty-2) | 2 | 150 | 0 | 350 | 0 | 30 s | — | Increase the range of combat ships by +1. |
| Armor Clad (armor-clad-3) | 3 | 150 | 0 | 350 | 0 | 60 s | rangedArmor +2; meleeArmor +2 | Increase the ranged and melee armor of Men-at-Arms by +2. |
| Armored Hull (armored-hull-3) | 3 | 100 | 0 | 200 | 0 | 20 s | hitpoints ×1.2; rangedArmor +1 | Increase the health of all military ships by +20% and ranged armor by +1. |
| Arrow Volley (arrow-volley-4) | 4 | 0 | 150 | 350 | 0 | 60 s | attackSpeed +-1 | Longbowmen gain Arrow Volley, an activated ability that reduces their time to attack by +1 second for a duration of 6 seconds. |
| Arrowslits (arrowslits-2) | 2 | 0 | 0 | 25 | 50 | 30 s | unknown +1 | Add defensive arrowslits to this structure and increase garrison arrow range by +1. Only one weapon emplacement can be added. |
| Boiling Oil (boiling-oil-3) | 3 | 0 | 0 | 500 | 200 | 90 s | unknown +1 | Towers and Keeps gain a boiling oil attack against nearby units that deals 30 damage. |
| Cannon Emplacement (cannon-emplacement-4) | 4 | 0 | 0 | 125 | 375 | 60 s | unknown +1 | Add a defensive cannon emplacement to this structure. |
| Drift Nets (drift-nets-3) | 3 | 0 | 150 | 350 | 0 | 45 s | foodGatherRate ×1.1; carryCapacity +20; moveSpeed ×1.1 | Increase the gathering rate of Fishing Ships by +10%, carry capacity by +20 and move speed by +10%. |
| Explosives (explosives-4) | 4 | 150 | 0 | 350 | 0 | 45 s | siegeAttack ×1.4 | Increase the damage of Incendiary Ships by +40%. |
| Extended Lines (extended-lines-2) | 2 | 0 | 75 | 175 | 0 | 30 s | foodGatherRate ×1.15; carryCapacity +10 | Increase the gathering rate of Fishing Ships by +15% and carry capacity by +10. |
| Extra Hammocks (extra-hammocks-3) | 3 | 0 | 75 | 125 | 0 | 20 s | rangedAttack ×1.2 | Increases the number of arrows fired by Archer Ships by +1. |
| Fortify Outpost (fortify-outpost-2) | 2 | 0 | 0 | 0 | 100 | 30 s | hitpoints +1000; fireArmor +5 | Add +1000 health and +5 fire armor to this Outpost. |
| Geometry (geometry-4) | 4 | 0 | 100 | 225 | 0 | 45 s | siegeAttack ×1.2 | Increase damage of Trebuchets by +20%. |
| Greased Axles (greased-axles-3) | 3 | 0 | 150 | 350 | 0 | 60 s | moveSpeed ×1.15 | Increase the movement speed of siege engines by +15%. |
| Heated Shot (heated-shot-4) | 4 | 0 | 200 | 500 | 0 | 45 s | rangedAttack +6 | Archer Ship arrows light enemy Ships on fire, dealing damage over time. |
| Incendiaries (incendiaries-3) | 3 | 75 | 0 | 125 | 0 | 20 s | maxRange ×1.2 | Incendiary Ships gain +20% explosion range. |
| Lightweight Beams (lightweight-beams-4) | 4 | 0 | 300 | 400 | 0 | 60 s | attackSpeed ×0.83; buildTime ×0.5 | Increase Battering Ram attack speed by +20% and reduce their field construction time by -50%. |
| Naval Arrowslits (naval-arrowslits-2) | 2 | 0 | 75 | 0 | 125 | 30 s | — | Add a defensive arrowslit to this Dock which only attacks ships. |
| Network of Citadels (network-of-citadels-3) | 3 | 0 | 0 | 350 | 150 | 45 s | attackSpeed ×1.1 | Increase the Network of Castles attack speed bonus from +20% to +30%. |
| Roller Shutter Triggers (roller-shutter-triggers-4) | 4 | 0 | 150 | 350 | 0 | 60 s | attackSpeed ×0.77; rangedResistance +10 | Increases Springald attack speed by +30% and grants +10% Ranged Resistance. |
| Shattering Projectiles (shattering-projectiles-4) | 4 | 0 | 300 | 700 | 0 | 90 s | areaOfEffect +1 | Trebuchet projectiles shatter on impact, increasing their area of effect. |
| Shipwrights (shipwrights-4) | 4 | 300 | 0 | 550 | 0 | 50 s | hitpoints ×1.2; rangedArmor +1 | Increase the health of all military ships by +20% and ranged armor by +1. |
| Springald Crews (springald-crews-3) | 3 | 100 | 0 | 250 | 0 | 25 s | maxRange +1; attackSpeed ×0.83 | Springald Ships gain +1 range and attack 20% faster. |
| Springald Emplacement (springald-emplacement-3) | 3 | 0 | 0 | 50 | 125 | 30 s | unknown +1 | Add a defensive springald emplacement to this structure. |
| Spyglass (spyglass-4) | 4 | 0 | 100 | 50 | 0 | 45 s | lineOfSight ×1.3 | Increase the sight radius of Scouts by 30%. |
| Swivel Cannon (swivel-cannon-4) | 4 | 150 | 0 | 350 | 0 | 45 s | rangedAttack +15 | Springald Ships gain an additional Cannon which fires in 360 degrees. |

Marcadores do Rei (`upgrade-king-3`, `upgrade-king-4`) estão na lista de técnicas do dataset sem custo nem prédio: ver nota no final de §5.

### 5.7 Tecnologias exclusivas FR (dataset `technologies/french`)

| Tecnologia (PT / EN, id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Efeito numérico (effects[]) | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|
| Cantled Saddles (cantled-saddles-3) | 3 | 75 | 0 | 200 | 0 | 45 s | meleeAttack +10 | Increase Royal Knights' bonus damage after a charge from +3 to +10. |
| Chivalry (chivalry-2) | 2 | 0 | 100 | 200 | 0 | 60 s | healingRate +1 | Royal Knights regenerate +1 health every 1 seconds when out of combat. |
| Chivalry (chivalry-3) | 3 | 0 | 100 | 200 | 0 | 60 s | healingRate +1 | Royal Knights regenerate +1 health every 1 seconds when out of combat. |
| Crossbow Stirrups (crossbow-stirrups-3) | 3 | 300 | 0 | 700 | 0 | 90 s | attackSpeed ×0.8 | Increase the attack speed of Arbalétriers by +25%. |
| Crossbow Stirrups (crossbow-stirrups-4) | 4 | 300 | 0 | 700 | 0 | 90 s | attackSpeed ×0.8 | Increase the attack speed of Arbalétriers by +25%. |
| Enlistment Incentives (enlistment-incentives-3) | 3 | 150 | 0 | 350 | 0 | 60 s | unknown +5 | Improves the French influence by reducing unit costs by a further -5%. |
| Enlistment Incentives (enlistment-incentives-4) | 4 | 150 | 0 | 350 | 0 | 60 s | unknown +5 | Improves the French influence by reducing unit costs by a further -5%. |
| Gambesons (gambesons-3) | 3 | 0 | 100 | 250 | 0 | 45 s | meleeArmor +5 | Increase Arbalétrier melee armor by +5. |
| Long Guns (long-guns-4) | 4 | 0 | 200 | 500 | 0 | 30 s | rangedAttack ×1.15 | Increase the damage of naval cannons by +15%. |
| Merchant Guilds (merchant-guilds-4) | 4 | 200 | 0 | 500 | 0 | 60 s | goldGatherRate +1 (valor bruto do dataset, type influence; texto diz +1 ouro / 6 s, ≈ 0,167 — arredondamento NAO VERIFICADO) | Active Traders generate 1 gold every 6 seconds. |
| Royal Bloodlines (royal-bloodlines-3) | 3 | 300 | 0 | 700 | 0 | 90 s | hitpoints ×1.35 | Fill the stables with the best stallions, increasing all cavalry health by +35%. |
| Royal Bloodlines (royal-bloodlines-4) | 4 | 300 | 0 | 700 | 0 | 90 s | hitpoints ×1.35 | Fill the stables with the best stallions, increasing all cavalry health by +35%. |

### 5.8 Upgrades de unidade (`upgrades/`)

| Upgrade (id) | Era | Comida | Madeira | Ouro | Pedra | Tempo | Prédio | Descrição (dataset) |
|---|---|---|---|---|---|---|---|---|
| Upgrade to Early (early-men-at-arms-2) | 2 | 15 | 0 | 35 | 0 | 15 s | barracks | Upgrade Vanguard Men-at-Arms to Early Men-at-Arms. |
| Upgrade to Elite (elite-crossbowmen-4) | 4 | 300 | 0 | 700 | 0 | 60 s | archery-range, council-hall | Upgrade Crossbowmen to Elite Crossbowmen. |
| Upgrade to Elite (elite-horsemen-4) | 4 | 300 | 0 | 700 | 0 | 60 s | stable | Upgrade Veteran Horsemen to Elite Horsemen. |
| Upgrade to Elite (elite-knights-or-lancers-4) | 4 | 300 | 0 | 700 | 0 | 60 s | stable | Upgrade Knights or Lancers to Elite Knights or Lancers. |
| Upgrade to Elite (elite-longbowmen-4) | 4 | 300 | 0 | 700 | 0 | 60 s | archery-range, council-hall | Upgrade Veteran Longbowmen to Elite Longbowmen. |
| Upgrade to Elite (elite-men-at-arms-4) | 4 | 300 | 0 | 700 | 0 | 60 s | barracks | Upgrade Men-at-Arms to Elite Men-at-Arms. |
| Upgrade to Elite (elite-spearmen-4) | 4 | 300 | 0 | 700 | 0 | 60 s | barracks | Upgrade Veteran Spearmen to Elite Spearmen. |
| Upgrade to Man-at-Arms (men-at-arms-3) | 3 | 50 | 0 | 125 | 0 | 30 s | barracks | Upgrade Early Men-at-Arms to Men-at-Arms. |
| Upgrade to Veteran (veteran-horsemen-3) | 3 | 100 | 0 | 250 | 0 | 60 s | stable | Upgrade Horsemen to Veteran Horsemen. |
| Upgrade to Veteran (veteran-longbowmen-3) | 3 | 100 | 0 | 250 | 0 | 60 s | archery-range, council-hall | Upgrade Longbowmen to Veteran Longbowmen. |
| Upgrade to Veteran (veteran-spearmen-3) | 3 | 100 | 0 | 250 | 0 | 60 s | barracks | Upgrade Hardened Spearmen to Veteran Spearmen. |

### 5.9 Diferenças EN × FR em tecnologias

| Tecnologia | Campo | EN | FR |
|---|---|---|---|
| Bloomery | food | 50 | 0 |
| Bloomery | gold | 125 | 0 |
| Bloomery | time | 60 | 0 |
| Crosscut Saw | food | 250 | 175 |
| Crosscut Saw | gold | 500 | 350 |
| Cupellation | wood | 250 | 175 |
| Cupellation | gold | 500 | 350 |
| Damascus Steel | food | 150 | 0 |
| Damascus Steel | gold | 350 | 0 |
| Damascus Steel | time | 60 | 0 |
| Decarbonization | food | 100 | 0 |
| Decarbonization | gold | 250 | 0 |
| Decarbonization | time | 60 | 0 |
| Double Broadax | food | 50 | 35 |
| Double Broadax | gold | 100 | 70 |
| Drift Nets | wood | 150 | 105 |
| Drift Nets | gold | 350 | 245 |
| Extended Lines | wood | 75 | 53 |
| Extended Lines | gold | 175 | 123 |
| Fertilization | wood | 100 | 70 |
| Fertilization | gold | 250 | 175 |
| Forestry | food | 25 | 18 |
| Forestry | gold | 50 | 35 |
| Horticulture | wood | 50 | 35 |
| Horticulture | gold | 100 | 70 |
| Lumber Preservation | food | 100 | 70 |
| Lumber Preservation | gold | 250 | 175 |
| Precision Cross-Breeding | wood | 250 | 175 |
| Precision Cross-Breeding | gold | 500 | 350 |
| Shaft Mining | wood | 100 | 70 |
| Shaft Mining | gold | 250 | 175 |
| Specialized Pick | wood | 50 | 35 |
| Specialized Pick | gold | 100 | 70 |
| Survival Techniques | wood | 25 | 18 |
| Survival Techniques | gold | 75 | 53 |

Techs FR com custo 0 (`bloomery-2`, `damascus-steel-4`, `decarbonization-3`): o dataset FR traz custo zero; valor FR = **NAO VERIFICADO** (usa-se EN).

Marcadores do Rei (`upgrade-king-3`, `upgrade-king-4`, sem custo nem prédio): descrição do dataset: "Increases the health, attack and armor of the King when reaching Castle Age / Imperial Age". Valores numéricos = NAO VERIFICADO.

## 6. Economia

| Item | Valor | Fonte / status |
|---|---|---|
| Limite de população (cap) | **200** | NAO VERIFICADO no dataset (o dataset traz `popcap` por unidade e `Increases your maximum Population` nas casas/TCs, sem valor de cap). Valor de referência do briefing; não confirmado. |
| Aumento de população por Casa (House) | NAO VERIFICADO | `house-1` diz "Increases your maximum Population" sem valor numérico no JSON. |
| Aumento de população por Centro da Cidade / landmark | NAO VERIFICADO | Mesmo caso. |
| Ocupação por unidade (`popcap`) | ver §2 | Campo `costs.popcap` do dataset (ex.: aldeão 1; Mangonel 3; Wynguard Army 6). |
| Taxa base de coleta do aldeão (comida / madeira / ouro / pedra) | NAO VERIFICADO | Dataset não traz taxa base. |
| Capacidade de carga base do aldeão | NAO VERIFICADO | Dataset não traz. Só o incremento de Wheelbarrow (+5) e Crosscut Saw (+5 para madeira) em §5. |
| Drop-off (ponto de entrega) | Parcial | "All Resources can be dropped off here" (TC/Capital/King's Palace). Moinho aceita comida; Acampamento de Madeira aceita madeira; Acampamento de Mineração aceita pedra e ouro (texto dos JSON). Demais combinações = NAO VERIFICADO. |
| Distância de drop-off / bônus de proximidade | NAO VERIFICADO | — |
| Fazendas: custo | 37 W (EN) / 75 W (FR) | `farm-1` (ver §3 e diferenças). |
| Fazendas: tempo / HP | 6 s / 300 HP | `farm-1`. Dataset: "Only one Villager can work each Farm". |
| Fazendas: aumento com moinho | +20% / +25% / +30% / +30% por era | `farm-1` e `mill-1` (`influences`): "Farm harvest rate increased +20%/+25%/+30%/+30% by Age while within the influence of a Mill." |
| Fazendas: durabilidade / replantio | NAO VERIFICADO | — |
| Coleta de comida (tecnologias) | ×1.10 (Horticulture, Fertilization, Precision Cross-Breeding), caça ×1.15 (Survival Techniques) | §5.5 (`effects[]`). |
| Coleta de madeira (tecnologias) | Forestry ×2 (corte de árvores); ×1.15 (Double Broadax, Lumber Preservation, Crosscut Saw) | §5.5. |
| Coleta de ouro/pedra (tecnologias) | ×1.15 (Specialized Pick, Shaft Mining); Enclosures: +1 ouro / 6 s por fazenda (texto; ver §5.5) | §5.5 (`goldGatherRate`). |
| Capacidade (tecnologias) | Wheelbarrow +5; Crosscut Saw +5 (madeira) | §5.5. |
| Comércio: Mercado | 100 W, tempo 20 s, HP 1000; produz Trader | `market-2` (§3). |
| Comércio: Trader (EN) | 0 F / 60 W / 60 G / 0 S; 30 s; 90 HP; spd 1 | `trader-2`. Gera ouro viajando entre Mercado de origem e Trade Post ou Mercado de outro jogador; distância maior = mais ouro. Taxa/valor exato = NAO VERIFICADO. |
| Comércio: Trader (FR) | 0 F / 60 W / 60 G; 30 s; popcap 1 | `trader-2` FR. Mesmo custo do EN. |
| Comércio: Trade Ship (EN/FR) | EN: 0 F / 90 W / 90 G, 30 s (total 180); FR: 0 F / 100 W / 100 G (total 200) | `trade-ship-2`. |
| Comércio: bônus FR | Traders podem devolver Food, Wood ou Gold aos Mercados; Trade Ships devolvem +20% | `civilizations/french.json` (overview). |
| Fazendas em Enclosure | +1 ouro a cada 6 s por fazenda trabalhada | Enclosures (`enclosures-4`): "generates +1 Gold every 6 seconds". Taxa de ouro por fazenda = +1 a cada 6 s (texto do dataset). Efeito de ouro por aldeão sem o enclosure = NAO VERIFICADO. |

## 7. Condições de vitória

| Modo | Condição | Número / limiar | Timer | Status |
|---|---|---|---|---|
| Destruir todos os landmarks | Não está descrita no dataset como regra de vitória. O dataset define `landmark` (classe) e `wonder` (classe) em construções. | NAO VERIFICADO | NAO VERIFICADO | **NAO VERIFICADO** |
| Maravilha (Wonder) | Dataset: "Build and defend a Wonder to secure victory. Rival civilizations will be aware of its construction and seek to destroy it." (cathedral-of-st-thomas-4 / notre-dame-4). Custo 20000 total (5000 F / 5000 W / 5000 G / 5000 S), tempo 600 s, HP 5000. | Custo e tempo: dados do dataset. Condição exata de vitória e duração de defesa: NAO VERIFICADO | NAO VERIFICADO (timer da Maravilha) | Parcial |
| Locais sagrados (Sacred Sites) | Dataset cita "capture Sacred Sites" (monk-3). Número de locais, pontos e regra de vitória: NAO VERIFICADO. | NAO VERIFICADO | NAO VERIFICADO | **NAO VERIFICADO** |

Nenhum número de vitória é inventado aqui. O timer da Maravilha e a regra de Locais Sagrados estão em §9.

### 7.1 Dados do dump de atributos (aoemods/attrib) — economia e sistemas

Fonte: dump de atributos do AoE4 (`github.com/aoemods/attrib`), minerado em
`docs/spec-parts/06-attrib.md` com os caminhos de arquivo. Valores brutos:

| Item | Valor | Fonte no dump |
|---|---|---|
| Coleta bruta (recurso/s por aldeão): arbusto, fazenda, rebanho | 0,66 / 0,75 / 0,75 | `ebps/races/core/units/unit_villager_1.json` |
| Coleta bruta: caça fogindo / caça perigosa / peixe | 0,825 / 0,90 / 1,00 | idem |
| Coleta bruta: madeira / ouro / pedra | 0,75 | idem |
| Capacidade de carga | 10 (caça: 25) | idem |
| Drop-off | imediato no Centro de Cidade (`drop_off_time = 0`) | idem |
| Fazenda | 120 comida total, 300 HP, 75 madeira, 6 s | `ebps/races/core/buildings/building_resource_farm.json` |
| Casa | 750 HP, 50 madeira, 15 s, +10 população (schema) | `ebps/races/core/buildings/building_house.json` |
| Local sagrado | captura 30 s, reversão 30 s, raio 10, footprint 10×10 | `ebps/gameplay/relics/holy_site.json` |
| Maravilha | 6000 de cada recurso, 600 s, 5000 HP | `ebps/races/core/buildings/building_wonder_age4.json` |
| Avanço de era | Feudal 190 s / 400 comida / 200 ouro; Castelo 220 s / 1200 / 600; Imperial 250 s / 2400 / 1200 | `upgrade/dev/ages/*` |
| Mercado (compra/venda) | comida 130/70, madeira 130/70, pedra 170/90; mercado opera em ouro, custo máx 1000 | `market_tuning/default.json` |
| Carrinho de mão | 90 s, 150 ouro + 50 madeira | `upgrade/races/common/research/unit/upgrade_unit_town_center_wheelbarrow_1.json` |
| Melhorias de coleta | 75 s cada; ouro: _2 = 175o+75m, _3 = 350+150, _4 = 700+300; pedra: 500/750/1000 ouro | `upgrade/races/common/research/economy/*` |
| Cercados (EN) | 350 ouro + 150 madeira, 60 s | `upgrade/races/english/research/upgrade_farm_improved_enclosures_eng.json` |

Notas: as taxas brutas de coleta são tratadas como recurso/segundo por aldeão (coerente com a
carga 10 → ~15 s por viagem em arbustos). Multiplicadores por era (`+20/25/30/30%` do bônus
inglês em fazendas perto do moinho) têm o texto confirmado no dataset, mas os valores numéricos
não estão no dump (**NAO VERIFICADO**). Cap de população 200, timer da Maravilha, taxa de
relíquias e regra exata de vitória por locais sagrados permanecem **NAO VERIFICADO**.


## 8. HUD, câmera, escala e paleta (referências visuais)

Referências no repo: `docs/reference/aoe4/ss-01..10.jpg` (gameplay limpo, oficiais Steam) e
`docs/reference/hud/eN2zJ3c.jpg` + `docs/reference/hud/overlay-ET6KY5W.png` (partidas reais
com HUD completo). Layout abaixo conferido nessas duas últimas.

### 8.1 Layout por região

| Região | Conteúdo |
|---|---|
| Topo-esquerda | Painel de **objetivos** (fundo escuro, texto dourado): "DESTROY ALL ENEMY LANDMARKS (0/N)" (ícone picareta), "OR BUILD A WONDER", "OR CONTROL ALL SACRED SITES (0/3)" com sub-itens "Site 1/2/3" e checkbox |
| Topo-esquerda (barra) | Botões de menu (X), sino de alertas; placar de jogadores (espadas cruzadas) |
| Topo-centro | **Indicador de era** em algarismo romano (I–IV) com moldura; **timer** da partida (mm:ss) abaixo |
| Topo-direita | Lista de jogadores: nome, era ("A.I. Hardest \| Age I"), civ/Elo em multijogador |
| Base-esquerda | **Painel de recursos**: colunas Comida/Madeira/Ouro/Pedra — quantidade + nº de **aldeões por recurso** à direita (ícone pessoa); **População** X/Y (ícone casa); totais de **unidades militares** (espada) e **aldeões** (pessoa). Aldeões ociosos entram na contagem de população. Botão de **aldeão ocioso** no canto |
| Base-centro | **Painel de seleção**: retrato + nome + subtipo ("MILL — Economy Building"), HP atual/máx (barra + número, ex. 750/750), atributos (ataque, armadura corpo a corpo, armadura à distância), barra de progresso, nome do jogador dono. Multisseleção mostra sprites das unidades. Militares não-cerco: comandos avançados (guardar, stance agressivo/segurar, formações, garrison). Aldeões: **command card** (grade de construções) |
| Base-direita | **Minimapa em losango** (diamante fixo), terreno colorido, unidades = pontos coloridos por dono, câmera = triângulo azul; botões de controle abaixo (alertas, visão) |
| Meio-esquerda | Ícones de **grupos de controle** (1..9) quando criados |
| Fila de produção | Fila global + ícones de produção em andamento junto ao painel de seleção/recursos |

### 8.2 Câmera e escala

- Câmera 3D orbital estilo RTS: pan (bordas/WASD/setas), zoom (roda), rotação (Q/E ou meio-clique).
- Ângulo padrão de visão: ~45–55° acima do horizonte (medido nas referências).
- FOV e limites exatos de zoom: **NAO VERIFICADO** (não mensuráveis em screenshots).
- Escala (aproximada, das referências): casa ≈ 2× a altura do aldeão; Centro de Cidade ≈ 4–5×;
  muralha de pedra ≈ 1,5× o aldeão de altura (unidades ficam em cima — confirmado em
  `docs/reference/aoe4/ss-05.jpg`); Keep ≈ 6×. Ajustar no motor para que 1 unidade de
  infantaria ocupe ~1/6 da largura de uma casa.

### 8.3 Paleta (extraída das referências, aproximada)

- Fundo dos painéis HUD: azul-preto escuro (~#0b1220), bordas dourado-escuro.
- Texto principal: branco/off-white; destaques e títulos: dourado (~#d4af6a).
- Objetivos/painel superior: texto dourado sobre fundo preto translúcido.
- Barras de HP: verde (próprio) → vermelho (inimigo); seleção: retângulo verde (próprio) /
  vermelho (inimigo) na base da unidade.
- Ícones de recursos: comida=trigo, madeira=tronco, ouro=moeda, pedra=bloco cinza.
- Cores de time: azul (jogador humano nas refs), vermelho, verde, amarelo, roxo, ciano, laranja, preto.

### 8.4 Atalhos (verificados)

- `Ctrl+N` cria grupo de controle N; `N` seleciona; `Shift+N` adiciona ao grupo; duplo toque na
  tecla foca o grupo; `Tab` alterna subgrupo de um tipo de unidade na seleção.
- Demais atalhos: **NAO VERIFICADO** (ver `docs/spec-parts/06-attrib.md` para hotkeys de
  pesquisa de coleta: Q/W/E/R etc.,extraídos do dump de atributos).

### 8.5 Telas

- Menu principal, seleção de partida, tela de vitória/derrota: **NAO VERIFICADO** sem
  referências visuais; layout proposto seguir o mesmo idioma visual (pergaminho/moldura
  dourada) — criticar na Fase 8 com referências novas.

## 9. Não verificado (lacunas)

Lista de tudo que o dataset não cobre ou que está marcado NAO VERIFICADO no documento:

0. Versão / commit do upstream aoe4world — **resolvido**: `data/aoe4/README.upstream.md` (upstream `b2cd3822`, coletado 2025-10-08).
1. Limite de população (200): não está no dataset (referência do briefing; casa +10 confirmada).
2. Aumento de população por casa/TC/landmark: casa +10 (schema, §7.1); TC e landmarks sem valor no dataset.
3. Tempo de construção e reparo do aldeão: não está no dataset.
4. Taxa base de coleta do aldeão e capacidade de carga — **resolvido** em §7.1 (0,66–1,0 recurso/s por subtipo; carga 10, caça 25).
5. Durabilidade e replantio de Fazenda: fazenda tem 120 comida e 300 HP (§7.1); decaimento/replantio NAO VERIFICADO.
6. Distância de drop-off e regras de proximidade: parcial (§7.1 confirma imediato no TC).
7. Comércio: rota, lucro e distância de Trader/Trade Ship NAO VERIFICADO (taxas do mercado em §7.1).
8. Reliquias: quantidade de relíquias e taxa de ouro no mosteiro NAO VERIFICADO (monges carregam relíquias: confirmado pelo dataset).
9. Locais sagrados: número/timer de **vitória** NAO VERIFICADO; captura 30 s / reversão 30 s (§7.1); HUD ref confirma modo "CONTROL ALL SACRED SITES (0/3)".
10. Timer da Maravilha: construção 600 s / 5000 HP / 6000 de cada recurso (§7.1); **timer de vitória** pós-construída NAO VERIFICADO.
11. Regra exata de vitória por landmarks: "destruir todos os landmarks inimigos" — confirmada nas referências visuais do HUD ("DESTROY ALL ENEMY LANDMARKS (0/N)"); semântica interna NAO VERIFICADO.
12. Custo de avanço de era cobrado: §4/§7.1 derivam do landmark + `upgrade/dev/ages/`.
13. Efeitos de upgrade dos reis (`upgrade-king-3`, `upgrade-king-4`): sem custo nem efeito no dataset.
14. Custos FR de `bloomery-2`, `damascus-steel-4`, `decarbonization-3` = 0 no dataset FR (usa-se EN).
15. Taxa de fazenda/moinho além do bônus de era: influência do moinho descrita em texto, sem efeito numérico por tecnologia.
16. Fórmula de dano: convenção do projeto; não validada contra o jogo oficial.
17. Unidades sobre Stone Wall — **resolvido**: sim (referência `docs/reference/aoe4/ss-05.jpg`); implementar garrison em muralha de pedra.
18. Monge: taxa de conversão e duração de cura NAO VERIFICADO; coleta de relíquias confirmada.
19. Tradução PT-BR oficial dos nomes de unidades e construções: os nomes PT-BR nas tabelas são traduções diretas sugeridas, não oficiais.
20. Diferenças EN × FR no dataset (custos e tempos de unidades, construções e techs): o projeto usa o valor da civilização específica do dataset.
21. Alcance mínimo de unidades de cerco e Trebuchet: valores vêm do dataset, mas comportamento em jogo = NAO VERIFICADO.

