# 06 — Atributos do dump (UI, atalhos, coletores, bônus de civilização)

**Fonte primária:** `/tmp/aoe4-attrib` (dump aoemods/attrib, formato Essence `{data:[{key,value}]}`).
Todos os valores abaixo foram lidos diretamente dos arquivos citados. Onde não houve achado, está marcado **NAO ENCONTRADO**.

---

## 1. Atalhos de teclado (campo `hotkey_name` / `ui_info`)

Não existe um arquivo único de keybindings no dump. Os atalhos aparecem como `hotkey_name` dentro de `ui_info` de cada upgrade/habilidade/ordem.

### 1.1 Atalhos de melhorias econômicas e de unidade (letra → exemplos)

| Tecla | Exemplos de uso (arquivo) |
|---|---|
| Q | Coleta de comida nível 2–4: `upgrade/races/common/research/economy/upgrade_econ_resource_food_harvest_rate_2.json` (e _3, _4) |
| R | Coleta de ouro nível 2–4: `upgrade/races/common/research/economy/upgrade_econ_resource_gold_harvest_rate_2.json` (e _3, _4) |
| E | Coleta de pedra nível 2–4: `upgrade/races/common/research/economy/upgrade_econ_resource_stone_harvest_rate_2.json` (e _3, _4) |
| W | Coleta de madeira nível 2–4: `upgrade/races/common/research/economy/upgrade_econ_resource_wood_harvest_rate_2.json` (e _3, _4) |
| Z | Carrinho de mão (wheelbarrow): `upgrade/races/common/research/unit/upgrade_unit_town_center_wheelbarrow_1.json` |
| S | Cercados de fazenda (English): `upgrade/races/english/research/upgrade_farm_improved_enclosures_eng.json` (hotkey_name = "s") |

Observação: a mesma tecla aparece em muitas habilidades de facções diferentes (ex.: "A", "C", "D", "S", "V", "W", "X" etc.), então a tecla não é única por ação. Ex.: `S` é usado tanto em `upgrade_farm_improved_enclosures_eng` quanto em `abilities/timed_abilities/civ_core/core_market_sell_wood.json`.

### 1.2 Ordens de entidade e de esquadrão (ui.entity_orders / ui.squad_orders)

Arquivo: `tuning_simulation/tuning_simulation.json`. Os nomes abaixo são os `hotkey_name` (identificadores de ação, não teclas físicas):

| Ação (chave em `ui.*`) | hotkey_name |
|---|---|
| entity_orders.stop | stop |
| entity_orders.retire | destroy |
| entity_orders.load | load |
| entity_orders.unload | unloadHere |
| entity_orders.rally_point | rallyPoint |
| entity_orders.detonate_charges | detonateCharges |
| entity_orders.cancel_construction | cancelConstruction |
| squad_orders.move | move |
| squad_orders.attack_move | attackMove |
| squad_orders.attack_ground | attackGround |
| squad_orders.stop | stop |
| squad_orders.retire | destroy |
| squad_orders.trade | Q |
| squad_orders.prefer_ranged | usingRanged |
| squad_orders.prefer_melee | usingMelee |
| squad_orders.hold_position | Stand Ground |
| squad_orders.hold_fire_on | holdFireOn |
| squad_orders.hold_fire_off | holdFireOff |
| squad_orders.add_patrol_point | patrolMove |
| squad_orders.reverse_move | reverseMove |
| squad_orders.retreat | retreat |
| squad_orders.pickup_item | pick_up_item |
| squad_orders.plant_demolitions | placeCharge |
| squad_orders.cancel_construction | cancelConstruction |
| squad_orders.abandon_team_weapon | abandonTeamWeapon |

### 1.3 Outros atalhos/comandos encontrados

- Pings: `ui_ping/attack_ping.json`, `ui_ping/defend_ping.json`, `ui_ping/question_ping.json` (`ping_attack`, `ping_defend`, `ping_question`).
- Painel de comandos por era: `menu/abb_age1.json` … `menu/eng_age4.json` (`command_card_row01_column01` … `column04`).
- Menu: `menu/back.json` (tecla B).
- Dicas de carregamento: `load_tips/campaign/shared/hotkey_all.json` e `tutorial_item/hotkeys_guide.json` apontam para o guia de atalhos, mas **não listam teclas** (apenas IDs de texto localizado).

