/**
 * Módulo de funções de interface do usuário (UI)
 */

/**
 * Exibe uma mensagem de alerta na tela
 * @param {String} message - Mensagem a ser exibida
 * @param {String} type - Tipo de alerta (success, error, warning)
 * @param {Number} duration - Duração em milissegundos
 */
export function showAlert(message, type = 'success', duration = 3000) {
  const alertContainer = document.getElementById('alertContainer');
  
  if (!alertContainer) {
    // Criar container de alerta se não existir
    const newAlertContainer = document.createElement('div');
    newAlertContainer.id = 'alertContainer';
    newAlertContainer.className = 'fixed top-4 right-4 z-50 transition-all duration-300';
    document.body.appendChild(newAlertContainer);
    
    // Usar o container recém-criado
    showAlert(message, type, duration);
    return;
  }
  
  // Criar elemento de alerta
  const alert = document.createElement('div');
  alert.className = `mb-4 p-4 rounded-lg shadow-md transform transition-all duration-300 ease-in-out translate-x-full`;
  
  // Definir cores com base no tipo
  if (type === 'error') {
    alert.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700');
  } else if (type === 'warning') {
    alert.classList.add('bg-yellow-100', 'border', 'border-yellow-400', 'text-yellow-700');
  } else {
    alert.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700');
  }
  
  // Conteúdo do alerta
  alert.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button class="ml-4 text-xl font-bold">&times;</button>
    </div>
  `;
  
  // Adicionar ao container
  alertContainer.appendChild(alert);
  
  // Animar entrada
  setTimeout(() => {
    alert.classList.remove('translate-x-full');
  }, 10);
  
  // Configurar botão de fechar
  const closeButton = alert.querySelector('button');
  closeButton.addEventListener('click', () => {
    alert.classList.add('translate-x-full');
    setTimeout(() => {
      alertContainer.removeChild(alert);
    }, 300);
  });
  
  // Auto-fechar após o tempo definido
  setTimeout(() => {
    if (alert.parentNode === alertContainer) {
      alert.classList.add('translate-x-full');
      setTimeout(() => {
        if (alert.parentNode === alertContainer) {
          alertContainer.removeChild(alert);
        }
      }, 300);
    }
  }, duration);
}

/**
 * Formata um valor de preço para exibição
 * @param {Number|String} price - Valor do preço
 * @returns {String} - Preço formatado
 */
export function formatPrice(price) {
  if (!price) return '0,00';
  
  // Converter para número se for string
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) : price;
  
  // Formatar para o padrão brasileiro
  return numPrice.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formata o tipo de propriedade para exibição
 * @param {String} type - Tipo da propriedade
 * @returns {String} - Tipo formatado
 */
export function formatPropertyType(type) {
  const types = {
    'venda': 'Venda',
    'aluguel': 'Aluguel',
    'lancamento': 'Lançamento'
  };
  
  return types[type] || type;
}

/**
 * Atualiza as informações de paginação na interface
 * @param {Number} start - Número do primeiro item exibido
 * @param {Number} end - Número do último item exibido
 * @param {Number} total - Número total de itens
 */
export function updatePaginationInfo(start, end, total) {
  const startElement = document.getElementById('range-start');
  const endElement = document.getElementById('range-end');
  const totalElement = document.getElementById('total-items');
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  
  if (startElement) startElement.textContent = start;
  if (endElement) endElement.textContent = end;
  if (totalElement) totalElement.textContent = total;
  
  // Atualizar estado dos botões
  if (prevButton) prevButton.disabled = window.currentPage <= 1;
  if (nextButton) nextButton.disabled = window.currentPage >= window.totalPages;
} 