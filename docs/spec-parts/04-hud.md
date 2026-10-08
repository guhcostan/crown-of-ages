# 04 — HUD, Controles, Câmera e Referências de Fidelidade (Crown of Ages)

**Patch de referencia:** Age of Empires IV — **Patch 16.2.10884** (publicado em 18/06/2026, via Steam News, feed `steam_community_announcements`). Patch anterior citado: 16.2.10604 (01/06/2026). Data de verificação: 08/10/2026.

> Aviso de escopo: este documento foi montado com fontes acessíveis neste ambiente. Fandom, Liquipedia e aoe4labs.com bloquearam o acesso (HTTP 403 / DNS), e a busca web esteve em rate limit. Por isso, a maior parte das tabelas de HUD/câmera/escala/paleta **não pôde ser cruzada com 2 fontes** e está marcada como NAO VERIFICADO. Não há números inventados.
>
> Também não consegui inspecionar visualmente os screenshots baixados (o modelo atual não declara entrada de imagem). A descrição de layout por imagem continua pendente.

**Uso no jogo:** Este é um spec de referência. Todos os valores NAO VERIFICADO devem ser confirmados antes de virar requisito de implementação.

---

## 1. LAYOUT DO HUD

Posições em % da tela (x = esquerda→direita, y = topo→base) **não foram medidas em fonte**. Todas as coordenadas abaixo estão marcadas como NAO VERIFICADO. Os nomes das regiões seguem o briefing; o que está confirmado por fonte é a existência/função de cada elemento, quando citado.

| Região | Posição aproximada (% x, % y) | Conteúdo | Função / comportamento | Fonte(s) | Status |
|---|---|---|---|---|---|
| Painel de recursos (topo-esquerda) | NAO VERIFICADO | Ícones comida / madeira / ouro / pedra; quantidade de cada recurso | Mostra estoque atual | NAO VERIFICADO | NAO VERIFICADO |
| Contagem de aldeões por recurso | NAO VERIFICADO | Número de aldeões coletando cada recurso, ao lado do ícone | Indica alocação da economia | NAO VERIFICADO | NAO VERIFICADO |
| Painel de seleção (inferior-centro) | NAO VERIFICADO | Retrato, HP, nome da unidade, lista de subgrupos | Mostra a seleção; subgrupos alternam com **Tab** | Steam guide "Roadmap for beginners" (Rinky) | Parcial (função confirmada, posição não) |
| Retrato / HP da seleção | NAO VERIFICADO | Retrato da unidade e barra de vida | — | NAO VERIFICADO | NAO VERIFICADO |
| Fila de produção (dentro do painel de seleção) | NAO VERIFICADO | Fila de unidades/edifícios em produção | Produção sequencial por edifício | NAO VERIFICADO | NAO VERIFICADO |
| Grade de comandos (command card, inferior-direita) | NAO VERIFICADO | Botões de ação organizados por aba/ícone | Ações da seleção; atalhos de teclado por aba | Steam guide "Roadmap" (menciona abas por Tab) | Parcial |
| Minimapa (inferior-esquerda) | NAO VERIFICADO | Mapa reduzido com elementos desenhados (ver nota abaixo) | Navegação e alertas | NAO VERIFICADO | NAO VERIFICADO |
| Elementos desenhados no minimapa (unidades, edifícios, território, ping) | NAO VERIFICADO | — | — | NAO VERIFICADO | NAO VERIFICADO |
| Indicador de Era (topo-centro?) | NAO VERIFICADO | Era atual e progresso para a próxima | — | NAO VERIFICADO | NAO VERIFICADO |
| Botão de aldeão ocioso | NAO VERIFICADO | Ícone de aldeão no canto inferior-esquerdo | Seleciona aldeões ociosos | Steam guide "Roadmap" (menciona ícone no canto inferior-esquerdo) | Parcial (posição confirmada só qualitativamente) |
| Fila global de produção | NAO VERIFICADO | Lista de todas as produções ativas | — | NAO VERIFICADO | NAO VERIFICADO |
| Placar (scoreboard) | NAO VERIFICADO | Jogadores/times, estatísticas | — | NAO VERIFICADO | NAO VERIFICADO |
| Objetivos de vitória | NAO VERIFICADO | Painel de condição de vitória | — | NAO VERIFICADO | NAO VERIFICADO |
| Menu de pausa | NAO VERIFICADO | — | Pausa somente em partidas single/AI (a confirmar) | NAO VERIFICADO | NAO VERIFICADO |
| Controle de velocidade do jogo | NAO VERIFICADO | — | — | NAO VERIFICADO | NAO VERIFICADO |
| Alertas (ataque, aldeão ocioso, limite de população) | NAO VERIFICADO | — | Texto/ícone + som | NAO VERIFICADO | NAO VERIFICADO |
| Alternância de UI Teclado/Mouse ↔ Controle | Opção do jogo | Escolha de interface | Desde o patch 16.2.10604 é possível alternar entre a UI de teclado+mouse e a de controle no PC | Steam News 16.2.10604 (01/06/2026); Steam News 16.2.10884 | Confirmado (existência) |