**NAO ENCONTRADO:** lista completa de teclas padrão (ex.: "Ctrl+1" para grupos, "Shift" para fila) em forma de arquivo de keybinding. Não há entrada dedicada no dump.

---

## 2. Layout de barras de UI (`ui_resource_bar_style/`)

Arquivos: `energy.json`, `heat.json`, `rage.json`.

| Arquivo | bar_style | pbgid |
|---|---|---|
| `ui_resource_bar_style/energy.json` | StatusIndicatorEnergy | 98073 |
| `ui_resource_bar_style/heat.json` | StatusIndicatorHeat | 101288 |
| `ui_resource_bar_style/rage.json` | StatusIndicatorRage | 98072 |

**Layout (posições, tamanhos, cores):** NAO ENCONTRADO no dump. Os arquivos só informam o estilo lógico da barra, sem geometria.

---

## 3. Carrinho de mão (wheelbarrow) — custo e tempo

Valores lidos com parser JSON (`cost`, `time_seconds`).

| Arquivo | Tempo (s) | Custo | Tecla |
|---|---|---|---|
| `upgrade/races/common/research/unit/upgrade_unit_town_center_wheelbarrow_1.json` | 90 | 150 ouro + 50 madeira | Z |
| `upgrade/races/mongol/research/unit/upgrade_unit_wheelbarrow_1_mon.json` | 90 | 150 ouro + 50 madeira | Z |
| `upgrade/races/mongol/research/unit/upgrade_unit_wheelbarrow_1_improved_mon.json` | 90 | 150 ouro + 200 pedra + 50 madeira | Z |
| `upgrade/races/mongol/research/unit/upgrade_unit_town_center_wheelbarrow_1_mon.json` | 90 | 150 ouro + 50 madeira | Z |
| `upgrade/races/sultanate/research/unit/upgrade_unit_town_center_wheelbarrow_1_sul.json` | 270 | sem custo em `cost` (ver nota) | Z |
| `upgrade/races/sultanate/research/upgrade_keep_wheelbarrow_sul.json` | 270 | sem custo em `cost` (ver nota) | Z |

Nota: nos arquivos sultanate o campo `cost` não retornou valores (todos vazios). Tempo de 270 s confirmado. Custo do Sultanato: **NAO ENCONTRADO** de forma confiável.

Pré-requisito do wheelbarrow comum (`upgrade_unit_town_center_wheelbarrow_1.json`): a bolsa lista `required_player_upgrade` com `upgrade_unit_wheelbarrow_1_improved_mon` como ausente (`is_present: false`) e a restrição `villager` (`apply_to_unit_classes`).

---

## 4. Melhorias de coleta (tempo e custo)

Todos os arquivos abaixo em `upgrade/races/common/research/economy/` têm tempo de 75 s.

| Upgrade | Ouro | Madeira | Comida | Pedra |
|---|---|---|---|---|
| food_harvest_rate_2 | 175 | 75 | 0 | 0 |
| food_harvest_rate_3 | 350 | 150 | 0 | 0 |
| food_harvest_rate_4 | 700 | 300 | 0 | 0 |
| gold_harvest_rate_2 | 175 | 75 | 0 | 0 |
| gold_harvest_rate_3 | 350 | 150 | 0 | 0 |
| gold_harvest_rate_4 | 700 | 300 | 0 | 0 |
| stone_harvest_rate_2 | 500 | 0 | 0 | 0 |
| stone_harvest_rate_3 | 750 | 0 | 0 | 0 |
| stone_harvest_rate_4 | 1000 | 0 | 0 | 0 |
| wood_harvest_rate_2 | 175 | 0 | 75 | 0 |
| wood_harvest_rate_3 | 350 | 0 | 150 | 0 |
| wood_harvest_rate_4 | 700 | 0 | 300 | 0 |

