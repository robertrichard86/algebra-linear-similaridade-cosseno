'use strict';

/**
 * app.js
 * Modulo principal: orquestra todos os componentes do site de
 * Similaridade do Cosseno entre frases de jogadores de futebol.
 *
 * Trabalho de Algebra Linear
 * Aluno: Robert Richard | Prof. Alexandre Garcia
 * Fatec Baixada Santista (Rubens Lara) | Ciencia de Dados
 */

// Mapeamento de bandeiras (emoji) por jogador
var PLAYER_FLAGS = {
  'Kylian Mbappé': '\u{1F1EB}\u{1F1F7}',      // Franca
  'Lamine Yamal': '\u{1F1EA}\u{1F1F8}',         // Espanha
  'Erling Haaland': '\u{1F1F3}\u{1F1F4}',       // Noruega
  'Harry Kane': '\u{1F1EC}\u{1F1E7}',           // Inglaterra
  'Rodri': '\u{1F1EA}\u{1F1F8}',                // Espanha
  'Vinícius Júnior': '\u{1F1E7}\u{1F1F7}',      // Brasil
  'Jude Bellingham': '\u{1F1EC}\u{1F1E7}',      // Inglaterra
  'Lionel Messi': '\u{1F1E6}\u{1F1F7}',         // Argentina
  'Neymar': '\u{1F1E7}\u{1F1F7}',               // Brasil
  'Cristiano Ronaldo': '\u{1F1F5}\u{1F1F9}'     // Portugal
};

// Estado global da aplicacao
var AppState = {
  currentMethod: 'tfidf',       // 'tfidf' ou 'transformer'
  currentGranularity: 'average', // 'average' ou 'phrase'
  dataset: [],                   // [{jogador, frase}]
  sources: [],                   // [{jogador, clube_atual, frase, fonte, link, data_aproximada, contexto}]
  players: [],                   // nomes unicos
  tfidfVectors: [],              // vetores TF-IDF por frase
  tfidfIDF: null,                // valores IDF
  tfidfVocabulary: null,         // vocabulario
  embeddingsData: null,          // embeddings pre-calculados
  transformerReady: false,       // modelo transformer carregado
  lastComparison: null           // ultimo resultado de comparacao
};

// ========== FUNCOES DE UTILIDADE ==========

/**
 * Faz parse de um CSV simples (com suporte a campos entre aspas)
 */
function parseCSV(text) {
  var lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  // Parse do header
  var headers = parseCSVLine(lines[0]);

  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var values = parseCSVLine(line);
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || '').trim();
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Parse de uma linha CSV respeitando campos entre aspas
 */