**Notas de layout a confirmar em screenshot:** o briefing pede posições em %. Como não consegui ler os PNGs baixados, esta coluna segue NAO VERIFICADO para todas as regiões.

Fontes:
- https://store.steampowered.com/news/app/1466860 (Steam News Hub)
- https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1466860&count=10&maxlength=600
- https://steamcommunity.com/sharedfiles/filedetails/?id=2669126495 (Rinky, "Roadmap for beginners")

---

## 2. ATALHOS DE TECLADO

Atalhos confirmados por guias da comunidade do Steam. Cada linha tem **1 fonte** (guia de usuário). O cruzamento com documentação oficial não foi possível (Fandom/Liquipedia bloqueados); por isso a coluna "Confirmações" indica o número de fontes lidas.

| Categoria | Ação | Atalho (padrão) | Descrição (PT-BR) | Fontes / confirmações | Status |
|---|---|---|---|---|---|
| Seleção | Selecionar unidades | Clique esquerdo | Seleciona unidade/edifício | Steam guide Rinky | 1 fonte |
| Seleção | Selecionar todas do mesmo tipo na tela | Duplo clique ou Ctrl + clique | Seleciona todas as unidades/edifícios do mesmo tipo visíveis | Steam guide Rinky | 1 fonte |
| Seleção | Adicionar/remover da seleção | Shift + clique | Adiciona ou remove sem limpar a seleção | Steam guide Rinky | 1 fonte |
| Seleção | Alternar subgrupo no painel de seleção | Tab | Troca o subgrupo ativo para liberar seus atalhos | Steam guide Rinky | 1 fonte |
| Grupos de controle | Criar grupo | Ctrl + N (N = 0–9) | Cria grupo de controle com a seleção atual | Steam guide Sashik "How to group and ungroup units" | 1 fonte |
| Grupos de controle | Selecionar grupo | N | Seleciona o grupo N | Steam guide Sashik | 1 fonte |
| Grupos de controle | Selecionar e focar grupo | N, N (duplo toque) | Seleciona e centraliza a câmera no grupo | Steam guide Sashik | 1 fonte |
| Grupos de controle | Adicionar ao grupo | Shift + N | Acrescenta a seleção atual ao grupo N existente | Steam guide Sashik | 1 fonte |
| Grupos de controle | Mesclar grupos | Shift + N (grupo não usado) | Cria grupo mesclado com a seleção dos grupos | Steam guide Sashik | 1 fonte |
| Grupos de controle | Apagar grupo | Ctrl + N (sem seleção) | Remove o grupo N | Steam guide Sashik | 1 fonte |
| Grupos de controle | Remover unidades de grupos | Ctrl + Backspace | Tira a seleção de todos os grupos | Comentário na Steam guide Sashik (usuário derf) | Comentário de usuário (fraca) |
| Grupos de controle | Opção "grupos exclusivos" | Configuração | Ao adicionar a um grupo, remove dos outros | Comentário na Steam guide Sashik | Comentário de usuário (fraca) |
| Produção | Produzir aldeões sem pausa | NAO VERIFICADO | Recomendação "sempre produzir aldeões" (Rinky) | Steam guide Rinky (recomendação, sem tecla) | Tecla NAO VERIFICADO |
| Produção | Recrutar unidades por atalho | NAO VERIFICADO | Guia recomenda atalhos em vez de cliques | Steam guide Rinky | Tecla NAO VERIFICADO |
| Aldeões | Selecionar aldeão ocioso | NAO VERIFICADO | Atalho para aldeões ociosos (guia cita, sem tecla) | Steam guide Rinky | Tecla NAO VERIFICADO |
| HUD | Abrir menu de pausa | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| HUD | Mostrar/ocultar placar | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Câmera | Pan (WASD / bordas / arrasto) | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Câmera | Zoom | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Câmera | Rotação | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Câmera | Ir para evento / alerta | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Combate | Atacar-mover (attack move) | NAO VERIFICADO | — | Steam guide Rinky menciona "attack move" sem tecla | Tecla NAO VERIFICADO |
| Combate | Parar, manter posição, patrulhar | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Combate | Formação | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Edifícios | Colocar construção | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Edifícios | Cancelar produção / construção | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Diversos | Mensagem / ping no minimapa | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |

**Observação:** o guia de Sashik informa que os atalhos de grupo funcionam também com teclado numérico ("even on numpad"). Combinações de grupo com modificadores só foram confirmadas nas linhas acima.

**Observação de versão:** o usuário Onecubed relatou que Shift + grupo não adiciona quando outras unidades já estão naquele grupo. Esse comportamento é relato de usuário (comentário), não foi reproduzido nem confirmado no patch atual.

Fontes:
- https://steamcommunity.com/sharedfiles/filedetails/?id=2641460590 (Sashik, "How to group and ungroup units")
- https://steamcommunity.com/sharedfiles/filedetails/?id=2669126495 (Rinky, "Roadmap for beginners")

---

## 3. CÂMERA

| Parâmetro | Valor | Unidade | Fontes / confirmações | Status |
|---|---|---|---|---|
| Ângulo padrão (pitch) | NAO VERIFICADO | graus | NAO VERIFICADO | NAO VERIFICADO |
| Ângulo de rotação padrão (yaw) | NAO VERIFICADO | graus | NAO VERIFICADO | NAO VERIFICADO |
| FOV (campo de visão vertical) | NAO VERIFICADO | graus | NAO VERIFICADO | NAO VERIFICADO |
| Zoom mínimo | NAO VERIFICADO | unidades de distância | NAO VERIFICADO | NAO VERIFICADO |
| Zoom máximo | NAO VERIFICADO | unidades de distância | NAO VERIFICADO | NAO VERIFICADO |
| Velocidade de pan | NAO VERIFICADO | unid./s | NAO VERIFICADO | NAO VERIFICADO |
| Velocidade de rotação | NAO VERIFICADO | graus/s | NAO VERIFICADO | NAO VERIFICADO |
| Limites de pitch | NAO VERIFICADO | graus | NAO VERIFICADO | NAO VERIFICADO |
| Limites do mapa (clamp) | NAO VERIFICADO | — | NAO VERIFICADO | NAO VERIFICADO |
| Focar grupo de controle (duplo toque) | Confirmado (comportamento) | — | Steam guide Sashik | 1 fonte |

Fontes:
- https://steamcommunity.com/sharedfiles/filedetails/?id=2641460590 (apenas comportamento de foco em grupo)

---

## 4. ESCALA / PROPORÇÕES

| Entidade / medida | Valor | Unidade | Fontes / confirmações | Status |
|---|---|---|---|---|
| Altura do Centro da Cidade (TC) | NAO VERIFICADO | unidades de mundo | NAO VERIFICADO | NAO VERIFICADO |
| Altura do aldeão | NAO VERIFICADO | unidades de mundo | NAO VERIFICADO | NAO VERIFICADO |
| Razão TC / aldeão | NAO VERIFICADO | × | NAO VERIFICADO | NAO VERIFICADO |
| Altura de cavalaria (ex.: Cavaleiro) | NAO VERIFICADO | unidades de mundo | NAO VERIFICADO | NAO VERIFICADO |
| Tamanho de tile do mapa | NAO VERIFICADO | unidades de mundo / tile | NAO VERIFICADO | NAO VERIFICADO |
| Tamanho de mapa padrão (lado) | NAO VERIFICADO | tiles | NAO VERIFICADO | NAO VERIFICADO |
| Raio de visão do aldeão | NAO VERIFICADO | tiles / unidades | NAO VERIFICADO | NAO VERIFICADO |