(Valores lidos dos campos `time_cost` / `cost` de cada arquivo `upgrade_econ_resource_*_harvest_rate_*.json`.)

**Percentual de ganho por nível (+% de coleta):** NAO ENCONTRADO. Os modifiers de coleta estão em árvores de estado (`common_upgrade_master\mining_harvest_rate_2\normal_modifiers\...`, `common_upgrade_master\wood_harvest_rate_3\...`) referenciadas em `ActionTree_OpeningBranch`. Essas árvores não existem no dump, então os multiplicadores não podem ser lidos.

---

## 5. Taxas base de coleta do aldeão (valores do dump)

Arquivo: `ebps/races/core/units/unit_villager_1.json`. Mesmos valores em `ebps/races/english/units/unit_villager_1_eng.json` e `ebps/races/french/units/unit_villager_1_fre.json`.

| Tarefa (`resource_gather_job`) | Alvo (`$PBGNAME`) | gather_rate | Capacidade de carga | Raio de busca |
|---|---|---|---|---|
| gather_wood | tree | 0.75 | 10 | 30 |
| gather_farm | farm | 0.75 | 10 | 25 |
| gather_berries | forage_bush | 0.66 | 10 | 30 |
| gather_herdable | herded_animal | 0.75 | 10 | 20 |
| gather_huntable_danger | hunted_animal_danger | 0.90 | 25 | 20 |
| gather_huntable | hunted_animal_flee | 0.825 | 25 | 30 |
| gather_stone | stone | 0.75 | 10 | 30 |
| gather_gold | gold | 0.75 | 10 | 30 |
| gather_shore_fish | fish | 1.00 | 10 | 30 |

Os valores de `gather_rate`/`resource_carry_capacity` são idênticos entre core, english e french: o dump não traz diferença de taxa para o aldeão inglês ou francês.

---

## 6. Bônus de civilização — English (fazenda perto de moinho)

**Resposta:** o bônus English de fazenda existe no dump, mas os valores por era de coleta **NAO ENCONTRADO** nos modifiers.

Achados verificados:

- **Taxa-base da estatística de cercado (fazenda):** `statemodel_schema/civs/english.json`, propriedades `enclosure_food_rate_eng` com `default = 5` e `enclosure_gold_rate_eng` com `default = 0`. Ambas são float properties do jogador inglês.
- **Upgrade de cercados (fazenda):** `upgrade/races/english/research/upgrade_farm_improved_enclosures_eng.json` — tempo 60 s, custo 350 ouro + 150 madeira. Tecla `s`. Requisito: `imperial_age` (is_present = true). Ícone: `races\english\abilities\enclosures`. Texto de tooltip (formatter 11185226) com `float_value = 3.5` e `int_value = 1`.
- **Habilidade do cercado:** `abilities/always_on_abilities/english/farm_enclosure_eng.json` (range 50, custo zero, `entity_tree = farm_enclosure_ability`).
- **Ligação com o moinho:** `ebps/races/english/buildings/building_econ_food_eng/building_econ_food_control_eng.json` referencia `abilities/mill_influence_eng` e as melhorias de fazenda `upgrade_econ_resource_food_harvest_rate_2/3/4` e `upgrade_farm_improved_enclosures_eng`.
- **Árvore de estado:** `tuning_simulation/tuning_simulation.json` lista `enclosure_food_rate_eng`, `enclosure_gold_rate_eng` e `enclosure_upgrade_eng` como booleanos de teste (`false`).

Não encontrado:

- O multiplicador/acréscimo real de `enclosure_food_rate_eng` por era (o valor 3.5 do tooltip não tem fórmula associada no dump).
- Modifier de "perto de moinho" (`mill_influence_eng`): o arquivo `abilities/always_on_abilities/english/mill_influence_eng.json` só contém requisitos de `golden_age_level_abb`, sem valor numérico.
- Taxas por era (Idade Feudal, Castelo, Imperial) do bônus English: NAO ENCONTRADO.

