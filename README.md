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

## 📑 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Fundamentação Matemática](#-fundamentação-matemática)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura de Vetorização](#-arquitetura-de-vetorização)
- [Dados e Metodologia](#-dados-e-metodologia)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar Localmente](#-como-executar-localmente)
- [Publicação no GitHub Pages](#-publicação-no-github-pages)
- [Créditos Acadêmicos](#-créditos-acadêmicos)
- [Licença](#-licença)

---

## 📌 Sobre o Projeto

Este projeto é uma aplicação web acadêmica desenvolvida para a disciplina de **Álgebra Linear** do curso superior de **Ciência de Dados** da **Fatec Baixada Santista (Rubens Lara)**, ministrada pelo **Prof. Alexandre Garcia**.

O objetivo central é demonstrar de forma visual, interativa e rigorosa como conceitos fundamentais de Álgebra Linear (espaços vetoriais, produto escalar, norma euclidiana e ângulo entre vetores) são aplicados no mundo real em Processamento de Linguagem Natural (PLN) e Recuperação de Informação.

A aplicação analisa **80 declarações reais** de **10 grandes estrelas do futebol internacional**, permitindo ao usuário:
- Explorar matrizes de correlação entre atletas via mapas de calor (heatmaps);
- Digitar frases personalizadas e descobrir, via ranking de similaridade vetorial, qual jogador possui discurso mais semelhante;
- Acompanhar visualmente o ângulo geométrico em duas dimensões;
- Desconstruir o cálculo algébrico passo a passo (vetores, normas, produto escalar e divisão);
- Consultar a procedência e fontes jornalísticas de cada declaração.

---

## 📐 Fundamentação Matemática

### 1. Espaços Vetoriais e Representação Textual

Em Processamento de Linguagem Natural, textos são mapeados em vetores pertencentes a um espaço vetorial de dimensão finita $\mathbb{R}^n$:

$$ \mathbf{u} = (u_1, u_2, \dots, u_n) \in \mathbb{R}^n $$
$$ \mathbf{v} = (v_1, v_2, \dots, v_n) \in \mathbb{R}^n $$

Onde cada dimensão $i$ representa o peso de um termo do vocabulário (no modelo esparso TF-IDF) ou uma dimensão latente de significado (no modelo denso de Embeddings).

### 2. Produto Escalar (Dot Product)

O produto interno usual no espaço euclidiano $\mathbb{R}^n$ é definido como a soma dos produtos de suas componentes correspondentes:

$$ \mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^{n} u_i v_i = u_1 v_1 + u_2 v_2 + \dots + u_n v_n $$

Propriedades fundamentais:
- **Comutatividade:** $\mathbf{u} \cdot \mathbf{v} = \mathbf{v} \cdot \mathbf{u}$
- **Distributividade:** $\mathbf{u} \cdot (\mathbf{v} + \mathbf{w}) = \mathbf{u} \cdot \mathbf{v} + \mathbf{u} \cdot \mathbf{w}$
- **Positividade:** $\mathbf{u} \cdot \mathbf{u} \ge 0$, sendo zero se e somente se $\mathbf{u} = \mathbf{0}$

### 3. Norma Euclidiana (Norma $L_2$)

A magnitude ou comprimento euclidiano de um vetor $\mathbf{u}$ é calculada como a raiz quadrada do produto interno do vetor por si mesmo:

$$ \|\mathbf{u}\| = \sqrt{\mathbf{u} \cdot \mathbf{u}} = \sqrt{\sum_{i=1}^{n} u_i^2} $$

A norma quantifica a extensão do vetor independentemente de sua orientação angular.

### 4. Similaridade do Cosseno

Pelo Teorema do Cosseno em espaços com produto interno, a relação geométrica entre o produto escalar e as normas dos vetores é dada por:

$$ \mathbf{u} \cdot \mathbf{v} = \|\mathbf{u}\| \|\mathbf{v}\| \cos(\theta) $$

Isolando o termo $\cos(\theta)$, obtém-se a fórmula clássica da **Similaridade do Cosseno**:

$$ \text{sim}(\mathbf{u}, \mathbf{v}) = \cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} = \frac{\sum_{i=1}^n u_i v_i}{\sqrt{\sum_{i=1}^n u_i^2} \sqrt{\sum_{i=1}^n v_i^2}} $$

### 5. Interpretação Geométrica

A similaridade do cosseno mede a **orientação direcional** dos vetores e não a sua magnitude. Isso a torna ideal para comparação de documentos de extensão variável:

| Cosseno $\cos(\theta)$ | Ângulo $\theta$ | Relação Geométrica | Interpretação Semântica |
|---|---|---|---|
| $+1.00$ | $0^\circ$ | Vetores colineares (mesma direção) | Máxima convergência temática |
| $> 0.70$ | $< 45^\circ$ | Ângulo agudo fechado | Alta similaridade discursiva |
| $0.30 \text{ a } 0.70$ | $45^\circ \text{ a } 72^\circ$ | Ângulo agudo moderado | Afinidade parcial / temas compartilhados |
| $0.00$ | $90^\circ$ | Vetores ortogonais | Vocabulários disjuntos / sem correlação |
| $< 0.00$ | $> 90^\circ$ | Ângulo obtuso | Semântica divergente (possível em embeddings densos) |
| $-1.00$ | $180^\circ$ | Vetores colineares opostos | Oposição diametral |

Em espaços vetoriais positivos como o TF-IDF (onde todas as frequências são não negativas), os vetores pertencem ao primeiro ortante, fazendo com que o cosseno varie estritamente no intervalo $[0, 1]$.

---

## 🚀 Funcionalidades Principais

- 🗺️ **Matriz de Similaridade Interativa (Heatmap):**
  - **Visão Agregada (10x10):** Média do espaço vetorial de cada jogador, revelando afinidades gerais de discurso;
  - **Visão Frase a Frase (80x80):** Matriz completa de alta resolução comparando cada uma das 80 declarações individualmente;
  - Alternância dinâmica através de seletor sem recarregamento de página;
  - Destaque automático da diagonal principal (auto-similaridade = 1.00);
  - Tooltips detalhados ao passar o cursor e clique direto para abrir os vetores no painel de cálculo.

- 🔍 **Comparador em Tempo Real com Frase do Usuário:**
  - Campo de texto para inserção livre de frases;
  - Vetorização instantânea e ranqueamento dos 10 jogadores com barras proporcionais e índices numéricos;
  - Identificação da declaração mais próxima com exibição da citação correspondente.

- 📐 **Visualizador Gráfico 2D do Ângulo $\theta$:**
  - Renderização em Canvas HTML5 desenhando os vetores diretores e o arco do ângulo $\theta$;
  - Exibição dinâmica do ângulo em graus e do valor exato de $\cos(\theta)$.

- 🧮 **Painel Didático do Cálculo Passo a Passo:**
  - Desdobramento da fórmula em quatro etapas didáticas;
  - **Passo 1:** Amostra dos vetores $\mathbf{A}$ e $\mathbf{B}$ com suas dimensões e visualização em barras de componentes;
  - **Passo 2:** Cálculo do produto escalar $\sum A_i B_i$;
  - **Passo 3:** Cálculo das normas euclidianas $\|\mathbf{A}\|$ e $\|\mathbf{B}\|$;
  - **Passo 4:** Resolução da divisão e obtenção do cosseno final com destaque tipográfico.

- 📋 **Tabela de Procedência e Fontes Jornalísticas:**
  - Listagem completa das 80 declarações com identificação de clube, veículo jornalístico, hiperlink para a matéria original, data aproximada e contexto da declaração;
  - Filtro interativo por atleta.

- 🌍 **Internacionalização Completa (i18n):**
  - Alternador de idioma instantâneo no cabeçalho: Português (PT) e Inglês (EN);
  - Tradução de toda a interface, explicações teóricas, botões, tabelas e tooltips.

- 🎨 **Design Temático de Futebol:**
  - Paleta visual inspirada em campos de futebol: verde gramado (`#1B5E20`), dourado (`#FFB300`), cinza neutro e fundo escuro (`#121212`) de alto contraste;
  - Banderinhas em emoji ao lado de cada jogador facilitando a identificação de nacionalidade.

---

## 🧠 Arquitetura de Vetorização

O projeto adota uma abordagem comparativa entre dois paradigmas de representação vetorial:

```
[ Texto de Entrada ]
        │
        ├──► [ Motor TF-IDF (Puro JS) ]
        │         │
        │         └──► Vetores Esparsos (~300 dimensões lexicais)
        │
        └──► [ Sentence Transformers ]
                  │
                  ├── Dataset: Pré-calculado em Python (MiniLM-L12-v2)
                  └── Input Usuário: Transformers.js no navegador
                            │
                            └──► Vetores Densos (384 dimensões semânticas)
```

### 1. TF-IDF (Term Frequency, Inverse Document Frequency)
- **Implementação:** 100% JavaScript puro (`js/tfidf.js`), sem bibliotecas externas;
- **Funcionamento:** Tokenização com preservação de caracteres acentuados da língua portuguesa, cálculo de TF por documento e IDF com suavização logarítmica no corpus:
  $$ \text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}} $$
  $$ \text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1 $$
  $$ \text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t) $$
