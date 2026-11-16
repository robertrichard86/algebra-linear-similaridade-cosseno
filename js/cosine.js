'use strict';

/**
 * Modulo de utilidades matematicas para calculo de similaridade do cosseno.
 * Projeto academico de Algebra Linear aplicado a citacoes de jogadores de futebol.
 * 
 * Todas as operacoes tratam casos de borda: vetores vazios, nulos, divisoes por zero
 * e diferencas de dimensionalidade.
 */

const CosineUtils = (function () {
  /**
   * Calcula o produto escalar (dot product) entre dois vetores numericos.
   * Formula: A . B = soma(a_i * b_i) para i de 0 a n-1.
   *
   * @param {Array<number>} a - Primeiro vetor
   * @param {Array<number>} b - Segundo vetor
   * @returns {number} Valor do produto escalar, ou 0 se os vetores forem invalidos
   */
  function dotProduct(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return 0;
    }

    const len = Math.min(a.length, b.length);
    if (len === 0) {
      return 0;
    }

    let sum = 0;
    for (let i = 0; i < len; i++) {
      const valA = Number(a[i]) || 0;
      const valB = Number(b[i]) || 0;
      sum += valA * valB;
    }

    return isNaN(sum) ? 0 : sum;
  }

  /**
   * Calcula a norma L2 (magnitude ou comprimento euclidiano) de um vetor.
   * Formula: ||V|| = sqrt(soma(v_i^2)).
   *
   * @param {Array<number>} v - Vetor numerico
   * @returns {number} Magnitude euclidiana do vetor, ou 0 se for invalido
   */
  function magnitude(v) {
    if (!Array.isArray(v) || v.length === 0) {
      return 0;
    }

    let sumSq = 0;
    for (let i = 0; i < v.length; i++) {
      const val = Number(v[i]) || 0;
      sumSq += val * val;
    }

    const mag = Math.sqrt(sumSq);
    return isNaN(mag) ? 0 : mag;
  }

  /**
   * Calcula a similaridade do cosseno entre dois vetores.
   * Formula: cos(theta) = (A . B) / (||A|| * ||B||).
   *
   * O resultado e limitado ao intervalo [-1, 1] para evitar imprecisoes de ponto flutuante.
   * Em espacos de texto (vetores positivos como TF-IDF), o resultado varia tipicamente de 0 a 1.
   *
   * @param {Array<number>} a - Primeiro vetor
   * @param {Array<number>} b - Segundo vetor
   * @returns {number} Similaridade do cosseno no intervalo [-1, 1], ou 0 em casos degenerados
   */
  function cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
      return 0;
    }

    const magA = magnitude(a);
    const magB = magnitude(b);

    // Evita divisao por zero se algum vetor for nulo (magnitude zero)
    if (magA === 0 || magB === 0 || isNaN(magA) || isNaN(magB)) {
      return 0;
    }

    const dot = dotProduct(a, b);
    let similarity = dot / (magA * magB);

    if (isNaN(similarity)) {
      return 0;
    }

    // Trunca dentro do intervalo teorico [-1, 1]
    if (similarity > 1) {
      similarity = 1;
    } else if (similarity < -1) {
      similarity = -1;
    }

    return similarity;
  }

  /**
   * Retorna um objeto detalhado com todos os passos intermediarios do calculo.
   * Ideal para exibicao didatica e visualizacao passo a passo na interface do usuario.
   *
   * @param {Array<number>} a - Primeiro vetor
   * @param {Array<number>} b - Segundo vetor
   * @returns {Object} Objeto com vetores, produto escalar, magnitudes, similaridade e angulo
   */
  function cosineDetailedCalc(a, b) {
    const validA = Array.isArray(a) ? a : [];
    const validB = Array.isArray(b) ? b : [];
    const len = Math.min(validA.length, validB.length);

    const dot = dotProduct(validA, validB);
    const magA = magnitude(validA);
    const magB = magnitude(validB);
    const sim = cosineSimilarity(validA, validB);

    // Calculo do angulo geometrico theta: arccos(similaridade)
    let angleRad = 0;
    let angleDeg = 0;
    if (magA > 0 && magB > 0) {
      angleRad = Math.acos(sim);
      angleDeg = angleRad * (180 / Math.PI);
    }

    // Coleta amostra de multiplicacoes par a par para fins didaticos
    const productPairs = [];
    const maxPreview = Math.min(len, 10);
    for (let i = 0; i < maxPreview; i++) {
      const valA = Number(validA[i]) || 0;
      const valB = Number(validB[i]) || 0;
      productPairs.push({
        index: i,
        valA: valA,
        valB: valB,
        product: valA * valB
      });
    }

    return {
      vectorA: validA,
      vectorB: validB,
      dimensions: len,
      dotProduct: dot,
      magnitudeA: magA,
      magnitudeB: magB,
      similarity: sim,
      angleRadians: isNaN(angleRad) ? 0 : angleRad,
      angleDegrees: isNaN(angleDeg) ? 0 : angleDeg,
      formula: 'cos(\u03B8) = (A \u00B7 B) / (||A|| * ||B||)',
      productPairsSample: productPairs,
      steps: {
        dotProductText: `A \u00B7 B = ${dot.toFixed(4)}`,
        magnitudeAText: `||A|| = ${magA.toFixed(4)}`,
        magnitudeBText: `||B|| = ${magB.toFixed(4)}`,
        denominatorText: `||A|| * ||B|| = ${(magA * magB).toFixed(4)}`,
        divisionText: `${dot.toFixed(4)} / ${(magA * magB).toFixed(4)} = ${sim.toFixed(4)}`,
        angleText: `\u03B8 = ${angleDeg.toFixed(2)}\u00B0 (${angleRad.toFixed(4)} rad)`
      }
    };
  }

  /**
   * Constroi uma matriz 2D de similaridade do cosseno para um conjunto de vetores.
   * Utiliza a propriedade de simetria: Sim(i, j) = Sim(j, i).
   *
   * @param {Array<Array<number>>} vectors - Lista de vetores numericos
   * @returns {Array<Array<number>>} Matriz quadrada de similaridades
   */
  function buildSimilarityMatrix(vectors) {
    if (!Array.isArray(vectors) || vectors.length === 0) {
      return [];
    }

    const n = vectors.length;
    const matrix = Array.from({ length: n }, () => new Array(n).fill(0));

    // Pre-calcula as magnitudes para otimizacao de desempenho
    const magnitudes = vectors.map(v => magnitude(v));

    for (let i = 0; i < n; i++) {
      // Elemento da diagonal principal
      matrix[i][i] = magnitudes[i] > 0 ? 1.0 : 0.0;

      for (let j = i + 1; j < n; j++) {
        const magI = magnitudes[i];
        const magJ = magnitudes[j];

        let sim = 0;
        if (magI > 0 && magJ > 0) {
          const dot = dotProduct(vectors[i], vectors[j]);
          sim = dot / (magI * magJ);

          if (isNaN(sim)) {
            sim = 0;
          } else if (sim > 1) {
            sim = 1;
          } else if (sim < -1) {
            sim = -1;
          }
        }

        matrix[i][j] = sim;
        matrix[j][i] = sim; // Matriz simetrica
      }
    }

    return matrix;
  }

  /**
   * Normaliza um vetor para norma unitaria (L2 = 1).
   *
   * @param {Array<number>} v - Vetor a ser normalizado
   * @returns {Array<number>} Vetor unitario
   */
  function normalize(v) {
    if (!Array.isArray(v) || v.length === 0) {
      return [];
    }
    const mag = magnitude(v);
    if (mag === 0) {
      return v.map(() => 0);
    }
    return v.map(val => (Number(val) || 0) / mag);
  }

  return {
    dotProduct: dotProduct,
    magnitude: magnitude,
    cosineSimilarity: cosineSimilarity,
    cosineDetailedCalc: cosineDetailedCalc,
    buildSimilarityMatrix: buildSimilarityMatrix,
    normalize: normalize
  };
})();

// Exportacao global para compatibilidade com navegadores e ambientes sem empacotador
if (typeof window !== 'undefined') {
  window.CosineUtils = CosineUtils;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosineUtils;
}
