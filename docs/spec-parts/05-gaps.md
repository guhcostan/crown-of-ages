# 05 — Lacunas de mecânica (fora do dataset aoe4world)

Objetivo: preencher as 12 lacunas de mecânica que o dataset aoe4world não cobre.

**Regra adotada:** só entra valor com fonte (URL). Quando não há fonte acessível, está marcado como **NAO VERIFICADO**. Nenhum número foi estimado.

## Status das fontes consultadas

| Fonte | Resultado |
|---|---|
| ageofempires.fandom.com (todas as URLs pedidas) | **Bloqueado** — HTTP 403 (desafio Cloudflare) |
| liquipedia.net/ageofempires | **Bloqueado** — HTTP 403 ("Verify you are human") |
| aoe4.wiki | **Indisponível** — DNS não resolve |
| aoe4.fandom.com/wiki/Relic | **Bloqueado** — HTTP 403 |
| aoe4world.com (páginas /explorer, /faq, /api) | Acessível, mas só navegação e texto geral; sem valores de jogo |
| www.ageofempires.com (/news, /civilizations) | Acessível, só navegação; sem valores de jogo |
| data.aoe4world.com (JSON de unidades/edifícios) | **Acessível — fonte principal dos números abaixo** |

Consequência: as lacunas 1, 2 (parcial), 3 (parcial), 4, 6, 7 (parcial), 8, 9, 10, 11 e 12 **não puderam ser verificadas** pelas fontes pedidas. Os dados de custo e vida dos edifícios vêm do JSON do aoe4world, que é um dataset de AoE4 real e não da wiki pedida. Ele deve ser tratado como referência, não como especificação de Crown of Ages.

---

## 1. Taxa de coleta do aldeão por recurso

**NAO VERIFICADO.**

- A ficha do aldeão (`units/english/villager-1.json`) traz custo (50 comida, 20 s), vida (50) e ataque, mas não traz taxa de coleta nem capacidade de carga. — fonte: https://data.aoe4world.com/units/english/villager-1.json
- Nenhuma das fontes acessíveis informa taxa por recurso/segundo ou capacidade de carga.

## 2. Mecânica de drop-off (depósito)

**Parcialmente verificado.** Qual edifício recebe cada recurso está confirmado. A regra de "edifício mais próximo" não está.

- Centro da Cidade Capital: "All Resources can be dropped off here" (aceita todos os recursos). — fonte: https://data.aoe4world.com/buildings/english/capital-town-center-1.json
- Centro da Cidade (não capital): classe `resource_drop_off`, aceita todos os recursos. — fonte: https://data.aoe4world.com/buildings/all.json (entrada `town-center-1`)
- Acampamento de Madeira: "Villagers can drop off Wood at this building". — fonte: https://data.aoe4world.com/buildings/all.json (entrada `lumber-camp-1`)
- Acampamento de Mineração: "Villagers can drop off Stone and Gold at this building". — fonte: https://data.aoe4world.com/buildings/all.json (entrada `mining-camp-1`)
- Moinho: "Villagers can drop off Food at this building". — fonte: https://data.aoe4world.com/buildings/all.json (entrada `mill-1`)
- Doca (Dock): classe `resource_drop_off` e `trade_dock`. — fonte: https://data.aoe4world.com/buildings/all.json (entrada `dock-1`)
- Depósito imediato no edifício mais próximo e distância máxima: **NAO VERIFICADO**.

## 3. Fazenda: durabilidade, comida total, decaimento, replantio, custo da semente

Confirmado:

- Custo: **37 madeira**, 6 s de construção (Inglês). — fonte: https://data.aoe4world.com/buildings/english/farm-1.json
- Custo: **75 madeira**, 6 s (Abássida). — fonte: https://data.aoe4world.com/buildings/all.json (entrada `farm-1`, civ `ab`)
- Vida da fazenda: **300**. — fonte: https://data.aoe4world.com/buildings/english/farm-1.json
- Regra: "Only one Villager can work each Farm" (1 aldeão por fazenda). — fonte: https://data.aoe4world.com/buildings/english/farm-1.json
- Influência do Moinho: taxa de colheita da fazenda +20%/+25%/+30%/+30% por era, dentro da influência do Moinho. — fonte: https://data.aoe4world.com/buildings/english/farm-1.json

NAO VERIFICADO:

- Comida total por fazenda, decaimento, replantio e semente (não há campo de comida no JSON da fazenda).

## 4. População: cap 200, provisão por Casa, limite por era

- Custo da Casa: **50 madeira**, 15 s, 750 de vida (Inglês e Abássida). — fonte: https://data.aoe4world.com/buildings/english/house-1.json
- A descrição diz apenas "Increases your maximum Population"; o campo `popcap` do JSON está em 0 para a Casa. — fonte: https://data.aoe4world.com/buildings/english/house-1.json
- Quanto cada Casa provê: **NAO VERIFICADO**.
- Cap de 200: **NAO VERIFICADO**.
- Limite de população por era: **NAO VERIFICADO**.
- Centro da Cidade e Centro Capital também "increase your maximum Population" (sem valor). — fonte: https://data.aoe4world.com/buildings/all.json

## 5. Avanço de era (age-up): landmark e custo

Confirmado (estrutura e custo de landmarks):