- **Característica:** Modela frequências lexicais diretas de forma leve e rápida.

### 2. Embeddings Neurais (Transformers)
- **Modelo:** `paraphrase-multilingual-MiniLM-L12-v2` (384 dimensões);
- **Estratégia Híbrida:**
  - As 80 frases do dataset são vetorizadas previamente via Python (`scripts/gerar_embeddings.py`) e armazenadas em formato JSON leve (`data/embeddings_precalculados.json`);
  - Para novas frases digitadas pelo usuário, a biblioteca `Transformers.js` carrega o modelo ONNX diretamente na memória do navegador via WebAssembly, garantindo inferência local sem necessidade de servidor back-end;
- **Característica:** Captura sinônimos, relações contextuais e semelhanças conceituais mesmo sem correspondência literal de palavras.

---

## 📊 Dados e Metodologia

O corpus do projeto é composto por declarações de 10 atletas de destaque mundial:

1. 🇫🇷 **Kylian Mbappé** (França)
2. 🇪🇸 **Lamine Yamal** (Espanha)
3. 🇳🇴 **Erling Haaland** (Noruega)
4. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Harry Kane** (Inglaterra)
5. 🇪🇸 **Rodri** (Espanha)
6. 🇧🇷 **Vinícius Júnior** (Brasil)
7. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Jude Bellingham** (Inglaterra)
8. 🇦🇷 **Lionel Messi** (Argentina)
9. 🇧🇷 **Neymar** (Brasil)
10. 🇵🇹 **Cristiano Ronaldo** (Portugal)