Caminhos verificados para este item: (1) `ebps/races/english/buildings/...`, (2) `upgrade/races/english/research/...`, (3) `abilities/always_on_abilities/english/...`, (4) `statemodel_schema/civs/english.json`, (5) `tuning_simulation/tuning_simulation.json`.

---

## 7. Bônus de civilização — outros (francês)

Não foi encontrada entrada de bônus de coleta numérica para o francês além das habilidades `toggle_guild_hall_resource_*_fre` em `abilities/toggle_abilities/french/`. Valores: **NAO ENCONTRADO**.

---

## 8. Resumo do que NÃO foi encontrado

- Lista de teclas padrão em arquivo de keybinding: NAO ENCONTRADO.
- Geometria/layout das barras de recurso: NAO ENCONTRADO.
- Custo do carrinho de mão do Sultanato: NAO ENCONTRADO (cost vazio).
- Percentual de ganho por nível de coleta (common_upgrade_master): NAO ENCONTRADO (árvores de estado ausentes no dump).
- Valores por era do bônus English de fazenda/moinho: NAO ENCONTRADO.

---

# Tarefa 2 — Vitória e sistemas de partida

**Método:** índice achatado de todos os JSON do dump (1.049.101 valores, em `/tmp/work/index.tsv`), busca por `sacred`, `relic`, `wonder`, `trade`, `victory`, `landmark`, `age`, `game_speed`, e leitura direta dos arquivos-chave.
**Ressalva:** o dump é a referência do AoE4 original. Os números abaixo são do dump e devem ser confirmados no código do Crown of Ages antes de virarem regra.

## T2.1 Locais sagrados (sacred / holy sites)

Arquivo: `ebps/gameplay/relics/holy_site.json`

| Atributo | Valor | Caminho |
|---|---|---|
| Tempo de captura | 30 | `/strategic_point_ext/capture_time` |
| Tempo de reversão | 30 | `/strategic_point_ext/revert_time` |
| Raio de captura (inner/outer) | 10 / 10 | `/strategic_point_ext/capture_area_info/{inner,outer}_radius` |
| Pegada | 10 × 10 | `/site_ext/footprint_scale/{x,y}` |
| Raio seguro | 0 | `/strategic_point_ext/secure_radius` |

- Variáveis de estado de sacred site no jogador (só nomes, sem valor padrão): `statemodel_float_property.json` `/_234` `sacred_site_gold_generation_multiplier`, `/_235` `sacred_site_gold_generation_rate`, `/_236` `sacred_site_gold_income_per_second`, `/_237` `sacred_site_total_generation_rate`.
- Schema por civilização: `statemodel_schema/civs/*.json` (`sacred_site_gold_*`).

| Item | Resultado |
|---|---|
| Quantidade de locais para vitória religiosa | NAO ENCONTRADO |
| Timer de posse para vitória religiosa | NAO ENCONTRADO (`religious_timer` existe em `tuning_simulation/tuning_simulation.json`, sem valor) |
| Pontos por posse | NAO ENCONTRADO |

A condição existe: `win_reason.json` `_9` = `Religious`; texto em `ui_misc/ui_misc_instance.json` (`win_condition_victory_reason_loc/Religious`). Não há número de locais nem timer.

## T2.2 Maravilha (wonder)

Arquivo: `ebps/races/core/buildings/building_wonder_age4.json` (apenas Era 4 auditada; `building_wonder_age{1,2,3}.json` não foram lidos).

| Atributo | Valor | Caminho |
|---|---|---|
| Tempo de construção | **600 s** | `/cost_ext/time_cost/time_seconds` |
| Custo | 6000 food, 6000 gold, 6000 stone, 6000 wood | `/cost_ext/time_cost/cost/*` |
| Vida (hitpoints) | **5000** | `/health_ext/hitpoints` |
| Armadura Ranged / Melee / Fire / True | 50 / 0 / 0 / 0 | `/health_ext/armor_scaler_by_damage_type/*` |
| Revelação ao morrer | 1.5 | `/sight_ext/reveal_area_on_death_time` |

