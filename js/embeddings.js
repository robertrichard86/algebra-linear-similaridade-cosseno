'use strict';

/**
 * Modulo de gerenciamento e geracao de embeddings semanticos.
 * Suporta o carregamento de embeddings pre-computados via JSON e geracao
 * em tempo real no navegador utilizando Transformers.js.
 *
 * Modelo utilizado: Xenova/paraphrase-multilingual-MiniLM-L12-v2 (384 dimensoes).
 */

const EmbeddingsEngine = (function () {
  // Estado interno do modulo
  let precomputedData = null;
  let playerEmbeddings = {};
  let averageEmbeddings = {};
  let pipelineInstance = null;
  let modelStatus = 'unloaded'; // 'unloaded', 'loading', 'ready', 'error'
  let modelError = null;

  const MODEL_NAME = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
  const CDN_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1';

  /**
   * Define os dados pre-computados diretamente a partir de um objeto carregado.
   * Suporta o formato oficial do projeto com { modelo, dimensoes, jogadores: [...] }
   * alem de listas e dicionarios diretos.
   *
   * @param {Object} data - Objeto JSON com dados dos jogadores e frases
   * @returns {Object} Mapa de embeddings indexado por jogador
   */
  function setPrecomputedData(data) {
    if (!data) return playerEmbeddings;
    precomputedData = data;
    playerEmbeddings = {};

    // Formato oficial do projeto: { jogadores: [ { nome, frases: [ { texto, embedding } ] } ] }
    if (data.jogadores && Array.isArray(data.jogadores)) {
      for (let i = 0; i < data.jogadores.length; i++) {
        const item = data.jogadores[i];
        const player = item.nome || item.jogador || 'Indefinido';
        playerEmbeddings[player] = (item.frases || []).map(f => ({
          quote: f.texto || f.frase || '',
          embedding: f.embedding || f.vector || [],
          metadata: f
        }));
      }
    } else if (Array.isArray(data)) {
      // Estrutura array direto: [{ player, quote, embedding }]
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const player = item.player || item.author || item.jogador || 'Indefinido';
        const quote = item.quote || item.text || item.frase || '';
        const embedding = item.embedding || item.vector || [];

        if (!playerEmbeddings[player]) {
          playerEmbeddings[player] = [];
        }
        playerEmbeddings[player].push({
          quote: quote,
          embedding: embedding,
          metadata: item
        });
      }
    } else if (typeof data === 'object') {
      const quoteList = data.quotes || data.citacoes || data.data || data.items;
      if (Array.isArray(quoteList)) {
        for (let i = 0; i < quoteList.length; i++) {
          const item = quoteList[i];
          const player = item.player || item.author || item.jogador || 'Indefinido';
          const quote = item.quote || item.text || item.frase || '';
          const embedding = item.embedding || item.vector || [];

          if (!playerEmbeddings[player]) {
            playerEmbeddings[player] = [];
          }
          playerEmbeddings[player].push({
            quote: quote,
            embedding: embedding,
            metadata: item
          });
        }
      } else {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const val = data[key];
            if (Array.isArray(val)) {
              playerEmbeddings[key] = val.map(item => {
                if (typeof item === 'object' && item !== null) {
                  return {
                    quote: item.quote || item.text || item.frase || '',
                    embedding: item.embedding || item.vector || [],
                    metadata: item
                  };
                }
                return { quote: String(item), embedding: [], metadata: null };
              });
            }
          }
        }
      }
    }

    averageEmbeddings = computeAverages(playerEmbeddings);
    return playerEmbeddings;
  }

  /**
   * Carrega o arquivo JSON contendo os embeddings pre-computados.
   * Suporta formatos flexiveis: lista de citacoes ou objeto indexado por jogador.
   *
   * @param {string} url - Caminho relativo ou absoluto do arquivo JSON
   * @returns {Promise<Object>} Dados carregados e indexados por jogador
   */
  async function loadPrecomputed(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Falha na requisicao: HTTP ${response.status} (${response.statusText})`);
      }

      const json = await response.json();
      return setPrecomputedData(json);
    } catch (err) {
      console.error('Erro ao carregar embeddings pre-computados:', err);
      throw err;
    }
  }

  /**
   * Funcao auxiliar para calcular o vetor medio (centroide) para cada jogador.
   * Aplica normalizacao L2 ao centroide resultante para preservar propriedades do espaco esferico.
   *
   * @param {Object} playerMap - Objeto com listas de citacoes por jogador
   * @returns {Object} Mapa de jogador para seu vetor medio
   */
  function computeAverages(playerMap) {
    const averages = {};

    for (const player in playerMap) {
      if (!Object.prototype.hasOwnProperty.call(playerMap, player)) {
        continue;
      }

      const list = playerMap[player];
      if (!Array.isArray(list) || list.length === 0) {
        continue;
      }

      // Filtra apenas itens com embeddings validos
      const validEmbeddings = list
        .map(item => item.embedding)
        .filter(emb => Array.isArray(emb) && emb.length > 0);

      if (validEmbeddings.length === 0) {
        continue;
      }

      const dim = validEmbeddings[0].length;
      const sumVector = new Array(dim).fill(0);

      for (let i = 0; i < validEmbeddings.length; i++) {
        const emb = validEmbeddings[i];
        for (let d = 0; d < dim; d++) {
          sumVector[d] += Number(emb[d]) || 0;
        }
      }

      const count = validEmbeddings.length;
      const meanVector = sumVector.map(val => val / count);

      // Normaliza o vetor medio (L2 norm = 1) para calculo adequado de similaridade
      let sumSq = 0;
      for (let d = 0; d < dim; d++) {
        sumSq += meanVector[d] * meanVector[d];
      }
      const mag = Math.sqrt(sumSq);

      averages[player] = mag > 0 ? meanVector.map(val => val / mag) : meanVector;
    }

    return averages;
  }

  /**
   * Retorna os embeddings carregados organizados por jogador.
   *
   * @returns {Object} Mapa no formato { [jogador]: [ { quote, embedding }, ... ] }
   */
  function getPlayerEmbeddings() {
    return playerEmbeddings;
  }

  /**
   * Retorna o embedding medio (centroide) de cada jogador.
   *
   * @returns {Object} Mapa no formato { [jogador]: Array<number> }
   */
  function getAverageEmbeddingPerPlayer() {
    if (Object.keys(averageEmbeddings).length === 0 && Object.keys(playerEmbeddings).length > 0) {
      averageEmbeddings = computeAverages(playerEmbeddings);
    }
    return averageEmbeddings;
  }

  /**
   * Carrega o modelo Transformers.js no navegador usando import dinamico via CDN.
   * Modelo: Xenova/paraphrase-multilingual-MiniLM-L12-v2.
   *
   * @param {Function} [progressCallback] - Callback opcional para relatorio de progresso de download
   * @returns {Promise<boolean>} Retorna true se o modelo for inicializado com sucesso
   */
  async function loadTransformerModel(progressCallback) {
    if (pipelineInstance && modelStatus === 'ready') {
      return true;
    }

    modelStatus = 'loading';
    modelError = null;

    try {
      // Importa a biblioteca do CDN oficial especificado
      const { pipeline } = await import(CDN_URL);

      // Cria a pipeline de extracao de caracteristicas (feature-extraction)
      pipelineInstance = await pipeline('feature-extraction', MODEL_NAME, {
        progress_callback: progressCallback
      });

      modelStatus = 'ready';
      return true;
    } catch (err) {
      modelStatus = 'error';
      modelError = err.message || 'Erro desconhecido ao carregar modelo';
      console.error('Falha ao carregar Transformers.js:', err);
      throw err;
    }
  }

  /**
   * Gera o embedding semantico para um novo texto fornecido pelo usuario.
   * Utiliza o modelo multilingual no navegador com pooling medio e normalizacao.
   *
   * @param {string} text - Texto a ser codificado
   * @returns {Promise<Array<number>>} Vetor de embedding com 384 dimensoes
   */
  async function embedText(text) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }

    if (!pipelineInstance || modelStatus !== 'ready') {
      await loadTransformerModel();
    }

    const output = await pipelineInstance(text, {
      pooling: 'mean',
      normalize: true
    });

    // Converte o Float32Array interno do Tensor em um Array nativo do JavaScript
    if (output && output.data) {
      return Array.from(output.data);
    }

    if (Array.isArray(output)) {
      return output;
    }

    return [];
  }

  /**
   * Verifica se o modelo transformer esta pronto para uso.
   *
   * @returns {boolean} Verdadeiro se o modelo foi carregado com sucesso
   */
  function isModelLoaded() {
    return modelStatus === 'ready' && pipelineInstance !== null;
  }

  /**
   * Retorna o status atual do carregamento do modelo.
   *
   * @returns {string} Status ('unloaded', 'loading', 'ready', 'error')
   */
  function getModelStatus() {
    return modelStatus;
  }

  /**
   * Retorna a ultima mensagem de erro registrada, caso exista.
   *
   * @returns {string|null} Mensagem de erro ou null
   */
  function getModelError() {
    return modelError;
  }

  return {
    setPrecomputedData: setPrecomputedData,
    loadPrecomputed: loadPrecomputed,
    getPlayerEmbeddings: getPlayerEmbeddings,
    getAverageEmbeddingPerPlayer: getAverageEmbeddingPerPlayer,
    loadTransformerModel: loadTransformerModel,
    embedText: embedText,
    isModelLoaded: isModelLoaded,
    getModelStatus: getModelStatus,
    getModelError: getModelError
  };
})();

// Exportacao global para o navegador
if (typeof window !== 'undefined') {
  window.EmbeddingsEngine = EmbeddingsEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmbeddingsEngine;
}