Cada atleta conta com 8 declarações extraídas de entrevistas coletivas, publicações em redes sociais oficiais e coberturas esportivas, totalizando 80 documentos.

### ⚠️ Notas Metodológicas Importantes

1. **Traduções Jornalísticas:** A maioria dos jogadores incluídos não é lusófona nativa (declarações concedidas originalmente em espanhol, inglês, francês ou norueguês). Os textos coletados são traduções publicadas por veículos de imprensa esportiva brasileiros (ge.globo, UOL, ESPN, Lance!). Essas traduções profissionais podem atenuar diferenças gramaticais de origem, homogeneizando parcialmente o estilo vocabular em português.
2. **Contexto do Atleta Rodri:** Na base de dados, o atleta consta com clube atual como FC Barcelona em função dos registros cadastrais fornecidos para o trabalho. Entretanto, todas as frases atribuídas a ele correspondem historicamente ao período em que atuava pelo Manchester City e pela Seleção Espanhola (temporadas 2023 a 2024).

---

## 📁 Estrutura do Projeto

```
algebra-linear-similaridade-cosseno/
├── .nojekyll                           # Desativa processamento Jekyll no GitHub Pages
├── LICENSE                             # Licença MIT
├── README.md                           # Documentação técnica do projeto
├── index.html                          # Interface principal da aplicação web
├── css/
│   └── styles.css                      # Design system temático (responsivo, tema futebol)
├── js/
│   ├── app.js                          # Orquestração principal e interface
│   ├── cosine.js                       # Funções algébricas puras (produto escalar, norma, cosseno)
│   ├── tfidf.js                        # Motor TF-IDF em JavaScript puro
│   ├── embeddings.js                   # Gerenciador de embeddings e Transformers.js
│   └── i18n.js                         # Módulo de internacionalização (PT / EN)
├── data/
│   ├── dataset_frases_jogadores.csv    # Corpus com 80 frases dos 10 jogadores
│   ├── fontes_frases_jogadores.csv     # Tabela de proveniência e links jornalísticos
│   └── embeddings_precalculados.json   # Embeddings semânticos (384 dimensões)
└── scripts/
    └── gerar_embeddings.py             # Script Python para pré-cálculo dos vetores
```

---

## 💻 Como Executar Localmente

### Opção 1: Execução Direta (Navegador)

Por ser uma aplicação puramente estática baseada em HTML, CSS e JavaScript client-side:

1. Clone este repositório:
```bash
git clone https://github.com/robertrichard86/algebra-linear-similaridade-cosseno.git
cd algebra-linear-similaridade-cosseno
```

2. Inicie qualquer servidor HTTP estático local para permitir que as chamadas `fetch` carreguem os arquivos CSV e JSON sem restrições de segurança `file://`:

**Com Python 3:**
```bash
python -m http.server 8000
```

**Com Node.js (npx):**
```bash
npx serve .
```

3. Abra seu navegador em: `http://localhost:8000`

### Opção 2: Regeneração dos Embeddings (Opcional)

Caso queira recalcular os vetores de embedding a partir do CSV:

```bash
# Instale as dependências necessárias
pip install sentence-transformers

# Execute o script gerador
python scripts/gerar_embeddings.py
```

O arquivo `data/embeddings_precalculados.json` será atualizado na pasta `data/`.

---

## 🌐 Publicação no GitHub Pages

O projeto está configurado para execução direta no GitHub Pages:
- Arquivo `.nojekyll` incluído na raiz para garantir carregamento de todos os recursos estáticos;
- Todos os caminhos de arquivos relativos;
- Scripts e estilos carregados sem necessidade de build ou empacotador.

URL Oficial de Acesso:
👉 **[https://robertrichard86.github.io/algebra-linear-similaridade-cosseno/](https://robertrichard86.github.io/algebra-linear-similaridade-cosseno/)**

---

## 👥 Créditos Acadêmicos

- **Aluno:** Robert Richard
- **Professor:** Alexandre Garcia
- **Disciplina:** Álgebra Linear
- **Curso:** Graduação em Ciência de Dados
- **Instituição:** Faculdade de Tecnologia da Baixada Santista (Fatec Rubens Lara)
- **Ano:** 2026

---

## 📄 Licença

Este projeto é distribuído sob os termos da **Licença MIT**. Consulte o arquivo [LICENSE](LICENSE) para maiores informações.
