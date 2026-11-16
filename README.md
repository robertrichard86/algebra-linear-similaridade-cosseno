# ⚽ Similaridade do Cosseno em Frases de Jogadores de Futebol

> **Aplicação prática de Álgebra Linear e Processamento de Linguagem Natural com TF-IDF e Transformer Embeddings**

[![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)](#)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-online-success?logo=github)](https://robertrichard86.github.io/algebra-linear-similaridade-cosseno/)
[![Licenca](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Disciplina](https://img.shields.io/badge/%C3%81lgebra%20Linear-Fatec%20BS-orange)](#)
[![Curso](https://img.shields.io/badge/Ci%C3%AAncia%20de%20Dados-Gradua%C3%A7%C3%A3o-yellow)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?logo=javascript&logoColor=black)](#)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](#)

---

## 📑 Sumario

- [Sobre o Projeto](#-sobre-o-projeto)
- [Fundamentacao Matematica](#-fundamentacao-matematica)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura de Vetorizacao](#-arquitetura-de-vetorizacao)
- [Dados e Metodologia](#-dados-e-metodologia)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar Localmente](#-como-executar-localmente)
- [Publicacao no GitHub Pages](#-publicacao-no-github-pages)
- [Creditos Academicos](#-creditos-academicos)
- [Licenca](#-licenca)

---

## 📌 Sobre o Projeto

Este projeto e uma aplicacao web academica desenvolvida para a disciplina de **Algebra Linear** do curso superior de **Ciencia de Dados** da **Fatec Baixada Santista (Rubens Lara)**, sob orientacao do **Prof. Alexandre Garcia**.

O objetivo central e demonstrar de forma visual, interativa e rigorosa como conceitos fundamentais de Algebra Linear (espacos vetoriais, produto escalar, norma euclidiana e angulo entre vetores) sao aplicados no mundo real em Processamento de Linguagem Natural (PLN) e Recuperacao de Informacao.

A aplicacao analisa **80 declaracoes reais** de **10 grandes estrelas do futebol internacional**, permitindo ao usuario:
- Explorar matrizes de correlacao entre atletas via mapas de calor (heatmaps);
- Digitar frases personalizadas e descobrir, via ranking de similaridade vetorial, qual jogador possui discurso mais semelhante;
- Acompanhar visualmente o angulo geometrico em duas dimensoes;
- Desconstruir o calculo algebrico passo a passo (vetores, normas, produto escalar e divisao);
- Consultar a procedencia e fontes jornalisticas de cada declaracao.

---

## 📐 Fundamentacao Matematica

### 1. Espacos Vetoriais e Representacao Textual

Em Processamento de Linguagem Natural, textos sao mapeados em vetores pertencentes a um espaco vetorial de dimensao finita $\mathbb{R}^n$:

$$ \mathbf{u} = (u_1, u_2, \dots, u_n) \in \mathbb{R}^n $$
$$ \mathbf{v} = (v_1, v_2, \dots, v_n) \in \mathbb{R}^n $$

Onde cada dimensao $i$ representa o peso de um termo do vocabulario (no modelo esparso TF-IDF) ou uma dimensao latente de significado (no modelo denso de Embeddings).

### 2. Produto Escalar (Dot Product)

O produto interno usual no espaco euclidiano $\mathbb{R}^n$ e definido como a soma dos produtos de suas componentes correspondentes:

$$ \mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^{n} u_i v_i = u_1 v_1 + u_2 v_2 + \dots + u_n v_n $$

Propriedades fundamentais:
- **Comutatividade:** $\mathbf{u} \cdot \mathbf{v} = \mathbf{v} \cdot \mathbf{u}$
- **Distributividade:** $\mathbf{u} \cdot (\mathbf{v} + \mathbf{w}) = \mathbf{u} \cdot \mathbf{v} + \mathbf{u} \cdot \mathbf{w}$
- **Positividade:** $\mathbf{u} \cdot \mathbf{u} \ge 0$, sendo zero se e somente se $\mathbf{u} = \mathbf{0}$

### 3. Norma Euclidiana (Norma $L_2$)

A magnitude ou comprimento euclidiano de um vetor $\mathbf{u}$ e calculada como a raiz quadrada do produto interno do vetor por si mesmo:

$$ \|\mathbf{u}\| = \sqrt{\mathbf{u} \cdot \mathbf{u}} = \sqrt{\sum_{i=1}^{n} u_i^2} $$

A norma quantifica a extensao do vetor independentemente de sua orientacao angular.

### 4. Similaridade do Cosseno

Pelo Teorema do Cosseno em espacos com produto interno, a relacao geometrica entre o produto escalar e as normas dos vetores e dada por:

$$ \mathbf{u} \cdot \mathbf{v} = \|\mathbf{u}\| \|\mathbf{v}\| \cos(\theta) $$

Isolando o termo $\cos(\theta)$, obtem-se a formula classica da **Similaridade do Cosseno**:

$$ \text{sim}(\mathbf{u}, \mathbf{v}) = \cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} = \frac{\sum_{i=1}^n u_i v_i}{\sqrt{\sum_{i=1}^n u_i^2} \sqrt{\sum_{i=1}^n v_i^2}} $$

### 5. Interpretacao Geometrica

A similaridade do cosseno mede a **orientacao direcional** dos vetores e nao a sua magnitude. Isso a torna ideal para comparacao de documentos de extensao variavel:

| Cosseno $\cos(\theta)$ | Angulo $\theta$ | Relacao Geometrica | Interpretacao Semantica |
|---|---|---|---|
| $+1.00$ | $0^\circ$ | Vetores colineares (mesma direcao) | Maxima convergencia tematica |
| $> 0.70$ | $< 45^\circ$ | Angulo agudo fechado | Alta similaridade discursiva |
| $0.30 \text{ a } 0.70$ | $45^\circ \text{ a } 72^\circ$ | Angulo agudo moderado | Afinidade parcial / temas compartilhados |
| $0.00$ | $90^\circ$ | Vetores ortogonais | Vocabularios disjuntos / sem correlacao |
| $< 0.00$ | $> 90^\circ$ | Angulo obtuso | Semantica divergente (possivel em embeddings densos) |
| $-1.00$ | $180^\circ$ | Vetores colineares opostos | Oposicao diametral |

Em espacos vetoriais positivos como o TF-IDF (onde todas as frequencias sao nao negativas), os vetores pertencem ao primeiro ortante, fazendo com que o cosseno varie estritamente no intervalo $[0, 1]$.

---

## 🚀 Funcionalidades Principais

- 🗺️ **Matriz de Similaridade Interativa (Heatmap):**
  - **Visao Agregada (10x10):** Media do espaco vetorial de cada jogador, revelando afinidades gerais de discurso;
  - **Visao Frase a Frase (80x80):** Matriz completa de alta resolucao comparando cada uma das 80 declaracoes individualmente;
  - Alternancia dinamica atraves de seletor sem recarregamento de pagina;
  - Destaque automatico da diagonal principal (auto-similaridade = 1.00);
  - Tooltips detalhados ao passar o cursor e clique direto para abrir os vetores no painel de calculo.

- 🔍 **Comparador em Tempo Real com Frase do Usuario:**
  - Campo de texto para insercao livre de frases;
  - Vetorizacao instantanea e ranqueamento dos 10 jogadores com barras proporcionais e indices numericos;
  - Identificacao da declaracao mais proxima com exibicao da citacao correspondente.

- 📐 **Visualizador Grafico 2D do Angulo $\theta$:**
  - Renderizacao em Canvas HTML5 desenhando os vetores diretores e o arco do angulo $\theta$;
  - Exibicao dinamica do angulo em graus e do valor exato de $\cos(\theta)$.

- 🧮 **Painel Didatico do Calculo Passo a Passo:**
  - Desdobramento da formula em quatro etapas didaticas;
  - **Passo 1:** Amostra dos vetores $\mathbf{A}$ e $\mathbf{B}$ com suas dimensoes e visualizacao em barras de componentes;
  - **Passo 2:** Calculo do produto escalar $\sum A_i B_i$;
  - **Passo 3:** Calculo das normas euclidianas $\|\mathbf{A}\|$ e $\|\mathbf{B}\|$;
  - **Passo 4:** Resolucao da divisao e obtencao do cosseno final com destaque tipografico.

- 📋 **Tabela de Procedencia e Fontes Jornalisticas:**
  - Listagem completa das 80 declaracoes com identificacao de clube, veiculo jornalistico, hiperlink para a materia original, data aproximada e contexto da declaracao;
  - Filtro interativo por atleta.

- 🌍 **Internacionalizacao Completa (i18n):**
  - Alternador de idioma instantaneo no cabecalho: Portugues (PT) e Ingles (EN);
  - Traducao de toda a interface, explicacoes teoricas, botoes, tabelas e tooltips.

- 🎨 **Design Tematico de Futebol:**
  - Paleta visual inspirada em campos de futebol: verde gramado (`#1B5E20`), dourado (`#FFB300`), cinza neutro e fundo escuro (`#121212`) de alto contraste;
  - Banderinhas em emoji ao lado de cada jogador facilitando a identificacao de nacionalidade.

---

## 🧠 Arquitetura de Vetorizacao

O projeto adota uma abordagem comparativa entre dois paradigmas de representacao vetorial:

```
[ Texto de Entrada ]
        │
        ├──► [ Motor TF-IDF (Puro JS) ]
        │         │
        │         └──► Vetores Esparsos (~300 dimensoes lexicais)
        │
        └──► [ Sentence Transformers ]
                  │
                  ├── Dataset: Pre-calculado em Python (MiniLM-L12-v2)
                  └── Input Usuario: Transformers.js no navegador
                            │
                            └──► Vetores Densos (384 dimensoes semanticas)
```

### 1. TF-IDF (Term Frequency, Inverse Document Frequency)
- **Implementacao:** 100% JavaScript puro (`js/tfidf.js`), sem bibliotecas externas;
- **Funcionamento:** Tokenizacao com preservacao de caracteres acentuados da lingua portuguesa, calculo de TF por documento e IDF com suavizacao logaritmica no corpus:
  $$ \text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}} $$
  $$ \text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1 $$
  $$ \text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t) $$
- **Caracteristica:** Modela frequencias lexicais diretas de forma leve e rapida.

### 2. Embeddings Neurais (Transformers)
- **Modelo:** `paraphrase-multilingual-MiniLM-L12-v2` (384 dimensoes);
- **Estrategia Hibrida:**
  - As 80 frases do dataset sao vetorizadas previamente via Python (`scripts/gerar_embeddings.py`) e armazenadas em formato JSON leve (`data/embeddings_precalculados.json`);
  - Para novas frases digitadas pelo usuario, a biblioteca `Transformers.js` carrega o modelo ONNX diretamente na memoria do navegador via WebAssembly, garantindo inferencia local sem necessidade de servidor back-end;
- **Caracteristica:** Captura sinonimos, relacoes contextuais e semelhancas conceituais mesmo sem correspondencia literal de palavras.

---

## 📊 Dados e Metodologia

O corpus do projeto e composto por declaracoes de 10 atletas de destaque mundial:

1. 🇫🇷 **Kylian Mbappé** (Franca)
2. 🇪🇸 **Lamine Yamal** (Espanha)
3. 🇳🇴 **Erling Haaland** (Noruega)
4. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Harry Kane** (Inglaterra)
5. 🇪🇸 **Rodri** (Espanha)
6. 🇧🇷 **Vinícius Júnior** (Brasil)
7. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Jude Bellingham** (Inglaterra)
8. 🇦🇷 **Lionel Messi** (Argentina)
9. 🇧🇷 **Neymar** (Brasil)
10. 🇵🇹 **Cristiano Ronaldo** (Portugal)

Cada atleta conta com 8 declaracoes extraidas de entrevistas coletivas, publicacoes em redes sociais oficiais e coberturas esportivas, totalizando 80 documentos.

### ⚠️ Notas Metodologicas Importantes

1. **Traducoes Jornalisticas:** A maioria dos jogadores incluidos nao e lusofona nativa (declaracoes concedidas originalmente em espanhol, ingles, frances ou noruegues). Os textos coletados sao traducoes publicadas por veiculos de imprensa esportiva brasileiros (ge.globo, UOL, ESPN, Lance!). Essas traducoes profissionais podem atenuar diferencas gramaticais de origem, homogeneizando parcialmente o estilo vocabular em portugues.
2. **Contexto do Atleta Rodri:** Na base de dados, o atleta consta com clube atual como FC Barcelona em funcao dos registros cadastrais fornecidos para o trabalho. Entretanto, todas as frases atribuidas a ele correspondem historicamente ao periodo em que atuava pelo Manchester City e pela Selecao Espanhola (temporadas 2023 a 2024).

---

## 📁 Estrutura do Projeto

```
algebra-linear-similaridade-cosseno/
├── .nojekyll                           # Desativa processamento Jekyll no GitHub Pages
├── LICENSE                             # Licenca MIT
├── README.md                           # Documentacao tecnica do projeto
├── index.html                          # Interface principal da aplicacao web
├── css/
│   └── styles.css                      # Design system tematico (responsivo, tema futebol)
├── js/
│   ├── app.js                          # Orquestracao principal e interface
│   ├── cosine.js                       # Funcoes algebricas puras (produto escalar, norma, cosseno)
│   ├── tfidf.js                        # Motor TF-IDF em JavaScript puro
│   ├── embeddings.js                   # Gerenciador de embeddings e Transformers.js
│   └── i18n.js                         # Modulo de internacionalizacao (PT / EN)
├── data/
│   ├── dataset_frases_jogadores.csv    # Corpus com 80 frases dos 10 jogadores
│   ├── fontes_frases_jogadores.csv     # Tabela de proveniencia e links jornalisticos
│   └── embeddings_precalculados.json   # Embeddings semanticos (384 dimensoes)
└── scripts/
    └── gerar_embeddings.py             # Script Python para pre-calculo dos vetores
```

---

## 💻 Como Executar Localmente

### Opcao 1: Execucao Direta (Navegador)

Por ser uma aplicacao puramente estatica baseada em HTML, CSS e JavaScript client-side:

1. Clone este repositorio:
```bash
git clone https://github.com/robertrichard86/algebra-linear-similaridade-cosseno.git
cd algebra-linear-similaridade-cosseno
```

2. Inicie qualquer servidor HTTP estatico local para permitir que as chamadas `fetch` carreguem os arquivos CSV e JSON sem restricoes de seguranca `file://`:

**Com Python 3:**
```bash
python -m http.server 8000
```

**Com Node.js (npx):**
```bash
npx serve .
```

3. Abra seu navegador em: `http://localhost:8000`

### Opcao 2: Regeneracao dos Embeddings (Opcional)

Caso queira recalcular os vetores de embedding a partir do CSV:

```bash
# Instale as dependencias necessarias
pip install sentence-transformers

# Execute o script gerador
python scripts/gerar_embeddings.py
```

O arquivo `data/embeddings_precalculados.json` sera atualizado na pasta `data/`.

---

## 🌐 Publicacao no GitHub Pages

O projeto esta configurado para execucao direta no GitHub Pages:
- Arquivo `.nojekyll` incluido na raiz para garantir carregamento de todos os recursos estaticos;
- Todos os caminhos de arquivos relativos;
- Scripts e estilos carregados sem necessidade de build ou empacotador.

URL Oficial de Acesso:
👉 **[https://robertrichard86.github.io/algebra-linear-similaridade-cosseno/](https://robertrichard86.github.io/algebra-linear-similaridade-cosseno/)**

---

## 👥 Creditos Academicos

- **Aluno:** Robert Richard
- **Professor Orientador:** Alexandre Garcia
- **Disciplina:** Algebra Linear
- **Curso:** Graduacao em Ciencia de Dados
- **Instituicao:** Faculdade de Tecnologia da Baixada Santista (Fatec Rubens Lara)
- **Ano:** 2026

---

## 📄 Licenca

Este projeto e distribuido sob os termos da **Licenca MIT**. Consulte o arquivo [LICENSE](LICENSE) para maiores informacoes.
