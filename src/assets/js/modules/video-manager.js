/**
 * Módulo para gerenciar vídeos dos imóveis
 */

import { API_BASE_URL } from '../config/auth.js';
import { showAlert } from './ui.js';

// Array para armazenar temporariamente os vídeos adicionados
let pendingVideos = [];

// Disponibiliza a variável pendingVideos globalmente para outros módulos
window.pendingVideos = pendingVideos;

/**
 * Inicializa o gerenciador de vídeos
 * @param {String} containerId - ID do container onde os vídeos serão exibidos
 * @param {String} inputId - ID do input para URL do vídeo
 * @param {String} titleId - ID do input para título do vídeo
 * @param {String} btnId - ID do botão para adicionar vídeo
 */
function initVideoManager(containerId = 'video-preview', inputId = 'video-url', titleId = 'video-title', btnId = 'add-video-btn') {
  console.log('Inicializando gerenciador de vídeos');
  
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  const titleInput = document.getElementById(titleId);
  const addBtn = document.getElementById(btnId);
  
  if (!container || !input || !addBtn) {
    console.error('Elementos necessários não encontrados');
    return;
  }
  
  // Limpar arrays
  pendingVideos = [];
  window.pendingVideos = pendingVideos; // Atualiza a referência global
  
  // Adicionar evento para adicionar vídeo
  addBtn.addEventListener('click', () => {
    const videoUrl = input.value.trim();
    const videoTitle = titleInput ? titleInput.value.trim() : '';
    
    if (!videoUrl) {
      showAlert('Por favor, informe a URL do vídeo', 'error');
      return;
    }
    
    // Verificar se é uma URL do YouTube válida
    if (!isValidYouTubeUrl(videoUrl)) {
      showAlert('Por favor, forneça uma URL válida do YouTube', 'error');
      return;
    }
    
    // Adicionar ao array de vídeos pendentes
    const videoId = extractYouTubeId(videoUrl);
    pendingVideos.push({
      url: videoUrl,
      title: videoTitle,
      id: videoId
    });
    
    // Atualizar a referência global
    window.pendingVideos = pendingVideos;
    
    console.log('Vídeo adicionado:', videoUrl, 'Total:', pendingVideos.length);
    
    // Atualizar a visualização
    updateVideoPreview(container);
    
    // Limpar campos
    input.value = '';
    if (titleInput) titleInput.value = '';
  });
}

/**
 * Verifica se uma URL é uma URL do YouTube válida
 * @param {String} url - URL a ser verificada
 * @returns {Boolean} - true se for uma URL válida
 */
function isValidYouTubeUrl(url) {
  // Expressão regular para validar URLs do YouTube
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

/**
 * Extrai o ID do vídeo do YouTube de uma URL
 * @param {String} url - URL do YouTube
 * @returns {String} - ID do vídeo
 */
function extractYouTubeId(url) {
  // Extrai o ID do vídeo de diferentes formatos de URL do YouTube
  let videoId = '';
  
  // youtu.be/ID
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
    if (videoId.includes('?')) {
      videoId = videoId.split('?')[0];
    }
  } 
  // youtube.com/watch?v=ID
  else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v');
  }
  // youtube.com/embed/ID
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1];
    if (videoId.includes('?')) {
      videoId = videoId.split('?')[0];
    }
  }
  
  return videoId;
}

/**
 * Atualiza a pré-visualização dos vídeos adicionados
 * @param {HTMLElement} container - Elemento onde os vídeos serão exibidos
 */