- Os landmarks de era têm classe de era explícita: `age2_landmark1` e `age3_landmark1`, e são `wonder_feudal_age` / `wonder_castle_age`. Isso indica que avançar de era é construir um landmark. — fonte: https://data.aoe4world.com/buildings/all.json
- A Casa da Sabedoria (Abássida, era 2) diz: "Abbasids advance in Ages through the House of Wisdom. Construct wings to advance to the next Age". Caso específico de civilização, não regra geral. — fonte: https://data.aoe4world.com/buildings/all.json (entrada `house-of-wisdom-2`)
- Landmarks de Era II (Cistern da Primeira Colina, Torre do Chifre de Ouro, Bizâncio): **1200 comida + 600 ouro**, 220 s, 5000 de vida. — fonte: https://data.aoe4world.com/buildings/all.json (entradas `cistern-of-the-first-hill-2`, `golden-horn-tower-2`)
- Landmark de Era III/IV (Companhia de Engenharia Estrangeira, Bizâncio): **2400 comida + 1200 ouro**, 250 s, 5000 de vida. — fonte: https://data.aoe4world.com/buildings/all.json (entrada `foreign-engineering-company-3`)

NAO VERIFICADO:

- Custo de age-up da regra genérica (qual landmark cada era exige, e custo comum a todas as civilizações). Os valores acima são de landmarks de civilizações específicas (Bizâncio, Abássidas).

## 6. Locais sagrados (sacred sites): vitória

**NAO VERIFICADO.** Nenhuma das fontes acessíveis descreve locais sagrados. Número de locais, timer de posse e condição de vitória não puderam ser confirmados.

## 7. Maravilha (wonder): construção, HP, timer de vitória

Confirmado (dados de maravilhas de civilizações específicas):

- Catedral da Sabedoria Divina (Bizâncio, era IV, wonder): custo **5000 comida, 5000 madeira, 5000 pedra, 5000 ouro** (total 20000); **600 s** de construção; **5000 de vida**. Descrição: "Build and defend a Wonder to secure victory. Rival civilizations will be aware of its construction and seek to destroy it." — fonte: https://data.aoe4world.com/buildings/all.json (entrada `cathedral-of-divine-wisdom-4`)
- Prayer Hall of Uqba (Abássida, era IV): mesmo custo (20000 total), 600 s, 5000 de vida. — fonte: https://data.aoe4world.com/buildings/all.json (entrada `prayer-hall-of-uqba-4`)

NAO VERIFICADO:

- Timer de vitória depois que a maravilha termina: **NAO VERIFICADO** (a descrição confirma que construir/defender a maravilha leva à vitória, mas não o tempo).

## 8. Vitória por landmarks: regra exata

**NAO VERIFICADO.** A regra "destruir todos os landmarks do inimigo" não foi confirmada. A única fonte acessível que fala em vitória é a descrição da maravilha (item 7), que cita "secure victory" sem detalhar a regra.

## 9. Relíquias

Parcialmente verificado:

- A Mesquita (Abássida, era III em diante) recebe relíquias: "religious units can pick up Relics and place them in this building to generate Gold." — fonte: https://data.aoe4world.com/buildings/all.json (entrada `mosque-3`)

NAO VERIFICADO:

- Quantas relíquias existem no mapa.
- Ouro gerado por segundo ou por relíquia.
- Mecânica exata de coleta pelo monge.

## 10. Comércio: mercado e mercador

Parcialmente verificado:

- Mercado (Abássida, era II): "Allows the buying and selling of resources and produces the Trader." Custo **100 madeira**, 20 s, 1000 de vida. — fonte: https://data.aoe4world.com/buildings/all.json (entrada `market-2`)
- Doca comercial (`trade_dock`, `trade_post`): classe de posto de comércio. — fonte: https://data.aoe4world.com/buildings/all.json (entrada `dock-1`)

NAO VERIFICADO:

- Rota, ouro por minuto, taxa de câmbio, limite de mercadores.

## 11. Atalhos de teclado

**NAO VERIFICADO.** A página `Hotkeys` do Fandom está bloqueada (403). Nenhuma fonte acessível lista atalhos. Não há lista para inserir.

## 12. Velocidade do jogo (game speed) e tick do servidor

**NAO VERIFICADO.** Nenhuma fonte acessível informa a velocidade padrão nem o tick do servidor.

---

## Resumo de cobertura

| # | Lacuna | Status |
|---|---|---|
| 1 | Taxa de coleta do aldeão | NAO VERIFICADO |
| 2 | Drop-off | Parcial (quem aceita o quê confirmado; "mais próximo" não) |
| 3 | Fazenda | Parcial (custo, vida, 1 aldeão, bônus de moinho; comida total não) |
| 4 | População | Parcial (custo da Casa; provisão, cap 200 e limite por era não) |
| 5 | Age-up | Parcial (age-up = landmark confirmado; custo genérico não) |
| 6 | Locais sagrados | NAO VERIFICADO |
| 7 | Maravilha | Parcial (custo, 600 s, 5000 HP confirmados; timer de vitória não) |
| 8 | Vitória por landmarks | NAO VERIFICADO |
| 9 | Relíquias | Parcial (mesquita aceita relíquias; quantidade e ouro não) |
| 10 | Comércio | Parcial (mercado e doca confirmados; mecânica não) |
| 11 | Atalhos | NAO VERIFICADO |
| 12 | Velocidade do jogo | NAO VERIFICADO |

## Próximo passo sugerido

Para fechar as lacunas NAO VERIFICADO, é preciso uma fonte que o acesso automatizado consiga ler. Opções:

- Extrair os dados do jogo com as ferramentas do repositório `aoemods/attrib` (https://github.com/aoemods/attrib), que traz os arquivos de atributos do jogo. Ele pode conter taxas de coleta, população e relíquias.
- Abrir manualmente as páginas do Fandom e da Liquipedia no navegador e colar o texto aqui.
- Pedir acesso ao aoe4world para dumps (`/dumps`), que a própria API recomenda para uso de pesquisa.