- Vitória por maravilha: `win_reason.json` `_13` = `Wonder`; daily `challenges/challenge/daily_quests/win_victory_wonder.json` (winreason = 4).
- Timer de vitória por maravilha: NAO ENCONTRADO.

## T2.3 Vitória por landmarks (destruir todos)

- `win_reason.json` não tem entrada de landmarks. Lista: Annihilation, Conquest, Elimination, Settlements, Siege, Regicide, RelicHunt, Religious, Wonder, KeepRush, ObjectiveComplete/Failed, Surrender, None.
- `ai/` define `landmark_building_types/entity_type = landmark`, mas não a regra de vitória.
- Semântica "destruir todos os landmarks": NAO ENCONTRADO.

## T2.4 Relíquias

Arquivos: `ebps/gameplay/relics/relic.json`, `statemodel_float_property.json`.

| Item | Resultado |
|---|---|
| Ouro por relíquia por segundo | NAO ENCONTRADO (`relic_gold_income_per_second` `/_217`, `relic_gold_generation_rate` `/_216`, sem valor) |
| Multiplicador de ouro de relíquia | NAO ENCONTRADO (`relic_gold_generation_multiplier` `/_215`) |
| Limite de relíquias por jogador | NAO ENCONTRADO (`relic_limit` `/_218`, `relic_threshold` `/_219`, sem valor) |
| Capacidade de carga | NAO ENCONTRADO (`Relic_Capacity` `/_213`) |

Custo de ouro das habilidades de relíquia (`pickup_relic`, `monk_statetree_deposit_relic`, `monk_remove_relic`): 0 em `cost_to_player/gold` e `cost_to_squad/gold` (`abilities/modal_abilities/core/*.json`).

## T2.5 Comércio

**Rota — `trade_route_tuning/default.json`**

| Atributo | Valor | Caminho |
|---|---|---|
| Recurso gerado | gold | `/trade_route_bag/resource_generation/resource_to_generate` |
| settlement_multiplier | 1.2 | `/trade_route_bag/settlement_multiplier` |
| final_multiplier | 1 | `/trade_route_bag/final_multiplier` |
| d_multiplier | 0.138 | `/trade_route_bag/d_multiplier` |
| distance_delta_power | 2 | `/trade_route_bag/distance_delta_power` |
| d_minimum | 0.1 | `/trade_route_bag/d_minimum` |
| z_multiplier | 0.95 | `/trade_route_bag/z_multiplier` |
| meters_per_cell | 7 | `/trade_route_bag/meters_per_cell` |
| delay_before_move_to_destination / delay_before_return_home | 1 / 1 | `/trade_route_bag/delay_*` |
| Veículo | trade_cart | `/trade_route_bag/trade_cart_type` |

**Mercado — `market_tuning/default.json`** (`campaign.json` tem os mesmos starting_rates)

| Recurso | Compra inicial | Venda inicial |
|---|---|---|
| Food | 130 | 70 |
| Wood | 130 | 70 |
| Stone | 170 | 90 |
| Gold / popcap / command / action | 0 | 0 |

- Moeda do mercado: gold (`/market_tuning_bag/currency_resource`).
- Limite de custo máximo: 1000 (food, gold, stone, wood). Custo mínimo: 30 (food, stone, wood); 1 (gold).
- Ajuste ao vender: `value_decrease_on_sell` = 2; `cost_decrease_on_sell` = 4.
- Cooldown de comércio: 0 (starting, minimum, seconds_per_cooldown_bonus).
- Normalização: 5 s (food, gold, stone, wood); 30 s (action, popcap, militia_hre, command) (`market_tuning/campaign.json`).

**Taxa de comércio por recurso (`player_trade_rate`):** modificadores `trade_rate_{food,wood,stone}_modifier` existem em `player_modifier_type.json`, mas o valor padrão: NAO ENCONTRADO.

**Mecânica do mercador:** unidade `trade_cart` (`statemodel_schema/units/trade_cart.json`); destinos TRADE_HOME / TRADE_PARTNER (`market_tuning/campaign.json`). Velocidade do carrinho: NAO ENCONTRADO.

## T2.6 Velocidade do jogo

