const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const themeBtn = document.getElementById("themeBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatList = document.getElementById("chatList");
const pdfList = document.getElementById("pdfList");

// Estrutura de dados
let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChat = 0;

// 🔥🔥🔥 COLE SEUS NOVOS SOURCEIDs AQUI 🔥🔥🔥
const PRECARREGED_PDFS = [
  {
    sourceId: "src_6kfjnOCMaMRxZcB9oyLfi", 
    name: "📚 Edital ENEM 2025",
    description: "Exame Nacional do Ensino Médio"
  },
  {
    sourceId: "src_gCPNGTUm4DgPEQUWTOR2D", 
    name: "🎓 Edital CEFET 2025", 
    description: "Centro Federal de Educação Tecnológica"
  },
  {
    sourceId: "src_wPH2kGdDfukiNSq2sRcmx", 
    name: "🏫 Edital IFMG 2025",
    description: "Instituto Federal de Minas Gerais"
  },
  {
    sourceId: "src_ttvA2zw4hOajwfMEv8cZ4",
    name: "🏫 Edital SERIADO-UFMG 2025",
    description: "Universidade Federal de Minas Gerais"
  },
];

// API Key do ChatPDF - VERIFIQUE SE ESTÁ CORRETA!
const CHATPDF_API_KEY = "sec_oNSB8e6u0ii7J5jpRILoMFgGYMdIiksM";

function renderChats() {
  chatList.innerHTML = "";
  chats.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = `Chat ${i + 1}`;
    li.onclick = () => switchChat(i);
    if (i === currentChat) li.style.background = "#2a2a2a";
    chatList.appendChild(li);
  });
}

function renderPdfs() {
  const header = pdfList.querySelector('.pdf-list-header');
  pdfList.innerHTML = '';
  pdfList.appendChild(header);
  
  if (PRECARREGED_PDFS.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'pdf-stats';
    emptyMsg.textContent = 'Nenhum edital disponível no momento';
    pdfList.appendChild(emptyMsg);
    return;
  }

  PRECARREGED_PDFS.forEach((pdf, i) => {
    const div = document.createElement("div");
    div.className = "pdf-item";
    
    const pdfInfo = document.createElement("div");
    pdfInfo.className = "pdf-info";
    
    const nameSpan = document.createElement("div");
    nameSpan.className = "pdf-name";
    nameSpan.textContent = pdf.name;
    
    const descSpan = document.createElement("div");
    descSpan.className = "pdf-description";
    descSpan.textContent = pdf.description;
    
    pdfInfo.appendChild(nameSpan);
    pdfInfo.appendChild(descSpan);
    div.appendChild(pdfInfo);
    
    pdfList.appendChild(div);
  });

  const stats = document.createElement('div');
  stats.className = 'pdf-stats';
  stats.textContent = `${PRECARREGED_PDFS.length} editais disponíveis para consulta`;
  pdfList.appendChild(stats);
}

function renderMessages() {
  chatEl.innerHTML = "";
  chats[currentChat].forEach(msg => {
    addMessage(msg.role, msg.content, false);
  });
  chatEl.scrollTop = chatEl.scrollHeight;
}

function addMessage(role, text, save = true) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;

  if (save) {
    chats[currentChat].push({ role, content: text });
    localStorage.setItem("chats", JSON.stringify(chats));
  }
}

// Função para mostrar indicador de digitação
function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message assistant typing-indicator";
  typingDiv.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatEl.appendChild(typingDiv);
  chatEl.scrollTop = chatEl.scrollHeight;
  return typingDiv;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  
  if (PRECARREGED_PDFS.length === 0) {
    addMessage('assistant', '⚠️ Nenhum edital disponível no momento.', false);
    return;
  }

  addMessage("user", text);
  inputEl.value = "";

  // Mostra indicador de digitação
  const typingIndicator = showTypingIndicator();
  
  try {
    await getAIResponseFromAllPdfs(text);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    addMessage('assistant', '❌ Ocorreu um erro ao consultar os editais. Tente novamente.');
  } finally {
    // Remove o indicador de digitação
    if (typingIndicator.parentNode) {
      typingIndicator.remove();
    }
  }
}