**Nota:** a Steam guide "The Hidden Math of AoE4" (GosHawK) traz a fórmula de dano, não escala. Dano de referência confirmado (1 fonte): `Dano = max(1, dano base + bônus − armadura)`; resistência percentual de Mangonel de 85% contra flechas (`dano × (1 − 0,85)`). Isso é mecânica de combate, não escala visual, e fica fora desta tabela.

Fontes:
- https://steamcommunity.com/sharedfiles/filedetails/?id=3661824697 (GosHawK, fórmula de dano — 1 fonte, não usada para escala)

---

## 5. PALETA VISUAL

Nenhum valor hex, RGB ou referência de token de UI foi confirmado. As tabelas abaixo ficam em NAO VERIFICADO.

| Papel | Descrição esperada (briefing) | Cor (hex) | Fontes / confirmações | Status |
|---|---|---|---|---|
| Fundo do painel (pergaminho) | tom pergaminho / bege | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Borda / moldura | marrom | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Destaque / dourado | dourado | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Texto principal | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Cor de seleção (contorno) | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Cor de time (jogador) | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Cor de time (inimigo) | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Barra de HP — cheia | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Barra de HP — média / baixa | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Barra de HP — fundo | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Ícone comida | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Ícone madeira | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Ícone ouro | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |
| Ícone pedra | — | NAO VERIFICADO | NAO VERIFICADO | NAO VERIFICADO |

**Recomendação de método:** amostrar cores dos screenshots em `docs/reference/` com um script (Pillow) **depois** de confirmar que o modelo consegue interpretar as imagens, ou extrair de um dump oficial. Amostragem direta de tela dá cor do frame, não token de UI, então precisa ser validada.

Fontes: nenhuma.

---

## 6. TELAS

| Tela | Elementos | Fontes / confirmações | Status |
|---|---|---|---|
| Menu principal | Logo, navegação, Modos de jogo (multiplayer/campanha/tutorial) | NAO VERIFICADO (página da loja não descreve o menu) | NAO VERIFICADO |
| Tela de carregamento (loading) | Imagem, dica, progresso | NAO VERIFICADO | NAO VERIFICADO |
| Tela de vitória | Estatísticas, placar, botões de saída | NAO VERIFICADO | NAO VERIFICADO |
| Tela de derrota | Estatísticas, botões de saída | NAO VERIFICADO | NAO VERIFICADO |
| Seleção de civilização / pré-partida | Lista de civs, mapa, configurações | NAO VERIFICADO | NAO VERIFICADO |

**Confirmado sobre o produto (loja Steam, API appdetails):** Age of Empires IV: Anniversary Edition, suporte completo a controle (controller_support: full), lançamento em 28/10/2021, plataforma Windows, desenvolvedores World's Edge, Relic Entertainment, Forgotten Empires e Climax Studios. Não descreve telas.

Fontes:
- https://store.steampowered.com/api/appdetails?appids=1466860

---

## 7. REFERÊNCIAS VISUAIS

Baixados com `curl` para `docs/reference/`. São imagens de referência de crítica de fidelidade. **Não usar como asset no jogo.** Dimensão: 1920×1080 JPEG. Conteúdo não foi inspecionado visualmente (o modelo atual não lê imagens).