function parseCSVLine(line) {
  var result = [];
  var current = '';
  var inQuotes = false;

  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

/**
 * Retorna a cor do heatmap com base no valor (0 a 1)
 */
function getHeatmapColor(value) {
  // Gradiente: azul escuro -> azul -> verde -> laranja -> vermelho
  var stops = [
    { pos: 0.0, r: 26, g: 35, b: 126 },    // azul escuro
    { pos: 0.25, r: 13, g: 71, b: 161 },    // azul
    { pos: 0.5, r: 76, g: 175, b: 80 },     // verde
    { pos: 0.75, r: 255, g: 152, b: 0 },    // laranja
    { pos: 1.0, r: 211, g: 47, b: 47 }      // vermelho
  ];

  for (var i = 0; i < stops.length - 1; i++) {
    if (value >= stops[i].pos && value <= stops[i + 1].pos) {
      var t = (value - stops[i].pos) / (stops[i + 1].pos - stops[i].pos);
      var r = Math.round(stops[i].r + t * (stops[i + 1].r - stops[i].r));
      var g = Math.round(stops[i].g + t * (stops[i + 1].g - stops[i].g));
      var b = Math.round(stops[i].b + t * (stops[i + 1].b - stops[i].b));
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
  }
  return 'rgb(211, 47, 47)';
}

/**
 * Retorna a cor do texto (claro/escuro) com base na luminosidade do fundo
 */
function getTextColorForBg(r, g, b) {
  var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#f0f0f0';
}

/**
 * Formata o nome do jogador com bandeira
 */
function playerWithFlag(name) {
  var flag = PLAYER_FLAGS[name] || '';
  return flag + ' ' + name;
}

/**
 * Nome curto do jogador para o heatmap
 */
function playerShortName(name) {
  var parts = name.split(' ');
  if (parts.length === 1) return name;
  // Para nomes compostos, usar o ultimo sobrenome
  // Excecoes: Vinicius Junior -> Vinicius Jr., Cristiano Ronaldo -> C. Ronaldo
  if (name === 'Vinícius Júnior') return 'Vinicius Jr.';
  if (name === 'Cristiano Ronaldo') return 'C. Ronaldo';
  if (name === 'Kylian Mbappé') return 'Mbappé';
  if (name === 'Lamine Yamal') return 'Yamal';
  if (name === 'Erling Haaland') return 'Haaland';
  if (name === 'Harry Kane') return 'Kane';
  if (name === 'Jude Bellingham') return 'Bellingham';
  if (name === 'Lionel Messi') return 'Messi';
  return parts[parts.length - 1];
}

// ========== CARREGAMENTO DE DADOS ==========

/**
 * Carrega os arquivos CSV e embeddings
 */
async function loadAllData() {
  try {
    // Carregar dataset principal
    var datasetResponse = await fetch('data/dataset_frases_jogadores.csv');
    var datasetText = await datasetResponse.text();
    AppState.dataset = parseCSV(datasetText);

    // Extrair jogadores unicos (mantendo a ordem original)
    var seen = {};
    AppState.players = [];
    for (var i = 0; i < AppState.dataset.length; i++) {
      var player = AppState.dataset[i].jogador;
      if (!seen[player]) {
        seen[player] = true;
        AppState.players.push(player);
      }
    }

    // Carregar fontes
    var sourcesResponse = await fetch('data/fontes_frases_jogadores.csv');
    var sourcesText = await sourcesResponse.text();
    AppState.sources = parseCSV(sourcesText);

    // Carregar embeddings pre-calculados
    var embResponse = await fetch('data/embeddings_precalculados.json');
    AppState.embeddingsData = await embResponse.json();
    EmbeddingsEngine.setPrecomputedData(AppState.embeddingsData);

    console.log('Dados carregados com sucesso:');
    console.log('  - ' + AppState.dataset.length + ' frases');
    console.log('  - ' + AppState.players.length + ' jogadores');
    console.log('  - Embeddings: ' + AppState.embeddingsData.dimensoes + ' dimensoes');

    return true;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return false;
  }
}

// ========== TF-IDF ==========

/**
 * Inicializa os vetores TF-IDF para todas as frases
 */
function initTFIDF() {
  var documents = AppState.dataset.map(function(item) { return item.frase; });
  var result = TFIDFEngine.computeTFIDF(documents);
  AppState.tfidfVectors = result.vectors;
  AppState.tfidfIDF = result.idf;
  AppState.tfidfVocabulary = result.vocabulary;
  console.log('TF-IDF calculado: ' + AppState.tfidfVocabulary.length + ' termos no vocabulario');
}

/**
 * Calcula a media dos vetores TF-IDF de cada jogador
 */
function getAverageTFIDFPerPlayer() {
  var playerVectors = {};
  for (var i = 0; i < AppState.dataset.length; i++) {
    var player = AppState.dataset[i].jogador;
    if (!playerVectors[player]) {
      playerVectors[player] = [];
    }
    playerVectors[player].push(AppState.tfidfVectors[i]);
  }

  var averages = {};
  for (var name in playerVectors) {
    var vecs = playerVectors[name];
    var dim = vecs[0].length;
    var avg = new Array(dim).fill(0);
    for (var j = 0; j < vecs.length; j++) {
      for (var k = 0; k < dim; k++) {
        avg[k] += vecs[j][k];
      }
    }
    for (var k = 0; k < dim; k++) {
      avg[k] /= vecs.length;
    }
    averages[name] = avg;
  }
  return averages;
}

// ========== EMBEDDINGS ==========

/**
 * Calcula a media dos embeddings de cada jogador
 */
function getAverageEmbeddingPerPlayer() {
  return EmbeddingsEngine.getAverageEmbeddingPerPlayer();
}

// ========== HEATMAP ==========

/**
 * Constroi e renderiza o heatmap de media por jogador
 */
function renderAverageHeatmap() {
  var container = document.getElementById('heatmap-average-container');

  var vectors;
  if (AppState.currentMethod === 'tfidf') {
    var averages = getAverageTFIDFPerPlayer();
    vectors = AppState.players.map(function(p) { return averages[p]; });
  } else {
    var averages = getAverageEmbeddingPerPlayer();
    vectors = AppState.players.map(function(p) { return averages[p]; });
  }

  // Calcular matriz de similaridade
  var matrix = CosineUtils.buildSimilarityMatrix(vectors);

  // Construir tabela HTML
  var html = '<table class="heatmap-table">';
  // Header
  html += '<tr><th></th>';
  for (var i = 0; i < AppState.players.length; i++) {
    var flag = PLAYER_FLAGS[AppState.players[i]] || '';
    html += '<th title="' + AppState.players[i] + '">' + flag + ' ' + playerShortName(AppState.players[i]) + '</th>';
  }
  html += '</tr>';

  // Linhas
  for (var i = 0; i < AppState.players.length; i++) {
    html += '<tr>';
    var flag = PLAYER_FLAGS[AppState.players[i]] || '';
    html += '<th class="row-header">' + flag + ' ' + playerShortName(AppState.players[i]) + '</th>';
    for (var j = 0; j < AppState.players.length; j++) {
      var val = matrix[i][j];
      var color = getHeatmapColor(val);
      var rgbMatch = color.match(/\d+/g);
      var textColor = getTextColorForBg(parseInt(rgbMatch[0]), parseInt(rgbMatch[1]), parseInt(rgbMatch[2]));
      var isDiag = i === j ? ' diagonal' : '';
      html += '<td class="heatmap-cell' + isDiag + '" ' +
              'style="background-color:' + color + '; color:' + textColor + ';" ' +
              'data-player-a="' + AppState.players[i] + '" ' +
              'data-player-b="' + AppState.players[j] + '" ' +
              'data-value="' + val.toFixed(4) + '" ' +
              'title="' + playerWithFlag(AppState.players[i]) + ' vs ' + playerWithFlag(AppState.players[j]) + ': ' + val.toFixed(4) + '">' +
              val.toFixed(2) + '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';

  container.innerHTML = html;

  // Eventos de clique nas celulas do heatmap
  var cells = container.querySelectorAll('.heatmap-cell');
  cells.forEach(function(cell) {
    cell.addEventListener('click', function() {
      var playerA = this.getAttribute('data-player-a');
      var playerB = this.getAttribute('data-player-b');
      // Selecionar nos dropdowns de calculo
      document.getElementById('calc-player-a').value = playerA;
      document.getElementById('calc-player-b').value = playerB;
      updateCosineCalcPanel();
      // Scroll para o painel de calculo
      document.getElementById('cosine-calc-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/**
 * Constroi o heatmap frase a frase (80x80)
 */
function renderPhraseHeatmap() {
  var container = document.getElementById('heatmap-phrase-container');

  var vectors;
  if (AppState.currentMethod === 'tfidf') {
    vectors = AppState.tfidfVectors;
  } else {
    // Usar embeddings de cada frase
    var allEmbeddings = [];
    var data = AppState.embeddingsData;
    for (var i = 0; i < data.jogadores.length; i++) {
      for (var j = 0; j < data.jogadores[i].frases.length; j++) {
        allEmbeddings.push(data.jogadores[i].frases[j].embedding);
      }
    }
    vectors = allEmbeddings;
  }

  // Calcular a matriz
  var matrix = CosineUtils.buildSimilarityMatrix(vectors);

  // Construir tabela compacta
  var html = '<table class="phrase-matrix-table">';
  // Header
  html += '<tr><th></th>';
  for (var i = 0; i < AppState.dataset.length; i++) {
    var shortLabel = playerShortName(AppState.dataset[i].jogador) + (i % 8 + 1);
    html += '<th title="' + AppState.dataset[i].jogador + ': ' + AppState.dataset[i].frase.substring(0, 50) + '...">' + shortLabel + '</th>';
  }
  html += '</tr>';

  for (var i = 0; i < AppState.dataset.length; i++) {
    html += '<tr>';
    var shortLabel = playerShortName(AppState.dataset[i].jogador) + (i % 8 + 1);
    html += '<th class="row-header" title="' + AppState.dataset[i].frase.substring(0, 80) + '">' + shortLabel + '</th>';
    for (var j = 0; j < AppState.dataset.length; j++) {
      var val = matrix[i][j];
      var color = getHeatmapColor(val);
      var isDiag = i === j ? ' diagonal' : '';
      html += '<td class="heatmap-cell' + isDiag + '" style="background-color:' + color + ';" title="' +
              AppState.dataset[i].jogador + ' vs ' + AppState.dataset[j].jogador + ': ' + val.toFixed(4) + '"></td>';
    }
    html += '</tr>';
  }
  html += '</table>';

  container.innerHTML = html;
}

// ========== COMPARACAO DO USUARIO ==========

/**
 * Compara a frase do usuario com todos os jogadores
 */
async function compareUserPhrase() {
  var input = document.getElementById('user-input').value.trim();
  if (!input) return;

  var btn = document.getElementById('btn-compare');
  btn.disabled = true;
  btn.innerHTML = '\u{23F3} ' + I18n.t('btn_comparing');

  try {
    var results = [];

    if (AppState.currentMethod === 'tfidf') {
      // Vetorizar a frase do usuario com TF-IDF
      var userVector = TFIDFEngine.vectorize(input, AppState.tfidfIDF, AppState.tfidfVocabulary);

      // Calcular similaridade com cada frase do dataset
      for (var i = 0; i < AppState.dataset.length; i++) {
        var sim = CosineUtils.cosineSimilarity(userVector, AppState.tfidfVectors[i]);
        results.push({
          jogador: AppState.dataset[i].jogador,
          frase: AppState.dataset[i].frase,
          similaridade: sim,
          index: i
        });
      }
    } else {
      // Usar embeddings
      var userEmbedding;
      if (AppState.transformerReady) {
        userEmbedding = await EmbeddingsEngine.embedText(input);
      } else {
        // Fallback: usar TF-IDF se o transformer nao estiver pronto
        var userVector = TFIDFEngine.vectorize(input, AppState.tfidfIDF, AppState.tfidfVocabulary);
        for (var i = 0; i < AppState.dataset.length; i++) {
          var sim = CosineUtils.cosineSimilarity(userVector, AppState.tfidfVectors[i]);
          results.push({
            jogador: AppState.dataset[i].jogador,
            frase: AppState.dataset[i].frase,
            similaridade: sim,
            index: i
          });
        }
        renderRanking(results);
        return;
      }

      // Calcular similaridade com embeddings pre-calculados
      var data = AppState.embeddingsData;
      var idx = 0;
      for (var i = 0; i < data.jogadores.length; i++) {
        for (var j = 0; j < data.jogadores[i].frases.length; j++) {
          var emb = data.jogadores[i].frases[j].embedding;
          var sim = CosineUtils.cosineSimilarity(userEmbedding, emb);
          results.push({
            jogador: data.jogadores[i].nome,
            frase: data.jogadores[i].frases[j].texto,
            similaridade: sim,
            index: idx
          });
          idx++;
        }
      }
    }

    // Ordenar por similaridade (maior primeiro)
    results.sort(function(a, b) { return b.similaridade - a.similaridade; });

    // Agrupar por jogador (melhor frase de cada)
    var bestPerPlayer = {};
    var playerRanking = [];
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (!bestPerPlayer[r.jogador]) {
        bestPerPlayer[r.jogador] = r;
        playerRanking.push(r);
      }
    }

    AppState.lastComparison = {
      userPhrase: input,
      ranking: playerRanking,
      allResults: results
    };

    renderRanking(playerRanking);
    renderAngleVisualization(playerRanking[0]);

  } catch (error) {
    console.error('Erro na comparacao:', error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '\u{1F4CA} ' + I18n.t('btn_compare');
  }
}

/**
 * Renderiza o ranking de similaridade
 */
function renderRanking(playerRanking) {
  var container = document.getElementById('ranking-container');
  var html = '<div class="ranking-list">';

  var maxSim = playerRanking.length > 0 ? playerRanking[0].similaridade : 1;

  for (var i = 0; i < Math.min(playerRanking.length, 10); i++) {
    var r = playerRanking[i];
    var flag = PLAYER_FLAGS[r.jogador] || '';
    var barWidth = maxSim > 0 ? (r.similaridade / maxSim * 100) : 0;
    var scoreColor = getHeatmapColor(r.similaridade);

    html += '<div class="ranking-item fade-in" style="animation-delay: ' + (i * 0.05) + 's">';
    html += '<span class="ranking-position">' + (i + 1) + '</span>';
    html += '<div class="ranking-info">';
    html += '<div class="ranking-name">' + flag + ' ' + r.jogador + '</div>';
    html += '<div class="ranking-phrase" title="' + escapeHtml(r.frase) + '">"' + escapeHtml(r.frase) + '"</div>';
    html += '<div class="ranking-bar"><div class="ranking-bar-fill" style="width: ' + barWidth + '%; background: ' + scoreColor + ';"></div></div>';
    html += '</div>';
    html += '<span class="ranking-score" style="color: ' + scoreColor + ';">' + r.similaridade.toFixed(4) + '</span>';
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Escapa HTML para evitar XSS
 */
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== VISUALIZACAO DO ANGULO 2D ==========

/**
 * Desenha a visualizacao 2D do angulo entre vetores
 */
function renderAngleVisualization(topResult) {
  var canvas = document.getElementById('angle-canvas');
  var ctx = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;

  // Limpar
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);

  if (!topResult) {
    // Estado vazio
    ctx.fillStyle = '#808080';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(I18n.t('angle_empty'), w / 2, h / 2);
    return;
  }

  var similarity = topResult.similaridade;
  // Angulo em radianos
  var angle = Math.acos(Math.max(-1, Math.min(1, similarity)));

  var centerX = 60;
  var centerY = h - 50;
  var len = Math.min(w, h) - 100;

  // Vetor A (horizontal, sempre para cima-direita)
  var ax = centerX + len;
  var ay = centerY;

  // Vetor B (rotacionado pelo angulo)
  var bx = centerX + len * Math.cos(-angle);
  var by = centerY + len * Math.sin(-angle);

  // Desenhar arco do angulo
  ctx.beginPath();
  ctx.arc(centerX, centerY, 50, -angle, 0, false);
  ctx.strokeStyle = 'rgba(255, 179, 0, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Preenchimento do arco
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, 50, -angle, 0, false);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 179, 0, 0.1)';
  ctx.fill();

  // Vetor A (verde)
  drawArrow(ctx, centerX, centerY, ax, ay, '#66BB6A', 3);
  // Vetor B (dourado)
  drawArrow(ctx, centerX, centerY, bx, by, '#FFB300', 3);

  // Labels
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = '#66BB6A';
  ctx.textAlign = 'left';
  ctx.fillText(I18n.t('angle_your_phrase'), ax - 60, ay + 20);

  ctx.fillStyle = '#FFB300';
  ctx.fillText(topResult.jogador, bx + 5, by - 10);

  // Angulo em graus
  var angleDeg = (angle * 180 / Math.PI).toFixed(1);
  ctx.font = 'bold 14px JetBrains Mono, monospace';
  ctx.fillStyle = '#FFD54F';
  ctx.textAlign = 'center';
  var labelX = centerX + 70 * Math.cos(-angle / 2);
  var labelY = centerY + 70 * Math.sin(-angle / 2);
  ctx.fillText(angleDeg + '\u00B0', labelX, labelY);

  // Similaridade
  ctx.font = 'bold 16px JetBrains Mono, monospace';
  ctx.fillStyle = '#f0f0f0';
  ctx.textAlign = 'right';
  ctx.fillText('cos(\u03B8) = ' + similarity.toFixed(4), w - 20, 30);

  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#808080';
  ctx.fillText('\u03B8 = ' + angleDeg + '\u00B0', w - 20, 50);
}

/**
 * Desenha uma seta no canvas
 */
function drawArrow(ctx, fromX, fromY, toX, toY, color, lineWidth) {
  var headLen = 12;
  var angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // Cabeca da seta
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// ========== PAINEL DE CALCULO DO COSSENO ==========

/**
 * Popula os dropdowns de jogadores para o calculo detalhado
 */
function populateCalcDropdowns() {
  var selectA = document.getElementById('calc-player-a');
  var selectB = document.getElementById('calc-player-b');

  // Limpar (manter o placeholder)
  selectA.innerHTML = '<option value="">' + I18n.t('calc_select_a') + '</option>';
  selectB.innerHTML = '<option value="">' + I18n.t('calc_select_b') + '</option>';

  for (var i = 0; i < AppState.players.length; i++) {
    var flag = PLAYER_FLAGS[AppState.players[i]] || '';
    var optionHTML = '<option value="' + AppState.players[i] + '">' + flag + ' ' + AppState.players[i] + '</option>';
    selectA.innerHTML += optionHTML;
    selectB.innerHTML += optionHTML;
  }
}

/**
 * Atualiza o painel de calculo detalhado
 */
function updateCosineCalcPanel() {
  var playerA = document.getElementById('calc-player-a').value;
  var playerB = document.getElementById('calc-player-b').value;

  var emptyState = document.getElementById('calc-empty-state');
  var stepsDiv = document.getElementById('calc-steps');

  if (!playerA || !playerB) {
    emptyState.style.display = 'flex';
    stepsDiv.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  stepsDiv.style.display = 'block';

  // Obter vetores medios
  var vectorA, vectorB;
  if (AppState.currentMethod === 'tfidf') {
    var averages = getAverageTFIDFPerPlayer();
    vectorA = averages[playerA];
    vectorB = averages[playerB];
  } else {
    var averages = getAverageEmbeddingPerPlayer();
    vectorA = averages[playerA];
    vectorB = averages[playerB];
  }

  if (!vectorA || !vectorB) return;

  // Calcular detalhes
  var details = CosineUtils.cosineDetailedCalc(vectorA, vectorB);

  // Passo 1: Vetores (mostrar primeiros 10 valores)
  var maxShow = 10;
  var dimLabel = AppState.currentMethod === 'tfidf' ?
    '(' + vectorA.length + ' ' + I18n.t('calc_dimensions') + ')' :
    '(384 ' + I18n.t('calc_dimensions') + ')';

  var vectorsHTML = '<strong>A</strong> (' + playerWithFlag(playerA) + ') ' + dimLabel + ':<br>';
  vectorsHTML += '[' + vectorA.slice(0, maxShow).map(function(v) { return v.toFixed(4); }).join(', ');
  if (vectorA.length > maxShow) vectorsHTML += ', ...';
  vectorsHTML += ']<br><br>';
  vectorsHTML += '<strong>B</strong> (' + playerWithFlag(playerB) + ') ' + dimLabel + ':<br>';
  vectorsHTML += '[' + vectorB.slice(0, maxShow).map(function(v) { return v.toFixed(4); }).join(', ');
  if (vectorB.length > maxShow) vectorsHTML += ', ...';
  vectorsHTML += ']';

  document.getElementById('calc-vectors-content').innerHTML = vectorsHTML;

  // Renderizar barras dos vetores
  renderVectorBars('calc-vector-a-bars', vectorA);
  renderVectorBars('calc-vector-b-bars', vectorB);
  document.getElementById('calc-vector-a-label').textContent = '(' + playerShortName(playerA) + ')';
  document.getElementById('calc-vector-b-label').textContent = '(' + playerShortName(playerB) + ')';

  // Passo 2: Produto escalar
  var dotHTML = 'A \u00B7 B = \u03A3(A\u1D62 \u00D7 B\u1D62) = <span class="highlight">' + details.dotProduct.toFixed(6) + '</span>';
  document.getElementById('calc-dot-content').innerHTML = dotHTML;

  // Passo 3: Normas
  var normsHTML = '||A|| = \u221A(\u03A3 A\u1D62\u00B2) = <span class="highlight">' + details.magnitudeA.toFixed(6) + '</span><br>';
  normsHTML += '||B|| = \u221A(\u03A3 B\u1D62\u00B2) = <span class="highlight">' + details.magnitudeB.toFixed(6) + '</span>';
  document.getElementById('calc-norms-content').innerHTML = normsHTML;

  // Passo 4: Resultado
  var resultHTML = 'cos(\u03B8) = ' + details.dotProduct.toFixed(6) + ' / (' + details.magnitudeA.toFixed(6) + ' \u00D7 ' + details.magnitudeB.toFixed(6) + ')<br>';
  resultHTML += 'cos(\u03B8) = ' + details.dotProduct.toFixed(6) + ' / ' + (details.magnitudeA * details.magnitudeB).toFixed(6) + '<br>';
  resultHTML += 'cos(\u03B8) = <span class="highlight">' + details.similarity.toFixed(6) + '</span>';
  document.getElementById('calc-result-content').innerHTML = resultHTML;

  // Resultado em destaque
  document.getElementById('calc-result-value').textContent = details.similarity.toFixed(6);
  document.getElementById('calc-angle-value').textContent = details.angleDegrees.toFixed(2) + '\u00B0';
}

/**
 * Renderiza barras de vetor (visualizacao das dimensoes)
 */
function renderVectorBars(containerId, vector) {
  var container = document.getElementById(containerId);
  if (!container) return;

  // Amostrar se o vetor for muito longo (max 80 barras)
  var maxBars = 80;
  var step = Math.max(1, Math.floor(vector.length / maxBars));
  var sampled = [];
  for (var i = 0; i < vector.length; i += step) {
    sampled.push(vector[i]);
  }

  var maxVal = Math.max.apply(null, sampled.map(function(v) { return Math.abs(v); }));
  if (maxVal === 0) maxVal = 1;

  var html = '';
  for (var i = 0; i < sampled.length; i++) {
    var h = Math.abs(sampled[i]) / maxVal * 50;
    var color = sampled[i] >= 0 ? 'var(--green-400)' : 'var(--gold-500)';
    html += '<div class="vector-bar" style="height: ' + Math.max(2, h) + 'px; background: ' + color + ';"></div>';
  }
  container.innerHTML = html;
}

// ========== TABELA DE FONTES ==========

/**
 * Renderiza a tabela de fontes/procedencia das frases
 */
function renderSourcesTable(filter) {
  var tbody = document.getElementById('sources-table-body');
  var rows = AppState.sources;
  if (filter && filter !== 'all') {
    rows = rows.filter(function(r) { return r.jogador === filter; });
  }

  var html = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var flag = PLAYER_FLAGS[r.jogador] || '';
    html += '<tr>';
    html += '<td>' + flag + ' ' + escapeHtml(r.jogador) + '</td>';
    html += '<td>' + escapeHtml(r.clube_atual || '') + '</td>';
    html += '<td style="max-width: 300px;">' + escapeHtml(r.frase) + '</td>';
    html += '<td>';
    if (r.link) {
      html += '<a href="' + escapeHtml(r.link) + '" target="_blank" rel="noopener">' + escapeHtml(r.fonte || 'Link') + '</a>';
    } else {
      html += escapeHtml(r.fonte || '');
    }
    html += '</td>';
    html += '<td>' + escapeHtml(r.data_aproximada || '') + '</td>';
    html += '<td style="max-width: 200px;">' + escapeHtml(r.contexto || '') + '</td>';
    html += '</tr>';
  }

  tbody.innerHTML = html;
}

/**
 * Popula o filtro de jogadores na tabela de fontes
 */
function populateSourcesFilter() {
  var select = document.getElementById('sources-filter');
  select.innerHTML = '<option value="all">' + I18n.t('sources_filter_all') + '</option>';
  for (var i = 0; i < AppState.players.length; i++) {
    var flag = PLAYER_FLAGS[AppState.players[i]] || '';
    select.innerHTML += '<option value="' + AppState.players[i] + '">' + flag + ' ' + AppState.players[i] + '</option>';
  }
}

// ========== INTERNACIONALIZACAO ==========

/**
 * Aplica traducoes a todos os elementos com data-i18n
 */
function applyTranslations() {
  var elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var translation = I18n.t(key);
    if (translation) {
      el.textContent = translation;
    }
  });

  // Placeholders
  var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    var translation = I18n.t(key);
    if (translation) {
      el.placeholder = translation;
    }
  });
}

// ========== EVENTOS E INICIALIZACAO ==========

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
  // Seletor de metodo (TF-IDF / Transformer)
  document.querySelectorAll('.method-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.method-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      AppState.currentMethod = this.getAttribute('data-method');
      document.getElementById('method-badge').innerHTML =
        '<span class="status-dot ready"></span> ' +
        (AppState.currentMethod === 'tfidf' ? 'TF-IDF' : 'Transformer');
      // Re-renderizar
      renderAverageHeatmap();
      if (AppState.currentGranularity === 'phrase') {
        renderPhraseHeatmap();
      }
      updateCosineCalcPanel();
    });
  });

  // Toggle de granularidade do heatmap
  document.querySelectorAll('.heatmap-toggle-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.heatmap-toggle-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      AppState.currentGranularity = this.getAttribute('data-granularity');

      if (AppState.currentGranularity === 'average') {
        document.getElementById('heatmap-average-panel').style.display = 'block';
        document.getElementById('heatmap-phrase-panel').style.display = 'none';
      } else {
        document.getElementById('heatmap-average-panel').style.display = 'none';
        document.getElementById('heatmap-phrase-panel').style.display = 'block';
        renderPhraseHeatmap();
      }
    });
  });

  // Seletor de idioma
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var lang = this.getAttribute('data-lang');
      I18n.setLanguage(lang);
      applyTranslations();
      // Re-popular dropdowns com traducoes
      populateCalcDropdowns();
      populateSourcesFilter();
    });
  });

  // Botao de comparar
  document.getElementById('btn-compare').addEventListener('click', function() {
    compareUserPhrase();
  });

  // Enter no textarea
  document.getElementById('user-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      compareUserPhrase();
    }
  });

  // Botao de limpar
  document.getElementById('btn-clear').addEventListener('click', function() {
    document.getElementById('user-input').value = '';
    document.getElementById('ranking-container').innerHTML =
      '<div class="empty-state">' +
      '<span class="icon">\u{1F4DD}</span>' +
      '<span class="message">' + I18n.t('ranking_empty') + '</span>' +
      '<span class="hint">' + I18n.t('ranking_hint') + '</span>' +
      '</div>';
    AppState.lastComparison = null;
    renderAngleVisualization(null);
  });

  // Dropdowns de calculo detalhado
  document.getElementById('calc-player-a').addEventListener('change', updateCosineCalcPanel);
  document.getElementById('calc-player-b').addEventListener('change', updateCosineCalcPanel);

  // Filtro de fontes
  document.getElementById('sources-filter').addEventListener('change', function() {
    renderSourcesTable(this.value);
  });

  // Navegacao suave
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      // Atualizar estado ativo dos nav links
      document.querySelectorAll('.nav-links a').forEach(function(l) { l.classList.remove('active'); });
      this.classList.add('active');
    });
  });
}