NAO ENCONTRADO. Não há `game_speed`, `simulation_rate` ou `tick_rate` com valor. As chaves `*_tick` encontradas são só timestamps de estado.

## T2.7 Eras (idades)

Arquivos: `upgrade/dev/ages/{dark,feudal,castle,imperial}_age.json` (variantes `abbasid/*_abb.json` e `hre/imperial_age_hre.json` não auditadas).

| Era | Tempo (s) | Food | Gold | Wood / Stone |
|---|---|---|---|---|
| Dark Age | 0 | 0 | 0 | 0 |
| Feudal Age | **190** | **400** | **200** | 0 |
| Castle Age | **220** | **1200** | **600** | 0 |
| Imperial Age | **250** | **2400** | **1200** | 0 |

Caminho: `/upgrade_bag/time_cost/time_seconds` e `/upgrade_bag/time_cost/cost/{food,gold,...}`. Habilitadores: `abilities/modal_abilities/core/age_up_{feudal,castle,imperial}.json`. Custos finais dos habilitadores: NAO ENCONTRADO nesta passagem.

## T2.8 Resumo NAO ENCONTRADO (Tarefa 2)

- Quantidade de sacred sites, timer de posse e pontos.
- Timer de vitória por maravilha.
- Regra de vitória por destruição de landmarks.
- Ouro por relíquia/s, limite de relíquias, capacidade de carga (valores).
- Taxa de comércio por recurso (valor padrão).
- Velocidade do carrinho e velocidade do jogo.

---

# Tarefa 1 — Economia do aldeão

Fonte: `/tmp/aoe4-attrib`. Caminhos relativos a essa raiz. Formato Essence `{data:[{key,value}]}`.

## E1. Taxa de coleta do aldeão por subtipo

Bloco `resource_gatherer_ext.gather_types.gather_target` em `ebps/races/core/units/unit_villager_1.json`.

| Subtipo (`resource_sub_type`) | Recurso | `gather_rate` (cru) | Capacidade | Raio de busca |
|---|---|---|---|---|
| forage_bush | comida | 0.66 | 10 | 30 |
| farm | comida | 0.75 | 10 | 25 |
| hunted_animal_flee | comida | 0.825 | 25 | 30 |
| hunted_animal_danger | comida | 0.9 | 25 | 20 |
| herded_animal | comida | 0.75 | 10 | 20 |
| fish | comida | 1.0 | 10 | 30 |
| tree | madeira | 0.75 | 10 | 30 |
| gold | ouro | 0.75 | 10 | 30 |
| stone | pedra | 0.75 | 10 | 30 |

**Recurso/segundo por aldeão: NAO ENCONTRADO.** `gather_rate` aparece como número puro, sem unidade de tempo nem duração de ciclo no dump. Não calculei recurso/s para não inventar.

**Modificadores `village_gather_rate_*`: NAO ENCONTRADO.** A busca por `village_gather` retornou 0 arquivos.

**Modificadores de taxa por upgrade:** os 12 upgrades `upgrade/races/common/research/economy/upgrade_econ_resource_{food,wood,gold,stone}_harvest_rate_{2,3,4}.json` apontam para state trees `upgrade_resource\...` que **não estão no dump** (0 diretórios `upgrade_resource`). O único número legível é `ui_info.help_text_formatter.formatter_arguments.int_value = 15`. Não confirmado como +15% por nível.

## E2. Capacidade de carga

| Recurso | Capacidade base | Fonte |
|---|---|---|
| comida (fazenda, bagas, rebanho, peixe) | 10 | `unit_villager_1.json` |
| madeira, ouro, pedra | 10 | `unit_villager_1.json` |
| caça (`hunted_animal_*`) | 25 | `unit_villager_1.json` |

Upgrade de capacidade (Abássida): `upgrade/races/abbasid/research/upgrade_econ_improved_carry_capacity_abb.json`, `upgradebag_float_property` `id="multiplier"` com `value = 0.5`. Texto de ajuda `int_value = 50`. Leitura: +50% de capacidade. É o único multiplicador de carga encontrado no dump.