// FUNÇÃO PRINCIPAL CORRIGIDA
async function getAIResponseFromAllPdfs(question) {
  if (PRECARREGED_PDFS.length === 0) return;

  console.log('🔍 Iniciando consulta para:', question);
  
  // Detecta qual edital específico foi mencionado
  const targetPdf = detectSpecificEdital(question);
  
  if (targetPdf) {
    console.log(`🎯 Edital específico detectado: ${targetPdf.name}`);
    
    try {
      const response = await consultSinglePdf(targetPdf.sourceId, question, targetPdf.name);
      
      // MOSTRA A RESPOSTA DIRETAMENTE - SEM FILTROS
      const message = `${response}\n\n*Fonte: ${targetPdf.name}*`;
      addMessage("assistant", message);
      
    } catch (error) {
      console.error(`❌ Erro no PDF ${targetPdf.name}:`, error);
      
      // Mostra detalhes do erro para debug
      let errorMessage = `❌ Erro ao consultar ${targetPdf.name}:\n`;
      
      if (error.response) {
        errorMessage += `Status: ${error.response.status}\n`;
        errorMessage += `Mensagem: ${error.response.data?.message || 'Erro desconhecido'}\n`;
      } else if (error.request) {
        errorMessage += `Não houve resposta da API\n`;
      } else {
        errorMessage += `Erro: ${error.message}\n`;
      }
      
      errorMessage += `\n💡 Tente recarregar este edital usando o arquivo recarregar-pdfs.html`;
      addMessage("assistant", errorMessage);
    }
    
  } else {
    // Se não detectou edital específico, consulta todos
    console.log('🔍 Nenhum edital específico detectado, consultando todos...');
    
    const responses = [];
    
    for (const pdf of PRECARREGED_PDFS) {
      try {
        console.log(`📄 Consultando: ${pdf.name}`);
        const response = await consultSinglePdf(pdf.sourceId, question, pdf.name);
        
        responses.push({
          pdfName: pdf.name,
          content: response,
          error: false
        });
        
      } catch (error) {
        console.error(`❌ Erro no PDF ${pdf.name}:`, error);
        responses.push({
          pdfName: pdf.name,
          content: `❌ Não foi possível consultar este edital.`,
          error: true
        });
      }
      
      // Aguarda 3 segundos entre consultas para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    displayAllResponses(responses, question);
  }
}

// FUNÇÃO SIMPLIFICADA - mostra TODAS as respostas sem filtrar
function displayAllResponses(responses, originalQuestion) {
  const successfulResponses = responses.filter(r => !r.error);
  
  let message = '';
  
  if (successfulResponses.length === 0) {
    message = `❌ Não foi possível consultar nenhum edital no momento.\n\n💡 **Solução:** Recarregue os PDFs usando o arquivo recarregar-pdfs.html`;
  } else if (successfulResponses.length === 1) {
    message = `${successfulResponses[0].content}\n\n*Fonte: ${successfulResponses[0].pdfName}*`;
  } else {
    message = `**Resposta para: "${originalQuestion}"**\n\n`;
    
    successfulResponses.forEach((response, index) => {
      message += `--- ${response.pdfName} ---\n`;
      message += `${response.content}\n\n`;
    });
    
    message += `*Consultados ${successfulResponses.length} editais.*`;
  }

  addMessage("assistant", message);
}

// FUNÇÃO DE CONSULTA MELHORADA - COM MELHOR TRATAMENTO DE ERRO
async function consultSinglePdf(sourceId, question, pdfName) {
  const config = {
    headers: {
      "x-api-key": CHATPDF_API_KEY,
      "Content-Type": "application/json",
    },
    timeout: 45000 // Timeout aumentado para 45 segundos
  };

  const data = {
    sourceId: sourceId,
    messages: [
      {
        role: "user",
        content: `Responda a seguinte pergunta baseando-se APENAS no documento "${pdfName}": ${question}`
      },
    ],
  };

  try {
    console.log(`📤 Enviando consulta para: ${pdfName}`);
    console.log(`🔑 SourceId: ${sourceId}`);
    
    const response = await axios.post("https://api.chatpdf.com/v1/chats/message", data, config);
    
    console.log(`✅ Resposta recebida de: ${pdfName}`);
    return response.data.content;
    
  } catch (error) {
    console.error(`❌ Erro no PDF ${pdfName}:`, error);
    
    // Log detalhado do erro
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
}

// FUNÇÃO DE DETECÇÃO DE EDITAL ESPECÍFICO MELHORADA
function detectSpecificEdital(question) {
  const questionLower = question.toLowerCase();
  
  // Mapeamento mais abrangente de termos para cada edital
  const editalMapping = [
    {
      terms: ['enem', 'exame nacional do ensino médio', 'enem 2025'],
      pdf: PRECARREGED_PDFS[0]
    },
    {
      terms: ['cefet', 'centro federal', 'educação tecnológica', 'cefet 2025'],
      pdf: PRECARREGED_PDFS[1]
    },
    {
      terms: ['ifmg', 'instituto federal minas gerais', 'if mg', 'if-mg', 'ifmg 2025'],
      pdf: PRECARREGED_PDFS[2]
    },
    {
      terms: ['ufmg', 'universidade federal minas gerais', 'seriado', 'seriado-ufmg', 'ufmg 2025'],
      pdf: PRECARREGED_PDFS[3]
    }
  ];
  
  // Procura por termos específicos
  for (const mapping of editalMapping) {
    for (const term of mapping.terms) {
      if (questionLower.includes(term)) {
        console.log(`✅ Edital detectado: ${mapping.pdf.name} (termo: ${term})`);
        return mapping.pdf;
      }
    }
  }
  
  // Busca adicional nos nomes dos PDFs
  for (const pdf of PRECARREGED_PDFS) {
    const pdfNameLower = pdf.name.toLowerCase();
    // Remove emojis e símbolos para busca mais limpa
    const cleanPdfName = pdfNameLower.replace(/[^a-z0-9\s]/g, '');
    const cleanQuestion = questionLower.replace(/[^a-z0-9\s]/g, '');
    
    // Verifica se palavras-chave do nome do edital estão na pergunta
    const palavrasChave = cleanPdfName.split(' ').filter(palavra => palavra.length > 3);
    for (const palavra of palavrasChave) {
      if (cleanQuestion.includes(palavra)) {
        console.log(`✅ Edital detectado por palavra-chave: ${pdf.name} (${palavra})`);
        return pdf;
      }
    }
  }
  
  console.log('❌ Nenhum edital específico detectado');
  return null;
}

function switchChat(i) {
  currentChat = i;
  renderChats();
  renderMessages();
}

// Event Listeners
newChatBtn.addEventListener("click", () => {
  chats.push([]);
  currentChat = chats.length - 1;
  renderChats();
  renderMessages();
  localStorage.setItem("chats", JSON.stringify(chats));
});

sendBtn.addEventListener("click", sendMessage);

inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Melhoria no input: auto-expand
inputEl.addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  // Salvar preferência do tema
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

document.getElementById('deleteChatsBtn').addEventListener('click', () => {
  if (confirm('Tem certeza que deseja limpar este chat?')) {
    chats = [[]];
    currentChat = 0;
    localStorage.setItem('chats', JSON.stringify(chats));
    renderChats();
    renderMessages();
  }
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Carregar tema salvo
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  }

  // Splash screen
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 600);
    }
  }, 2500);

  if (chats.length === 0) chats.push([]);
  renderChats();
  renderPdfs();
  renderMessages();

  // Focar no input após carregamento
  setTimeout(() => {
    inputEl.focus();
  }, 500);

  // Audio de inicialização
  var audio = document.getElementById("sound");
  audio.play().catch(e => console.log('Autoplay bloqueado:', e));
});