| Arquivo local | URL de origem | Tipo | Descrição | Status |
|---|---|---|---|---|
| `docs/reference/steam-ss-01.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_2ae5b5a2a779c31e3acae486ec359b0d9087bc8c.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |
| `docs/reference/steam-ss-02.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_5384805fa5d365b069f197498269fabd7143cb4c.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |
| `docs/reference/steam-ss-03.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_4da9632574ab355b1a581190c262d21a1d3248ba.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |
| `docs/reference/steam-ss-04.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_48195285a60c6208f8bd722f74c556b9a224f4b0.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |
| `docs/reference/steam-ss-05.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_758b154dbd4cbfc943ba34010f514348580968c7.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |
| `docs/reference/steam-ss-06.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_c1284fc0ac8145df0811411adbbe9ab0ed512fef.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |
| `docs/reference/steam-ss-07.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_4d48fbd0aa828322c76239c03c591181c69b3049.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |
| `docs/reference/steam-ss-08.jpg` | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1466860/ss_71e788f069dd226f40ce6dd7cce06430abbaf918.1920x1080.jpg | Screenshot oficial (loja Steam) | Não inspecionado | Baixado, conteúdo NAO VERIFICADO |

Lista de origem: `https://store.steampowered.com/api/appdetails?appids=1466860` (campo `screenshots`, ids 0–7 usados; o id 8 e o 9 também existem e não foram baixados).

Fontes:
- https://store.steampowered.com/api/appdetails?appids=1466860

---

## Fontes (consolidado)

- https://store.steampowered.com/news/app/1466860 — Steam News Hub, Age of Empires IV: Anniversary Edition
- https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1466860 — feed de notícias da Steam (patch 16.2.10884, 16.2.10604)
- https://store.steampowered.com/api/appdetails?appids=1466860 — dados da loja (suporte a controle, screenshots, datas)
- https://steamcommunity.com/app/1466860/guides/ — índice de guias
- https://steamcommunity.com/sharedfiles/filedetails/?id=2641460590 — Sashik, grupos de controle
- https://steamcommunity.com/sharedfiles/filedetails/?id=2669126495 — Rinky, roadmap para iniciantes
- https://steamcommunity.com/sharedfiles/filedetails/?id=3661824697 — GosHawK, fórmula de dano
- https://www.ageofempires.com/age-iv-accessibility/ — página de acessibilidade (sem dados de HUD)
- https://aoe4world.com/ — navegação do site (sem dados de HUD/controles)
- https://aoe4world.com/api — documentação da API (sem dados de HUD/controles)

Fontes tentadas e não acessíveis: Fandom (`ageofempires.fandom.com`, `age-of-empires-iv.fandom.com`) — HTTP 403; Liquipedia (`liquipedia.net/ageofempires`) — HTTP 403; aoe4labs.com — DNS falhou; busca web — rate limit.

---

## Não verificado

Lacunas que precisam de nova pesquisa ou inspeção visual:

1. **Layout do HUD**: todas as posições em % (recursos, seleção, fila, command card, minimapa, Era, aldeão ocioso, fila global, placar, objetivos, menu de pausa, velocidade, alertas).
2. **Conteúdo do minimapa**: quais elementos são desenhados.
3. **Teclas não confirmadas**: pan, zoom, rotação, attack move, parar/patrulhar, formação, colocar construção, cancelar, ping, mensagem, placar, pausa, velocidade, aldeão ocioso, produção por atalho.
4. **Câmera**: pitch, yaw, FOV, zoom mín/máx, velocidades de pan e rotação, limites.
5. **Escala**: altura de TC, aldeão e cavalaria; tamanho de tile; tamanho de mapa padrão; raio de visão.
6. **Paleta**: todos os hex (pergaminho, marrom, dourado, seleção, times, HP, ícones de recursos).
7. **Telas**: menu principal, carregamento, vitória, derrota, pré-partida — todos os elementos.
8. **Cruzamento de fontes**: nenhuma tabela ficou com 2 fontes independentes porque Fandom/Liquipedia estavam bloqueados. Confirmar com a wiki da comunidade ou com documentação oficial quando acessível.
9. **Screenshots**: 8 PNG/JPEG baixados em `docs/reference/`, mas nenhum foi inspecionado. Revisar visualmente com um modelo que aceite imagem e preencher a coluna "Descrição".
10. **Versão futura**: o aoe4world anuncia a expansão *Raiders of the North* para 29/10/2026 (Vikings, Scots, novos biomas). Se ela entrar em patch antes da implementação, a referência de patch precisa ser reavaliada.