function updateVideoPreview(container) {
  container.innerHTML = '';
  
  if (pendingVideos.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center my-4">Nenhum vídeo adicionado</p>';
    return;
  }
  
  pendingVideos.forEach((video, index) => {
    const videoCard = document.createElement('div');
    videoCard.className = 'bg-white border border-[#E0DEF7] rounded-lg p-4 flex flex-col';
    
    videoCard.innerHTML = `
      <div class="aspect-video bg-gray-100 mb-2 overflow-hidden rounded">
        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${video.id}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      </div>
      <div class="flex justify-between items-center mt-2">
        <p class="text-sm font-medium truncate">${video.title || 'Vídeo sem título'}</p>
        <button type="button" class="text-red-600 hover:text-red-800 remove-video" data-index="${index}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;
    
    container.appendChild(videoCard);
    
    // Adicionar evento para remover o vídeo
    videoCard.querySelector('.remove-video').addEventListener('click', function() {
      const index = parseInt(this.dataset.index, 10);
      pendingVideos.splice(index, 1);
      // Atualizar a referência global
      window.pendingVideos = pendingVideos;
      console.log('Vídeo removido. Total:', pendingVideos.length);
      updateVideoPreview(container);
    });
  });
}

/**
 * Envia os vídeos para o servidor
 * @param {String} propertyId - ID do imóvel
 * @returns {Promise} - Promise com o resultado do envio
 */
function saveVideos(propertyId) {
  return new Promise((resolve, reject) => {
    // Utilizar a referência global para garantir que temos os dados mais recentes
    const videosToSave = window.pendingVideos || pendingVideos;
    
    if (videosToSave.length === 0) {
      console.log('Nenhum vídeo para salvar');
      resolve({ success: true, message: 'Nenhum vídeo para salvar' });
      return;
    }
    
    console.log(`Salvando ${videosToSave.length} vídeos para o imóvel ${propertyId}`);
    
    // Prepara os dados para envio
    const videos = videosToSave.map(video => ({
      url: video.url,
      title: video.title
    }));
    
    // Use a URL completa diretamente para garantir que está correto
    const apiUrl = `/api/admin/properties/${propertyId}/videos`;
    console.log('Enviando requisição para:', apiUrl);
    
    // Envia para a API
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ videos })
    })
      .then(response => {
        console.log('Resposta recebida:', response.status);
        if (!response.ok) {
          throw new Error(`Erro ao salvar vídeos. Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Vídeos salvos com sucesso:', data);
        
        // Limpar vídeos pendentes
        pendingVideos = [];
        window.pendingVideos = []; // Atualiza a referência global
        
        resolve(data);
      })
      .catch(error => {
        console.error('Erro ao salvar vídeos:', error);
        reject(error);
      });
  });
}

/**
 * Carrega vídeos existentes de um imóvel
 * @param {String} propertyId - ID do imóvel
 * @param {String} containerId - ID do container onde os vídeos serão exibidos
 */
function loadExistingVideos(propertyId, containerId = 'video-preview') {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('Container de vídeos não encontrado');
    return;
  }
  
  // Limpar o container
  container.innerHTML = '<p class="text-gray-500 text-center my-4">Carregando vídeos...</p>';
  
  // Buscar vídeos da API
  fetch(`${API_BASE_URL}/properties/${propertyId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar vídeos do imóvel');
      }
      return response.json();
    })
    .then(data => {
      const videos = data.videos || [];
      
      if (videos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center my-4">Nenhum vídeo encontrado</p>';
        return;
      }
      
      // Limpar o container
      container.innerHTML = '';
      
      videos.forEach(video => {
        const videoId = extractYouTubeId(video.video_url);
        
        const videoCard = document.createElement('div');
        videoCard.className = 'bg-white border border-[#E0DEF7] rounded-lg p-4 flex flex-col';
        
        videoCard.innerHTML = `
          <div class="aspect-video bg-gray-100 mb-2 overflow-hidden rounded">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
          </div>
          <div class="flex justify-between items-center mt-2">
            <p class="text-sm font-medium truncate">${video.title || 'Vídeo sem título'}</p>
            <button type="button" class="text-red-600 hover:text-red-800 delete-video" data-video-id="${video.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        `;
        
        container.appendChild(videoCard);
        
        // Adicionar evento para excluir o vídeo
        videoCard.querySelector('.delete-video').addEventListener('click', function() {
          const videoId = this.dataset.videoId;
          deleteVideo(propertyId, videoId, videoCard);
        });
      });
    })
    .catch(error => {
      console.error('Erro ao carregar vídeos:', error);
      container.innerHTML = '<p class="text-red-500 text-center my-4">Erro ao carregar vídeos</p>';
    });
}

/**
 * Exclui um vídeo do servidor
 * @param {String} propertyId - ID do imóvel
 * @param {String} videoId - ID do vídeo
 * @param {HTMLElement} element - Elemento a ser removido da UI após sucesso
 */
function deleteVideo(propertyId, videoId, element) {
  if (!confirm('Tem certeza que deseja excluir este vídeo?')) {
    return;
  }
  
  fetch(`${API_BASE_URL}/admin/properties/${propertyId}/videos/${videoId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao excluir vídeo');
      }
      return response.json();
    })
    .then(data => {
      console.log('Vídeo excluído com sucesso:', data);
      
      // Remover elemento da UI
      if (element) {
        element.remove();
      }
      
      showAlert('Vídeo excluído com sucesso', 'success');
    })
    .catch(error => {
      console.error('Erro ao excluir vídeo:', error);
      showAlert('Erro ao excluir vídeo', 'error');
    });
}

// Exportar funções
export {
  initVideoManager,
  saveVideos,
  loadExistingVideos,
  deleteVideo,
  pendingVideos
}; 