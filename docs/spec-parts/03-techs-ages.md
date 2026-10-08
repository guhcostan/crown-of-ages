# 03 — Eras, Tecnologias, Economia e Condições de Vitória (Crown of Ages)

> **Patch de referência:** NÃO VERIFICADO. Não foi possível identificar o patch estável mais recente a partir das fontes acessíveis nesta sessão (ver seção "Nao verificado"). Nenhum número deste arquivo deve ser usado como definitivo até o patch ser confirmado.
>
> **Referência de fonte de desenvolvimento:** o jogo de referência é *Age of Empires IV* (Relic Entertainment / World's Edge, Xbox Game Studios). Este documento descreve mecânicas de domínio público para guiar a réplica original "Crown of Ages"; nomes, textos e assets do jogo original não devem ser copiados.

## Status da pesquisa (resumo honesto)

- Fandom (ageofempires.fandom.com): bloqueado (erro de DNS / HTTP 403 na tentativa de acesso).
- Liquipedia (liquipedia.net/ageofempires): bloqueada por verificação anti-bot ("Verify you are human").
- aoe4world.com: páginas `/explorer/technologies`, `/explorer/buildings` e `/explorer/patches` respondem HTTP 200 mas o conteúdo é renderizado no cliente (apenas o shell/menu veio no HTML). Endpoints `/api/v0/*` testados retornaram 404.
- Wikipedia (en) "Age of Empires IV": acessível. Confirmou os fatos de alto nível listados abaixo.
- ageofempires.com: página de jogo acessível mas sem tabelas técnicas.
- Steam (news hub do Anniversary Edition): acessível, sem conteúdo técnico extraído.
- web_search: retornou resultados não relacionados (Wikipedia genérica, arXiv) e depois falhou com HTTP 429.

Por isso **as tabelas numéricas abaixo estão marcadas como NAO VERIFICADO**. Não foram inventados valores.

---

## 1. ERAS

Confirmado (Wikipedia EN): o jogo possui 4 eras, com os nomes em inglês Dark Age, Feudal Age, Castle Age e Imperial Age. O avanço de era ocorre construindo **Landmarks** (e não no Centro da Cidade, exceto para Knights Templar). Cada civilização (exceto Abbasid Dynasty, Ayyubids, Golden Horde e Knights Templar) tem 4 landmarks: o Centro da Cidade inicial + um landmark para Feudal, Castle e Imperial. Cada landmark de avanço é escolhido entre duas opções.

| Era (EN) | Era (PT-BR sugerida) | Custo total p/ avançar (comida) | Custo total p/ avançar (ouro) | Papel do landmark | O que desbloqueia (edifícios / unidades / upgrades) |
|---|---|---|---|---|---|
| Dark Age | Era Sombria | NAO VERIFICADO | NAO VERIFICADO | Centro da Cidade inicial (landmark da era 1). Base da economia inicial. Avanço para Feudal depende de landmark. | NAO VERIFICADO |
| Feudal Age | Era Feudal | NAO VERIFICADO | NAO VERIFICADO | Landmark de Feudal (escolha entre 2 opções). Destrava avanço para Castle. | NAO VERIFICADO |
| Castle Age | Era do Castelo | NAO VERIFICADO | NAO VERIFICADO | Landmark de Castle (escolha entre 2 opções). Destrava avanço para Imperial. | NAO VERIFICADO |
| Imperial Age | Era Imperial | NAO VERIFICADO | NAO VERIFICADO | Landmark de Imperial (escolha entre 2 opções). Última era. | NAO VERIFICADO |

Exceções confirmadas (Wikipedia EN):
- Knights Templar: avança pesquisando a era no próprio Centro da Cidade (único landmark).
- Abbasid Dynasty / Ayyubids: landmark único, a House of Wisdom; avanço pesquisado nesse landmark.
- Golden Horde: landmark único, a Golden Tent; avanço pesquisado nesse landmark.
- Chinese e Zhu Xi's Legacy: podem construir ambos os landmarks para habilitar uma Dinastia.

Fontes:
- https://en.wikipedia.org/wiki/Age_of_Empires_IV (seção "Ages" e "Landmarks") — confirmado
- https://aoe4world.com/explorer/buildings — acessível, sem dados numéricos extraídos (NAO VERIFICADO)

---

## 2. POPULAÇÃO

Limite de população base: **200** (informação de conhecimento geral do jogo; NAO VERIFICADO em fonte acessível nesta sessão).

| Item | Valor | Observação |
|---|---|---|
| Limite máximo de população | NAO VERIFICADO | Briefing indica 200; não confirmado em fonte acessível |
| População por Casa (House), Era Dark Age | NAO VERIFICADO | — |
| População por Casa (House), Era Feudal | NAO VERIFICADO | — |
| População por Casa (House), Era Castle | NAO VERIFICADO | — |
| População por Casa (House), Era Imperial | NAO VERIFICADO | — |
| População por Centro da Cidade (TC) | NAO VERIFICADO | — |
| População por landmark (demais) | NAO VERIFICADO | — |
| Penalidade ao estourar o limite | NAO VERIFICADO | Bloqueio de treino (esperado) não confirmado |

Fontes:
- Nenhuma fonte acessível confirmou valores de população. (Wikipedia EN não detalha.)

---

## 3. ECONOMIA

| Item | Valor | Observação |
|---|---|---|
| Taxa de coleta — comida (fazenda) | NAO VERIFICADO | — |
| Taxa de coleta — madeira | NAO VERIFICADO | — |
| Taxa de coleta — ouro | NAO VERIFICADO | — |
| Taxa de coleta — pedra | NAO VERIFICADO | — |
| Drop-off (imediato ou ao retornar) | NAO VERIFICADO | — |
| Bônus de edifícios próximos (ex.: acampamento) | NAO VERIFICADO | — |
| Fazenda: decai (farm decay)? | NAO VERIFICADO | — |
| Taxa de comércio do mercado | NAO VERIFICADO | — |
| Comissão do mercado | NAO VERIFICADO | — |
| Mercador (Trader): rota, ouro/tempo | NAO VERIFICADO | — |
| Mercador: retorno | NAO VERIFICADO | — |

Fontes:
- Nenhuma fonte acessível com números de economia foi obtida.

---

## 4. RELÍQUIAS

| Item | Valor | Observação |
|---|---|---|
| Monges coletam relíquias? | NAO VERIFICADO | Mecânica conhecida no jogo de referência; detalhes não confirmados |
| Quantidade de relíquias por jogo | NAO VERIFICADO | — |
| Ouro gerado por relíquia no mosteiro | NAO VERIFICADO | — |
| Bônus/efeito adicional de relíquia | NAO VERIFICADO | — |

Fontes:
- Nenhuma fonte acessível confirmou valores.

---

## 5. LOCAIS SAGRADOS (SACRED SITES)

| Item | Valor | Observação |
|---|---|---|
| Mecânica de controle | NAO VERIFICADO | — |
| Número de locais sagrados | NAO VERIFICADO | — |
| Pontos para vitória | NAO VERIFICADO | — |
| Timer de controle | NAO VERIFICADO | — |
| Como o controle é disputado/perdido | NAO VERIFICADO | — |

Fontes:
- Nenhuma fonte acessível confirmou valores.

---

## 6. TECNOLOGIAS — FERRARIA (Blacksmith)

| Tecnologia (EN) | Tecnologia (PT-BR sugerida) | Era | Custo comida | Custo ouro | Custo madeira | Efeito numérico |
|---|---|---|---|---|---|---|
| NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |

Observação: o edifício Ferraria (Blacksmith) existe na lista de edifícios do jogo (Wikipedia EN, "Technology - Blacksmith, University/Madrasa"), mas a lista de tecnologias não foi obtida.

Fontes:
- https://en.wikipedia.org/wiki/Age_of_Empires_IV (lista de edifícios)

---

## 7. TECNOLOGIAS — UNIVERSIDADE (University / Madrasa)

| Tecnologia (EN) | Tecnologia (PT-BR sugerida) | Era | Custo comida | Custo ouro | Custo madeira | Efeito numérico |
|---|---|---|---|---|---|---|
| NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |

Observação: a Universidade (University) / Madrasa existe como edifício tecnológico (Wikipedia EN). Lista de tecnologias não obtida.

Fontes:
- https://en.wikipedia.org/wiki/Age_of_Empires_IV (lista de edifícios)

---

## 8. TECNOLOGIAS — MOSTEIRO (Monastery)

| Tecnologia (EN) | Tecnologia (PT-BR sugerida) | Era | Custo comida | Custo ouro | Custo madeira | Efeito numérico (incl. conversão/relíquias) |
|---|---|---|---|---|---|---|
| NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |

Observação: o Mosteiro (Monastery) existe como edifício religioso (Wikipedia EN, "Religious - Monastery, Mosque, Prayer Tent"). Lista de tecnologias e conversão não obtidas.

Fontes:
- https://en.wikipedia.org/wiki/Age_of_Empires_IV (lista de edifícios)

---

## 9. UPGRADES ECONÔMICOS POR ERA

| Upgrade (EN) | Upgrade (PT-BR sugerido) | Era | Custo comida | Custo ouro | Custo madeira | Efeito numérico |
|---|---|---|---|---|---|---|
| NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |

Fontes:
- Nenhuma fonte acessível obtida.

---

## 10. CONDIÇÕES DE VITÓRIA

| Modo de vitória | Condição exata | Número/limiar | Timer | Observação |
|---|---|---|---|---|
| Destruir todos os landmarks | Confirmado em termos gerais (Wikipedia EN implica landmarks como estrutura central da era/avanço); condição de derrota/vitória exata NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | — |
| Maravilha (Wonder) | Edifício "Wonder" existe na lista de edifícios (Wikipedia EN); condição de vitória exata NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | Tempo de construção NAO VERIFICADO |
| Locais sagrados (Sacred Sites) | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO | — |

Fontes:
- https://en.wikipedia.org/wiki/Age_of_Empires_IV (lista de edifícios, incluindo Wonder)

---

## Nao verificado

Lacunas que **não** puderam ser confirmadas nesta sessão (todas marcadas NAO VERIFICADO acima):

1. **Patch de referência**: versão/patch estável mais recente não identificada. Necessário para qualquer número.
2. **Custos de avanço de era** (comida/ouro) por era — Seção 1.
3. **Lista de unidades/edifícios/upgrades desbloqueados por era** — Seção 1.
4. **Limite de população e população por casa/TC/landmark por era** — Seção 2. Briefing cita 200; não verificado.
5. **Penalidade ao estourar o limite de população** — Seção 2.
6. **Todas as taxas de coleta, drop-off, bônus de edifícios próximos** — Seção 3.
7. **Mecânica de fazenda (decay)** — Seção 3.
8. **Taxa de comércio, comissão do mercado, rota/tempo/retorno do mercador** — Seção 3.
9. **Mecânica de relíquias (monges, quantidade, ouro por relíquia no mosteiro)** — Seção 4.
10. **Mecânica, número de pontos e timer dos locais sagrados** — Seção 5.
11. **Árvore completa da Ferraria (era, custos, efeitos)** — Seção 6.
12. **Árvore completa da Universidade (era, custos, efeitos)** — Seção 7.
13. **Árvore completa do Mosteiro (era, custos, efeitos, conversão)** — Seção 8.
14. **Upgrades econômicos por era** — Seção 9.
15. **Condições exatas de vitória (landmarks, maravilha, locais sagrados) com números** — Seção 10.

### Fontes bloqueadas (tentativas registradas)
- https://ageofempires.fandom.com/wiki/Age_of_Empires_IV — HTTP 403 / DNS falho
- https://ageofempires.fandom.com/wiki/Landmark_(Age_of_Empires_IV) — DNS falho
- https://liquipedia.net/ageofempires/Age_of_Empires_IV — verificação anti-bot
- https://aoe4world.com/explorer/technologies, /buildings, /patches — conteúdo renderizado no cliente (sem dados)
- https://aoe4world.com/api/v0/technologies, /api/v0/patches — 404

### Próximos passos sugeridos
- Obter o conteúdo do Fandom/Liquipedia por outro meio (cache, exportação de wiki, ou acesso autorizado) ou usar a API do aoe4world (endpoint correto a confirmar na documentação `https://aoe4world.com/api`).
- Repetir a pesquisa quando `web_search` voltar a responder (atualmente HTTP 429).
- Cruzar cada tabela com pelo menos 2 fontes antes de marcar como verificado.
