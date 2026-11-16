import csv
import json
import os
import sys
from sentence_transformers import SentenceTransformer

def main():
    print("Iniciando geracao de embeddings para o dataset de frases de jogadores...")

    diretorio_base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    caminho_csv = os.path.join(diretorio_base, "data", "dataset_frases_jogadores.csv")
    caminho_saida = os.path.join(diretorio_base, "data", "embeddings_precalculados.json")
    nome_modelo = "paraphrase-multilingual-MiniLM-L12-v2"

    if not os.path.exists(caminho_csv):
        print(f"Erro: Arquivo CSV nao encontrado em: {caminho_csv}")
        sys.exit(1)

    print(f"Lendo dados de: {caminho_csv}")
    jogadores_dict = {}
    ordem_jogadores = []
    total_frases = 0

    with open(caminho_csv, mode="r", encoding="utf-8") as arquivo_csv:
        leitor = csv.DictReader(arquivo_csv)
        for linha in leitor:
            jogador = linha["jogador"].strip()
            frase = linha["frase"].strip()
            if not jogador or not frase:
                continue

            if jogador not in jogadores_dict:
                jogadores_dict[jogador] = []
                ordem_jogadores.append(jogador)

            jogadores_dict[jogador].append(frase)
            total_frases += 1

    print(f"Total de jogadores encontrados: {len(ordem_jogadores)}")
    print(f"Total de frases encontradas: {total_frases}")

    print(f"Carregando modelo SentenceTransformer: {nome_modelo}")
    modelo = SentenceTransformer(nome_modelo)

    lista_todas_frases = []
    mapeamento = []
    for jogador in ordem_jogadores:
        for frase in jogadores_dict[jogador]:
            lista_todas_frases.append(frase)
            mapeamento.append((jogador, frase))

    print(f"Calculando embeddings para {len(lista_todas_frases)} frases...")
    embeddings = modelo.encode(lista_todas_frases, show_progress_bar=True, convert_to_numpy=True)

    dimensoes = int(embeddings.shape[1])
    print(f"Dimensoes dos embeddings gerados: {dimensoes}")

    dados_jogadores_json = {}
    for jogador in ordem_jogadores:
        dados_jogadores_json[jogador] = {
            "nome": jogador,
            "frases": []
        }

    for idx, (jogador, frase) in enumerate(mapeamento):
        vetor = [round(float(val), 6) for val in embeddings[idx].tolist()]
        dados_jogadores_json[jogador]["frases"].append({
            "texto": frase,
            "embedding": vetor
        })

    estrutura_final = {
        "modelo": nome_modelo,
        "dimensoes": dimensoes,
        "jogadores": [dados_jogadores_json[jog] for jog in ordem_jogadores]
    }

    print(f"Gravando arquivo JSON em: {caminho_saida}")
    os.makedirs(os.path.dirname(caminho_saida), exist_ok=True)
    with open(caminho_saida, mode="w", encoding="utf-8") as arquivo_json:
        json.dump(estrutura_final, arquivo_json, ensure_ascii=False, indent=2)

    tamanho_bytes = os.path.getsize(caminho_saida)
    tamanho_kb = tamanho_bytes / 1024
    print("Processo concluido com sucesso!")
    print(f"Arquivo gerado: {caminho_saida}")
    print(f"Tamanho do arquivo: {tamanho_kb:.2f} KB ({tamanho_bytes} bytes)")
    print(f"Total de jogadores: {len(estrutura_final['jogadores'])}")
    print(f"Total de dimensoes: {dimensoes}")

if __name__ == "__main__":
    main()
