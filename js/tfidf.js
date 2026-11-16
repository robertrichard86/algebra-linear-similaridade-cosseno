'use strict';

/**
 * Modulo de processamento de texto e extracao de caracteristicas por TF-IDF.
 * Implementacao pura em JavaScript, sem dependencias externas.
 * 
 * TF (Term Frequency): frequencia do termo no documento.
 * IDF (Inverse Document Frequency): raridade do termo no corpus.
 * TF-IDF = TF * IDF.
 */

const TFIDFEngine = (function () {
  // Estado interno para armazenar o vocabulario e IDF calculados no ultimo corpus
  let lastVocabulary = [];
  let lastIDF = {};

  // Lista padrao de stopwords em portugues para descarte opcional ou filtragem
  const PORTUGUESE_STOPWORDS = new Set([
    'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo', 'as', 'ate',
    'com', 'como', 'da', 'das', 'de', 'dela', 'delas', 'dele', 'deles', 'do', 'dos',
    'e', 'ela', 'elas', 'ele', 'eles', 'em', 'era', 'eram', 'essa', 'essas', 'esse',
    'esses', 'esta', 'estas', 'este', 'estes', 'eu', 'foi', 'fomos', 'foram', 'ha',
    'isso', 'isto', 'ja', 'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo', 'meu', 'meus',
    'minha', 'minhas', 'muito', 'na', 'nao', 'nas', 'nem', 'no', 'nos', 'nossa',
    'nossas', 'nosso', 'nossos', 'num', 'numa', 'o', 'os', 'ou', 'para', 'pela',
    'pelas', 'pelo', 'pelos', 'por', 'qual', 'quando', 'que', 'quem', 'se', 'seja',
    'sem', 'seu', 'seus', 'so', 'sua', 'suas', 'tambem', 'te', 'tem', 'tinha',
    'um', 'uma', 'umas', 'uns', 'voce', 'voces'
  ]);

  /**
   * Converte texto em tokens individuais:
   * - Converte para minusculas
   * - Preserva caracteres acentuados da lingua portuguesa (a-z, a-u, c)
   * - Remove pontuacao, simbolos e espacos extras
   *
   * @param {string} text - Texto de entrada
   * @param {boolean} [filterStopwords=false] - Se verdadeiro, remove palavras irrelevantes
   * @returns {Array<string>} Lista de palavras/tokens limpos
   */
  function tokenize(text, filterStopwords = false) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }

    // Normaliza para minusculas
    const lower = text.toLowerCase();

    // Expressao regular que captura palavras com acentuacao da lingua portuguesa
    // Letras de 'a' a 'z', acentuadas (à-ú), cedilha (ç) e numeros
    const matches = lower.match(/[a-zà-ú0-9ç]+/gi) || [];

    if (!filterStopwords) {
      return matches;
    }

    // Filtragem opcional de stopwords
    return matches.filter(token => token.length > 1 && !PORTUGUESE_STOPWORDS.has(token));
  }

  /**
   * Calcula a frequencia dos termos (TF) para um documento individual.
   * Formula: TF(t, d) = contagem(t, d) / total_de_termos(d).
   *
   * @param {Array<string>} tokens - Lista de tokens do documento
   * @returns {Object} Mapa de termos para frequencias relativas
   */
  function computeTF(tokens) {
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return {};
    }

    const counts = {};
    const totalTokens = tokens.length;

    for (let i = 0; i < totalTokens; i++) {
      const term = tokens[i];
      counts[term] = (counts[term] || 0) + 1;
    }

    const tf = {};
    for (const term in counts) {
      if (Object.prototype.hasOwnProperty.call(counts, term)) {
        tf[term] = counts[term] / totalTokens;
      }
    }

    return tf;
  }

  /**
   * Calcula o IDF (Inverse Document Frequency) para todos os termos do corpus.
   * Utiliza a formulacao com suavizacao (smooth IDF):
   * IDF(t) = ln((1 + N) / (1 + DF(t))) + 1
   * onde N e o numero total de documentos e DF(t) e a contagem de documentos contendo t.
   *
   * @param {Array<string|Array<string>>} documents - Lista de documentos (texto ou lista de tokens)
   * @returns {Object} Mapa de cada termo para seu respectivo valor de IDF
   */
  function computeIDF(documents) {
    if (!Array.isArray(documents) || documents.length === 0) {
      return {};
    }

    const N = documents.length;
    const documentFrequency = {};

    // Coleta a ocorrencia de cada termo por documento
    for (let i = 0; i < N; i++) {
      const doc = documents[i];
      const tokens = Array.isArray(doc) ? doc : tokenize(doc);
      const uniqueInDoc = new Set(tokens);

      uniqueInDoc.forEach(term => {
        documentFrequency[term] = (documentFrequency[term] || 0) + 1;
      });
    }

    // Calcula o IDF suavizado para cada termo unico
    const idf = {};
    for (const term in documentFrequency) {
      if (Object.prototype.hasOwnProperty.call(documentFrequency, term)) {
        const df = documentFrequency[term];
        idf[term] = Math.log((1 + N) / (1 + df)) + 1;
      }
    }

    lastIDF = idf;
    return idf;
  }

  /**
   * Retorna o vocabulario ordenado alfabeticamente.
   *
   * @returns {Array<string>} Lista ordenada de termos unicos
   */
  function getVocabulary() {
    return [...lastVocabulary];
  }

  /**
   * Transforma um novo texto em um vetor TF-IDF utilizando o vocabulario e IDF fornecidos.
   * Garante a mesma ordem e dimensao do vocabulario do corpus original.
   *
   * @param {string} text - Texto a ser vetorizado
   * @param {Object} [existingIDF] - Mapa de IDF pre-calculado (opcional, usa o ultimo se omitido)
   * @param {Array<string>} [vocabulary] - Vocabulario ordenado (opcional, usa o ultimo se omitido)
   * @returns {Array<number>} Vetor numerico representando o texto
   */
  function vectorize(text, existingIDF, vocabulary) {
    const vocab = Array.isArray(vocabulary) && vocabulary.length > 0 ? vocabulary : lastVocabulary;
    const idfDict = (existingIDF && typeof existingIDF === 'object') ? existingIDF : lastIDF;

    if (!Array.isArray(vocab) || vocab.length === 0) {
      return [];
    }

    const tokens = tokenize(text);
    const tf = computeTF(tokens);

    const vector = new Array(vocab.length).fill(0);

    for (let i = 0; i < vocab.length; i++) {
      const term = vocab[i];
      const termTF = tf[term] || 0;
      const termIDF = idfDict[term] || 0;
      vector[i] = termTF * termIDF;
    }

    return vector;
  }

  /**
   * Calcula os vetores TF-IDF para todos os documentos da colecao.
   * Cada vetor possui a mesma dimensao (tamanho do vocabulario unico do corpus).
   *
   * @param {Array<string|Array<string>>} documents - Conjunto de documentos
   * @returns {Array<Array<number>>} Lista de vetores TF-IDF alinhados por dimensao
   */
  function computeTFIDF(documents) {
    if (!Array.isArray(documents) || documents.length === 0) {
      lastVocabulary = [];
      lastIDF = {};
      const emptyArr = [];
      emptyArr.vectors = [];
      emptyArr.idf = {};
      emptyArr.vocabulary = [];
      return emptyArr;
    }

    // Converte documentos para listas de tokens
    const tokenizedDocs = documents.map(doc => {
      return Array.isArray(doc) ? doc : tokenize(doc);
    });

    // Calcula o IDF do corpus
    const idf = computeIDF(tokenizedDocs);

    // Constroi o vocabulario ordenado alfabeticamente a partir dos termos do IDF
    const vocabulary = Object.keys(idf).sort();
    lastVocabulary = vocabulary;
    lastIDF = idf;

    // Gera os vetores para cada documento
    const vectors = tokenizedDocs.map(tokens => {
      const tf = computeTF(tokens);
      const vector = new Array(vocabulary.length).fill(0);

      for (let i = 0; i < vocabulary.length; i++) {
        const term = vocabulary[i];
        const termTF = tf[term] || 0;
        const termIDF = idf[term] || 0;
        vector[i] = termTF * termIDF;
      }

      return vector;
    });

    // Anexa propriedades para suportar tanto retorno de array quanto objeto estruturado
    vectors.vectors = vectors;
    vectors.idf = idf;
    vectors.vocabulary = vocabulary;

    return vectors;
  }

  /**
   * Retorna os termos mais relevantes (maior peso TF-IDF) em um documento.
   *
   * @param {Array<number>} vector - Vetor TF-IDF
   * @param {Array<string>} [vocabulary] - Vocabulario correspondente
   * @param {number} [topN=5] - Quantidade de termos a retornar
   * @returns {Array<{term: string, score: number}>} Lista dos termos mais importantes
   */
  function getTopTerms(vector, vocabulary, topN = 5) {
    const vocab = Array.isArray(vocabulary) && vocabulary.length > 0 ? vocabulary : lastVocabulary;
    if (!Array.isArray(vector) || vector.length === 0 || vocab.length !== vector.length) {
      return [];
    }

    const items = [];
    for (let i = 0; i < vector.length; i++) {
      if (vector[i] > 0) {
        items.push({ term: vocab[i], score: vector[i] });
      }
    }

    items.sort((a, b) => b.score - a.score);
    return items.slice(0, topN);
  }

  return {
    tokenize: tokenize,
    computeTF: computeTF,
    computeIDF: computeIDF,
    computeTFIDF: computeTFIDF,
    getVocabulary: getVocabulary,
    vectorize: vectorize,
    getTopTerms: getTopTerms
  };
})();

// Exportacao global para navegadores e ambientes de teste
if (typeof window !== 'undefined') {
  window.TFIDFEngine = TFIDFEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TFIDFEngine;
}
