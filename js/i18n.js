'use strict';

/**
 * Modulo de internacionalizacao (i18n) para suporte multilingue.
 * Idiomas suportados: Portugues do Brasil (pt) e Ingles (en).
 * Idioma padrao: pt.
 *
 * Contem todas as traducoes da interface: titulos, controles, comparacao,
 * detalhamento matematico, explicacoes teoricas e mensagens de erro.
 */

const I18n = (function () {
  let currentLanguage = 'pt';
  const listeners = [];

  const translations = {
    pt: {
      // Chaves diretas para elementos do index.html e app.js
      hero_badge: 'Algebra Linear',
      hero_title_1: 'Similaridade do ',
      hero_title_2: 'Cosseno',
      hero_subtitle: 'Comparando declaracoes de jogadores de futebol usando vetorizacao de texto: TF-IDF e Transformer Embeddings',
      hero_student: 'Aluno: Robert Richard',
      hero_professor: 'Prof. Alexandre Garcia',
      hero_institution: 'Fatec Baixada Santista',
      hero_course: 'Ciencia de Dados',

      nav_heatmap: 'Heatmap',
      nav_comparison: 'Comparacao',
      nav_calculation: 'Calculo',
      nav_sources: 'Fontes',

      transformer_loading: 'Carregando modelo transformer no navegador...',
      transformer_ready: 'Modelo transformer carregado e pronto para uso local!',
      transformer_error: 'Erro ao carregar modelo transformer',

      heatmap_title: 'Matriz de Similaridade',
      heatmap_average: 'Media por jogador',
      heatmap_phrase: 'Frase a frase',
      heatmap_description: 'Cada celula mostra a similaridade do cosseno (de 0 a 1) entre dois jogadores. Valores mais altos (cores quentes) indicam que os jogadores falam de forma mais parecida. Passe o mouse sobre uma celula para ver detalhes.',
      loading_data: 'Carregando dados...',
      loading_matrix: 'Gerando matriz frase a frase...',

      comparison_title: 'Compare sua frase',
      comparison_description: 'Digite uma frase livre e descubra qual jogador fala de forma mais parecida com voce. O sistema calcula a similaridade do cosseno entre sua frase e todas as frases do dataset.',
      input_placeholder: 'Digite sua frase aqui... (ex: Quero ganhar a Liga dos Campeoes)',
      btn_compare: 'Comparar',
      btn_comparing: 'Comparando...',
      btn_clear: 'Limpar',

      ranking_title: 'Ranking de similaridade',
      ranking_empty: 'Digite uma frase para ver o ranking',
      ranking_hint: 'Os 10 jogadores serao ranqueados por similaridade com a sua frase',

      angle_title: 'Visualizacao do angulo',
      angle_empty: 'Digite uma frase para visualizar o angulo',
      angle_your_phrase: 'Sua frase',
      angle_explanation: 'O angulo entre os vetores ilustra a similaridade: quanto menor o angulo, mais similares os textos.',

      calc_section_title: 'Calculo do Cosseno: Passo a Passo',
      calc_section_description: 'Veja como a similaridade do cosseno e calculada. Selecione dois jogadores (ou use sua frase acima) para visualizar cada etapa: os vetores, o produto escalar, as normas e o resultado final.',
      calc_panel_title: 'Detalhamento do calculo',
      calc_select_a: 'Jogador A',
      calc_select_b: 'Jogador B',
      calc_formula_desc: 'Similaridade do cosseno: produto escalar dos vetores dividido pelo produto de suas normas',
      calc_empty: 'Selecione dois jogadores acima para visualizar o calculo',
      calc_step1_title: 'Passo 1: Vetores',
      calc_vector_a: 'Vetor A',
      calc_vector_b: 'Vetor B',
      calc_dimensions: 'dimensoes',
      calc_step2_title: 'Passo 2: Produto Escalar (A . B)',
      calc_step3_title: 'Passo 3: Normas (||A|| e ||B||)',
      calc_step4_title: 'Passo 4: Resultado Final',
      calc_result_label: 'Similaridade do cosseno',
      calc_angle_label: 'Angulo:',

      sources_title: 'Sobre as Frases',
      sources_description: 'Todas as frases usadas neste trabalho sao declaracoes reais de jogadores de futebol, coletadas de fontes jornalisticas. A tabela abaixo mostra a procedencia de cada frase.',
      sources_note_translations: 'Nota: a maioria dos jogadores nao fala portugues nativamente. As frases sao traducoes jornalisticas para o portugues brasileiro.',
      sources_note_rodri: 'Nota sobre Rodri: aparece com clube atual como FC Barcelona (pos-transferencia de agosto/2026), mas todas as suas frases foram ditas quando ainda jogava no Manchester City.',
      sources_filter_all: 'Todos os jogadores',
      sources_col_player: 'Jogador',
      sources_col_club: 'Clube',
      sources_col_phrase: 'Frase',
      sources_col_source: 'Fonte',
      sources_col_date: 'Data',
      sources_col_context: 'Contexto',

      methodology_title: 'Metodologia',
      status_local: 'Local',
      status_ready: 'Pronto',
      status_loading: 'Carregando...',
      status_error: 'Erro',
      methodology_tfidf_desc: 'O TF-IDF (Term Frequency, Inverse Document Frequency) e um metodo classico de vetorizacao de texto. Cada frase e transformada em um vetor esparso, onde cada dimensao corresponde a uma palavra do vocabulario. O peso de cada palavra e calculado pela frequencia do termo no documento multiplicada pelo inverso da frequencia do documento no corpus. A implementacao e feita inteiramente em JavaScript, sem dependencias externas.',
      methodology_transformer_desc: 'Os embeddings sao gerados pelo modelo paraphrase-multilingual-MiniLM-L12-v2, um transformer multilingual treinado para capturar similaridade semantica. Os embeddings do dataset foram pre-calculados e salvos em JSON. Para frases do usuario, o modelo roda diretamente no navegador via Transformers.js. Cada frase e representada por um vetor denso de 384 dimensoes, que captura o significado semantico do texto.',

      footer_project: 'Trabalho de Algebra Linear',
      footer_student: 'Aluno: Robert Richard',
      footer_professor: 'Professor: Alexandre Garcia',
      footer_course_full: 'Ciencia de Dados, Fatec Baixada Santista (Rubens Lara)',
      footer_github: 'GitHub',
      footer_top: 'Voltar ao topo'
    },
    en: {
      hero_badge: 'Linear Algebra',
      hero_title_1: 'Cosine ',
      hero_title_2: 'Similarity',
      hero_subtitle: 'Comparing football legend statements using text vectorization: TF-IDF and Transformer Embeddings',
      hero_student: 'Student: Robert Richard',
      hero_professor: 'Prof. Alexandre Garcia',
      hero_institution: 'Fatec Baixada Santista',
      hero_course: 'Data Science',

      nav_heatmap: 'Heatmap',
      nav_comparison: 'Comparison',
      nav_calculation: 'Calculation',
      nav_sources: 'Sources',

      transformer_loading: 'Loading transformer model in browser...',
      transformer_ready: 'Transformer model loaded and ready for local use!',
      transformer_error: 'Error loading transformer model',

      heatmap_title: 'Similarity Matrix',
      heatmap_average: 'Average per player',
      heatmap_phrase: 'Phrase by phrase',
      heatmap_description: 'Each cell displays the cosine similarity (from 0 to 1) between two players. Higher values (warmer colors) indicate more similar speech styles. Hover over any cell to see details.',
      loading_data: 'Loading data...',
      loading_matrix: 'Generating phrase matrix...',

      comparison_title: 'Compare your phrase',
      comparison_description: 'Type any phrase and discover which football legend speaks most similarly to you. The system calculates cosine similarity between your text and all phrases in the dataset.',
      input_placeholder: 'Type your phrase here... (e.g. I want to win the Champions League)',
      btn_compare: 'Compare',
      btn_comparing: 'Comparing...',
      btn_clear: 'Clear',

      ranking_title: 'Similarity Ranking',
      ranking_empty: 'Type a phrase to view ranking',
      ranking_hint: 'All 10 players will be ranked by similarity with your phrase',

      angle_title: 'Angle Visualization',
      angle_empty: 'Enter a phrase to visualize angle',
      angle_your_phrase: 'Your phrase',
      angle_explanation: 'The angle between vectors illustrates similarity: the smaller the angle, the more similar the texts.',

      calc_section_title: 'Cosine Calculation: Step by Step',
      calc_section_description: 'See how cosine similarity is computed. Select two players to inspect each stage: vectors, dot product, norms, and the final result.',
      calc_panel_title: 'Calculation breakdown',
      calc_select_a: 'Player A',
      calc_select_b: 'Player B',
      calc_formula_desc: 'Cosine similarity: dot product of vectors divided by the product of their norms',
      calc_empty: 'Select two players above to visualize the calculation',
      calc_step1_title: 'Step 1: Vectors',
      calc_vector_a: 'Vector A',
      calc_vector_b: 'Vector B',
      calc_dimensions: 'dimensions',
      calc_step2_title: 'Step 2: Dot Product (A . B)',
      calc_step3_title: 'Step 3: Norms (||A|| and ||B||)',
      calc_step4_title: 'Step 4: Final Result',
      calc_result_label: 'Cosine similarity',
      calc_angle_label: 'Angle:',

      sources_title: 'About the Quotes',
      sources_description: 'All phrases used in this project are genuine statements made by football players, collected from journalistic sources. The table below shows the provenance of each quote.',
      sources_note_translations: 'Note: most players do not speak Portuguese natively. Statements are journalistic translations into Brazilian Portuguese.',
      sources_note_rodri: 'Note on Rodri: listed with current club as FC Barcelona (post-transfer of August 2026), but all quotes were spoken during his time at Manchester City.',
      sources_filter_all: 'All players',
      sources_col_player: 'Player',
      sources_col_club: 'Club',
      sources_col_phrase: 'Quote',
      sources_col_source: 'Source',
      sources_col_date: 'Date',
      sources_col_context: 'Context',

      methodology_title: 'Methodology',
      status_local: 'Local',
      status_ready: 'Ready',
      status_loading: 'Loading...',
      status_error: 'Error',
      methodology_tfidf_desc: 'TF-IDF (Term Frequency, Inverse Document Frequency) is a classic text vectorization method. Each phrase is converted into a sparse vector where each dimension corresponds to a vocabulary word. Term weight is computed by term frequency in the document multiplied by inverse document frequency across the corpus. Implemented purely in JavaScript without external dependencies.',
      methodology_transformer_desc: 'Embeddings are generated by the paraphrase-multilingual-MiniLM-L12-v2 model, a multilingual transformer trained to capture semantic similarity. Dataset embeddings were pre-computed and stored in JSON. For user-entered phrases, the model runs directly client-side via Transformers.js. Each sentence is represented as a dense 384-dimensional vector capturing semantic meaning.',

      footer_project: 'Linear Algebra Academic Project',
      footer_student: 'Student: Robert Richard',
      footer_professor: 'Professor: Alexandre Garcia',
      footer_course_full: 'Data Science, Fatec Baixada Santista (Rubens Lara)',
      footer_github: 'GitHub',
      footer_top: 'Back to top'
    }
  };

  /**
   * Obtem a traducao correspondente a chave fornecida.
   * Suporta notacao direta ou de pontos para caminhos aninhados.
   * Permite interpolacao de parametros (ex: {playerA: 'Pele'}).
   *
   * @param {string} key - Caminho da chave de traducao
   * @param {Object} [params] - Valores para interpolacao
   * @returns {string} Texto traduzido ou a propria chave se nao encontrada
   */
  function t(key, params) {
    if (typeof key !== 'string' || key.trim().length === 0) {
      return '';
    }

    const langData = translations[currentLanguage] || translations.pt;
    const fallbackData = translations.pt;

    let value = null;
    let fallbackValue = null;

    if (key in langData) {
      value = langData[key];
    }
    if (key in fallbackData) {
      fallbackValue = fallbackData[key];
    }

    if (value === null && key.includes('.')) {
      const parts = key.split('.');
      let cur = langData;
      let fb = fallbackData;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        cur = (cur && typeof cur === 'object' && p in cur) ? cur[p] : null;
        fb = (fb && typeof fb === 'object' && p in fb) ? fb[p] : null;
      }
      value = cur;
      fallbackValue = fb;
    }

    let result = (typeof value === 'string') ? value : (typeof fallbackValue === 'string' ? fallbackValue : key);

    // Substituicao de variaveis no formato {nomeVariavel}
    if (params && typeof params === 'object') {
      for (const p in params) {
        if (Object.prototype.hasOwnProperty.call(params, p)) {
          const regex = new RegExp(`\\{${p}\\}`, 'g');
          result = result.replace(regex, String(params[p]));
        }
      }
    }

    return result;
  }

  /**
   * Altera o idioma ativo do sistema e notifica observadores.
   *
   * @param {string} lang - Codigo do idioma ('pt' ou 'en')
   * @returns {boolean} Verdadeiro se o idioma foi alterado
   */
  function setLanguage(lang) {
    const targetLang = (lang === 'en') ? 'en' : 'pt';
    if (targetLang === currentLanguage) {
      return false;
    }

    currentLanguage = targetLang;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('cosine_preferred_lang', currentLanguage);
      }
    } catch (e) {
      // Ignora falhas de acesso ao storage local
    }

    for (let i = 0; i < listeners.length; i++) {
      try {
        listeners[i](currentLanguage);
      } catch (err) {
        console.error('Erro em ouvinte de traducao:', err);
      }
    }

    if (typeof document !== 'undefined') {
      translateDOM();
    }

    return true;
  }

  /**
   * Retorna o codigo do idioma ativo no momento.
   *
   * @returns {string} Codigo do idioma ('pt' ou 'en')
   */
  function getCurrentLanguage() {
    return currentLanguage;
  }

  /**
   * Registra uma funcao de retorno chamada quando o idioma e modificado.
   *
   * @param {Function} callback - Funcao recebedora do novo idioma
   */
  function onLanguageChange(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
    }
  }

  /**
   * Varre o documento HTML e traduz todos os elementos com atributos data-i18n.
   *
   * @param {HTMLElement} [rootElement] - Elemento raiz para traducao
   */
  function translateDOM(rootElement) {
    if (typeof document === 'undefined') {
      return;
    }

    const container = rootElement || document;

    const elements = container.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    const placeholders = container.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', t(key));
      }
    });

    const titles = container.querySelectorAll('[data-i18n-title]');
    titles.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', t(key));
      }
    });

    if (document.documentElement) {
      document.documentElement.setAttribute('lang', currentLanguage === 'pt' ? 'pt-BR' : 'en');
    }
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('cosine_preferred_lang');
      if (saved === 'en' || saved === 'pt') {
        currentLanguage = saved;
      }
    }
  } catch (e) {
    // Mantem o idioma padrao 'pt'
  }

  return {
    t: t,
    setLanguage: setLanguage,
    getCurrentLanguage: getCurrentLanguage,
    onLanguageChange: onLanguageChange,
    translateDOM: translateDOM,
    translations: translations
  };
})();

if (typeof window !== 'undefined') {
  window.I18n = I18n;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