// FUNÇÃO PARA TESTAR TODOS OS PDFs - EXECUTE NO CONSOLE!
async function testarTodosEditais() {
  console.log('🧪 INICIANDO TESTE DOS EDITAIS...');
  
  const resultadosTeste = document.createElement('div');
  resultadosTeste.style.background = '#f0f8ff';
  resultadosTeste.style.padding = '20px';
  resultadosTeste.style.margin = '20px 0';
  resultadosTeste.style.border = '2px solid blue';
  resultadosTeste.style.borderRadius = '10px';
  resultadosTeste.innerHTML = '<h3>🧪 RESULTADOS DO TESTE:</h3>';
  document.body.appendChild(resultadosTeste);

  for (const pdf of PRECARREGED_PDFS) {
    try {
      resultadosTeste.innerHTML += `<p><strong>🔍 Testando: ${pdf.name}</strong></p>`;
      resultadosTeste.innerHTML += `<p><small>SourceId: ${pdf.sourceId}</small></p>`;
      
      // Pergunta simples para testar
      const perguntaTeste = "Qual é a data da prova?";
      const resposta = await consultSinglePdf(pdf.sourceId, perguntaTeste, pdf.name);
      
      resultadosTeste.innerHTML += `
        <div style="background: #90EE90; padding: 10px; margin: 5px; border-radius: 5px;">
          ✅ <strong>FUNCIONANDO!</strong><br>
          <strong>Resposta:</strong> ${resposta.substring(0, 150)}...
        </div>
      `;
      
    } catch (error) {
      resultadosTeste.innerHTML += `
        <div style="background: #FFB6C1; padding: 10px; margin: 5px; border-radius: 5px;">
          ❌ <strong>FALHOU!</strong><br>
          <strong>Erro:</strong> ${error.response?.data?.message || error.message}
        </div>
      `;
    }
    
    // Espera 5 segundos entre testes para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// Função para testar PDF específico
async function testarPDFEspecifico(nomePDF) {
  const pdf = PRECARREGED_PDFS.find(p => p.name.includes(nomePDF));
  if (!pdf) {
    console.log('❌ PDF não encontrado');
    return;
  }
  
  console.log(`🧪 Testando: ${pdf.name}`);
  try {
    const resposta = await consultSinglePdf(pdf.sourceId, "Qual é a data da prova?", pdf.name);
    console.log(`✅ SUCESSO: ${resposta.substring(0, 100)}...`);
    return resposta;
  } catch (error) {
    console.error(`❌ ERRO:`, error.response?.data || error.message);
    return null;
  }
}

// Função utilitária para adicionar efeitos visuais
function addVisualEffect(element, effectType) {
  switch(effectType) {
    case 'pulse':
      element.style.animation = 'pulse 0.6s ease-in-out';
      setTimeout(() => {
        element.style.animation = '';
      }, 600);
      break;
    case 'bounce':
      element.style.animation = 'bounce 0.5s ease-in-out';
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
      break;
  }
}

// Adicionar efeitos aos botões
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', function() {
    addVisualEffect(this, 'pulse');
  });
});

// Melhorar a experiência do textarea
inputEl.addEventListener('focus', function() {
  this.parentElement.style.borderColor = '#8B5CF6';
  this.parentElement.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
});

inputEl.addEventListener('blur', function() {
  this.parentElement.style.borderColor = '';
  this.parentElement.style.boxShadow = '';
});