/**
 * Carrega o modelo transformer em segundo plano
 */
async function loadTransformerInBackground() {
  var statusBar = document.getElementById('transformer-status-bar');
  var dot = document.getElementById('transformer-loading-dot');
  var methodDot = document.getElementById('transformer-method-dot');
  var methodLabel = document.getElementById('transformer-method-label');
  var statusText = document.getElementById('transformer-status-text');

  statusBar.style.display = 'flex';
  dot.style.display = 'inline-block';

  try {
    statusText.textContent = I18n.t('transformer_loading');
    await EmbeddingsEngine.loadTransformerModel();

    AppState.transformerReady = true;
    statusBar.className = 'notification success';
    statusText.textContent = I18n.t('transformer_ready');
    dot.style.display = 'none';

    methodDot.className = 'status-dot ready';
    methodLabel.textContent = I18n.t('status_ready');
    document.getElementById('transformer-method-badge').className = 'status-badge ready';

    // Ocultar a notificacao apos 3 segundos
    setTimeout(function() {
      statusBar.style.display = 'none';
    }, 3000);

  } catch (error) {
    console.error('Erro ao carregar modelo transformer:', error);
    statusBar.className = 'notification warning';
    statusText.textContent = I18n.t('transformer_error') + ': ' + error.message;

    methodDot.className = 'status-dot error';
    methodLabel.textContent = I18n.t('status_error');
    document.getElementById('transformer-method-badge').className = 'status-badge error';
  }
}

/**
 * Inicializacao principal
 */
async function init() {
  console.log('Inicializando Similaridade do Cosseno...');

  // Configurar idioma padrao
  I18n.setLanguage('pt');
  applyTranslations();

  // Carregar dados
  var loaded = await loadAllData();
  if (!loaded) {
    console.error('Falha ao carregar dados. Verifique os arquivos CSV e JSON.');
    return;
  }

  // Inicializar TF-IDF
  initTFIDF();

  // Popular dropdowns
  populateCalcDropdowns();
  populateSourcesFilter();

  // Renderizar heatmap inicial (TF-IDF, media por jogador)
  renderAverageHeatmap();

  // Renderizar tabela de fontes
  renderSourcesTable('all');

  // Renderizar canvas de angulo (vazio)
  renderAngleVisualization(null);

  // Configurar eventos
  setupEventListeners();

  // Carregar transformer em segundo plano
  loadTransformerInBackground();

  console.log('Aplicacao inicializada com sucesso!');
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
