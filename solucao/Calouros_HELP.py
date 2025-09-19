import os
import re
from collections import defaultdict

class TextAnalyzer:
    def __init__(self, file_path):
        self.file_path = file_path
        self.content = ""
        self.keywords = defaultdict(list)
        self.load_file()
        self.analyze_content()

    def load_file(self):
        """Carrega o arquivo de texto"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                self.content = file.read()
            if not self.content:
                raise ValueError("O arquivo está vazio")
        except FileNotFoundError:
            raise FileNotFoundError(f"Arquivo não encontrado: {self.file_path}")
        except Exception as e:
            raise Exception(f"Erro ao ler arquivo: {str(e)}")

    def analyze_content(self):
        """Extrai informações importantes do texto"""
        # Identifica frases importantes
        sentences = [s.strip() for s in re.split(r'[.!?]', self.content) if s.strip()]
        
        # Cria um índice de palavras-chave
        for idx, sentence in enumerate(sentences):
            words = re.findall(r'\b\w{4,}\b', sentence.lower())  # Palavras com 4+ letras
            for word in words:
                self.keywords[word].append((idx, sentence))

    def answer_question(self, question):
        """Responde perguntas baseadas no conteúdo"""
        question = question.lower()
        response = None
        
        # Verifica perguntas específicas
        if "quem" in question:
            response = self.find_person()
        elif "quando" in question:
            response = self.find_date()
        elif "onde" in question:
            response = self.find_place()
        
        # Busca por palavras-chave se não encontrou resposta específica
        if not response:
            keywords = re.findall(r'\b\w{4,}\b', question)
            for word in keywords:
                if word in self.keywords:
                    # Pega a primeira ocorrência da palavra
                    _, sentence = self.keywords[word][0]
                    response = sentence
                    break
        
        return response or "Não encontrei informações sobre isso no texto."

    def find_person(self):
        """Tenta identificar pessoas no texto"""
        # Procura por nomes próprios (iniciais maiúsculas)
        names = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', self.content)
        if names:
            return f"O texto menciona: {', '.join(set(names))}"
        return None

    def find_date(self):
        """Tenta identificar datas no texto"""
        dates = re.findall(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b|\b\d{4}\b', self.content)
        if dates:
            return f"Datas mencionadas: {', '.join(set(dates))}"
        return None

    def find_place(self):
        """Tenta identificar locais no texto"""
        # Procura por palavras que podem indicar locais
        places = re.findall(r'\b(?:em|no|na|em|para)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', self.content)
        if places:
            return f"Locais mencionados: {', '.join(set(places))}"
        return None


def main():
    print("=== Sistema de Perguntas e Respostas sobre Textos ===")
    
    # Solicita o arquivo (ou usa um padrão)
    #Linha a ser alterada file_path = input("Digite o caminho do arquivo (ou Enter para 'texto.txt'): ").strip()
    file_path = "texto.txt"
    file_path = file_path if file_path else "texto.txt"
    
    try:
        analyzer = TextAnalyzer(file_path)
        print(f"\nArquivo carregado com sucesso: {file_path}")
        print(f"Tamanho do texto: {len(analyzer.content)} caracteres\n")
        
        while True:
            question = input("Faça sua pergunta sobre o texto (ou 'sair'): ").strip()
            if question.lower() == 'sair':
                break
            
            answer = analyzer.answer_question(question)
            print("\nResposta:", answer, "\n")
            
    except Exception as e:
        print(f"\nErro: {str(e)}")
    finally:
        print("\nPrograma encerrado.")


if __name__ == "__main__":
    main()