Modificadores por recurso (`resource_carry_capacity_food/wood/stone/gold`) existem como chaves em `resource_type_info/*.json`, mas sem valores no dump: NAO ENCONTRADO.

## E3. Mecânica de depósito (drop-off)

Fonte: `ebps/races/core/buildings/building_town_center.json`, bloco `resource_drop_off_ext`.

- Aceita: food, gold, stone, wood = `true`.
- `drop_off_time_seconds`: food = 0, gold = 0, stone = 0, wood = 0 (imediato).
- Mineração: `ebps/races/core/buildings/building_econ_mining_camp.json` aceita gold e stone (`true`), `drop_off_time_seconds` = 0.

Leitura: o depósito de recurso econômico no TC leva 0 s. A única latência é o trajeto até o depósito.

## E4. Fazenda

Fonte: `ebps/races/core/buildings/building_resource_farm.json`.

| Campo | Valor | Chave |
|---|---|---|
| Comida total | 120 | `resource_deposit_ext.initial_amount` |
| Regeneração base | 75 | `resource_deposit_ext.base_regrowth_rate` |
| Trabalho para ativar | 80 | `resource_deposit_ext.work_to_enable` |
| Durabilidade (HP) | 300 | `health_ext.hitpoints` |
| Custo | 75 madeira, 0 comida | `cost_ext.time_cost.cost.wood` |
| Tempo de construção | 6 s | `cost_ext.time_cost.time_seconds` |
| Raio de coleta | 3.5 | `resource_deposit_ext.gather_distance` |

- Decaimento por tempo: NAO ENCONTRADO (`burn_ext.on_fire_decay_amount_per_sec = 0` é fogo, não colheita).
- Custo de replantio: NAO ENCONTRADO. Existe só `base_regrowth_rate = 75`, sem unidade.

## E5. Casa e cap de população

Fonte: `ebps/races/core/buildings/building_house.json` e `statemodel_schema/buildings/house.json`.

| Campo | Valor | Chave |
|---|---|---|
| Durabilidade (HP) | 750 | `health_ext.hitpoints` |
| Custo | 50 madeira | `cost_ext.time_cost.cost.wood` |
| Tempo de construção | 15 s | `cost_ext.time_cost.time_seconds` |
| Popcap provido | 10 (default do schema) | `statemodel_int_property` `population_cap_increase`, `default = 10` em `statemodel_schema/buildings/house.json` |

- Casa mongol (`ebps/races/mongol/buildings/building_house_mon.json`): 1000 HP, 100 madeira, 20 s. Mesmo `population_cap_increase` com default 10 em `statemodel_schema/buildings/civilizations/mongols/house_mon.json`.
- O TC também define `population_cap_increase` com default 10 (`statemodel_schema/buildings/town_center.json`, linha 83).
- Caveat: o `default` é o valor do schema. O dump não mostra que esse default é o efeito aplicado no jogo; não há modifier de popcap na casa.

**Cap máximo de população do jogador: NAO ENCONTRADO.** `population_cap_player_modifier` existe em `tuning_simulation/tuning_simulation.json` (linha ~3093), mas só com limites de modificador (±9000 e similares), sem valor base. `player_max_cap` aparece só como chave vazia em `resource_type_info/*.json`.

## E6. Resumo (economia do aldeão)

- Taxa crua: 0.66 bagas, 0.75 fazenda, 0.75 rebanho, 0.825 caça fugindo, 0.9 caça perigosa, 1.0 peixe, 0.75 madeira, 0.75 ouro, 0.75 pedra.
- Carga: 10 (maioria) e 25 (caça). Abássida +50% (`multiplier` 0.5).
- Depósito no TC: 0 s para recursos econômicos.
- Fazenda: 120 comida, regeneração 75, 300 HP, 75 madeira, 6 s.
- Casa: 750 HP, 50 madeira, 15 s, popcap default 10 (efeito a confirmar).
- Cap do jogador: NAO ENCONTRADO. Recurso/s por aldeão: NAO ENCONTRADO. Upgrades de taxa (%): NAO ENCONTRADO (árvore ausente).
